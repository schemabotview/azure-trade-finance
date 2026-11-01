#!/usr/bin/env python3
"""Replay the spine's LOCAL steps along one chain; check its AZURE steps without running anything.

The spine is the course's one project, `lc-exposure`, kept as real files: one snapshot per step in
spine/<course>/<NN-step>/project/. Each step's session.txt is the terminal pane a scene shows — `$ `
lines are commands, everything else is their output. Scenes import these files with Vite's `?raw`,
so a frame can only show what a real run printed.

  python scripts/spine.py                  check: replay every local step, compare; every Azure step
                                           recorded and current (runs NOTHING on Azure)
  python scripts/spine.py --write [steps]  replay and rewrite the local steps' session.txt / captured/
  python scripts/spine.py --record <step>  record ONE Azure step on the owner's subscription (needs the
                                           AZURE_* environment secrets): run once, normalise, write
  python scripts/spine.py --teardown       delete every *tradefin* resource group (after a course)

Ported from spark-ecommerce-analytics (local replay, data generated not committed, `volatile`) and
aws-ecommerce (record-once, keys, normalisation in the recorder). What is this course's own:

TWO KINDS OF STEP (COURSE-PLAN.md, "The spine"):

  Local ({})            replayed every time, deterministically: PostgreSQL 18.6 (TradeBook), Azurite
                        (the lake, emulated), Python 3.14.9. The pipeline's numbers all come from here.
  Azure ({"azure": true})  recorded ONCE with --record, never replayed. recorded.json beside it holds
                        the step's KEY (a hash of its step.json, files and typed commands, and every
                        ancestor's) and the hash of the transcript it wrote. The check runs nothing: a
                        key that no longer matches means the step or one before it changed (re-record
                        it and every Azure step after it in the course, in order); a transcript that no
                        longer matches its hash was edited by hand. An Azure step changes no local
                        state, so the local replay passes over it.

ONE CHAIN, REAL STATE. The local steps run in ONE working copy (/home/ana/lc-exposure, as Ana, the
path shown on screen — nothing is rewritten), against ONE database (`tradebook`) and ONE Azurite, in
chain order from the `first` step. A step's files are laid over the working copy (a file it no longer
has is removed; run outputs, data/ and .venv stay) and its session runs where the previous one left
off. So the landing zone a section shows is what the earlier sections' commands really wrote.

  {"branch": true}      a step that breaks things on purpose (a failed gate): its state — working copy,
                        database, lake — is put back as it was before it, so the next step continues
                        from the step before the branch. Its CODE carries on, like any step's.

THE SPINE IS CUMULATIVE (python-expense-tracker's rule): every step is its parent plus the changes
it declares, and a step whose project differs anywhere it did not declare fails.

  {"first": true}             starts the chain
  {"from": "land/04-...",     continues that step; `changes` lists every path it adds, edits or
   "changes": ["extract/"]}   removes (a directory covers everything under it); a listed path that
                              did not change fails too. `[]` is a section that only looks.
  {"lab": true}               a standalone lab outside the chain (fresh database and lake)

step.json (other keys, all optional):
  {"venv": true}          run with the project's .venv (requirements.txt) activated; built silently,
                          one per requirements.txt
  {"env": true}           `source env.sh` silently first, as Ana's shell profile does
  {"setup": ["cmd"]}      run silently before the session: ONLY what happens off screen between two
                          sections (the desk's business day), never the pipeline's own state
  {"generated": ["tradebook", "reference"]}  tradebook_gen's parts: tradebook → data/tradebook/,
                          reference → reference/ (not committed; cached by the generator's source)
  {"capture": ["path"]}   files the session writes that a scene shows; saved to captured/. A path
                          `lake:<container>/<blob>` is a blob, read from the lake after the session
  {"volatile": true}      compared with digits, hex and UUIDs masked; or a list: ["uuid"], ["digits"]
  {"columns": 80}         the pane's width (default 80): output wider than it wraps, as a terminal does
"""
from __future__ import annotations

import difflib
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / 'spine'
# Course order: the chain runs through the courses in this order (COURSE-PLAN.md, "The courses").
COURSES = ['intro', 'how-azure-runs', 'start', 'secure', 'land', 'network', 'extract', 'bronze', 'silver', 'gold',
           'orchestrate', 'operate']
USER = 'ana'
HOME = Path('/home') / USER
PROJECT = 'lc-exposure'
WORK = HOME / PROJECT
DB = 'tradebook'
SPINE_ROOT = Path(os.environ.get('SPINE_ROOT', '/tmp/tradefin-spine'))
PINNED = 'Python 3.14.9'
PYTHON = '/usr/local/bin/python3.14'
PG_MAJOR = 18
AZURITE_PORT = 10000
# Run outputs, the venv, generated data: never part of a step's snapshot, never removed by a lay.
IGNORED = {'__pycache__', '.venv', 'data', 'reference', 'out'}
MARK = '__SPINE_MARK__'
UUID = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
ANSI = re.compile(r'\x1b\[[0-9;?]*[@-~]|\x1b[=>]|\r')


# ── the steps ─────────────────────────────────────────────────────────────────────────────────────

def config_of(step: Path) -> dict:
    return json.loads((step / 'step.json').read_text()) if (step / 'step.json').exists() else {}


def name_of(step: Path) -> str:
    return step.relative_to(ROOT).as_posix()


def every_step() -> list[Path]:
    steps = [p.parent for p in ROOT.glob('*/*/step.json')]
    order = {c: i for i, c in enumerate(COURSES)}
    for s in steps:
        if s.parent.name not in order:
            sys.exit(f'✗ {name_of(s)}: course "{s.parent.name}" is not in COURSES')
    return sorted(steps, key=lambda s: (order[s.parent.name], s.name))


def files(step: Path) -> dict[str, bytes]:
    """A step's project as {relative path: bytes}, without run outputs."""
    root = step / 'project'
    if not root.exists():
        return {}
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in sorted(root.rglob('*'))
            if p.is_file() and not IGNORED & set(p.relative_to(root).parts) and p.suffix != '.pyc'}


def commands(session: str) -> list[str]:
    return [line[2:] for line in session.splitlines() if line.startswith('$ ')]


def lineage(step: Path) -> list[str]:
    """Why this step is not its parent plus its declared changes (empty when it is)."""
    name, config = name_of(step), config_of(step)
    kinds = [k for k in ('first', 'from', 'lab') if config.get(k)]
    if len(kinds) != 1:
        return [f'{name}: step.json needs exactly one of "first", "from", "lab" (has {kinds or "none"})']
    if 'from' not in kinds:
        return [f'{name}: "changes" only means something with "from"'] if config.get('changes') else []
    parent = ROOT / config['from']
    if not (parent / 'step.json').exists():
        return [f'{name}: "from" names {config["from"]}, which is not a step']
    if config_of(parent).get('lab'):
        return [f'{name}: "from" names a lab, which is outside the chain']
    if 'changes' not in config:
        return [f'{name}: "from" without "changes" (use [] for a section that only looks)']
    changes = config['changes']
    under = lambda path, c: path == c or path.startswith(c.rstrip('/') + '/')
    before, after = files(parent), files(step)
    differs = {p for p in before.keys() | after.keys() if before.get(p) != after.get(p)}
    out = [f'{name}: {p} differs from {config["from"]} but is not in "changes"' for p in sorted(differs) if not any(under(p, c) for c in changes)]
    out += [f'{name}: "changes" lists {c}, which did not change' for c in changes if not any(under(p, c) for p in differs)]
    return out


def chain() -> list[Path]:
    """The chain from the `first` step, in order. It is a line: every step has at most one child."""
    steps = every_step()
    firsts = [s for s in steps if config_of(s).get('first')]
    if len(firsts) > 1:
        sys.exit(f'✗ more than one "first" step: {[name_of(s) for s in firsts]}')
    children: dict[str, list[Path]] = {}
    for s in steps:
        if config_of(s).get('from'):
            children.setdefault(config_of(s)['from'], []).append(s)
    for parent, kids in children.items():
        if len(kids) > 1:
            sys.exit(f'✗ {parent} has {len(kids)} children ({[name_of(k) for k in kids]}): the chain is a line')
    out = firsts[:1]
    while out and name_of(out[-1]) in children:
        out.append(children[name_of(out[-1])][0])
    return out


def lineage_of(step: Path) -> list[Path]:
    """The step and every ancestor through `from`, oldest first."""
    out = [step]
    while config_of(out[0]).get('from'):
        out.insert(0, ROOT / config_of(out[0])['from'])
    return out


def key_of(step: Path) -> str:
    """An Azure step's KEY: its step.json, files and typed commands, and every ancestor's. Not scripts/:
    improving the machine forces no re-record."""
    h = hashlib.sha256()
    for s in lineage_of(step):
        h.update(name_of(s).encode() + b'\0' + (s / 'step.json').read_bytes())
        for path, data in files(s).items():
            h.update(path.encode() + b'\0' + hashlib.sha256(data).digest())
        session = (s / 'session.txt').read_text() if (s / 'session.txt').exists() else ''
        h.update('\n'.join(commands(session)).encode())
    return h.hexdigest()


# ── the machine ───────────────────────────────────────────────────────────────────────────────────

def run(args: list[str], **kw) -> subprocess.CompletedProcess:
    r = subprocess.run(args, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(f'✗ `{" ".join(args)}` failed:\n{r.stdout}{r.stderr}')
    return r


def admin(sql: str, db: str = 'postgres') -> str:
    return run(['runuser', '-u', 'postgres', '--', 'psql', '-X', '-q', '-At', '-h', '/tmp', '-v', 'ON_ERROR_STOP=1', '-d', db, '-c', sql]).stdout


def environment() -> dict:
    keep = {k: v for k, v in os.environ.items() if k in ('LANG', 'LC_ALL', 'TZ', 'HTTPS_PROXY', 'HTTP_PROXY', 'NO_PROXY',
                                                        'https_proxy', 'http_proxy', 'no_proxy', 'SSL_CERT_FILE',
                                                        'REQUESTS_CA_BUNDLE', 'PIP_INDEX_URL', 'PIP_CERT',
                                                        'NODE_EXTRA_CA_CERTS')}
    for k in ('SSL_CERT_FILE', 'REQUESTS_CA_BUNDLE', 'PIP_CERT', 'NODE_EXTRA_CA_CERTS'):
        # A proxy's CA bundle under /root is unreadable to ana: the replay hands her a copy
        if os.environ.get(k) and Path(os.environ[k]).is_file():
            copy = SPINE_ROOT / 'ca-bundle.crt'
            if not copy.exists():
                shutil.copy(os.environ[k], copy)
                copy.chmod(0o644)
            keep[k] = str(copy)
    return {**keep, 'HOME': str(HOME), 'USER': USER, 'LOGNAME': USER, 'PATH': '/usr/local/bin:/usr/bin:/bin',
            'TERM': 'dumb', 'NO_COLOR': '1', 'PYTHON_COLORS': '0', 'PS1': '', 'PGHOST': '/tmp',
            'PIP_DISABLE_PIP_VERSION_CHECK': '1', 'PSQLRC': '/dev/null', 'PAGER': 'cat', 'PSQL_PAGER': 'cat',
            'AZURE_CORE_COLLECT_TELEMETRY': 'no', 'AZURE_CORE_ONLY_SHOW_ERRORS': 'false', 'AZURE_CONFIG_DIR': str(HOME / '.azure'),
            'PIP_CACHE_DIR': str(SPINE_ROOT / 'pip-cache'), 'COLUMNS': '80', 'TZ': 'UTC'}


class Lake:
    """Azurite: the lake, emulated (Blob API only). One per chain, fresh at its start."""

    def __init__(self) -> None:
        self.dir = SPINE_ROOT / 'azurite'
        self.proc: subprocess.Popen | None = None

    def start(self) -> None:
        self.dir.mkdir(parents=True, exist_ok=True)
        self.proc = subprocess.Popen(['azurite-blob', '--blobHost', '127.0.0.1', '--blobPort', str(AZURITE_PORT), '--location', str(self.dir),
                                      '--silent', '--skipApiVersionCheck', '--loose'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        import socket
        for _ in range(100):
            try:
                socket.create_connection(('127.0.0.1', AZURITE_PORT), timeout=0.2).close()
                return
            except OSError:
                time.sleep(0.1)
        sys.exit('✗ Azurite did not start')

    def stop(self) -> None:
        if self.proc:
            self.proc.terminate()
            self.proc.wait()
            self.proc = None

    def reset(self) -> None:
        self.stop()
        shutil.rmtree(self.dir, ignore_errors=True)
        self.start()


def generated(part: str) -> Path:
    """tradebook_gen's output for a part, generated once per generator source."""
    h = hashlib.sha256()
    for p in sorted((REPO / 'tradebook_gen').glob('*.py')):
        h.update(p.read_bytes())
    cache = SPINE_ROOT / 'data' / h.hexdigest()[:16]
    if not cache.exists():
        tmp = cache.with_suffix('.tmp')
        shutil.rmtree(tmp, ignore_errors=True)
        run([sys.executable, '-m', 'tradebook_gen', '--out', str(tmp)], cwd=REPO)
        tmp.rename(cache)
    return cache / part


def lay(step: Path) -> None:
    """Lay the step's files over the working copy: a file it no longer has goes, run outputs stay."""
    want = files(step)
    if WORK.exists():
        for p in sorted(WORK.rglob('*'), reverse=True):
            rel = p.relative_to(WORK)
            if IGNORED & set(rel.parts):
                continue
            if p.is_file() and rel.as_posix() not in want:
                p.unlink()
            elif p.is_dir() and not any(p.iterdir()):
                p.rmdir()
    for path, data in want.items():
        target = WORK / path
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.read_bytes() != data:
            target.write_bytes(data)
    for part in config_of(step).get('generated', []):
        # TradeBook's files are the local copy's seed (data/, not shown); the risk team's reference
        # files are the project's own reference/ folder (COURSE-PLAN.md, "The app")
        shutil.copytree(generated(part), WORK / ('reference' if part == 'reference' else f'data/{part}'), dirs_exist_ok=True)
    run(['chown', '-R', f'{USER}:{USER}', str(WORK)])


def venv(env: dict) -> dict:
    """The project's .venv for its requirements.txt: built silently once, parked when it changes."""
    req = WORK / 'requirements.txt'
    if not req.exists():
        sys.exit('✗ "venv": true needs a requirements.txt')
    key = hashlib.sha256(req.read_bytes()).hexdigest()[:16]
    stamp = WORK / '.venv' / '.spine-key'
    if not (stamp.exists() and stamp.read_text() == key):
        if (WORK / '.venv').exists():
            old = (stamp.read_text() if stamp.exists() else 'unknown')
            parked = SPINE_ROOT / 'venvs' / old
            shutil.rmtree(parked, ignore_errors=True)
            parked.parent.mkdir(parents=True, exist_ok=True)
            (WORK / '.venv').rename(parked)
        parked = SPINE_ROOT / 'venvs' / key
        if parked.exists():
            parked.rename(WORK / '.venv')
        else:
            as_ana(f'{PYTHON} -m venv .venv && .venv/bin/pip install -q -r requirements.txt', env, check=True)
            (WORK / '.venv' / '.spine-key').write_text(key)
    return {**env, 'VIRTUAL_ENV': str(WORK / '.venv'), 'PATH': f"{WORK / '.venv' / 'bin'}:{env['PATH']}"}


def as_ana(script: str, env: dict, check: bool = False) -> subprocess.CompletedProcess:
    r = subprocess.run(['runuser', '-u', USER, '--', 'env', '-i', *[f'{k}={v}' for k, v in env.items()], 'bash', '-c', script],
                       cwd=WORK, capture_output=True, text=True)
    if check and r.returncode:
        sys.exit(f'✗ `{script}` failed:\n{r.stdout}{r.stderr}')
    return r


def wrap(text: str, columns: int) -> str:
    rows = []
    for line in text.split('\n'):
        rows += [line[i:i + columns] for i in range(0, len(line), columns)] or ['']
    return '\n'.join(rows)


def session_of(step: Path, env: dict) -> tuple[str, dict[str, str]]:
    """Run the step's setup silently, then its commands one by one, in ONE shell's state."""
    config = config_of(step)
    if config.get('venv'):
        env = venv(env)
    prelude = 'source env.sh\n' if config.get('env') else ''
    for cmd in config.get('setup', []):
        r = as_ana(prelude + cmd, env)
        if r.returncode:
            sys.exit(f'✗ {name_of(step)}: setup `{cmd}` failed:\n{r.stdout}{r.stderr}')
    cwd, blocks, columns = WORK, [], config.get('columns', 80)
    state = SPINE_ROOT / 'shell-state'
    state.write_text(prelude)
    run(['chmod', '644', str(state)])
    for cmd in commands((step / 'session.txt').read_text()):
        if len(cmd) + 2 > columns:  # a wrapped command would read back as a shorter one
            sys.exit(f'✗ {name_of(step)}: `$ {cmd[:40]}…` is {len(cmd) + 2} columns; the pane holds {columns}')
        script = f'source {state}\ncd {cwd}\n{{ {cmd}\n}} 2>&1\necho "{MARK}$PWD"\n'
        r = as_ana(script, env)
        output, _, after = (r.stdout + r.stderr).partition(MARK)
        if after:
            cwd = Path(after.split('\n')[0])
        output = ANSI.sub('', output).rstrip('\n')
        output = '\n'.join(line.rstrip() for line in output.split('\n'))
        blocks.append(wrap(f'$ {cmd}', columns) + (f'\n{wrap(output, columns)}' if output else ''))
    captured = {}
    for name in config.get('capture', []):
        if name.startswith('lake:'):  # a blob, read from the lake after the session
            container, _, blob = name[5:].partition('/')
            tmp = SPINE_ROOT / 'capture.tmp'
            as_ana(prelude + f'az storage blob download -c {container} -n "{blob}" -f {tmp} -o none', env, check=True)
            captured[name[5:]] = tmp.read_text()
            tmp.unlink()
        else:
            captured[name] = (WORK / name).read_text()
    return '\n'.join(blocks).rstrip('\n') + '\n', captured


def masked(text: str, step: Path) -> str:
    kinds = config_of(step).get('volatile')
    if not kinds:
        return text
    kinds = {'uuid', 'hex', 'digits'} if kinds is True else set(kinds)
    if 'uuid' in kinds:
        text = UUID.sub('<uuid>', text)
    if 'hex' in kinds:
        text = re.sub(r'0x[0-9a-f]+', '0x#', text)
    return re.sub(r' *\d+(?:[.,]\d+)*', ' #', text) if 'digits' in kinds else text


class Snapshot:
    """A branch's state, put back after it: working copy (not .venv), database, lake."""

    def __init__(self, lake: Lake) -> None:
        self.lake, self.dir = lake, SPINE_ROOT / 'branch'
        shutil.rmtree(self.dir, ignore_errors=True)
        shutil.copytree(WORK, self.dir / 'work', symlinks=True, ignore=shutil.ignore_patterns('.venv'))
        admin(f'DROP DATABASE IF EXISTS {DB}_saved')
        admin(f'CREATE DATABASE {DB}_saved TEMPLATE {DB}')
        lake.stop()
        shutil.copytree(lake.dir, self.dir / 'azurite')
        lake.start()

    def restore(self) -> None:
        for p in WORK.iterdir():
            if p.name != '.venv':
                shutil.rmtree(p) if p.is_dir() and not p.is_symlink() else p.unlink()
        shutil.copytree(self.dir / 'work', WORK, symlinks=True, dirs_exist_ok=True)
        admin(f'DROP DATABASE {DB}')
        admin(f'ALTER DATABASE {DB}_saved RENAME TO {DB}')
        self.lake.stop()
        shutil.rmtree(self.lake.dir)
        shutil.copytree(self.dir / 'azurite', self.lake.dir)
        self.lake.start()


def fresh(lake: Lake) -> None:
    """A new chain (or lab): an empty working copy, an empty database, an empty lake."""
    if WORK.exists():
        for p in WORK.iterdir():
            if p.name != '.venv':
                shutil.rmtree(p) if p.is_dir() and not p.is_symlink() else p.unlink()
    WORK.mkdir(parents=True, exist_ok=True)
    shutil.rmtree(HOME / '.azure', ignore_errors=True)
    admin(f'DROP DATABASE IF EXISTS {DB}')
    admin(f'DROP DATABASE IF EXISTS {DB}_saved')
    admin(f'CREATE DATABASE {DB} OWNER {USER}')
    lake.reset()


# ── recording an Azure step ───────────────────────────────────────────────────────────────────────

FACTS = {  # COURSE-PLAN.md, "Facts": what a real id is shown as
    'subscription': '00000000-0000-0000-0000-0000000000d1',
    'tenant': '00000000-0000-0000-0000-0000000000a1',
    'client': '00000000-0000-0000-0000-0000000000c1',
    'domain': 'syndicabank.onmicrosoft.example',
}
SECRETS = ('AZURE_TENANT_ID', 'AZURE_SUBSCRIPTION_ID', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET')


class Normaliser:
    """Real ids, hosts, emails and timestamps → the values in COURSE-PLAN.md, "Facts". Every other GUID
    becomes a stable placeholder in order of first appearance; timestamps keep their spacing from a
    fixed clock. `refuse` lists every fragment of a known real value still in the text."""

    CLOCK = '2026-11-01T09:30:00'
    ISO = re.compile(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?')

    def __init__(self, real: dict[str, str], names: dict[str, str]) -> None:
        self.real = {k: v.lower() for k, v in real.items() if v}
        self.names = names  # real resource name → shown name (a storage account's global suffix)
        self.guids: dict[str, str] = {}
        self.t0 = None

    def __call__(self, text: str) -> str:
        from datetime import datetime, timedelta
        for real, shown in self.names.items():
            text = text.replace(real, shown)
        for kind, value in self.real.items():
            if kind in FACTS:
                text = re.sub(re.escape(value), FACTS[kind], text, flags=re.I)
        if self.real.get('tenant_domain'):
            text = re.sub(re.escape(self.real['tenant_domain']), FACTS['domain'], text, flags=re.I)

        def guid(m: re.Match) -> str:
            g = m.group(0).lower()
            if g in FACTS.values() or g.startswith('00000000-0000-0000-0000-'):
                return g
            return self.guids.setdefault(g, f'00000000-0000-0000-0000-{0x1000 + len(self.guids):012x}')
        text = UUID.sub(guid, text)

        def stamp(m: re.Match) -> str:
            raw = m.group(0)
            t = datetime.fromisoformat(raw.replace('Z', '+00:00')).replace(tzinfo=None)
            self.t0 = self.t0 or t
            shown = datetime.fromisoformat(self.CLOCK) + (t - self.t0)
            return shown.isoformat(timespec='seconds') + ('Z' if raw.endswith('Z') else '+00:00' if '+' in raw[10:] else '')
        text = self.ISO.sub(stamp, text)
        text = re.sub(r'adb-\d+\.\d+\.azuredatabricks\.net', 'adb-0000000000000000.0.azuredatabricks.net', text)
        return re.sub(r'[\w.+-]+@(?!syndicabank\.)[\w-]+(\.[\w-]+)+', f'ana@{FACTS["domain"]}', text)

    def refuse(self, text: str) -> list[str]:
        out = []
        for kind, value in self.real.items():
            for frag in re.findall(r'[0-9a-f]{8,}', value.replace('-', '')) + ([value] if len(value) >= 6 else []):
                if frag.lower() in text.lower().replace('-', ''):
                    out.append(f'a fragment of the real {kind}')
                    break
        return out


def record(step: Path) -> int:
    config = config_of(step)
    if not config.get('azure'):
        sys.exit(f'✗ {name_of(step)} is a local step: it is replayed, not recorded')
    missing = [s for s in SECRETS if not os.environ.get(s)]
    if missing:
        sys.exit(f'✗ recording needs the environment secrets {", ".join(missing)} (CLAUDE.md, "Identity")')
    if shutil.which('az') is None:
        sys.exit('✗ the Azure CLI is not installed: scripts/install-azure-tools.sh')
    for parent in lineage_of(step)[:-1]:
        if config_of(parent).get('azure') and not recorded_ok(parent)[0]:
            sys.exit(f'✗ {name_of(parent)} is not recorded and current: record the course in order')
    lay(step)
    env = {**environment(), 'AZURE_CONFIG_DIR': str(SPINE_ROOT / 'azure-record')}
    run(['chown', '-R', f'{USER}:{USER}', str(SPINE_ROOT)])
    login = (f'az login --service-principal -u "{os.environ["AZURE_CLIENT_ID"]}" -p "$AZ_SECRET" --tenant "{os.environ["AZURE_TENANT_ID"]}" -o none'
             f' && az account set -s "{os.environ["AZURE_SUBSCRIPTION_ID"]}"')
    r = as_ana(login, {**env, 'AZ_SECRET': os.environ['AZURE_CLIENT_SECRET']})
    if r.returncode:
        sys.exit('✗ az login failed (the output is not printed: it may hold a secret)')
    shown = as_ana('az account show --query "{t:tenantDefaultDomain}" -o tsv', env).stdout.strip()
    real = {'subscription': os.environ['AZURE_SUBSCRIPTION_ID'], 'tenant': os.environ['AZURE_TENANT_ID'],
            'client': os.environ['AZURE_CLIENT_ID'], 'tenant_domain': shown}
    suffix = os.environ.get('TRADEFIN_SUFFIX', '')  # storage names are global: the owner's carry a suffix
    names = {f'sttradefindev{suffix}': 'sttradefindev', f'sttradefinprod{suffix}': 'sttradefinprod'} if suffix else {}
    norm = Normaliser(real, names)
    transcript, captured = session_of(step, env)
    transcript = norm(transcript)
    captured = {k: norm(v) for k, v in captured.items()}
    leaks = norm.refuse(transcript + ''.join(captured.values()))
    if os.environ['AZURE_CLIENT_SECRET'] in transcript:
        leaks.append('the client secret')
    if leaks:
        sys.exit(f'✗ {name_of(step)}: the transcript still holds {", ".join(sorted(set(leaks)))} — nothing written')
    (step / 'session.txt').write_text(transcript)
    for file, text in captured.items():
        (step / 'captured' / file).parent.mkdir(parents=True, exist_ok=True)
        (step / 'captured' / file).write_text(text)
    az = as_ana('az version --query \'"azure-cli"\' -o tsv', env).stdout.strip()
    (step / 'recorded.json').write_text(json.dumps({'key': key_of(step), 'transcript': hashlib.sha256(transcript.encode()).hexdigest(),
                                                    'azure_cli': az}, indent=2) + '\n')
    print(f'✓ recorded {name_of(step)}')
    return 0


def recorded_ok(step: Path) -> tuple[bool, str]:
    rec = step / 'recorded.json'
    if not rec.exists():
        return False, 'not recorded yet (python scripts/spine.py --record ' + name_of(step) + ')'
    data = json.loads(rec.read_text())
    if data['key'] != key_of(step):
        return False, 'changed since it was recorded (or a step before it did): re-record it and every Azure step after it'
    if data['transcript'] != hashlib.sha256((step / 'session.txt').read_bytes()).hexdigest():
        return False, 'session.txt was edited by hand: a transcript is recorded, never typed'
    return True, ''


def teardown() -> int:
    r = run(['az', 'group', 'list', '--query', "[?contains(name, 'tradefin')].name", '-o', 'tsv'])
    for group in r.stdout.split():
        run(['az', 'group', 'delete', '-n', group, '--yes', '--no-wait'])
        print(f'deleting {group}')
    return 0


# ── main ──────────────────────────────────────────────────────────────────────────────────────────

def preflight() -> str | None:
    if os.geteuid() != 0:
        return 'run as root: the replay drives the shell as ana and the server as postgres'
    if run([PYTHON, '-c', 'import platform; print("Python " + platform.python_version())']).stdout.strip() != PINNED:
        return f'{PYTHON} is not {PINNED}: run scripts/install-toolchain.sh'
    major = admin('SHOW server_version_num')
    if int(major) // 10000 != PG_MAJOR:
        return f'PostgreSQL is {major}, not {PG_MAJOR}: run scripts/setup-postgres.sh'
    if shutil.which('azurite-blob') is None:
        return 'Azurite is not installed: run scripts/install-azure-tools.sh'
    return None


def main(argv: list[str]) -> int:
    if '--record' in argv:
        return record(ROOT / argv[argv.index('--record') + 1])
    if '--teardown' in argv:
        return teardown()
    write = '--write' in argv
    only = [a for a in argv if not a.startswith('--')]
    problems = [p for s in every_step() for p in lineage(s)]
    for p in problems:
        print(f'✗ {p}')
    if problems and write:
        print('✗ the chain is broken: fix step.json or the snapshots before rewriting transcripts')
        return 1
    problem = preflight()
    if problem:
        print(f'✗ {problem}')
        return 1
    SPINE_ROOT.mkdir(parents=True, exist_ok=True)
    (SPINE_ROOT / 'pip-cache').mkdir(exist_ok=True)
    run(['chown', f'{USER}:{USER}', str(SPINE_ROOT), str(SPINE_ROOT / 'pip-cache')])
    asked = lambda s: not only or any(name_of(s).startswith(o) for o in only)
    line = chain()
    on_chain = set(line)
    labs = [s for s in every_step() if config_of(s).get('lab')]
    orphans = [s for s in every_step() if s not in on_chain and s not in labs]
    for s in orphans:
        problems.append(f'{name_of(s)}: not on the chain from the first step')
        print(f'✗ {problems[-1]}')
    lake = Lake()
    replayed = 0
    try:
        for group in [line] + [[lab] for lab in labs]:
            # A chain is replayed from its start up to the last step asked for; a lab alone.
            wanted = [s for s in group if asked(s)]
            if not wanted:
                continue
            fresh(lake)
            for step in group[:group.index(wanted[-1]) + 1]:
                config = config_of(step)
                if config.get('azure'):
                    ok, why = recorded_ok(step)
                    if asked(step):
                        print(f'{"✓" if ok else "✗"} {name_of(step)} (recorded on Azure){"" if ok else ": " + why}')
                        problems += [] if ok else [why]
                    continue
                lay(step)
                snap = Snapshot(lake) if config.get('branch') else None
                transcript, captured = session_of(step, environment())
                if snap:
                    snap.restore()
                if not asked(step):
                    continue
                replayed += 1
                if write:
                    (step / 'session.txt').write_text(transcript)
                    for file, text in captured.items():
                        (step / 'captured' / file).parent.mkdir(parents=True, exist_ok=True)
                        (step / 'captured' / file).write_text(text)
                    print(f'wrote {name_of(step)}')
                    continue
                before = len(problems)
                expected = (step / 'session.txt').read_text()
                if masked(transcript, step) != masked(expected, step):
                    problems.append(f'{name_of(step)}: the terminal pane differs from a real run')
                    sys.stdout.writelines(difflib.unified_diff(expected.splitlines(True), transcript.splitlines(True), 'session.txt', 'real run'))
                for file, text in captured.items():
                    if not (step / 'captured' / file).exists() or (step / 'captured' / file).read_text() != text:
                        problems.append(f'{name_of(step)}: captured/{file} differs from a real run')
                print(f'{"✗" if len(problems) > before else "✓"} {name_of(step)}')
    finally:
        lake.stop()
    if not write:
        print(f"{'✗' if problems else '✓'} {replayed} local step(s) replayed, {len(problems)} problem(s)")
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

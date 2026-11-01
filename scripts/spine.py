#!/usr/bin/env python3
"""Build the spine one step at a time, each from the state the step before it left; check it all
without running anything.

The spine is the course's one project, `lc-exposure`, kept as real files: one snapshot per step in
spine/<course>/<NN-step>/project/. Each step's session.txt is the terminal pane a scene shows — `$ `
lines are commands, everything else is their output. Scenes import these files with Vite's `?raw`,
so a frame can only show what a real run printed.

  python scripts/spine.py                  check: every step written, current and untouched. Runs
                                           NOTHING (< 1 s)
  python scripts/spine.py --write <steps>  write local steps: each runs ONCE, from the saved state of
                                           the local step before it, and saves its own state
  python scripts/spine.py --record <step>  record ONE Azure step on the owner's subscription (needs the
                                           AZURE_* environment secrets): run once, normalise, write
  python scripts/spine.py --replay [steps] deliberate, after a tool upgrade: run the local chain from
                                           its start and compare every transcript
  python scripts/spine.py --teardown       delete every *tradefin* resource group (after a course)

STEP BY STEP, NEVER AGAIN AND AGAIN (aws-ecommerce's method, for both kinds of step). Each step is
written once, starting from what the step before it left; nothing before it runs again.

  Local   after its session, the step's whole state is saved beside it in state/: the database
          (db.sql.gz, pg_dump), the lake (lake.tar.gz, Azurite's folder) and the working copy
          (work.tar.gz, without .venv). `--write land/07` restores land/06's state, lays land/07's
          files, runs land/07's commands, saves land/07's state. A branch saves none: the step
          after it starts from the state before it.
  Azure   recorded once (--record) against the subscription as the step before it left it.

Both write recorded.json: the step's KEY and the hash of its transcript. The key hashes the step's
step.json, files and typed commands, and every ancestor's files and RECORDED transcript, so editing
or rewriting a step makes every step after it stale (check names them; write them again, in order,
each from the one before). Not scripts/: improving the machine forces nothing.

Ported from spark-ecommerce-analytics (local replay, data generated not committed, `volatile`) and
aws-ecommerce (record-once, keys, normalisation in the recorder). What is this course's own:

TWO KINDS OF STEP (COURSE-PLAN.md, "The spine"):

  Local ({})            run here, deterministically: PostgreSQL 18.6 (TradeBook), Azurite (the lake,
                        emulated), Python 3.14.9. The pipeline's numbers all come from here.
  Azure ({"azure": true})  run once on the owner's subscription. An Azure step changes no local
                        state, so a local step after it starts from the last local step's state.

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
  {"env": true}           `source env.sh` silently first, as Ana's shell profile does; a file name
                          sources that file instead (`"env": "azure.sh"`: an Azure step's shell)
  {"setup": ["cmd"]}      run silently before the session: ONLY what happens off screen between two
                          sections (the desk's business day), never the pipeline's own state
  {"generated": ["tradebook", "reference"]}  tradebook_gen's parts: tradebook → data/tradebook/,
                          reference → reference/ (not committed; cached by the generator's source)
  {"capture": ["path"]}   files the session writes that a scene shows; saved to captured/. A path
                          `lake:<container>/<blob>` is a blob, read from the lake after the session
  {"volatile": true}      compared with digits, hex and UUIDs masked; or a list: ["uuid"], ["digits"]
  {"columns": 80}         the pane's width (default 80): output wider than it wraps, as a terminal does
  {"restore": true}       an Azure step recorded after a teardown: first put the subscription back as
                          its parent left it (restore_azure: the parent's infra/, applied silently)
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
# Terraform's local state and saved plans hold real ids: never in a snapshot, never in a state archive.
IGNORED = {'__pycache__', '.venv', 'data', 'reference', 'out', '.terraform', 'terraform.tfstate', 'terraform.tfstate.backup', 'tfplan',
           'jars', 'logs', 'lake', 'spark-warehouse', 'metastore_db'}
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
    """A step's KEY: its step.json, files and typed commands, and every ancestor's files and RECORDED
    transcript (what the step started from). A local step adds tradebook_gen's source: its data is
    the generator's. Not scripts/: improving the machine forces no re-write."""
    h = hashlib.sha256()
    chain = lineage_of(step)
    for s in chain:
        h.update(name_of(s).encode() + b'\0' + (s / 'step.json').read_bytes())
        for path, data in files(s).items():
            h.update(path.encode() + b'\0' + hashlib.sha256(data).digest())
        session = (s / 'session.txt').read_text() if (s / 'session.txt').exists() else ''
        h.update((session if s != step else '\n'.join(commands(session))).encode())
    if not config_of(step).get('azure'):
        for p in sorted((REPO / 'tradebook_gen').glob('*.py')):
            h.update(p.read_bytes())
    return h.hexdigest()


def state_parent(step: Path) -> Path | None:
    """The local step whose saved state this step starts from: the nearest ancestor that is local
    and not a branch (an Azure step leaves local state as it found it; a branch is put back)."""
    for s in reversed(lineage_of(step)[:-1]):
        if not config_of(s).get('azure') and not config_of(s).get('branch'):
            return s
    return None


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
            'PIP_CACHE_DIR': str(SPINE_ROOT / 'pip-cache'), 'COLUMNS': '80', 'TZ': 'UTC',
            # a container's hostname resolves to loopback, which Spark warns about; a laptop's does not
            'SPARK_LOCAL_IP': '127.0.0.1',
            # Terraform one request at a time (aws-ecommerce's rule): the same order every recording,
            # and no burst of parallel listKeys calls for the sandbox's proxy to reset. Invisible in
            # every typed command.
            'TF_CLI_ARGS_plan': '-parallelism=1', 'TF_CLI_ARGS_apply': '-parallelism=1',
            'TF_CLI_ARGS_destroy': '-parallelism=1'}


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
    if (WORK / 'jars.txt').exists():  # Delta's jars (Maven Central), fetched once and cached by name
        (WORK / 'jars').mkdir(exist_ok=True)
        for url in (WORK / 'jars.txt').read_text().split():
            if url.startswith('#'):
                continue
            cached = SPINE_ROOT / 'jars' / url.rsplit('/', 1)[1]
            if not cached.exists():
                cached.parent.mkdir(parents=True, exist_ok=True)
                run(['curl', '-sSfL', '-o', str(cached), url])
            shutil.copy(cached, WORK / 'jars' / cached.name)
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


def session_of(step: Path, env: dict, normalise=None) -> tuple[str, dict[str, str], str]:
    """Run the step's setup silently, then its commands one by one, in ONE shell's state. Returns the
    transcript (normalised BEFORE it is wrapped: a wrapped id is an id split in two), the captures, and
    the raw unwrapped output, which a recording scans for leaks."""
    config = config_of(step)
    if config.get('venv'):
        env = venv(env)
    env_file = config.get('env')
    prelude = f'source {"env.sh" if env_file is True else env_file}\n' if env_file else ''
    for cmd in config.get('setup', []):
        r = as_ana(prelude + cmd, env)
        if r.returncode:
            sys.exit(f'✗ {name_of(step)}: setup `{cmd}` failed:\n{r.stdout}{r.stderr}')
    cwd, blocks, columns, raw = WORK, [], config.get('columns', 80), []
    normalise = normalise or (lambda s: s)
    # One terminal's state across commands that each run in their own bash: the profile (prelude),
    # then every variable a typed command set (`ID=$(…)`, `URL=…`), saved after it and sourced before
    # the next. The names bash starts with are the baseline; only new ones are carried.
    state, saved = SPINE_ROOT / 'shell-state', SPINE_ROOT / 'shell-vars'
    state.write_text(prelude)
    saved.write_text('')
    baseline = SPINE_ROOT / 'shell-baseline'
    baseline.write_text(as_ana(f'source {state} >/dev/null 2>&1; compgen -v | sort', env).stdout)
    for f in (state, saved, baseline):
        run(['chmod', '666', str(f)])
    typed = commands((step / 'session.txt').read_text())
    for cmd in typed:  # before ANY runs: an Azure command must not run for a step that cannot record
        if len(cmd) + 2 > columns:  # a wrapped command would read back as a shorter one
            sys.exit(f'✗ {name_of(step)}: `$ {cmd[:40]}…` is {len(cmd) + 2} columns; the pane holds {columns}')
    for cmd in typed:
        script = (f'source {state}\nsource {saved}\ncd {cwd}\n{{ {cmd}\n}} 2>&1\necho "{MARK}$PWD"\n'
                  f'new=$(comm -13 {baseline} <(compgen -v | sort) | grep -vx "new\\|BASH_.*\\|_" )\n'
                  f'[ -n "$new" ] && declare -p $new 2>/dev/null > {saved}.tmp && mv {saved}.tmp {saved}\n')
        r = as_ana(script, env)
        output, _, after = (r.stdout + r.stderr).partition(MARK)
        if after:
            cwd = Path(after.split('\n')[0])
        output = ANSI.sub('', output).rstrip('\n')
        output = '\n'.join(line.rstrip() for line in output.split('\n'))
        raw.append(output)
        output = normalise(output)
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
    captured = {k: normalise(v) for k, v in captured.items()}
    return '\n'.join(blocks).rstrip('\n') + '\n', captured, '\n'.join(raw)


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


# ── saved state: one local step at a time ──────────────────────────────────────────────────────────

def _tar(src: Path, dest: Path, skip: set[str] = frozenset()) -> None:
    import tarfile
    # Anything named in IGNORED that can hold a real id (Terraform's state) stays out at any depth
    secret = {'.terraform', 'terraform.tfstate', 'terraform.tfstate.backup', 'tfplan'}
    with tarfile.open(dest, 'w:gz') as tar:
        for p in sorted(src.iterdir()):
            if p.name not in skip:
                tar.add(p, arcname=p.name, filter=lambda info: None if secret & set(Path(info.name).parts) else info)


def _untar(src: Path, dest: Path) -> None:
    import tarfile
    with tarfile.open(src) as tar:
        tar.extractall(dest, filter='tar')


def save_state(step: Path, lake: Lake) -> None:
    import gzip
    d = step / 'state'
    shutil.rmtree(d, ignore_errors=True)
    d.mkdir()
    dump = run(['runuser', '-u', 'postgres', '--', 'pg_dump', '-h', '/tmp', '--no-owner', '--no-privileges', DB]).stdout
    with gzip.GzipFile(d / 'db.sql.gz', 'wb', mtime=0) as f:
        f.write(dump.encode())
    lake.stop()
    _tar(lake.dir, d / 'lake.tar.gz')
    lake.start()
    _tar(WORK, d / 'work.tar.gz', skip={'.venv'})


def restore_state(step: Path | None, lake: Lake) -> None:
    """Empty database, lake and working copy; then, if there is a step, exactly what it left."""
    import gzip
    fresh(lake)
    if step is None:
        return
    d = step / 'state'
    sql = gzip.decompress((d / 'db.sql.gz').read_bytes()).decode()
    r = subprocess.run(['runuser', '-u', USER, '--', 'psql', '-X', '-q', '-h', '/tmp', '-v', 'ON_ERROR_STOP=1', '-d', DB],
                       input=sql, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'✗ restoring {name_of(step)}\'s database failed:\n{r.stderr}')
    lake.stop()
    shutil.rmtree(lake.dir, ignore_errors=True)
    lake.dir.mkdir(parents=True)
    _untar(d / 'lake.tar.gz', lake.dir)
    lake.start()
    _untar(d / 'work.tar.gz', WORK)
    run(['chown', '-R', f'{USER}:{USER}', str(WORK)])


def write_local(step: Path, lake: Lake) -> None:
    parent = state_parent(step)
    if parent is not None and not recorded_ok(parent)[0]:
        sys.exit(f'✗ {name_of(step)} starts from {name_of(parent)}, which is {recorded_ok(parent)[1]}')
    restore_state(parent, lake)
    lay(step)
    transcript, captured, _ = session_of(step, environment())
    (step / 'session.txt').write_text(transcript)
    for file, text in captured.items():
        (step / 'captured' / file).parent.mkdir(parents=True, exist_ok=True)
        (step / 'captured' / file).write_text(text)
    if config_of(step).get('branch'):
        shutil.rmtree(step / 'state', ignore_errors=True)
    else:
        save_state(step, lake)
    (step / 'recorded.json').write_text(json.dumps({'key': key_of(step), 'transcript': hashlib.sha256(transcript.encode()).hexdigest()},
                                                   indent=2) + '\n')
    print(f'wrote {name_of(step)}{" (a branch: no state saved)" if config_of(step).get("branch") else ""}')


# ── recording an Azure step ───────────────────────────────────────────────────────────────────────

FACTS = {  # COURSE-PLAN.md, "Facts": what a real id is shown as
    'subscription': '00000000-0000-0000-0000-0000000000d1',
    'tenant': '00000000-0000-0000-0000-0000000000a1',
    'client': '00000000-0000-0000-0000-0000000000c1',
    'domain': 'syndicabank.onmicrosoft.example',
}
TRANSPORT = ('HTTP response was nil', 'connection may have been reset', 'connection reset by peer', 'i/o timeout',
             'TLS handshake timeout', 'RemoteDisconnected', 'Connection aborted',
             'is being deleted. Try operation later')  # the end of an earlier teardown, still running
SECRETS = ('AZURE_TENANT_ID', 'AZURE_SUBSCRIPTION_ID', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET')


class Normaliser:
    """Real ids, hosts, emails and timestamps → the values in COURSE-PLAN.md, "Facts". Every other GUID
    becomes a stable placeholder in order of first appearance; timestamps keep their spacing from a
    fixed clock. `refuse` lists every fragment of a known real value still in the text."""

    CLOCK = '2026-11-01T09:30:00'
    ISO = re.compile(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?')

    def __init__(self, real: dict[str, str], names: dict[str, str]) -> None:
        # a value is real only if it is one: an SP has no default domain, and the CLI says "None"
        self.real = {k: v.lower() for k, v in real.items() if v and v.lower() != 'none' and (k != 'tenant_domain' or '.' in v)}
        self.names = names  # real resource name → shown name (a storage account's global suffix)
        self.guids: dict[str, str] = {}
        self.t0 = None

    def __call__(self, text: str) -> str:
        # What was TYPED is never rewritten (the step's key hashes it); only what Azure printed
        return '\n'.join(line if line.startswith('$ ') else self.output(line) for line in text.split('\n'))

    B64 = re.compile(r'[A-Za-z0-9+/]{24,}={0,2}')

    def decoded(self, text: str) -> list[str]:
        """Every base64 run in the text that decodes to printable text (azurerm's client_config id is
        base64 of the client, object and subscription ids)."""
        import base64, binascii
        out = []
        for m in self.B64.finditer(text.replace('\n', '')):
            s = m.group(0)
            try:
                d = base64.b64decode(s + '=' * (-len(s) % 4), validate=True).decode()
            except (binascii.Error, UnicodeDecodeError, ValueError):
                continue
            if d.isprintable():
                out.append(d)
        return out

    def output(self, text: str) -> str:
        import base64, binascii

        def b64(m: re.Match) -> str:  # normalise inside a base64 value, and encode it again
            s = m.group(0)
            try:
                d = base64.b64decode(s + '=' * (-len(s) % 4), validate=True).decode()
            except (binascii.Error, UnicodeDecodeError, ValueError):
                return s
            if not d.isprintable():
                return s
            n = self.plain(d)
            return s if n == d else base64.b64encode(n.encode()).decode().rstrip('=') if not s.endswith('=') else base64.b64encode(n.encode()).decode()
        return self.plain(self.B64.sub(b64, text))

    def plain(self, text: str) -> str:
        from datetime import datetime
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
        # A SAS signature is a credential for as long as the token lives: never on screen
        text = re.sub(r'(sig=)[A-Za-z0-9%+/=]+', r'\1<signature>', text)
        return re.sub(r'[\w.+-]+@(?!syndicabank\.)[\w-]+(\.[\w-]+)+', f'ana@{FACTS["domain"]}', text)

    def refuse(self, text: str) -> list[str]:
        # Searched three ways: as written, with every line break removed (a wrapped id), and inside
        # every base64 run that decodes to text.
        text = '\n'.join([text, text.replace('\n', ''), *self.decoded(text)])
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
    env = {**environment(), 'AZURE_CONFIG_DIR': str(SPINE_ROOT / 'azure-record')}
    run(['chown', '-R', f'{USER}:{USER}', str(SPINE_ROOT)])
    login = (f'az login --service-principal -u "{os.environ["AZURE_CLIENT_ID"]}" -p "$AZ_SECRET" --tenant "{os.environ["AZURE_TENANT_ID"]}" -o none'
             f' && az account set -s "{os.environ["AZURE_SUBSCRIPTION_ID"]}"')
    r = as_ana(login, {**env, 'AZ_SECRET': os.environ['AZURE_CLIENT_SECRET']})
    if r.returncode:
        sys.exit('✗ az login failed (the output is not printed: it may hold a secret)')
    shown = as_ana('az account show --query "{t:tenantDefaultDomain}" -o tsv', env).stdout.strip()
    # The signed-in identity's object id, from its own token: it appears in role assignments and
    # inside azurerm's client_config id
    claims = as_ana('az account get-access-token --query accessToken -o tsv', env).stdout.strip().split('.')
    import base64
    oid = json.loads(base64.urlsafe_b64decode(claims[1] + '=' * (-len(claims[1]) % 4))).get('oid', '') if len(claims) > 1 else ''
    real = {'subscription': os.environ['AZURE_SUBSCRIPTION_ID'], 'tenant': os.environ['AZURE_TENANT_ID'],
            'client': os.environ['AZURE_CLIENT_ID'], 'tenant_domain': shown, 'object': oid}
    suffix = os.environ.get('TRADEFIN_SUFFIX', '')  # storage names are global: the owner's carry a suffix
    names = {f'sttradefindev{suffix}': 'sttradefindev', f'sttradefinprod{suffix}': 'sttradefinprod'} if suffix else {}
    # The subscription's display name is the owner's: shown as the plan's (Facts: "subscriptions")
    sub_name = as_ana('az account show --query name -o tsv', env).stdout.strip()
    if sub_name and sub_name != 'sub-tradefin-dev':
        names[sub_name] = 'sub-tradefin-dev'
    norm = Normaliser(real, names)
    if config.get('restore'):
        restore_azure(lineage_of(step)[-2], env)
    lay(step)
    transcript, captured, _ = session_of(step, env, normalise=norm.output)
    leaks = norm.refuse(transcript + '\n'.join(captured.values()))
    # A dropped connection is the network's, not the lesson's: record the step again
    flaky = [m for m in TRANSPORT if m in transcript]
    if flaky:
        sys.exit(f'✗ {name_of(step)}: a transport failure ("{flaky[0]}") is in the transcript — nothing written; record it again')
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


def restore_azure(parent: Path, env: dict) -> None:
    """{"restore": true}: put the subscription back as the PARENT step left it, silently, by applying
    the parent's own infra/ (every resource is Terraform, so its code IS its state): the state backend
    first, then apply until plan says No changes. A just re-created name can answer 404 for a while:
    on an error, wait, untaint, apply again."""
    lay(parent)
    run(['chown', '-R', f'{USER}:{USER}', str(SPINE_ROOT)])
    r = as_ana('bash infra/bootstrap.sh >/dev/null 2>&1', env)
    if r.returncode:
        sys.exit(f'✗ restoring {name_of(parent)}: the state backend could not be made')
    apply = 'cd infra && terraform init -input=false >/dev/null 2>&1 && terraform apply -var-file=envs/dev.tfvars -auto-approve -input=false -no-color 2>&1'
    for attempt in range(6):
        r = as_ana(apply, env)
        plan = as_ana('cd infra && terraform plan -var-file=envs/dev.tfvars -input=false -no-color -detailed-exitcode >/dev/null 2>&1', env)
        if plan.returncode == 0:
            print(f'· restored {name_of(parent)}\'s Azure state')
            time.sleep(120)  # let new role assignments reach the data plane before the step runs
            return
        time.sleep(90)
        for res in re.findall(r'^\s*# (\S+) is tainted', as_ana('cd infra && terraform plan -var-file=envs/dev.tfvars -input=false -no-color 2>&1', env).stdout, re.M):
            as_ana(f'cd infra && terraform untaint {res} >/dev/null 2>&1', env)
    sys.exit(f'✗ could not restore {name_of(parent)}\'s Azure state (plan never settled)')


def recorded_ok(step: Path) -> tuple[bool, str]:
    azure = config_of(step).get('azure')
    how = f'python scripts/spine.py {"--record" if azure else "--write"} {name_of(step)}'
    rec = step / 'recorded.json'
    if not rec.exists():
        return False, f'not written yet ({how})'
    data = json.loads(rec.read_text())
    if data['key'] != key_of(step):
        return False, f'changed since it was written, or a step before it did ({how}, then every stale step after it)'
    if data['transcript'] != hashlib.sha256((step / 'session.txt').read_bytes()).hexdigest():
        return False, 'session.txt was edited by hand: a transcript is run, never typed'
    if not azure and not config_of(step).get('branch') and not (step / 'state' / 'db.sql.gz').exists():
        return False, f'its saved state is missing ({how})'
    return True, ''


def teardown() -> int:
    """After a course: `terraform destroy` of what infra/ made, then the state's own resource group
    (COURSE-PLAN.md, "The spine"). Run with Ana's recording sign-in; prints no ids."""
    env = {**environment(), 'AZURE_CONFIG_DIR': str(SPINE_ROOT / 'azure-record')}
    if (WORK / 'infra' / 'main.tf').exists():
        r = as_ana('cd infra && terraform init -input=false >/dev/null && '
                   'terraform destroy -var-file=envs/dev.tfvars -auto-approve -input=false >/dev/null', env)
        print('✓ terraform destroy' if r.returncode == 0 else f'✗ terraform destroy failed:\n{ANSI.sub("", r.stderr)[-2000:]}')
        if r.returncode:
            return 1
    r = as_ana("az group list --query \"[?contains(name, 'tradefin')].name\" -o tsv", env)
    for group in r.stdout.split():
        as_ana(f'az group delete -n {group} --yes', env, check=True)
        print(f'✓ deleted {group}')
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
    write, replay = '--write' in argv, '--replay' in argv
    only = [a for a in argv if not a.startswith('--')]
    asked = lambda s: not only or any(name_of(s).startswith(o) for o in only)
    problems = [p for s in every_step() for p in lineage(s)]
    line = chain()
    labs = [s for s in every_step() if config_of(s).get('lab')]
    problems += [f'{name_of(s)}: not on the chain from the first step' for s in every_step() if s not in line and s not in labs]
    for p in problems:
        print(f'✗ {p}')
    if problems and (write or replay):
        print('✗ the chain is broken: fix step.json or the snapshots first')
        return 1
    ordered = line + labs
    if not write and not replay:  # the check: runs nothing
        for step in (s for s in ordered if asked(s)):
            ok, why = recorded_ok(step)
            kind = 'Azure' if config_of(step).get('azure') else 'local'
            print(f'{"✓" if ok else "✗"} {name_of(step)} ({kind}){"" if ok else ": " + why}')
            problems += [] if ok else [f'{name_of(step)}: {why}']
        print(f"{'✗' if problems else '✓'} {sum(map(asked, ordered))} step(s) checked, {len(problems)} problem(s)")
        return 1 if problems else 0
    problem = preflight()
    if problem:
        print(f'✗ {problem}')
        return 1
    SPINE_ROOT.mkdir(parents=True, exist_ok=True)
    (SPINE_ROOT / 'pip-cache').mkdir(exist_ok=True)
    run(['chown', f'{USER}:{USER}', str(SPINE_ROOT), str(SPINE_ROOT / 'pip-cache')])
    lake = Lake()
    try:
        if write:
            for step in (s for s in ordered if asked(s)):
                if config_of(step).get('azure'):
                    print(f'· {name_of(step)} is an Azure step: --record it')
                    continue
                write_local(step, lake)
            return 0
        # --replay: the whole local chain from its start (labs alone), compared with what was written
        for group in [line] + [[lab] for lab in labs]:
            wanted = [s for s in group if asked(s)]
            if not wanted:
                continue
            fresh(lake)
            for step in group[:group.index(wanted[-1]) + 1]:
                config = config_of(step)
                if config.get('azure'):
                    continue
                lay(step)
                snap = Snapshot(lake) if config.get('branch') else None
                transcript, captured, _ = session_of(step, environment())
                if snap:
                    snap.restore()
                if not asked(step):
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
    print(f"{'✗' if problems else '✓'} replayed, {len(problems)} problem(s)")
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

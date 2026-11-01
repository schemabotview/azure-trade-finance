#!/usr/bin/env python3
"""Scan every file git would commit for a fragment of a real Azure id (CLAUDE.md, "Invariants").

  python scripts/leaks.py      exit 1 on any hit; needs the AZURE_* environment secrets

The recorder refuses a leaking transcript, but a transcript is not the only file a step writes. This
runs the recorder's own check (as written, with line breaks removed, and inside every base64 run that
decodes to text) over the whole tree. Run it before every commit that holds a recording.
"""
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from spine import Normaliser  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
real = {k: os.environ.get(v, '') for k, v in
        (('subscription', 'AZURE_SUBSCRIPTION_ID'), ('tenant', 'AZURE_TENANT_ID'), ('client', 'AZURE_CLIENT_ID'))}
if not all(real.values()):
    sys.exit('✗ the AZURE_* secrets are not in the environment: nothing to scan for')
norm = Normaliser(real, {})
listed = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard'], cwd=REPO,
                        capture_output=True, text=True, check=True).stdout.split('\n')
hits = 0
for name in filter(None, listed):
    path = REPO / name
    try:
        text = path.read_text()
    except (UnicodeDecodeError, IsADirectoryError, FileNotFoundError):
        continue  # binary state archives hold only local data: no Azure call makes them
    for what in norm.refuse(text) + (['the client secret'] if os.environ.get('AZURE_CLIENT_SECRET', '\0') in text else []):
        hits += 1
        print(f'✗ {name}: {what}')
print(f"{'✗' if hits else '✓'} {len(listed)} file(s) scanned, {hits} leak(s)")
sys.exit(1 if hits else 0)

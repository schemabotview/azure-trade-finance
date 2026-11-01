#!/usr/bin/env python3
"""Carry the files a step ADDED (or changed) into every step after it on the chain.

  python scripts/carry.py <course/NN-step> <path in project> [...]

The spine is cumulative, and courses are not authored in chain order: Course 5 was written before
Course 3, so when a Course 3 step adds a file, every later step's project must hold it too, or the
chain check fails. A path that is a directory carries everything under it. A later step that
already changed the file itself (its bytes differ from the step before it) keeps its own version.
"""
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'spine'
sys.path.insert(0, str(ROOT.parent / 'scripts'))
from spine import chain, config_of, name_of  # noqa: E402

step = ROOT / sys.argv[1]
line = chain()
after = line[line.index(step) + 1:]
for rel in sys.argv[2:]:
    src = step / 'project' / rel
    paths = [p for p in src.rglob('*') if p.is_file()] if src.is_dir() else [src]
    for path in paths:
        sub = path.relative_to(step / 'project')
        previous = path.read_bytes()
        for other in after:
            target = other / 'project' / sub
            parent = ROOT / config_of(other)['from'] / 'project' / sub
            # a step that changed this file itself keeps its version (and so do the steps after it)
            if target.exists() and parent.exists() and target.read_bytes() != parent.read_bytes():
                break
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(path, target)
        print(f'carried {sub} into {len(after)} later step(s)')

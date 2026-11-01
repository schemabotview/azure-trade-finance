"""G1, the landing gate: is batch N exactly what its manifest promised?

    python extract/g1.py --batch 42      exit 1 when it is not
"""
import argparse
import csv
import io
import json
import sys

from lake import container


def check(batch: int) -> bool:
    landing, folder = container("landing"), f"lc_deals/batch_id={batch}/"
    manifest = json.loads(landing.download_blob(folder + "_manifest.json")
                          .readall())
    there = {b.name.removeprefix(folder)
             for b in landing.list_blobs(name_starts_with=folder)}
    files = [f for f in manifest["files"] if f in there]
    declared, columns, rows = list(manifest["columns"]), 0, 0
    for f in files:
        lines = list(csv.reader(io.StringIO(
            landing.download_blob(folder + f).readall().decode())))
        columns = sum(a == b for a, b in zip(lines[0], declared))
        rows += len(lines) - 1
    results = [("files", len(files), len(manifest["files"])),
               ("columns", columns, len(declared)),
               ("rows", rows, manifest["expected_rows"])]
    for name, got, want in results:
        verdict = "PASS" if got == want else "FAIL"
        print(f"  {name:<8} {got:>4} of {want:<4} {verdict}")
    return all(got == want for _, got, want in results)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--batch", type=int, required=True)
    a = p.parse_args()
    if not check(a.batch):
        sys.exit(f"G1 FAIL: batch {a.batch} is not published")
    print(f"G1 PASS: batch {a.batch}")

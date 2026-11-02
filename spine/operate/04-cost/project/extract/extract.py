"""Land the LCs TradeBook changed since the last batch, one step at a time.

    python extract/extract.py watermark [--set TIME]
    python extract/extract.py lookup --batch 42 --window-end TIME
    python extract/extract.py copy --batch 42
    python extract/extract.py commit --batch 42
"""
import argparse
import csv
import io
import json
import sys

import psycopg
from azure.core.exceptions import ResourceNotFoundError

import g1
from lake import container

WATERMARK = "_control/lc_deals.watermark"  # the end of the last good window
FOLDER = "lc_deals/batch_id={}/"
COLUMNS = """SELECT attname, format_type(atttypid, atttypmod) FROM pg_attribute
             WHERE attrelid = 'lc_deals'::regclass AND attnum > 0
             ORDER BY attnum"""


def watermark(value: str | None = None) -> str:
    landing = container("landing")
    if value:
        landing.upload_blob(WATERMARK, value, overwrite=True)
    try:
        return landing.download_blob(WATERMARK).readall().decode()
    except ResourceNotFoundError:
        sys.exit("no watermark yet: set it to the last full load's window end")


def lookup(batch: int, window_end: str) -> None:
    start = watermark()
    with psycopg.connect() as db:
        changed, total = db.execute(
            "SELECT count(*) FILTER (WHERE updated_at > %s"
            " AND updated_at <= %s), count(*) FROM lc_deals",
            [start, window_end]).fetchone()
        columns = dict(db.execute(COLUMNS).fetchall())
    # The manifest is written FIRST: what the copy must deliver. G1 holds the
    # batch folder to it.
    manifest = {"batch_id": batch, "table": "lc_deals",
                "window": {"from": start, "to": window_end},
                "expected_rows": changed, "files": ["part-00000.csv"],
                "columns": columns}
    path = FOLDER.format(batch) + "_manifest.json"
    container("landing").upload_blob(path, json.dumps(manifest, indent=2))
    print(f"batch {batch}: window ({start}, {window_end}]")
    print(f"{changed} of {total} LCs changed in the window")
    print(f"manifest -> landing/{path}")


def copy(batch: int) -> None:
    landing, folder = container("landing"), FOLDER.format(batch)
    if landing.get_blob_client(folder + "_SUCCESS").exists():
        sys.exit(f"refused: batch {batch} is sealed (_SUCCESS)")
    window = json.loads(landing.download_blob(folder + "_manifest.json")
                        .readall())["window"]
    with psycopg.connect() as db:  # the manifest's window, not "now"
        rows = db.execute("SELECT * FROM lc_deals WHERE updated_at > %s"
                          " AND updated_at <= %s ORDER BY lc_id",
                          [window["from"], window["to"]])
        out = io.StringIO()
        writer = csv.writer(out, lineterminator="\n")
        writer.writerow([c.name for c in rows.description])
        writer.writerows(rows)
    # Until the batch is sealed, a retry lands on the same path: overwrite
    landing.upload_blob(folder + "part-00000.csv", out.getvalue(),
                        overwrite=True)
    print(f"batch {batch}: {rows.rowcount} rows -> landing/{folder}"
          "part-00000.csv")


def commit(batch: int) -> None:
    """G1 passes, then seal the batch and move the watermark: in that order."""
    if not g1.check(batch):
        sys.exit(f"G1 FAIL: batch {batch} is not published")
    landing, folder = container("landing"), FOLDER.format(batch)
    window = json.loads(landing.download_blob(folder + "_manifest.json")
                        .readall())["window"]
    landing.upload_blob(folder + "_SUCCESS", b"", overwrite=True)
    moved = watermark(window["to"])
    print(f"G1 PASS: batch {batch} sealed; watermark -> {moved}")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("step", choices=["watermark", "lookup", "copy", "commit"])
    p.add_argument("--set")
    p.add_argument("--batch", type=int)
    p.add_argument("--window-end")
    a = p.parse_args()
    if a.step == "watermark":
        print(f"watermark: {watermark(a.set)}")
    elif a.step == "lookup":
        lookup(a.batch, a.window_end)
    elif a.step == "copy":
        copy(a.batch)
    else:
        commit(a.batch)


if __name__ == "__main__":
    main()

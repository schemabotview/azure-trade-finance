"""Land the LCs TradeBook changed since the last batch, one step at a time.

    python extract/extract.py watermark [--set TIME]
    python extract/extract.py lookup --batch 42 --window-end TIME
"""
import argparse
import sys

import psycopg
from azure.core.exceptions import ResourceNotFoundError

from lake import container

WATERMARK = "_control/lc_deals.watermark"  # the end of the last good window


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
    print(f"batch {batch}: window ({start}, {window_end}]")
    print(f"{changed} of {total} LCs changed in the window")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("step", choices=["watermark", "lookup"])
    p.add_argument("--set")
    p.add_argument("--batch", type=int)
    p.add_argument("--window-end")
    a = p.parse_args()
    if a.step == "watermark":
        print(f"watermark: {watermark(a.set)}")
    else:
        lookup(a.batch, a.window_end)


if __name__ == "__main__":
    main()

"""Land TradeBook's LCs in the lake as one batch, in a folder of its own.

    python extract/extract.py --batch 41 --window-end 2026-10-31T02:00:00Z
"""
import argparse
import csv
import io
import sys

import psycopg
from azure.core.exceptions import ResourceExistsError

from lake import container


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--batch", type=int, required=True)
    p.add_argument("--window-end", required=True)
    a = p.parse_args()

    with psycopg.connect() as db:  # TradeBook, as PGDATABASE says
        rows = db.execute("SELECT * FROM lc_deals WHERE updated_at <= %s"
                          " ORDER BY lc_id", [a.window_end])
        out = io.StringIO()
        writer = csv.writer(out, lineterminator="\n")
        writer.writerow([c.name for c in rows.description])
        writer.writerows(rows)

    path = f"lc_deals/batch_id={a.batch}/part-00000.csv"
    try:  # a batch folder is written once: never overwrite a delivery
        container("landing").upload_blob(path, out.getvalue(),
                                         overwrite=False)
    except ResourceExistsError:
        sys.exit(f"refused: landing/{path} already exists")
    print(f"batch {a.batch}: {rows.rowcount} rows -> landing/{path}")


if __name__ == "__main__":
    main()

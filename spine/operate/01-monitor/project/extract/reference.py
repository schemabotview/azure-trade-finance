"""Publish the risk team's reference files to the lake's reference zone.

    python extract/reference.py --as-of 2026-10-31

The counterparty mapping and the limits are not TradeBook deliveries: they
skip landing and Bronze, and Silver reads them from here by the date they
hold for, after checking them itself.
"""
import argparse
from pathlib import Path

from lake import container

FILES = ["counterparty_group.csv", "group_limits.csv"]


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--as-of", required=True)
    a = p.parse_args()
    zone = container("reference")
    for name in FILES:
        text = Path("reference", name).read_text()
        path = f"{name.removesuffix('.csv')}/as_of={a.as_of}/{name}"
        zone.upload_blob(path, text, overwrite=True)
        print(f"{len(text.splitlines()) - 1:>3} rows -> reference/{path}")


if __name__ == "__main__":
    main()

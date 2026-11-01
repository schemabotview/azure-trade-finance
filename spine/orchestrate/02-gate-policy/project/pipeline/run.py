"""One night of lc-exposure, gates and all: python pipeline/run.py

The gate policy: PASS goes on; WARN goes on and says so; FAIL stops every
step after it, and Gold keeps the last answer that passed.
"""
import sys

import bronze
import gold
import silver
from gates import g3, g4
from session import spark_session


def verdict(gate: str, results: list[tuple[str, bool, str]]) -> str:
    status = "PASS" if all(ok for _, ok, _ in results) else "FAIL"
    for check, ok, detail in results:
        print(f"  {gate} {check:<36} {'PASS' if ok else 'FAIL'}  {detail}")
    return status


def main() -> None:
    spark = spark_session()
    bronze.main()
    held = (spark.read.format("delta")
            .load("lake/bronze/lc_deals_quarantine").count())
    print(f"G2 {'WARN' if held else 'PASS'}: {held} rows in quarantine")
    silver.main()
    if verdict("G3", g3(spark)) == "FAIL":
        sys.exit("G3 FAIL: Gold does not run; it keeps the last good answer")
    gold.main()
    if verdict("G4", g4(spark)) == "FAIL":
        sys.exit("G4 FAIL: the new Gold is not published")
    print("night complete: Gold published")


if __name__ == "__main__":
    main()

"""One night of lc-exposure, gates and all: python pipeline/run.py RUN_ID

The gate policy: PASS goes on; WARN goes on and says so; FAIL stops every
step after it, and Gold keeps the last answer that passed.
"""
import sys

import bronze
import gold
import silver
from gates import g3, g4
from session import spark_session


AUDIT = "lake/audit/gate_results"
SCHEMA = ("run_id string, gate string, rule string, status string,"
          " detail string")


def verdict(spark, run_id: str, gate: str, results) -> str:
    """Print each check, write it to the audit table, return PASS or FAIL."""
    status = "PASS" if all(ok for _, ok, _ in results) else "FAIL"
    rows = [(run_id, gate, check, "PASS" if ok else "FAIL", detail)
            for check, ok, detail in results]
    for _, _, check, result, detail in rows:
        print(f"  {gate} {check:<36} {result}  {detail}")
    (spark.createDataFrame(rows, SCHEMA).write.format("delta")
     .mode("append").save(AUDIT))
    return status


def main() -> None:
    spark = spark_session()
    bronze.main()
    run_id = sys.argv[1] if len(sys.argv) > 1 else "manual"
    held = (spark.read.format("delta")
            .load("lake/bronze/lc_deals_quarantine").count())
    print(f"G2 {'WARN' if held else 'PASS'}: {held} rows in quarantine")
    (spark.createDataFrame([(run_id, "G2", "rows quarantined",
                             "WARN" if held else "PASS", str(held))], SCHEMA)
     .write.format("delta").mode("append").save(AUDIT))
    silver.main()
    if verdict(spark, run_id, "G3", g3(spark)) == "FAIL":
        sys.exit("G3 FAIL: Gold does not run; it keeps the last good answer")
    gold.main()
    if verdict(spark, run_id, "G4", g4(spark)) == "FAIL":
        sys.exit("G4 FAIL: the new Gold is not published")
    print("night complete: Gold published")


if __name__ == "__main__":
    main()

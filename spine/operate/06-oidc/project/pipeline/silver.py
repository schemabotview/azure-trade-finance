"""Silver: one current row per LC, typed, MERGED batch by batch.

    python pipeline/silver.py [--through BATCH]
"""
import sys

from delta.tables import DeltaTable
from pyspark.sql import Window
from pyspark.sql import functions as F

from session import spark_session

BRONZE, SILVER = "lake/bronze/lc_deals", "lake/silver/lc_current"
MERGED = "lake/silver/_merged_batches"  # which Bronze batches Silver has


def typed(rows):
    """Bronze keeps strings; Silver keeps types. Money is decimal(18,2)."""
    return rows.select(
        "lc_id", "applicant_id", "beneficiary", "currency",
        F.col("amount").cast("decimal(18,2)").alias("amount"), "status",
        F.col("issue_date").cast("date"), F.col("expiry_date").cast("date"),
        F.col("source_version").cast("int"),
        F.col("updated_at").cast("timestamp"), "batch_id")


def latest(rows):
    """Row 1 per lc_id: the highest source_version (later batch on a tie)."""
    newest = Window.partitionBy("lc_id").orderBy(
        F.col("source_version").desc(), F.col("batch_id").desc())
    return (rows.withColumn("rn", F.row_number().over(newest))
            .where("rn = 1").drop("rn"))


def merge(spark, rows) -> dict:
    """Insert new LCs; update one ONLY when the incoming version is newer."""
    if not DeltaTable.isDeltaTable(spark, SILVER):
        rows.limit(0).write.format("delta").save(SILVER)
    silver = DeltaTable.forPath(spark, SILVER)
    (silver.alias("t").merge(rows.alias("s"), "t.lc_id = s.lc_id")
     .whenMatchedUpdateAll(condition="s.source_version > t.source_version")
     .whenNotMatchedInsertAll()
     .execute())
    return silver.history(1).collect()[0].operationMetrics


def main() -> None:
    spark = spark_session()
    through = int(sys.argv[2]) if sys.argv[1:2] == ["--through"] else None
    done = set()
    if DeltaTable.isDeltaTable(spark, MERGED):
        done = {r.batch_id for r in spark.read.format("delta").load(MERGED)
                .collect()}
    bronze = typed(spark.read.format("delta").load(BRONZE))
    batches = sorted(r.batch_id for r in bronze.select("batch_id")
                     .distinct().collect())
    for b in [b for b in batches if b not in done and b <= (through or b)]:
        m = merge(spark, latest(bronze.where(F.col("batch_id") == b)))
        rows, new, upd = (int(m[k]) for k in ("numSourceRows",
                          "numTargetRowsInserted", "numTargetRowsUpdated"))
        print(f"batch {b}: {rows} rows, {new} inserted, {upd} updated,"
              f" {rows - new - upd} ignored")
        (spark.createDataFrame([(b,)], "batch_id int").write
         .format("delta").mode("append").save(MERGED))


if __name__ == "__main__":
    main()

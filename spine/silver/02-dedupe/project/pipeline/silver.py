"""Silver: one current row per LC, typed.

    python pipeline/silver.py
"""
from pyspark.sql import Window
from pyspark.sql import functions as F

from session import spark_session

BRONZE, SILVER = "lake/bronze/lc_deals", "lake/silver/lc_current"


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


def main() -> None:
    spark = spark_session()
    bronze = typed(spark.read.format("delta").load(BRONZE))
    current = latest(bronze)
    current.write.format("delta").mode("overwrite").save(SILVER)
    print(f"Bronze {bronze.count()} rows -> Silver {current.count()} rows")


if __name__ == "__main__":
    main()

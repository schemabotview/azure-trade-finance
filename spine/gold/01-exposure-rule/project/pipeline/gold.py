"""Gold: the answer, built from Silver.

    python pipeline/gold.py
"""
from pyspark.sql import functions as F

from gates import OPEN
from session import spark_session

FACT = "lake/gold/fact_lc_exposure"


def exposure(lcs):
    """The rule: an open LC's exposure is its amount; any other, zero."""
    return lcs.withColumn("exposure", F.when(
        F.col("status").isin(*OPEN), F.col("amount"))
        .otherwise(F.lit(0).cast("decimal(18,2)")))


def main() -> None:
    spark = spark_session()
    fact = exposure(spark.read.format("delta").load("lake/silver/lc_current"))
    fact.write.format("delta").mode("overwrite").save(FACT)
    (fact.groupBy("status")
     .agg(F.count("*").alias("lcs"),
          F.max(F.col("exposure") > 0).alias("counts_as_exposure"))
     .orderBy(F.col("counts_as_exposure").desc(), "status").show())


if __name__ == "__main__":
    main()

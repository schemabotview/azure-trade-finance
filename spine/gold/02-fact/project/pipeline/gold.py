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
    lcs = spark.read.format("delta").load("lake/silver/lc_current")
    groups = spark.read.format("delta").load("lake/silver/counterparty_group")
    # LEFT join: an LC whose counterparty has no group keeps its row (G3)
    fact = (exposure(lcs)
            .join(groups, lcs.applicant_id == groups.counterparty_id, "left")
            .select("lc_id", "applicant_id", "group_name", "currency",
                    "status", "source_version", "amount", "exposure"))
    fact.write.format("delta").mode("overwrite").save(FACT)
    print(f"{FACT}: {fact.count()} rows, one per LC")


if __name__ == "__main__":
    main()

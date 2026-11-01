"""Gold: the answer, built from Silver.

    python pipeline/gold.py
"""
from pyspark.sql import functions as F

from gates import OPEN
from session import spark_session

FACT = "lake/gold/fact_lc_exposure"
AGG = "lake/gold/agg_group_exposure"


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
    # Gold's shape grows with the course: an overwrite replaces it whole
    (fact.write.format("delta").mode("overwrite")
     .option("overwriteSchema", "true").save(FACT))
    print(f"{FACT}: {fact.count()} rows, one per LC")
    # one row per group AND currency: amounts in different currencies are
    # never added together
    limits = spark.read.format("delta").load("lake/silver/group_limits")
    agg = (fact.where(F.col("group_name").isNotNull())
           .where(F.col("status").isin("ISSUED", "ACTIVE"))  # still open
           .groupBy("group_name", "currency")
           .agg(F.sum("exposure").alias("gross_exposure"))
           .join(limits, ["group_name", "currency"], "left")
           .withColumn("utilisation_pct", F.round(
               F.col("gross_exposure") * 100 / F.col("limit_amount"), 1))
           .withColumn("headroom", F.col("limit_amount")
                       - F.col("gross_exposure"))
           .withColumn("breach", F.when(F.col("headroom") < 0, "Yes")
                       .otherwise("No")))
    (agg.write.format("delta").mode("overwrite")
     .option("overwriteSchema", "true").save(AGG))
    (agg.select("group_name", "currency", "gross_exposure", "limit_amount",
                "utilisation_pct", "breach")
     .orderBy("group_name", "currency").show())


if __name__ == "__main__":
    main()

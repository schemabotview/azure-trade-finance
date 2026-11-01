"""The pipeline's gates after landing: G2 here; G3 and G4 come later.

G2 sets aside a row Bronze cannot trust, with its reason. It never drops one:
a quarantined row is still evidence that something upstream went wrong.
"""
from pyspark.sql import DataFrame
from pyspark.sql import functions as F

G2_RULES = {
    "no lc_id": F.col("lc_id").isNull() | (F.trim("lc_id") == ""),
    "amount not a number": ~F.col("amount").rlike(r"^\d+\.\d{2}$"),
    "currency not three capitals": ~F.col("currency").rlike("^[A-Z]{3}$"),
}


def g2(rows: DataFrame) -> tuple[DataFrame, DataFrame]:
    """(rows that pass, rows set aside with a g2_reason)."""
    reason = F.coalesce(*[F.when(test, F.lit(name))
                          for name, test in G2_RULES.items()])
    checked = rows.withColumn("g2_reason", reason)
    return (checked.where("g2_reason IS NULL").drop("g2_reason"),
            checked.where("g2_reason IS NOT NULL"))


OPEN = ("ISSUED", "ACTIVE", "AMENDED")


def g3(spark) -> list[tuple[str, bool, str]]:
    """G3 on Silver: [(check, passed, detail)]. Gold never runs on a fail."""
    lcs = spark.read.format("delta").load("lake/silver/lc_current")
    groups = spark.read.format("delta").load("lake/silver/counterparty_group")
    limits = spark.read.format("delta").load("lake/silver/group_limits")
    dupes = lcs.groupBy("lc_id").count().where("count > 1").count()
    open_lcs = lcs.where(F.col("status").isin(*OPEN))
    unmapped = open_lcs.join(groups, open_lcs.applicant_id ==
                             groups.counterparty_id, "left_anti")
    lost = unmapped.select("applicant_id", "lc_id", "currency", "amount")
    keyed = open_lcs.join(groups, open_lcs.applicant_id ==
                          groups.counterparty_id)
    no_limit = keyed.join(limits, ["group_name", "currency"], "left_anti")
    detail = ", ".join(f"{r.applicant_id} {r.lc_id} {r.currency} {r.amount}"
                       for r in lost.collect())
    return [
        ("one row per lc_id", dupes == 0, f"{dupes} duplicated"),
        ("every open LC's counterparty mapped", unmapped.count() == 0,
         detail or "all mapped"),
        ("every open group/currency limited", no_limit.count() == 0,
         f"{no_limit.count()} without a limit"),
    ]


def g4(spark) -> list[tuple[str, bool, str]]:
    """G4 on Gold: per currency, the aggregate's total equals the fact's."""
    fact = spark.read.format("delta").load("lake/gold/fact_lc_exposure")
    agg = spark.read.format("delta").load("lake/gold/agg_group_exposure")
    facts = {r.currency: r.total for r in fact.where(
        F.col("group_name").isNotNull()).groupBy("currency")
        .agg(F.sum("exposure").alias("total")).collect()}
    aggs = {r.currency: r.total for r in agg.groupBy("currency")
            .agg(F.sum("gross_exposure").alias("total")).collect()}
    return [(f"{c} fact = aggregate", facts[c] == aggs.get(c),
             f"{facts[c]} vs {aggs.get(c)}") for c in sorted(facts)]

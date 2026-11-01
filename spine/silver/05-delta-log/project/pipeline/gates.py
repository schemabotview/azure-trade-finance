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

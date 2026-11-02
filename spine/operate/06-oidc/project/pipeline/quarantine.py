"""The rows G2 set aside, and why: python pipeline/quarantine.py"""
from session import spark_session

table = spark_session().read.format("delta").load(
    "lake/bronze/lc_deals_quarantine")
(table.select("lc_id", "amount", "currency", "batch_id", "g2_reason")
 .orderBy("batch_id", "g2_reason").show(truncate=False))

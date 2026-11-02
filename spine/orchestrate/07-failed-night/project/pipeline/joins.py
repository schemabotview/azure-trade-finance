"""The join that loses money: open exposure per currency, two ways.

    python pipeline/joins.py
"""
from pyspark.sql import functions as F

from gates import OPEN
from session import spark_session

spark = spark_session()
lcs = spark.read.format("delta").load("lake/silver/lc_current")
groups = spark.read.format("delta").load("lake/silver/counterparty_group")
open_lcs = lcs.where(F.col("status").isin(*OPEN))
on = open_lcs.applicant_id == groups.counterparty_id
inner = open_lcs.join(groups, on, "inner").groupBy("currency").agg(
    F.sum("amount").alias("inner_join"))
left = open_lcs.join(groups, on, "left").groupBy("currency").agg(
    F.sum("amount").alias("left_join"))
(left.join(inner, "currency", "left")
 .withColumn("lost", F.col("left_join") - F.coalesce("inner_join", F.lit(0)))
 .orderBy("currency").show())

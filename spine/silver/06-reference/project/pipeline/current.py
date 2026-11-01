"""Bronze holds every version; how many rows does one LC have?

    python pipeline/current.py
"""
from session import spark_session

bronze = spark_session().read.format("delta").load("lake/bronze/lc_deals")
lcs = bronze.select("lc_id").distinct().count()
print(f"Bronze: {bronze.count()} rows for {lcs} LCs")
(bronze.groupBy("lc_id").count()
 .groupBy("count").agg({"lc_id": "count"})
 .withColumnRenamed("count", "rows_per_lc")
 .withColumnRenamed("count(lc_id)", "lcs")
 .orderBy("rows_per_lc").show())

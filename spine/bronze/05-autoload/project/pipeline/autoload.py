"""Each file once: open-source Spark's file stream, the mechanism Auto
Loader is built on (Databricks adds file notification and schema
inference on top).

    python pipeline/autoload.py

Reads every CSV under landing/ that it has not read before, appends the
rows to a Delta table, and writes down what it read in a checkpoint.
availableNow: take everything there now, then stop - a nightly batch job
with a stream's memory.
"""
from pyspark.sql import functions as F

from session import spark_session

SCHEMA = ("lc_id string, applicant_id string, beneficiary string, "
          "currency string, amount string, status string, issue_date string,"
          " expiry_date string, source_version string, updated_at string")

spark = spark_session()
rows = (spark.readStream.schema(SCHEMA).option("header", True)
        .csv("landing/*/*.csv")
        .withColumn("src_file", F.regexp_extract(
            "_metadata.file_path", "landing/.*", 0)))
query = (rows.writeStream.format("delta")
         .option("checkpointLocation", "lake/_checkpoints/autoload")
         .trigger(availableNow=True)
         .start("lake/autoload"))
query.awaitTermination()
read = sum(p["numInputRows"] for p in query.recentProgress)
table = spark.read.format("delta").load("lake/autoload")
print(f"this run: {read} rows read; the table: {table.count()} rows")
table.groupBy("src_file").count().orderBy("src_file").show(truncate=False)

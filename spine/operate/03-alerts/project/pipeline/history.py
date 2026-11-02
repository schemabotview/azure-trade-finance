"""Silver's transaction log: every commit, and a read from the past.

    python pipeline/history.py LC-2041 1
"""
import sys

from delta.tables import DeltaTable

from session import spark_session

SILVER = "lake/silver/lc_current"
spark = spark_session()
(DeltaTable.forPath(spark, SILVER).history()
 .select("version", "operation",
         "operationMetrics.numTargetRowsInserted",
         "operationMetrics.numTargetRowsUpdated")
 .orderBy("version").show())

lc, version = sys.argv[1], int(sys.argv[2])  # time travel: Silver back then
then = spark.read.format("delta").option("versionAsOf", version).load(SILVER)
then.where(then.lc_id == lc).select("lc_id", "source_version", "amount").show()

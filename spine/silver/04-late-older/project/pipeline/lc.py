"""One LC in Silver: python pipeline/lc.py LC-2041"""
import sys

from session import spark_session

silver = spark_session().read.format("delta").load("lake/silver/lc_current")
(silver.where(silver.lc_id == sys.argv[1])
 .select("lc_id", "source_version", "amount", "status", "batch_id")
 .show())

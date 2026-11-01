"""Every row Bronze holds for one LC: python pipeline/versions.py LC-2041"""
import sys

from session import spark_session

bronze = spark_session().read.format("delta").load("lake/bronze/lc_deals")
(bronze.where(bronze.lc_id == sys.argv[1])
 .select("lc_id", "source_version", "amount", "status", "batch_id",
         "src_file")
 .orderBy("batch_id", "source_version")
 .show(truncate=False))

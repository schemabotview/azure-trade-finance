"""The gate results of every run: python pipeline/audit.py"""
from session import spark_session

audit = spark_session().read.format("delta").load("lake/audit/gate_results")
(audit.select("run_id", "gate", "rule", "status")
 .orderBy("run_id", "gate", "rule").show(truncate=False))

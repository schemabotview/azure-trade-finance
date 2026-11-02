"""One group's rows in the fact table: python pipeline/fact.py Woodgrove"""
import sys

from session import spark_session

fact = spark_session().read.format("delta").load("lake/gold/fact_lc_exposure")
(fact.where((fact.group_name == sys.argv[1]) & (fact.exposure > 0))
 .select("lc_id", "applicant_id", "currency", "status", "amount",
         "exposure")
 .orderBy("lc_id").show())

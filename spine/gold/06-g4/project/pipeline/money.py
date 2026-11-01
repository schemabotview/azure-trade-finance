"""Why money is decimal(18,2): Spark's own arithmetic, two ways.

    python pipeline/money.py
"""
from session import spark_session

spark = spark_session()
spark.sql("""SELECT 0.10D + 0.20D AS as_double,
                    CAST(0.10 AS DECIMAL(18,2)) + CAST(0.20 AS DECIMAL(18,2))
                    AS as_decimal""").show()
fact = spark.read.format("delta").load("lake/gold/fact_lc_exposure")
print("fact_lc_exposure.exposure is", dict(fact.dtypes)["exposure"])

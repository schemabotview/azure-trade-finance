"""The morning's answer for one group and currency.

    python pipeline/answer.py Woodgrove USD
"""
import sys

from session import spark_session

group, currency = sys.argv[1], sys.argv[2]
agg = spark_session().read.format("delta").load("lake/gold/agg_group_exposure")
r = agg.where((agg.group_name == group) & (agg.currency == currency)).first()
print(f"{group} | {currency}")
print(f"  gross exposure  {r.gross_exposure:>15,}")
print(f"  limit           {r.limit_amount:>15,}")
print(f"  utilisation     {r.utilisation_pct:>14}%")
print(f"  headroom        {r.headroom:>15,}")
print(f"  breach          {r.breach:>15}")

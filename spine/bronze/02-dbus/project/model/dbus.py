"""What a night of Databricks costs, two ways: a job cluster, or serverless.

    python model/dbus.py

A DBU (Databricks Unit) is Databricks' meter: compute time, weighted by the
kind of compute. A job cluster bills DBUs AND the virtual machines it runs on
(our subscription's meter); serverless bills DBUs only, at a higher rate,
because the machines are Databricks'. The usage is the model's (assumptions,
named below); the prices are Azure's Retail Prices API, as it answers today.
"""
import json
import urllib.parse
import urllib.request

API = "https://prices.azure.com/api/retail/prices"
NIGHTS = 30
HOURS = 0.5            # the job's run, each night (assumed)
NODES = 2              # a driver and one worker (assumed)
DBU_PER_NODE_HOUR = 1  # for this node type (assumed: Databricks lists it)
SERVERLESS_DBUS = 2    # DBUs the same work takes serverless (assumed)


def price(where: str) -> float:
    q = f"armRegionName eq 'uksouth' and type eq 'Consumption' and {where}"
    url = API + "?" + urllib.parse.urlencode({"$filter": q})
    return json.load(urllib.request.urlopen(url))["Items"][0]["retailPrice"]


jobs_dbu = price("meterName eq 'Premium Jobs Compute DBU'")
serverless_dbu = price(
    "meterName eq 'Premium Automated Serverless Compute DBU'")
vm = price("armSkuName eq 'Standard_D4ds_v5' and meterName eq 'D4ds v5'"
           " and productName eq 'Virtual Machines Ddsv5 Series'")

node_hours = NODES * HOURS * NIGHTS
plans = {
    "job cluster: DBUs": node_hours * DBU_PER_NODE_HOUR * jobs_dbu,
    "job cluster: VMs (D4ds v5)": node_hours * vm,
    "serverless: DBUs only": SERVERLESS_DBUS * HOURS * NIGHTS
    * serverless_dbu,
}
print(f"unit prices, USD: jobs DBU {jobs_dbu}, serverless DBU "
      f"{serverless_dbu}, D4ds v5 hour {vm}")
for what, cost in plans.items():
    print(f"  {what:<30}{cost:>8.2f} a month")
job = plans["job cluster: DBUs"] + plans["job cluster: VMs (D4ds v5)"]
print(f"  {'job cluster, total':<30}{job:>8.2f} a month")

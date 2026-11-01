"""A month of lc-exposure, modelled from Azure's public retail prices.

    python model/charges.py

The usage is the model's (every number below is an assumption, named);
the prices are Azure's, read from the Retail Prices API as it answers today.
Not modelled: the virtual machines under a Databricks job, billed on their
own meter beside the DBUs.
"""
import json
import urllib.parse
import urllib.request

API = "https://prices.azure.com/api/retail/prices"
NIGHTS = 30
# (what, region, filter, units a month) — the pipeline's usage, assumed
USAGE = [
    ("lake, hot, GB stored", "uksouth",
     "productName eq 'General Block Blob v2 Hierarchical Namespace'"
     " and meterName eq 'Hot LRS Data Stored' and tierMinimumUnits eq 0",
     5),
    ("ADF activity runs, cloud (x1000)", "uksouth",
     "meterName eq 'Cloud Orchestration Activity Run'", 4 * NIGHTS / 1000),
    ("ADF activity runs, SHIR (x1000)", "uksouth",
     "meterName eq 'Self Hosted Orchestration Activity Run'",
     1 * NIGHTS / 1000),
    ("Databricks jobs DBUs", "uksouth",
     "meterName eq 'Premium Jobs Compute DBU'", 2 * 0.75 * 0.5 * NIGHTS),
]


def price(region: str, where: str) -> tuple[float, str]:
    q = (f"armRegionName eq '{region}' and type eq 'Consumption'"
         f" and {where}")
    url = API + "?" + urllib.parse.urlencode({"$filter": q})
    item = json.load(urllib.request.urlopen(url))["Items"][0]
    return item["retailPrice"], item["unitOfMeasure"]


total = 0.0
print(f"{'meter':<34}{'units':>8}{'unit price':>12}{'a month':>10}")
for what, region, where, units in USAGE:
    unit, measure = price(region, where)
    cost = unit * units
    total += cost
    print(f"{what:<34}{units:>8.2f}{unit:>12.4f}{cost:>10.2f}")
print(f"{'total, USD (retail, before tax)':<54}{total:>10.2f}")

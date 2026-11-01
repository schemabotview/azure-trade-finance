"""Silver's reference tables: the risk team's files, checked, then published.

    python pipeline/reference_tables.py 2026-10-31

Every check must pass, or nothing is published and Silver keeps the files it
had: a wrong mapping would move exposure from one group to another.
"""
import csv
import io
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

sys.path.append(str(Path(__file__).parents[1] / "extract"))
from lake import container  # noqa: E402
from session import spark_session  # noqa: E402


def fetch(name: str, as_of: str) -> list[dict]:
    blob = f"{name}/as_of={as_of}/{name}.csv"
    text = container("reference").download_blob(blob).readall().decode()
    return list(csv.DictReader(io.StringIO(text)))


def money(text: str) -> Decimal | None:
    try:
        return Decimal(text)
    except InvalidOperation:
        return None


def main() -> None:
    as_of = sys.argv[1]
    groups, limits = fetch("counterparty_group", as_of), fetch(
        "group_limits", as_of)
    ids = [r["counterparty_id"] for r in groups]
    pairs = [(r["group_name"], r["currency"]) for r in limits]
    checks = {
        "counterparty_id unique": len(set(ids)) == len(ids),
        "every counterparty has a group": all(r["group_name"]
                                              for r in groups),
        "one limit per group and currency": len(set(pairs)) == len(pairs),
        "every limit a positive amount": all(
            (money(r["limit_amount"]) or 0) > 0 for r in limits),
        "every limited group is mapped": {g for g, _ in pairs}
        <= {r["group_name"] for r in groups},
    }
    for name, ok in checks.items():
        print(f"  {name:<34} {'PASS' if ok else 'FAIL'}")
    if not all(checks.values()):
        sys.exit("refused: Silver keeps its previous reference tables")
    spark = spark_session()
    spark.createDataFrame(groups).write.format("delta").mode(
        "overwrite").save("lake/silver/counterparty_group")
    table = spark.createDataFrame(limits)
    (table.withColumn("limit_amount",
                      table.limit_amount.cast("decimal(18,2)"))
     .write.format("delta").mode("overwrite")
     .save("lake/silver/group_limits"))
    print(f"published: {len(groups)} mappings, {len(limits)} limits,"
          f" as of {as_of}")


if __name__ == "__main__":
    main()

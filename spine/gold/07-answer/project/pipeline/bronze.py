"""Bronze: every version TradeBook delivered, appended exactly as received.

    python pipeline/bronze.py

Each sealed batch in the landing zone is read once, every column kept as the
string it arrived as, with three columns added: which delivery it came in
(batch_id), from which file (src_file) and when Bronze took it (ingest_ts).
"""
import sys
from pathlib import Path

from pyspark.sql import functions as F

sys.path.append(str(Path(__file__).parents[1] / "extract"))
from gates import g2  # noqa: E402
from lake import container  # noqa: E402
from session import spark_session  # noqa: E402

BRONZE = "lake/bronze/lc_deals"
QUARANTINE = "lake/bronze/lc_deals_quarantine"
FILES = Path("lake/landing")  # local copies of the delivered files


def sealed_batches() -> list[int]:
    blobs = container("landing").list_blobs(name_starts_with="lc_deals/")
    return sorted(int(b.name.split("=")[1].split("/")[0])
                  for b in blobs if b.name.endswith("/_SUCCESS"))


def fetch(batch: int) -> str:
    landing, folder = container("landing"), f"lc_deals/batch_id={batch}/"
    for blob in landing.list_blobs(name_starts_with=folder):
        if blob.name.endswith(".csv"):
            target = FILES / blob.name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(landing.download_blob(blob.name).readall())
    return str(FILES / folder)


def main() -> None:
    spark = spark_session()
    done = set()
    if Path(BRONZE).exists():
        table = spark.read.format("delta").load(BRONZE)
        done = {r.batch_id for r in table.select("batch_id").distinct()
                .collect()}
    for batch in sealed_batches():
        if batch in done:
            print(f"batch {batch}: already in Bronze")
            continue
        rows = (spark.read.option("header", True).csv(fetch(batch))
                .withColumn("batch_id", F.lit(batch))
                .withColumn("src_file", F.col("_metadata.file_name"))
                .withColumn("ingest_ts", F.current_timestamp()))
        good, bad = g2(rows)
        good.write.format("delta").mode("append").save(BRONZE)
        bad.write.format("delta").mode("append").save(QUARANTINE)
        print(f"batch {batch}: {good.count()} rows appended,"
              f" {bad.count()} quarantined (G2)")


if __name__ == "__main__":
    main()

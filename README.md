# azure-trade-finance

**Learn Azure by building a trade finance risk pipeline** — a GraphL concept app
(graphl.in/azure-trade-finance). Syndica Bank's trade finance desk needs one answer every morning:
how much letter-of-credit exposure each counterparty group carries, per currency, against its limit.
One project, `lc-exposure`, answers it with a nightly batch from the desk's PostgreSQL database
through Data Factory, ADLS Gen2 and Azure Databricks to a Gold table, behind four quality gates.
Every Azure service is taught when the pipeline first needs it: identity, networking, storage, Data
Factory, Databricks, monitoring, cost and CI. The pipeline's numbers are run locally; the Azure
platform is recorded on a real subscription; every frame says which. Planned as one film (12
courses, 87 sections). Prerequisites: [`sql-bank`](https://github.com/schemabotview/sql-bank) and
[`spark-ecommerce-analytics`](https://github.com/schemabotview/spark-ecommerce-analytics).

**Status:** plan v1 awaiting the owner's review; infra built; the pilot's local half (Course 5
§3–§8) authored.
Plan: [`COURSE-PLAN.md`](COURSE-PLAN.md) · Rules and status: [`CLAUDE.md`](CLAUDE.md).

## Run

```sh
npm ci
npm run dev                                # http://localhost:5173 · #/<course>-<section>
npm run check                              # content + 4K render
```

The spine (as root, once): `scripts/install-toolchain.sh`, `scripts/setup-postgres.sh`,
`scripts/install-azure-tools.sh`; then `python scripts/spine.py` replays every local step.

## Layout

```
src/content/<course>/    one file per section (+ narration) and the course index
src/scenes/<course>/     declarative scenes; map.ts (the pipeline map), ide.ts (the IDE frame)
spine/<course>/<step>/   the real project + transcript at each step (local replay or Azure record)
tradebook_gen/           the seeded TradeBook generator and its verify
scripts/                 spine.py, checks, registry, shots, film, publishing data
```

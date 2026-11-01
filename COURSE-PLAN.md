# Learn Azure by building a trade finance risk pipeline: full course, beginner to professional — plan

**Plan status:** v1, awaiting owner review (2026-11-01). Runtime "A+" and 12 courses agreed with the
owner. Nothing is authored yet. Shared rules (section shape, ◆ detours, packaging, build order) are
in `CLAUDE.md`, "Shared rules"; this plan states only what is specific to this concept.

## The idea

Syndica Bank's **trade finance desk** issues letters of credit (LCs) for its corporate clients. Risk
needs one answer every morning: **how much LC exposure does each counterparty group carry, per
currency, against its limit?** One project, `lc-exposure`, answers it: a nightly batch from the
desk's TradeBook database to a Gold table on Azure, with four quality gates that refuse to publish a
wrong number.

The learner learns **Azure and the pipeline together**, the way aws-ecommerce teaches AWS through a
shop: every Azure service is taught **when the pipeline first needs it**, and background (how a
Region is built, how RBAC evaluates a request, where a private endpoint's packet goes) appears as a
◆ detour at the moment it answers a question on screen.

| the desk needs to… | Azure teaches | course |
| --- | --- | --- |
| know where its system will live | regions, zones, the resource hierarchy, ARM | 2 |
| create anything at all, repeatably and on a budget | resource groups, tags, Bicep, budgets | 3 |
| let a pipeline in without a password in code | Entra ID, managed identities, RBAC, Key Vault, Policy | 4 |
| land extracts that can be trusted | ADLS Gen2, containers as zones, SAS / RBAC / ACL, lifecycle | 5 |
| reach a database inside the bank, privately | VNet, NSG, private endpoints, the self-hosted IR | 6 |
| copy only what changed, every night | Data Factory: linked services, IRs, Copy, watermark, triggers | 7 |
| turn files into tables | Azure Databricks, Unity Catalog, the access connector, Auto Loader | 8 |
| hold one true version of each LC | Delta `MERGE`, the transaction log, time travel | 9 |
| answer the question | Gold aggregates, decimal money, reconciliation | 10 |
| run it every night, and recover | Databricks Jobs, an ADF parent, the gate policy, failure email | 11 |
| watch it, pay for it, ship it | Monitor, Log Analytics + KQL, cost, dev/prod, CI with OIDC | 12 |

Why trade finance:

- **The stakes are real and simple.** A wrong exposure number lets a group borrow past its limit.
  Every data-engineering idea (completeness, deduplication, versioning, reconciliation) has a reason.
- **It needs both halves of Azure**: the platform (identity, network, governance, cost) because a bank
  is regulated, and the data services (ADF, ADLS, Databricks) because the answer is a pipeline.
- **The scope is an MVP**: batch only, one business requirement. What it does not do (hard-delete
  CDC, versioned publication, FX conversion, streaming) is named in 12.7 and nowhere built.

Prerequisites: SQL (`sql-bank`) and Spark (`spark-ecommerce-analytics`). They are referenced, never
re-taught.

## Packaging

**One film: "Learn Azure by building a trade finance risk pipeline: full course, beginner to
professional"** — 12 courses, 87 sections, ~1 h 55 min (section ~80 s), titled *concept: what the
pipeline gets* (e.g. "Managed identities: no password in the pipeline"). The film opens with the
finished answer: Woodgrove | USD, 97% of its limit.

## Stack and pins

| what | pin | role |
| --- | --- | --- |
| PostgreSQL | **18.6** (conda-forge, `sql-bank`'s `setup-postgres.sh`) | TradeBook, the source system |
| Python | **3.14.9** | the extractor, gates, the generator |
| PySpark + delta-spark | **4.2.0** + **4.4.1** on Java **21** | Bronze → Gold, run locally (the pipeline's numbers) |
| Azurite | pinned at the infra step | blob landing, emulated (Blob API only: no hierarchical namespace) |
| Azure CLI, Bicep CLI, azcopy | pinned at the infra step | the platform, recorded on Azure |
| Databricks CLI | **1.22.1** (as `databricks-retail-bank-lakehouse`) | Azure Databricks, recorded on Azure |
| Azure subscription | the owner's | every "recorded on Azure" step |

Region **UK South** (`uksouth`), paired with UK West. Infrastructure is **Bicep** (Azure's own
language, compiled to ARM JSON), not Terraform: the course teaches ARM, and Bicep is its native
client. Same pins as the sister repos where they overlap; never changed after the pilot is recorded.

## The app: `lc-exposure`

```
lc-exposure/
  infra/                  Bicep: main.bicep + modules/ (storage, keyvault, network, adf,
                          databricks, monitor), params/dev, params/prod                  (3 → 12)
  tradebook/              schema.sql: lc_deals, lc_amendments; the seed                  (3)
  reference/              counterparty_group.csv, group_limits.csv                       (5)
  extract/                extract.py: watermark, batch folder, manifest; g1.py           (5)
  adf/                    pl_extract_lc.json, linked services, datasets, triggers        (7)
  pipeline/               bronze.py, silver.py, gold.py, gates.py (G2–G4), audit.py      (8 → 11)
  jobs/                   lc_exposure_job.json: tasks, dependencies, email_notifications (11)
  tests/                  gate and rule tests                                            (10 →)
  .github/workflows/      deploy.yml (OIDC)                                              (12)
```

| After course | The pipeline can… |
| --- | --- |
| 3 Start | read TradeBook; deploy an empty resource group with a storage account |
| 4 Secure | reach Key Vault as a managed identity; hold no secret in code |
| 5 Land | extract changed LCs into an immutable batch folder, refusing an incomplete batch (G1) |
| 6 Network | do that with public access off, through a private endpoint and a self-hosted IR |
| 7 Extract | run the extraction as a Data Factory pipeline on a trigger |
| 8 Bronze | append every received version to Delta, quarantining bad rows (G2) |
| 9 Silver | keep one current row per LC and validated reference tables (G3) |
| 10 Gold | publish exposure per group and currency, reconciled (G4) |
| 11 Orchestrate | run nightly end to end, block on a failed gate, email, recover |
| 12 Operate | be watched, costed, and deployed to prod from CI |

## The data

TradeBook's data is synthetic, owned and seeded: `tradebook_gen` (built like `shopwave_gen` and
`globalbank_sim`), standard library only, with every planted fault a named constant and asserted by
`verify`. Business date **2026-10-31**; nightly batches are numbered (`batch_id=42` is the one the
course follows).

| planted fault | caught by | section |
| --- | --- | --- |
| a batch copied short (expected 120, copied 117) | G1: do not publish, keep the old watermark | 5.6 |
| the same records re-sent under a new file name | Bronze keeps both; Silver dedupes | 8.8, 9.2 |
| a row with no `lc_id`, an amount written `2,0m` | G2: quarantine | 8.7 |
| an older version arriving after a newer one | `MERGE` only when `source_version` is greater | 9.4 |
| a counterparty with no group mapping | G3; an inner join would silently drop its exposure | 9.7, 9.8 |
| a closed LC | stays in Gold with zero exposure | 10.1 |
| one group with USD and EUR LCs | no cross-currency sum | 10.3 |
| a group over its limit | breach = Yes | 10.5 |
| fact totals ≠ aggregate totals (a bug planted in 10.6) | G4 reconciliation | 10.6 |

## Facts

Frozen: frames quote them. Extend; never change a value a frame already quotes. Real ids from the
owner's subscription are never shown: the replay normalises them to the values below.

| fact | value |
| --- | --- |
| bank | Syndica Bank (fictional), its trade finance desk; Ana, data engineer |
| tenant / subscriptions | `syndicabank.onmicrosoft.example` (normalised); `sub-tradefin-dev`, `sub-tradefin-prod`, ids shown as `00000000-0000-0000-0000-0000000000d1` / `…p1` |
| region | `uksouth` (pair `ukwest`), zones 1–3 |
| resource groups | `rg-tradefin-dev`, `rg-tradefin-prod`; tags `app=lc-exposure`, `env`, `owner=trade-risk` |
| storage | `sttradefindev` (ADLS Gen2, HNS on); containers `landing`, `bronze`, `silver`, `gold`, `reference` |
| key vault | `kv-tradefin-dev`; secret `tradebook-password` |
| identities | group `grp-trade-risk-eng`; ADF's system-assigned identity; Databricks access connector `ac-tradefin-dev` |
| network | `vnet-tradefin-dev` 10.30.0.0/16; subnets `snet-pe` 10.30.1.0/24, `snet-shir` 10.30.2.0/24, Databricks `snet-dbx-host` / `snet-dbx-container` 10.30.8.0/22 each |
| data factory | `adf-tradefin-dev`; IR `ir-tradebook-shir`; pipeline `pl_extract_lc`; trigger `tr_nightly_0200` |
| databricks | `dbw-tradefin-dev` (premium); catalog `risk`; schemas `bronze`, `silver`, `gold`, `audit` |
| tables | `risk.bronze.lc_deals`, `risk.silver.lc_current`, `risk.silver.counterparty_group`, `risk.silver.group_limits`, `risk.gold.fact_lc_exposure`, `risk.gold.agg_group_exposure`, `risk.audit.gate_results` |
| landing path | `landing/lc_deals/batch_id=42/` + `_manifest.json` |
| groups | Woodgrove (USD limit 10.0m), Contoso (USD 6.0m, EUR 4.0m), Fabrikam (EUR limit 3.0m — in breach), Northwind (USD 8.0m) |
| the answer | Woodgrove USD: LC-2041 v1 2.0m → v2 2.2m, other open LCs 5.0m + 2.5m → gross 9.7m, limit 10.0m, utilisation 97%, headroom 0.3m, breach No |
| exposure rule | open (`ISSUED`, `ACTIVE`, `AMENDED`) → amount; else 0. Money `decimal(18,2)` |
| alerts | action group `ag-trade-risk`, email `trade-risk@syndicabank.example` |

The generator's other values (LC ids, counterparties, amounts) are frozen when the pilot is recorded
and added here then.

## Frames

- **Map frame** (ported from `aws-ecommerce`'s `map.ts`): the pipeline's WHOLE final architecture
  drawn the Azure way — subscription → resource group, the VNet with its subnets, then Source |
  Landing | Bronze | Silver | Gold with G1–G4 as badges between them. A part not built yet is
  `muted` in place; `BUILT[course]` is what exists; what a section adds is ringed by its `focus`.
  Every map frame shares one fit.
- **IDE frame** (ported from `spark-ecommerce-analytics`' `ide.ts`): explorer | editor over terminal |
  fixed side pane. Bicep, Python, SQL, KQL and ADF JSON are all shown here.
- **◆ full scene**: a canonical big picture (the resource hierarchy, RBAC inheritance, a private
  endpoint's packet path, Databricks' two planes, Delta's log, three kinds of progress), its own
  section, with real output inside it.
- The Azure portal is never screenshotted: what a blade would show is drawn from the CLI's or API's
  own output.

## The spine

`spine/<course>/<NN-step>/` = `project/` + `session.txt` + `step.json`, one cumulative chain, like
`spark-ecommerce-analytics`. Each step has exactly one of `first`, `from` + `changes`, or `lab`.
Two kinds of step, marked in `step.json`:

- **Local** (`{}`): replayed every time, deterministically — PostgreSQL, Azurite, local Spark/Delta,
  the extractor and the gates. The pipeline's numbers all come from local steps.
- **Azure** (`{"azure": true}`): **recorded once, never replayed** (`aws-ecommerce`'s method). A step
  runs once against the owner's subscription when it is authored; its normalised transcript and a
  key (hash of the step) are committed; `check:spine` runs nothing and fails when a step changed
  without a re-record. A course's Azure resources are deployed at its first Azure step and torn down
  after its last, so a subscription holds nothing between recordings.
- **Normalisation** happens in the recorder, never by hand: tenant, subscription and object ids,
  hostnames, emails, timestamps, run ids. A transcript holding a fragment of a real id is refused.
- The database, landing folders, the watermark, checkpoints and Delta tables carry forward along
  the chain; a step that breaks things on purpose (a failed gate) is `"branch": true` and discarded.

## Verification levels

Every frame is in one level, and says so when it is not the first:

| level | means |
| --- | --- |
| `runs locally` | really run here: PostgreSQL, Spark, Delta, Python |
| `recorded on Azure` | run once on a real subscription; the transcript is the record |
| `emulated` | Azurite, labelled; never presented as Azure's own output |
| `compiled` | `bicep build` / the Bicep linter: real, offline, not deployed |
| `doc-cited` | Azure documentation says so; the URL is in the scene |
| `model` | a documented rule reproduced as a small program; proves nothing about Azure |

No prices are quoted as facts: cost frames show the subscription's own Cost Management output or a
labelled model.

## How a section teaches

Differences from the shared shape: a failure is its own step with real output (an
`AuthorizationFailed`, a gate's `DQ_GATE_FAILED`). Acronyms are spelled for the speech engine. A ◆
detour returns to the pipeline.

## The courses

Side pane = the diagram. ◆ = detour. ⑂ = a branch step (run, then discarded). Level: L runs locally ·
A recorded on Azure · E emulated · C compiled · D doc-cited · M model.

**1. `intro` · Trade finance, and what we'll build · 3**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | A letter of credit, in one picture | concept | importer → issuing bank → exporter; the bank's promise is the exposure | D |
| 2 | The question: exposure by group | concept + lab (the finished Gold) | counterparties → groups → limits; the answer table | L |
| 3 | What we'll build | concept | **the map**, every stage lit; Woodgrove USD 97% | L |

**2. `how-azure-runs` · How Azure is built · 7**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | ◆ full scene: regions, pairs and zones | `az account list-locations` | geography → region → zones → datacenters; uksouth ↔ ukwest | A |
| 2 | The resource hierarchy | `az account management-group list`, `az account list` | tenant → management groups → subscriptions → resource groups → resources | A |
| 3 | Azure Resource Manager | `az group list --debug` (the HTTPS call) | every client → ARM → resource providers | A |
| 4 | Control plane vs data plane | list a storage account vs list its blobs | management.azure.com vs `<account>.blob.core.windows.net` | A |
| 5 | Portal, CLI, Bicep: three clients | one resource read three ways | three clients, one API | A |
| 6 | IaaS, PaaS, SaaS | concept | each part of our pipeline on the responsibility line | D |
| 7 | How Azure charges | lab: a month of the pipeline, modelled | meters: storage GB, ADF activity runs, DBUs | M |

**3. `start` · The source, and a first deployment · 7**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | TradeBook | `psql`: `lc_deals`, `lc_amendments` | ER: deal → amendments, `source_version`, `updated_at` | L |
| 2 | An LC's life | the history of LC-2041 | state machine ISSUED → AMENDED → CLOSED; what counts as open | L |
| 3 | Signing in, and a resource group | `az login`, `az group create` with tags | subscription → `rg-tradefin-dev`; naming and tags | A |
| 4 | A first Bicep file | `storage.bicep`; `az deployment group create` | Bicep → ARM → the storage account | A |
| 5 | Parameters and modules | `main.bicep` + `modules/`; `bicep build` | module tree; the ARM JSON it compiles to | C |
| 6 | Deployment modes | `what-if`, incremental vs complete | what each mode does to a resource not in the file | A |
| 7 | Budgets | a budget at 80% forecast | budget → action group → email | A |

**4. `secure` · Identity first · 8**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | Entra ID | users, `grp-trade-risk-eng` | tenant → users, groups | A |
| 2 | Service principals and managed identities | ADF's system-assigned identity | three kinds of identity, who holds the secret | A |
| 3 | ◆ full scene: RBAC | assignments at three scopes | role × scope × principal; inheritance down the hierarchy | A |
| 4 | Owner cannot read a blob | Owner reads blobs → `AuthorizationPermissionMismatch` | control-plane vs data-plane roles | A |
| 5 | Key Vault | `tradebook-password` stored; RBAC model | vault → secret → version | A |
| 6 | No secret anywhere | the identity reads the secret, a person cannot | identity → token → vault, no password in code | A |
| 7 | Least privilege | the pipeline's role matrix applied | matrix: principal × resource × role | A |
| 8 | Azure Policy | allowed locations + required tags; a refused deploy | policy → assignment → deny | A |

**5. `land` · ADLS Gen2, and a batch you can trust · 9**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | Storage accounts and the hierarchical namespace | HNS on; `az storage fs` | flat blob names vs real directories | A |
| 2 | Containers as zones | `landing`, `bronze`, `silver`, `gold`, `reference` | the zones on the map | A |
| 3 | Immutable batch folders | `batch_id=42/` written once | a batch_id identifies a delivery, not an LC revision | E |
| 4 | Incremental by watermark | `extract.py`: read watermark → copy `updated_at` window | old / new watermark on a timeline | L |
| 5 | The manifest | `_manifest.json`: expected counts, files, schema | manifest ↔ folder | L |
| 6 | ⑂ G1 fails | a short copy: 117 of 120 | G1: do not publish; the old watermark stays | L |
| 7 | Retry-safe landing | the same batch re-run, same path | a retry lands on the same folder | E |
| 8 | Reference files | mapping and limits on their own path | reference path → Silver directly, not through Bronze | E |
| 9 | Who may read a batch | SAS vs RBAC vs ACL; a lifecycle rule | three ways in; hot → cool → archive | A |

**6. `network` · Private by default · 7**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | VNets and subnets | `vnet-tradefin-dev`, four subnets | address space carved into subnets | A |
| 2 | Network security groups | an NSG on `snet-shir` | rules evaluated by priority | A |
| 3 | Public access off | storage firewall: a laptop refused | the internet → storage, blocked | A |
| 4 | ◆ full scene: a private endpoint | private endpoint + private DNS zone; `nslookup` | a packet's path: name → private IP → storage | A |
| 5 | TradeBook is on-premises | concept | why ADF cannot reach it: the bank's firewall | D |
| 6 | ◆ the self-hosted integration runtime | SHIR on a VM in `snet-shir`, registered | SHIR polls out on 443; nothing comes in | A |
| 7 | VPN and ExpressRoute | concept | site-to-site vs private circuit, what each costs | D |

**7. `extract` · Data Factory · 8**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | Data Factory's parts | `adf-tradefin-dev` deployed by Bicep | pipeline → activities; linked service → dataset | A |
| 2 | Integration runtimes | Azure IR vs `ir-tradebook-shir` | which IR runs which activity | A |
| 3 | A linked service to TradeBook | through the SHIR, password from Key Vault | ADF → SHIR → TradeBook; vault in the side | A |
| 4 | The Copy activity | one table to `landing/` | source query → sink folder | A |
| 5 | The watermark pipeline | Lookup → Copy → G1 → commit watermark | the activity chain, success paths | A |
| 6 | Parameters and expressions | `batch_id`, the window | `@pipeline().parameters` → the paths | A |
| 7 | Triggers | `tr_nightly_0200`; tumbling window vs schedule | windows on a timeline | A |
| 8 | Monitoring a run | a failed G1, rerun from the failed activity | run → activity runs, one red | A |

**8. `bronze` · Azure Databricks: raw and complete · 8**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | ◆ full scene: Databricks' two planes | `dbw-tradefin-dev` (VNet-injected) | control plane (Databricks) vs compute plane (our subscription) | A |
| 2 | Workspaces, compute, DBUs | a job cluster vs serverless | what a DBU meters | A |
| 3 | Unity Catalog | metastore → `risk` → schemas | the three-level namespace | A |
| 4 | Reaching the lake | access connector → storage credential → external location | identity chain, no keys | A |
| 5 | Auto Loader | `cloudFiles`, checkpoint, `availableNow` | files → checkpoint → each file once | A |
| 6 | Bronze | `bronze.py` locally: append all versions + `src_file`, `ingest_ts` | Bronze rows with provenance | L |
| 7 | G2 | null key, bad amount → quarantine | rows split: valid / quarantined | L |
| 8 | A replayed file | the same records, a new file name | Bronze keeps both; why that is right | L |

**9. `silver` · One true row per LC · 8**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | The current row | concept + query | many versions → one current row per `lc_id` | L |
| 2 | Deduplicate | `ROW_NUMBER() OVER (PARTITION BY lc_id ORDER BY source_version DESC)` | the window, row 1 kept | L |
| 3 | `MERGE` | `MERGE INTO silver … WHEN MATCHED AND s.source_version > t.source_version` | matched / not matched paths | L |
| 4 | The late older version | v1 arrives after v2 | ignored: equal or older never wins | L |
| 5 | ◆ full scene: Delta's log | `DESCRIBE HISTORY`, a time-travel read | commits → versions → snapshot | L |
| 6 | Reference tables | validate, then publish `counterparty_group`, `group_limits` | file → checks → table | L |
| 7 | G3 | unique LC keys; a counterparty with no mapping | the gate's three checks | L |
| 8 | The join that loses money | inner vs left join: 1.2m vanishes | missing reference → missing exposure | L |

**10. `gold` · The answer · 7**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | The exposure rule | open → amount, closed → 0 | rule table per status | L |
| 2 | `fact_lc_exposure` | one row per LC | fact rows | L |
| 3 | Per currency | `agg_group_exposure` by group + currency | Contoso: USD and EUR, never summed | L |
| 4 | Decimal money | `decimal(18,2)` vs a float sum | the cent a float loses | L |
| 5 | Utilisation, headroom, breach | Fabrikam EUR in breach | bar per group vs its limit | L |
| 6 | G4 | fact ↔ aggregate reconciliation; a planted bug caught | the totals that must match | L |
| 7 | The answer | Woodgrove USD | the summary card: 9.7m / 10.0m / 97% / 0.3m / No | L |

**11. `orchestrate` · Every night, and the night it fails · 8**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | Databricks Jobs | `lc_exposure_job`: Bronze → G2 → Silver → G3 → Gold → G4 | task graph | A |
| 2 | The gate policy | PASS / WARN / FAIL | three outcomes, what each blocks | L |
| 3 | The audit table | `risk.audit.gate_results` | run_id, batch_id, rule, expected, actual, status | L |
| 4 | Failure email | `email_notifications.on_failure` | failure → email | A |
| 5 | The ADF parent | Copy → G1 → watermark → run the Databricks job | the parent pipeline | A |
| 6 | One schedule owner | the job's own schedule paused | two schedulers → a double run | A |
| 7 | A failed night | G3 fails; the fix; a rerun | the run, red then green | A |
| 8 | ◆ full scene: three kinds of progress | lab: rerun after each failure point | watermark (extraction) / checkpoint (files) / MERGE (business state) | L |

**12. `operate` · Watch it, pay for it, ship it · 7**

| # | Section | Step | Side pane | Level |
| --- | --- | --- | --- | --- |
| 1 | Diagnostic settings | ADF and Databricks logs → Log Analytics | sources → workspace | A |
| 2 | KQL | last night's failed gates | the query, its result table | A |
| 3 | Alerts | a log alert → `ag-trade-risk` | signal → rule → action group | A |
| 4 | Where the money goes | Cost Management by service | cost per service, the month | A |
| 5 | Two environments | dev and prod from one Bicep, two param files | one template, two subscriptions | A |
| 6 | CI with no stored secret | GitHub Actions + OIDC federated credential | GitHub → Entra → a token → deploy | A |
| 7 | Where next | concept | hard-delete CDC, versioned Gold, FX, streaming, Fabric — each on the map | D |

## Decisions

1. Concept: Azure, taught through Syndica Bank's trade finance desk; one requirement, LC exposure
   by group; batch only (2026-11-01).
2. Runtime **A+**: the pipeline's numbers run locally (PostgreSQL, Azurite, Spark/Delta), the Azure
   platform is recorded once on the owner's subscription (2026-11-01).
3. 12 courses, 87 sections, one film (2026-11-01).
4. Infrastructure as Bicep, not Terraform.
5. Repo `azure-trade-finance`, public, under `schemabotview`.

## Open

- The pins for Azurite, the Azure CLI, Bicep and azcopy, and the Azure Databricks runtime, set at
  the infra step.
- Whether the SHIR VM is kept between Courses 6 and 7 or rebuilt (cost vs a shorter chain).
- Section 12.6 needs a GitHub repository with an OIDC federated credential: this repo, or a
  separate demo repo.

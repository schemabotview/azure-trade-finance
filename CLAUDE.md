# CLAUDE.md — azure-trade-finance

> Source of truth: `COURSE-PLAN.md`. On the owner's machine the workspace rules are in
> `../CLAUDE.md`; a cloud session cannot see that file, so the rules this repo needs are copied
> under "Shared rules" below. Keep them in step with it.

## Identity

| | |
|---|---|
| teaches | Azure, by building `lc-exposure`: a nightly batch from Syndica Bank's TradeBook (PostgreSQL) to a Gold table of LC exposure by counterparty group, with quality gates G1–G4 |
| cast | Ana (data engineer), Syndica Bank's trade finance desk; groups Woodgrove, Contoso, Fabrikam, Northwind |
| reference repos | all public under `github.com/schemabotview` — clone them beside this one, port, do not reinvent: **`spark-ecommerce-analytics`** (IDE frame, `spine.py`, the seeded generator, checks, registry, shots, film), **`aws-ecommerce`** (the map frame, `map.ts` with `BUILT`/`muted`, the record-once spine, verification levels), **`sql-bank`** (`setup-postgres.sh`, psql consoles), **`databricks-retail-bank-lakehouse`** (normalising a real cloud account, credentials as secrets), **`python-expense-tracker`** (the original templates) |
| engine / shell | `@graphlearning/graphl-flow` ^0.8.0, `@graphlearning/shell` ^1.1.0, from npm. graphl-flow's Azure icon keys: `adls`, `datafactory`, `databricks`, `keyvault`, `loganalytics`, `monitor`, `storage`, `vm`, `devops`; brand `postgresql`, `github`, `githubactions`; Delta has no mark (lucide `layers`) |
| toolchain | see COURSE-PLAN, "Stack and pins": PostgreSQL 18.6, Python 3.14.9, PySpark 4.2.0 + delta-spark 4.4.1 on Java 21, Azurite, Terraform 1.17.0 (`azurerm` + `databricks` providers, tflint), Azure CLI + azcopy, Databricks CLI 1.22.1 |
| frames | map (from aws-ecommerce), IDE (from spark-ecommerce-analytics), ◆ full scenes; `--brand` Azure blue |
| secrets | `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` (a service principal for recording), `DATABRICKS_HOST`, `DATABRICKS_TOKEN`: environment secrets, never committed, never printed |

## Status

Plan v1.1 written 2026-11-01 (infrastructure moved from Bicep to Terraform), awaiting the owner's
review. 2026-11-01 (cloud sessions): **infra built, and the pilot's Course 5 authored** — all nine
sections, checked and shot at 4K; §1, §2, §9 recorded on Azure in Terraform, then torn down. Next:

1. Owner review of `COURSE-PLAN.md` and of `#/land-storage-and-hns` … `#/land-who-may-read`.
2. The pilot's last piece: the ◆ RBAC full scene from Course 4 (needs Course 4's steps, or a lab).
3. Courses 1–4, 6–12 one at a time, each reviewed on its rendered routes, then narrated.
4. Audio (`npm run gen:audio` is current for every authored section), record, film, cover.

**Built (infra):** the app (vite, shell `ConceptApp`, `--brand` #0078d4), checks (`check-content`,
`check-render` with the map-frame fit), `registry`, `shots` (also takes a bare scene id, e.g.
`npm run shots -- preview-map-land`), `film`, the Colab notebook, `concept.json`, `titles.json`;
`tradebook_gen` + `verify` (15 planted facts); `scripts/spine.py` (both step kinds);
`src/scenes/ide.ts` (aws-ecommerce's), `map.ts` (`BUILT` per course; previews `#/preview-map-land`; the finished map is §1.3), `level.ts` (the verification label); installers
`install-toolchain.sh` (Python 3.14.9, Java 21), `setup-postgres.sh` (PostgreSQL 18.6, OS user
`ana`), `install-azure-tools.sh` (Azure CLI 2.91.0, Azurite 3.37.0, Terraform 1.17.0). Not ported yet: the cover
(`thumb-film.mjs` was Spark's own drawing), `record-all` wiring is the shell's.

| # | course | sections | status |
|---|---|---|---|
| 1 | `intro` | 3 | authored, narrated (text), 4K-checked (§1 doc-cited, §2–3 from the spine's finished Gold) |
| 2 | `how-azure-runs` | 7 | authored, narrated (text), 4K-checked; §1–5 read-only labs recorded on Azure (no resources), §6 doc-cited, §7 a model priced from prices.azure.com |
| 3 | `start` | 8 | authored, narrated (text), 4K-checked; §3–5, §7–8 recorded on Azure |
| 4 | `secure` | 8 | authored, narrated (text), 4K-checked; §2–§8 recorded on Azure, §1 compiled (Graph permissions needed to apply) |
| 5 | `land` | 9 | authored, narrated (text), 4K-checked; §1, §2, §9 re-recorded after Courses 3–4 |
| 6 | `network` | 7 | authored, narrated (text), 4K-checked, recorded on Azure (§6.6: ADF + a self-hosted IR on a Windows VM in a simulated bank network, UK West); torn down |
| 7 | `extract` | 8 | authored, narrated (text), 4K-checked, recorded on Azure (TradeBook as a PostgreSQL VM in the bank network, peered; batches 41–43 through the SHIR into the private lake); torn down |
| 8 | `bronze` | 8 | authored, narrated (text), 4K-checked: §1, §3, §4 compiled; §2 a recorded price model; §5–8 local Spark (§5 standing in for Auto Loader) |
| 9 | `silver` | 8 | authored, narrated (text), 4K-checked (all local) |
| 10 | `gold` | 7 | authored, narrated (text), 4K-checked (all local) |
| 11 | `orchestrate` | 8 | authored, narrated (text), 4K-checked: §1, §4–6 compiled; §2, §3, §7, ◆ §8 local Spark standing in for the job |
| 12 | `operate` | 7 | authored, narrated (text), 4K-checked: §1–3, §5, §6 compiled; §4 recorded (the Consumption API: usage, no cost on this offer); §7 concept |

## Spine

See COURSE-PLAN, "The spine". The rules an author applies every step:

- **Local steps replay; Azure steps are recorded once.** Never re-run an Azure step to check it:
  `check:spine` compares keys and hashes only. Re-record a changed step and every Azure step after
  it in the same course, in order.
- **Every resource is Terraform** (`infra/`); the CLI only reads, moves data, and bootstraps the
  state backend. **State never enters the spine** (it holds real ids): remote backend only;
  `.terraform.lock.hcl` is committed.
- **Tear down after recording a course** (`terraform destroy`, then `rg-tradefin-tfstate`); a
  subscription holds nothing between recordings. Never leave the SHIR VM or a Databricks cluster running.
- **Normalise in the recorder, never by hand**: ids, hosts, emails, timestamps, run ids → the values
  in COURSE-PLAN, "Facts". The recorder refuses a transcript holding a fragment of a real id.
- **Never list the owner's subscription unfiltered on screen**: filter to `*tradefin*` resources.
- **The pipeline's numbers come from local steps only**; a frame quoting a number reads it from a
  local session.

**How the replay works here** (`scripts/spine.py`'s docstring has every key):

- **Step by step, each from the one before** (both kinds). A local step saves its state in
  `state/` (database dump, Azurite folder, working copy; ≤ 90 KB); `--write land/07` restores
  `land/06`'s state and runs ONLY `land/07` (~15 s). An Azure step records against the subscription
  as the step before left it. `python scripts/spine.py` runs nothing: it checks every step's key and
  transcript hash. A key hashes the step and its ancestors' files and RECORDED transcripts, so an
  edit marks only the steps after it stale; write them again in order. `--replay` (the whole local
  chain, compared) is for after a tool upgrade, not for authoring.
- `--write` and `--replay` run as root: the shell as OS user `ana` in `/home/ana/lc-exposure` (the
  path on screen, nothing rewritten), the server as `postgres`. After a container restart, run
  `scripts/setup-postgres.sh` again: it starts the server.
- Off-screen events are `setup`: the desk's business day (`desk-2026-10-31.sql`, before §5.4) and
  the race (`desk-late.sql`, inside the §5.6 branch). Both are tradebook_gen's output.
- `"branch": true` puts back the working copy, the database and the lake after the step.
- `lake:<container>/<blob>` in `capture` reads a blob back after the session (the manifest, the batch
  files a scene quotes LC-2041 from).
- A command wider than the pane fails the replay (a wrapped command reads back as a shorter one).
  Code is ≤ 79 columns; the terminal holds 13 rows.
- The proxy's CA bundle under `/root` is copied for `ana` (pip inside the replay).
- A variable a typed command sets (`ID=$(…)`) is carried to the next command, as in one terminal.

**Recording on Azure** (`--record`), learned on Course 5:

- Sign-in is `az login` as the service principal, silently; Terraform's azurerm uses that CLI
  sign-in, so no secret reaches the project. The state backend (`infra/bootstrap.sh`, Course 3 §5)
  is made by the first Azure step's `setup`; later Azure steps `setup` a silent `terraform init`.
- Normalisation runs BEFORE wrapping (a wrapped id is an id split in two), and inside base64 runs
  (azurerm's `client_config` id is base64 of the client, object and subscription ids). The leak
  check searches as written, with line breaks removed, and decoded. `python scripts/leaks.py` runs
  the same check over the whole tree: run it before committing a recording.
- Terraform runs one request at a time (`TF_CLI_ARGS_*=-parallelism=1`, invisible): parallel
  `listKeys` calls were reset by the sandbox's proxy.
- A transcript holding a transport failure, or "is being deleted" (an earlier teardown still
  running), is refused: record it again. A re-record must start from the parent's Azure state —
  remove what a failed attempt created (`terraform destroy -target=…`) so the apply is the real one.
- `--teardown` is `terraform destroy`, then every `*tradefin*` group (the state's included). The vault
  is purged on destroy (`purge_soft_delete_on_destroy`), so its name is free for the next recording.
- azurerm's `features { storage { data_plane_available = false } }` (from §5.1): Terraform manages
  storage accounts through ARM alone. Without it, the read-back of a just re-created account answered
  404 on its file-share properties, again and again.
- To re-record a step, restore its PARENT's Azure state first: lay the parent, `terraform apply`
  silently (on an error: wait, `terraform untaint`, apply again) until `plan` says No changes; then
  remove what the step itself creates (`terraform destroy -target=…`) so its apply is the real one.
- Role assignments and policy assignments take minutes to take effect: record the step that USES
  one a few minutes after the step that made it (4.4 → 4.5, 4.7 → 4.8).
- Course 3 and 4 resources were left up while Course 4 and 5 recorded, then torn down together.
- Course 7: prototype first (restore the parent, apply the course's Terraform by hand from a reviewed
  `terraform plan -out`, run every pipeline), then plan back to the parent's state and record in order.
  azurerm 5.12's model of the PostgreSqlV2 linked service drops `authenticationType`: it is an ARM
  template deployment (`adf-tradebook.tf`). ADF adds `compressionProperties: null` to a
  DelimitedTextReadSettings: write it in the pipeline JSON or every plan shows a change.
- The normaliser keeps TradeBook's own timestamps (at or before 2026-11-01T02:00:07, `BUSINESS_END`):
  a window end or a watermark in Azure output is data, not a clock.
- A pipeline's state lives in the lake (the watermark). To re-record a step that moved it, put the
  parent's watermark back first (a throwaway pipeline, deleted after), or the window is empty.

## Frames

The map frame's parts are the COURSE-PLAN map; never rename a part. Every map frame shares one fit;
every IDE frame shares one fit. The Azure portal is never screenshotted.

## Narration

Spell acronyms for the speech engine: "A D F", "A D L S", "R B A C", "V Net", "N S G", "K Q L",
"L C", "S H I R", "D B U", "A R M". Amounts as words ("nine point seven million dollars"); ids
never read out.

## Invariants

- Every frame states its verification level when it is not `runs locally` (COURSE-PLAN,
  "Verification levels"). Nothing emulated or compiled is presented as Azure's own output.
- Money is `decimal(18,2)`; amounts in different currencies are never summed.
- No real tenant, subscription, object id, hostname or email is committed.

## Shared rules (copied from the workspace `../CLAUDE.md`)

**Vocabulary.** Concept = this repo = ONE YouTube film. Course = a chapter group and the owner's
review unit. Section = `(scene, narration)`: one full-screen 16:9 frame, one chapter, 82–120 s.
Scene = a declarative graphl-flow model. ◆ = a detour.

**Pipeline.** plan → infra → spine → author (`src/content/<course>/`, `src/scenes/<course>/`) →
check → `npm run gen:audio` (re-run after ANY narration edit) → Colab + Chatterbox
(`scripts/colab_generate_audio.ipynb` commits each wav to `main`) → `npm run record:all` →
`npm run film` → `npm run gen:desc`, `npm run thumb:film`.

**Commands.**

```sh
npm run dev                                          # :5173 — #/ catalog, #/<course>-<section>
npm run build && npx tsc --noEmit && npm run check   # check = check-content + check-render (4K)
npm run check:spine
npm run shots -- <course>                            # 4K PNGs in out/shots/ — then LOOK
```

**Invariants.**

- `COURSE-PLAN.md` is the source of truth: change it first, never drift.
- Route contract (the shell's, never reimplemented): `#/` catalog, `#/<courseId>-<sectionId>`,
  `#/<sceneId>`, `?capture=1`, `window.__scene.plan()`.
- Scenes are declarative: never `x`/`y`.
- Stylesheets in order: graphl-flow, shell, `./theme.css` last.
- Pin published engine and shell versions; no `file:` installs committed; no `overrides`.
- Every output is real: replayed or recorded, never typed. Scenes READ values from the spine (find
  lines by text with `lineOf`). `volatile` values are masked in comparison and never said in
  narration.
- Narration: `.tts` → `.wav` via Colab + Chatterbox only; audio at `public/audio/<course>/<id>.wav`.
  Flowing prose that walks the frame and ends with a one-line bridge; never reads code aloud; never
  claims the viewer has mastered anything.
- `SiteHeader` on the catalog page only.
- Checks are a floor, not proof: shoot and LOOK at every frame.

**Frames.** Every side pane carries a diagram, never a bullet list, and fills ≥ 2/3 of its height.
No edges between panes. A ◆ that cannot fit the side pane at ≥ 24px body text in the 4K frame is a
full scene, its own section with real output inside. Flows run one direction; arrows do not cross;
a fan-in of 3+ arrows aims at a tall node.

**How a section teaches.** Objective → mental model (side pane) → the code and its real result → a
failure or alternative → bridge. One step per section; a failure is its own step.

**Working agreement.** Author a whole course (spine, scenes, narration), render it, LOOK, then hand
over the routes. No silent scaffolding. Report what was built, verified and left out, and each
frame's verification level. Commit and push to `main` per course.

## Local pipeline facts (Courses 8–11, from the spine)

- Batch 41 predates seals: §8.6 seals it by hand (an empty `_SUCCESS`). Batch 43 is the desk's manual
  correction (tradebook_gen `deliveries`): 3 late amendments + 2 broken rows (empty lc_id; amount `2,0m`).
  Batch 44 is batch 41's file re-sent: Bronze appends 400, Silver ignores 400.
- Silver merges Bronze batch by batch (`--through N`), updating only when `s.source_version >
  t.source_version`; Delta's operation metrics are the per-batch counts a scene quotes.
- G3 fails on CP-1501 / LC-2299 / USD 1,200,000.00 (unmapped); an inner join loses exactly that.
  Gold is built anyway in Course 10 (the fact is a LEFT join; the aggregate keeps mapped rows only);
  Course 11's `run.py` is where a G3 FAIL stops Gold.
- §10.6 plants `.where(status in ISSUED, ACTIVE)` (forgets AMENDED) in gold.py; §10.7 removes it.
- A gate's `G<n> FAIL:` exit is a refusal line in `terminal()` (drawn red).

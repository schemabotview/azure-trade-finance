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

Plan v1.1 written 2026-11-01 (infrastructure moved from Bicep to Terraform), awaiting the owner's review. Nothing authored. Next, in order:

1. Owner review of `COURSE-PLAN.md`.
2. Infra (no content): scaffold the repo from `spark-ecommerce-analytics` (vite, `package.json`
   scripts, `src/main.tsx`, `theme.css`, checks, registry, shots, film, the Colab notebook with
   `REPO = "azure-trade-finance"`); `scripts/concept.json` and `titles.json`; `tradebook_gen` +
   `verify`; `spine.py` with both step kinds (local replay, Azure record-once with normalisation);
   the map frame; the install scripts; pin the open versions.
3. Pilot: Course 5 `land` (local + emulated + Azure steps, G1) plus one ◆ full scene from Course 4
   (RBAC) → owner review.
4. Courses 1–4, 6–12 one at a time, each reviewed on its rendered routes, then narrated.
5. Audio, record, film, cover (Shared rules, "Pipeline").

| # | course | sections | status |
|---|---|---|---|
| 1 | `intro` | 3 | planned |
| 2 | `how-azure-runs` | 7 | planned |
| 3 | `start` | 8 | planned |
| 4 | `secure` | 8 | planned |
| 5 | `land` | 9 | planned (pilot) |
| 6 | `network` | 7 | planned |
| 7 | `extract` | 8 | planned |
| 8 | `bronze` | 8 | planned |
| 9 | `silver` | 8 | planned |
| 10 | `gold` | 7 | planned |
| 11 | `orchestrate` | 8 | planned |
| 12 | `operate` | 7 | planned |

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

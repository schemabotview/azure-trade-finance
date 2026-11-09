import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { money, printed, shown } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/gold/02-fact/project/pipeline/gold.py?raw'
import session from '../../../spine/gold/02-fact/session.txt?raw'

// §10.2 — fact_lc_exposure (runs locally): one row per LC, the rule applied, its group joined on (LEFT, so an
// unmapped LC keeps its row). Woodgrove's open LCs are the session's.
const [, n] = /: (\d+) rows, one per LC/.exec(printed(session, 'python pipeline/gold.py').join('\n'))!
const w = shown(session, 'python pipeline/fact.py Woodgrove').rows
const total = w.reduce((s, r) => s + Number(r[5]), 0)

export const goldFact: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/gold.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py', 'gold.py', 'fact.py'], { fresh: ['pipeline/fact.py'] }),
  editor: { file: 'pipeline/gold.py', code, show: [[lineOf(code, 'def main'), lineOf(code, 'one per LC")')]],
    highlight: linesFrom(code, '.join(groups, lcs.applicant_id', '"status", "source_version", "amount", "exposure"))') },
  session,
  side: [
    {
      type: 'group', id: 'build', title: 'How the fact is built', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'b-silver', title: 'lc_current', sub: 'Silver: one current row per LC', icon: 'layers' },
        { type: 'item', id: 'b-rule', title: 'the exposure rule', sub: 'open → amount, closed → 0', icon: 'filter' },
        { type: 'item', id: 'b-join', title: 'LEFT join counterparty_group', sub: 'adds group_name; no row is lost', icon: 'workflow' },
        { type: 'item', id: 'b-fact', title: `fact_lc_exposure: ${n} rows`, sub: 'one per LC, the grain everything sums from', icon: 'layers', tone: 'store' },
        { type: 'item', id: 'b-agg', title: 'every Gold total sums it', sub: 'per group and currency, §10.3', icon: 'chart' },
      ],
    },
    {
      type: 'table', id: 'woodgrove', title: `Woodgrove’s open LCs: USD ${money(String(total))}`, tone: 'store', columns: ['lc_id', 'applicant', 'status', 'exposure'],
      rows: w.map((r) => ({ id: `w-${r[0]}`, cells: [r[0], r[1], r[3], money(r[5])] })),
    },
  ],
  edges: [
    { from: 'b-silver', to: 'b-rule' },
    { from: 'b-rule', to: 'b-join' },
    { from: 'b-join', to: 'b-fact' },
    { from: 'b-fact', to: 'b-agg' },
  ],
})

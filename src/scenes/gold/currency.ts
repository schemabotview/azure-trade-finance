import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { money, shown } from '../spark'
import { millions } from '../csv'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/gold/03-per-currency/project/pipeline/gold.py?raw'
import session from '../../../spine/gold/03-per-currency/session.txt?raw'

// §10.3 — per currency (runs locally). agg_group_exposure is one row per group AND currency: Contoso has two,
// and they are never added together. Spark's own rows.
const t = shown(session, 'python pipeline/gold.py').rows
const contoso = t.filter((r) => r[0] === 'Contoso')

export const goldCurrency: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/gold.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py', 'gold.py', 'fact.py']),
  editor: { file: 'pipeline/gold.py', code, show: [[lineOf(code, 'def main'), lastShow(code)]],
    highlight: [lineOf(code, '.groupBy("group_name", "currency")')] },
  session,
  side: [
    {
      type: 'group', id: 'how', title: 'fact → aggregate', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'h-fact', title: 'fact_lc_exposure', sub: 'one row per LC', icon: 'layers' },
        { type: 'item', id: 'h-where', title: 'only rows with a group', sub: 'the unmapped LC is G3’s to raise', icon: 'filter' },
        { type: 'item', id: 'h-group', title: 'group by group_name AND currency', sub: 'sum(exposure)', icon: 'boxes' },
        { type: 'item', id: 'h-agg', title: `agg_group_exposure: ${t.length} rows`, sub: 'one per group and currency', icon: 'layers', tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'contoso', title: 'Contoso: two rows, never one', icon: 'building', tone: 'consume', dir: 'grid', cols: 2, children: [
        ...contoso.map(([, c, x]) => ({ type: 'item' as const, id: `c-${c}`, title: `${c} ${millions(x)}`, sub: `gross exposure in ${c}`, icon: 'chart', tone: 'store' as const })),
        { type: 'item', id: 'c-no', title: 'EUR + USD = ?', sub: 'no answer: a rate is a market price, not the desk’s', icon: 'lock', span: 'all' },
      ],
    },
    {
      type: 'table', id: 'agg', title: 'lake/gold/agg_group_exposure', tone: 'store', columns: ['group', 'currency', 'gross exposure'],
      rows: t.map((r) => ({ id: `a-${r[0]}-${r[1]}`, cells: [r[0], r[1], money(r[2])] })),
    },
  ],
  edges: [
    { from: 'h-fact', to: 'h-where' },
    { from: 'h-where', to: 'h-group' },
    { from: 'h-group', to: 'h-agg' },
  ],
})

function lastShow(text: string) {
  return lineOf(text, 'agg.orderBy("group_name", "currency").show()')
}

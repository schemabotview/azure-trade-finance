import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { shown } from '../spark'
import { millions } from '../csv'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/gold/05-utilisation/project/pipeline/gold.py?raw'
import session from '../../../spine/gold/05-utilisation/session.txt?raw'

// §10.5 — utilisation, headroom, breach (runs locally). Each group/currency row against its own limit;
// Fabrikam EUR is over. Spark's own rows.
const t = shown(session, 'python pipeline/gold.py').rows

export const goldUtilisation: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/gold.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py', 'gold.py', 'fact.py', 'money.py']),
  editor: { file: 'pipeline/gold.py', code, show: [[lineOf(code, 'limits = spark.read'), lineOf(code, '.orderBy("group_name", "currency").show())')]],
    highlight: linesFrom(code, '.join(limits, ["group_name", "currency"], "left")', '.otherwise("No")))') },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        {
          type: 'group', id: 'how', title: 'each aggregate row meets its limit', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
            { type: 'item', id: 'u-agg', title: 'exposure', sub: 'per group, currency', icon: 'chart', stack: true },
            { type: 'item', id: 'u-lim', title: '+ its limit', sub: 'same keys', icon: 'shield', stack: true },
            { type: 'item', id: 'u-out', title: '3 columns', sub: 'below', icon: 'gauge', tone: 'store', stack: true },
          ],
        },
        {
          type: 'group', id: 'rows', title: 'Each group, against its own limit', icon: 'gauge', tone: 'store', children:
            t.map(([g, c, x, l, u, b]) => ({ type: 'item' as const, id: `r-${g}-${c}`, title: `${g} ${c}: ${u}%`, sub: `${millions(x)} of ${millions(l)}${b === 'Yes' ? ', in breach' : ''}`, icon: b === 'Yes' ? 'bell' : 'gauge', tone: b === 'Yes' ? 'consume' as const : undefined })),
        },
      ],
    },
    {
      type: 'table', id: 'formula', title: 'three columns from two numbers', tone: 'infra', columns: ['column', 'is'], rows: [
        { id: 'f-u', cells: ['utilisation_pct', 'exposure × 100 ÷ limit'] },
        { id: 'f-h', cells: ['headroom', 'limit − exposure'] },
        { id: 'f-b', cells: ['breach', 'Yes when headroom < 0'] },
      ],
    },
  ],
  edges: [
    { from: 'u-agg', to: 'u-lim' },
    { from: 'u-lim', to: 'u-out' },
  ],
})

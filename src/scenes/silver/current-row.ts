import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame } from '../ide'
import { printed, shown } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/silver/01-current-row/project/pipeline/current.py?raw'
import session from '../../../spine/silver/01-current-row/session.txt?raw'

// §9.1 — the current row (runs locally). Bronze holds every version of every LC, duplicates included; the
// query counts rows and LCs and how many rows each LC has. Silver will keep exactly one per LC.
const [, rows, lcs] = /Bronze: (\d+) rows for (\d+) LCs/.exec(printed(session, 'python pipeline/current.py').join('\n'))!
const dist = shown(session, 'python pipeline/current.py').rows

export const silverCurrentRow: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/current.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py'], { fresh: ['pipeline/current.py'] }),
  editor: { file: 'pipeline/current.py', code },
  session,
  side: [
    {
      type: 'group', id: 'idea', title: 'Many rows in, one row out', icon: 'filter', tone: 'ingest', children: [
        { type: 'item', id: 'i-bronze', title: `Bronze: ${rows} rows`, sub: 'every version, every delivery, duplicates too', icon: 'layers' },
        { type: 'item', id: 'i-rule', title: 'per lc_id, the highest source_version', sub: 'what TradeBook says now', icon: 'filter' },
        { type: 'item', id: 'i-silver', title: `Silver: ${lcs} rows`, sub: 'one current row per LC', icon: 'layers', tone: 'store' },
      ],
    },
    { type: 'table', id: 'dist', title: 'Rows per LC in Bronze', tone: 'ingest', columns: ['rows per LC', 'LCs'], rows: dist.map(([n, c]) => ({ id: `d-${n}`, cells: [n, c] })) },
  ],
  edges: [
    { from: 'i-bronze', to: 'i-rule' },
    { from: 'i-rule', to: 'i-silver' },
  ],
})

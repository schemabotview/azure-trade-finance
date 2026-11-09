import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { AZURITE } from '../level'
import { pipelineTree } from './tree'
import code from '../../../spine/bronze/07-g2/project/pipeline/gates.py?raw'
import session from '../../../spine/bronze/07-g2/session.txt?raw'

// §8.7 — G2 (runs locally). Off screen, the desk's operations team delivers batch 43 by hand (tradebook_gen's
// planted correction file, sealed like any batch): three real late amendments and two broken rows. G2 sets
// the broken ones aside with a reason; the rest are appended. The quarantined rows are the session's.
const [, ok, bad] = /batch 43: (\d+) rows appended, (\d+) quarantined/.exec(session)!
const rows = outputOf(session, 'python pipeline/quarantine.py').split('\n').filter((l) => /^\|.*\|$/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim())).filter((r) => r[0] !== 'lc_id')

export const bronzeG2: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/gates.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py'], { fresh: ['pipeline/gates.py', 'pipeline/quarantine.py'] }),
  editor: { file: 'pipeline/gates.py', code, show: [[lineOf(code, 'from pyspark.sql import DataFrame'), lineOf(code, 'checked.where("g2_reason IS NOT NULL"))')]], highlight: linesFrom(code, 'def g2_rules', '"currency not three capitals"') },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        AZURITE,
        {
          type: 'group', id: 'split', title: 'Batch 43, through G2', icon: 'shield', tone: 'ingest', dir: 'grid', cols: 2, children: [
            { type: 'item', id: 's-in', title: 'batch 43', sub: 'the late amendments, plus a hand-made correction', icon: 'file', span: 'all', fill: true },
            { type: 'item', id: 's-ok', title: `${ok} rows → Bronze`, sub: 'the late amendments', icon: 'layers', tone: 'store' },
            { type: 'item', id: 's-bad', title: `${bad} rows → quarantine`, sub: 'kept, with the reason', icon: 'lock', tone: 'consume' },
            { type: 'item', id: 's-bronze', title: 'bronze/lc_deals', sub: 'Silver reads these', icon: 'layers', tone: 'store' },
            { type: 'item', id: 's-q', title: 'lc_deals_quarantine', sub: 'someone fixes the source', icon: 'layers', tone: 'consume' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'quarantine', title: 'lake/bronze/lc_deals_quarantine', tone: 'consume', columns: ['lc_id', 'amount', 'reason'],
      rows: rows.map((r, i) => ({ id: `q-${i}`, cells: [r[0] === 'NULL' || !r[0] ? '(empty)' : r[0], r[1], r[4]], tone: 'consume' as const })),
    },
  ],
  edges: [
    { from: 's-in', to: 's-ok' },
    { from: 's-in', to: 's-bad' },
    { from: 's-ok', to: 's-bronze' },
    { from: 's-bad', to: 's-q' },
  ],
})

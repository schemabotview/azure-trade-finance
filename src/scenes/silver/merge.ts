import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { printed } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/silver/03-merge/project/pipeline/silver.py?raw'
import session from '../../../spine/silver/03-merge/session.txt?raw'

// §9.3 — MERGE (runs locally). Silver is rebuilt by merging Bronze batch by batch: a new LC is inserted; an
// existing one is updated ONLY when the incoming source_version is greater. The per-batch counts are Delta's own
// operation metrics, as the session printed them.
const batches = printed(session, 'python pipeline/silver.py --through 43').map((l) => /batch (\d+): (\d+) rows, (\d+) inserted, (\d+) updated, (\d+) ignored/.exec(l)).filter(Boolean).map((m) => m!.slice(1))

export const silverMerge: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/silver.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py']),
  editor: { file: 'pipeline/silver.py', code, show: [[lineOf(code, 'def merge'), lineOf(code, 'return silver.history(1)')]],
    highlight: linesFrom(code, '(silver.alias("t").merge', '.whenNotMatchedInsertAll()') },
  session,
  side: [
    {
      type: 'group', id: 'paths', title: 'Each incoming row takes one path', icon: 'workflow', tone: 'ingest', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'p-in', title: 'a row from the batch', sub: 'matched on lc_id', icon: 'file', span: 'all' },
        { type: 'item', id: 'p-new', title: 'not matched → insert', sub: 'an LC Silver has not seen', icon: 'check', tone: 'store' },
        { type: 'item', id: 'p-upd', title: 'matched, newer → update', sub: 's.source_version > t.source_version', icon: 'settings', tone: 'infra' },
      ],
    },
    {
      type: 'table', id: 'counts', title: 'Delta’s own counts, per batch', tone: 'store', columns: ['batch', 'rows', 'inserted', 'updated', 'ignored'],
      rows: batches.map((b) => ({ id: `b-${b[0]}`, cells: b })),
    },
    { type: 'note', id: 'note', tone: 'ingest', text: 'Matched but NOT newer: nothing happens. That third path is the next section.' },
  ],
  edges: [
    { from: 'p-in', to: 'p-new' },
    { from: 'p-in', to: 'p-upd' },
  ],
})

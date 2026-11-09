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
      type: 'group', id: 'diagram', bare: true, children: [
        {
          type: 'group', id: 'loop', title: 'For each batch, in order', icon: 'clock', tone: 'store', children: [
            { type: 'item', id: 'l-bronze', title: 'Bronze rows', sub: 'one batch', icon: 'layers' },
            { type: 'item', id: 'l-dedupe', title: 'deduplicate', sub: 'within it', icon: 'filter' },
            { type: 'item', id: 'l-merge', title: 'MERGE', sub: 'a Delta commit', icon: 'layers', tone: 'store' },
            { type: 'item', id: 'l-next', title: 'the next batch', sub: 'against Silver as this one left it', icon: 'clock' },
          ],
        },
        {
          type: 'group', id: 'paths', title: 'Each incoming row takes one path', icon: 'workflow', tone: 'ingest', dir: 'grid', cols: 3, children: [
            { type: 'item', id: 'p-in', title: 'a row from the batch', sub: 'matched on lc_id', icon: 'file', span: 'all', fill: true },
            { type: 'item', id: 'p-new', title: 'not matched', sub: 'insert: a new LC', icon: 'check', tone: 'store' },
            { type: 'item', id: 'p-upd', title: 'matched, newer', sub: 'update', icon: 'settings', tone: 'infra' },
            { type: 'item', id: 'p-old', title: 'matched, not newer', sub: 'nothing: §9.4', icon: 'lock' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'counts', title: 'Delta’s own counts, per batch', tone: 'store', columns: ['batch', 'rows', 'inserted', 'updated', 'ignored'],
      rows: batches.map((b) => ({ id: `b-${b[0]}`, cells: b })),
    },
  ],
  edges: [
    { from: 'l-bronze', to: 'l-dedupe' },
    { from: 'l-dedupe', to: 'l-merge' },
    { from: 'l-merge', to: 'l-next' },
    { from: 'p-in', to: 'p-new' },
    { from: 'p-in', to: 'p-upd' },
    { from: 'p-in', to: 'p-old' },
  ],
})

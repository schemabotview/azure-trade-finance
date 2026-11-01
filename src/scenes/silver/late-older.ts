import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { printed, shown } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/silver/04-late-older/project/pipeline/silver.py?raw'
import session from '../../../spine/silver/04-late-older/session.txt?raw'

// §9.4 — the late older version (runs locally). Batch 44 (batch 41's file, re-sent) reaches Silver: every row is
// equal to or older than what Silver holds, so the MERGE's condition sends all of them nowhere. LC-2041 stays v2.
const m = /batch 44: (\d+) rows, (\d+) inserted, (\d+) updated, (\d+) ignored/.exec(printed(session, 'python pipeline/silver.py').join('\n'))!
const lc = shown(session, 'python pipeline/lc.py LC-2041').rows[0]

export const silverLateOlder: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/silver.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py']),
  editor: { file: 'pipeline/silver.py', code, show: [[lineOf(code, 'def merge'), lineOf(code, 'return silver.history(1)')]], highlight: [lineOf(code, 'condition="s.source_version > t.source_version"')] },
  session,
  side: [
    {
      type: 'group', id: 'race', title: 'LC-2041, as Silver sees it', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'r-41', title: 'batch 41: v1, 2.0m', sub: 'inserted', icon: 'file' },
        { type: 'item', id: 'r-42', title: 'batch 42: v2, 2.2m', sub: '2 > 1: updated', icon: 'settings', tone: 'store' },
        { type: 'item', id: 'r-44', title: 'batch 44: v1 again', sub: '1 > 2? no: ignored', icon: 'lock', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'batch44', title: 'Batch 44 into Silver', tone: 'consume', columns: ['rows', 'inserted', 'updated', 'ignored'],
      rows: [{ id: 'b44', cells: [m[1], m[2], m[3], m[4]] }],
    },
    { type: 'table', id: 'now', title: 'LC-2041 in Silver, after', tone: 'store', columns: ['source_version', 'amount', 'status'], rows: [{ id: 'n', cells: [lc[1], lc[2], lc[3]] }] },
  ],
  edges: [
    { from: 'r-41', to: 'r-42' },
    { from: 'r-42', to: 'r-44' },
  ],
})

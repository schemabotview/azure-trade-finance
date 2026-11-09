import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, terminal, trim } from '../ide'
import { outputOf } from '../lab'
import { shown } from '../spark'
import code from '../../../spine/silver/05-delta-log/project/pipeline/history.py?raw'
import session from '../../../spine/silver/05-delta-log/session.txt?raw'

// §9.5 — ◆ full scene: Delta's log (runs locally). A Delta table is Parquet files plus _delta_log/: one numbered
// JSON commit per write. history() reads the commits; versionAsOf reads the table as it was — LC-2041 at version
// 1, before batch 42 amended it. All values from the session.
const commits = outputOf(session, 'ls lake/silver/lc_current/_delta_log/').trim().split('\n').filter((f) => f.endsWith('.json'))
const hist = shown(session, 'python pipeline/history.py LC-2041 1', 0).rows
const then = shown(session, 'python pipeline/history.py LC-2041 1', 1).rows[0]
const rows = terminal(session).split('\n')

export const silverDeltaLog: SceneModel = {
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'log', bare: true, spread: true, children: [
        {
          type: 'group', id: 'commits', title: 'lake/silver/lc_current/_delta_log/', icon: 'folder', tone: 'ingest', spread: true, minH: 640, children:
            hist.map(([v, op, ins, upd]) => ({ type: 'item' as const, id: `c-${v}`, title: `${commits[Number(v)] ?? v}`, sub: `v${v} ${op}${ins !== 'NULL' ? `: ${ins} inserted, ${upd} updated` : ': the empty table'}`, icon: 'file' })),
        },
        { type: 'table', id: 'travel', title: 'versionAsOf 1: LC-2041 back then', tone: 'store', columns: ['lc_id', 'source_version', 'amount'], rows: [{ id: 't', cells: then }] },
      ],
    },
    {
      type: 'group', id: 'right', bare: true, children: [
        { type: 'code', id: 'editor', filename: 'pipeline/history.py', lang: 'python', code: trim(code), tone: 'ingest', show: [[lineOf(code, '(DeltaTable.forPath'), lineOf(code, 'then.where')]] },
        { type: 'code', id: 'terminal', terminal: true, filename: 'terminal — lc-exposure', code: rows.join('\n'), show: [[rows.findIndex((l) => l.startsWith('$ python')) + 1, rows.length]] },
      ],
    },
  ],
  edges: hist.slice(1).map(([v]) => ({ from: `c-${Number(v) - 1}`, to: `c-${v}` })),
}

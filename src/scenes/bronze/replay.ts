import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { AZURITE } from '../level'
import { pipelineTree } from './tree'
import code from '../../../spine/bronze/08-replay/project/pipeline/bronze.py?raw'
import session from '../../../spine/bronze/08-replay/session.txt?raw'

// §8.8 — a replayed file (runs locally). Off screen, batch 41's file is re-sent under a new batch, 44 (the
// step's setup copies it in the lake and seals it). Bronze appends it — every row again — so LC-2041 now
// has three rows: v1 twice, v2 once. That is right: Bronze records what ARRIVED; Silver decides what is TRUE.
const appended = /batch 44: (\d+) rows appended/.exec(session)![1]
const versions = outputOf(session, 'python pipeline/versions.py LC-2041').split('\n').filter((l) => l.startsWith('|LC-')).map((l) => l.split('|').map((c) => c.trim()).filter(Boolean))

export const bronzeReplay: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/bronze.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py']),
  editor: { file: 'pipeline/bronze.py', code, show: [[lineOf(code, 'def main'), lineOf(code, 'quarantined (G2)")')]], highlight: [lineOf(code, 'if batch in done')] },
  session,
  side: [
    AZURITE,
    {
      type: 'table', id: 'lc2041', title: 'LC-2041 in Bronze, now', tone: 'ingest', columns: ['source_version', 'amount', 'batch_id'],
      rows: versions.map((v, i) => ({ id: `v-${i}`, cells: [v[1], v[2], v[4]], tone: v[4] === '44' ? 'infra' as const : undefined })),
    },
    {
      type: 'table', id: 'why', title: 'Why Bronze keeps the duplicate', tone: 'store', columns: ['layer', 'answers'], rows: [
        { id: 'w-bronze', cells: ['Bronze', 'what arrived, when, from where'] },
        { id: 'w-silver', cells: ['Silver (Course 9)', 'what is true now, per LC'], tone: 'store' },
        { id: 'w-audit', cells: ['an auditor', '“was batch 44 a re-send?” — yes, here'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'infra', text: `Batch 44 appended ${appended} rows: batch 41’s file, every row again, under a new delivery. Deduplicating here would erase the evidence that it happened.` },
  ],
})

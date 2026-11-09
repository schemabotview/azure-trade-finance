import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame } from '../ide'
import { printed } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/gold/07-answer/project/pipeline/answer.py?raw'
import session from '../../../spine/gold/07-answer/session.txt?raw'

// §10.7 — the answer (runs locally). The bug fixed, G4 passes, and answer.py reads Woodgrove USD from the
// published aggregate. Every value is the session's.
const out = printed(session, 'python pipeline/answer.py Woodgrove USD')
const v = (k: string) => out.find((l) => l.trim().startsWith(k))!.trim().slice(k.length).trim()
const g4 = printed(session, 'python pipeline/g4.py').filter((l) => / PASS /.test(l)).map((l) => l.trim().split(/\s+/))

export const goldAnswer: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/answer.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py', 'gold.py', 'fact.py', 'money.py', 'g4.py', 'answer.py'], { fresh: ['pipeline/answer.py'] }),
  editor: { file: 'pipeline/answer.py', code },
  session,
  keep: ['$ python pipeline/g4.py', 'G4 PASS', ['$ python pipeline/answer.py', 'breach']],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        {
          type: 'group', id: 'card', title: 'Woodgrove · USD · 31 October 2026', icon: 'building', tone: 'store', dir: 'grid', cols: 2, children: [
            { type: 'item', id: 'a-x', title: v('gross exposure'), sub: 'gross exposure', icon: 'chart' },
            { type: 'item', id: 'a-l', title: v('limit'), sub: 'limit', icon: 'shield' },
            { type: 'item', id: 'a-u', title: v('utilisation'), sub: 'utilisation', icon: 'gauge' },
            { type: 'item', id: 'a-h', title: v('headroom'), sub: 'headroom', icon: 'chart' },
            { type: 'item', id: 'a-b', title: v('breach'), sub: 'breach', icon: 'check', tone: 'store', span: 'all' },
          ],
        },
        {
          type: 'group', id: 'path', title: 'How the number was earned', icon: 'workflow', tone: 'ingest', children: [
            { type: 'item', id: 'p-g1', title: 'G1 at landing', sub: 'every batch complete and sealed', icon: 'adls' },
            { type: 'item', id: 'p-g2', title: 'G2 into Bronze', sub: 'untrusted rows set aside', icon: 'layers' },
            { type: 'item', id: 'p-g3', title: 'G3 on Silver', sub: 'one row per LC, every LC mapped', icon: 'layers' },
            { type: 'item', id: 'p-g4', title: 'G4 on Gold: PASS', sub: `fact = aggregate in ${g4.length} currencies`, icon: 'check', tone: 'store' },
            { type: 'item', id: 'p-ans', title: 'answer.py', sub: 'reads the published aggregate', icon: 'code' },
          ],
        },
      ],
    },
  ],
  edges: [
    { from: 'p-g1', to: 'p-g2' },
    { from: 'p-g2', to: 'p-g3' },
    { from: 'p-g3', to: 'p-g4' },
    { from: 'p-g4', to: 'p-ans' },
  ],
})

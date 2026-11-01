import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { printed } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/orchestrate/02-gate-policy/project/pipeline/run.py?raw'
import session from '../../../spine/orchestrate/02-gate-policy/session.txt?raw'

// §11.2 — the gate policy (runs locally). run.py is one night end to end: PASS goes on, WARN goes on and says
// so, FAIL stops every step after it. Tonight G2 warns and G3 fails, so Gold keeps its last good answer.
const out = printed(session, 'python pipeline/run.py')
const g2 = out.find((l) => l.startsWith('G2 '))!
const g3 = out.find((l) => l.startsWith('G3 FAIL'))!

export const orchestrateGatePolicy: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/run.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py', 'gold.py', 'fact.py', 'money.py', 'g4.py', 'answer.py', 'run.py'], { fresh: ['pipeline/run.py'] }),
  editor: { file: 'pipeline/run.py', code, show: [[1, 4], [lineOf(code, 'def main'), lineOf(code, 'night complete')]],
    highlight: [lineOf(code, '== "FAIL":'), lineOf(code, 'sys.exit("G3 FAIL')] },
  session,
  side: [
    {
      type: 'table', id: 'policy', title: 'three outcomes, and what each blocks', tone: 'infra', columns: ['outcome', 'the run', 'tonight'], rows: [
        { id: 'p-pass', cells: ['PASS', 'goes on', 'G3: 2 of 3 checks'] },
        { id: 'p-warn', cells: ['WARN', 'goes on, and says so', 'G2'], tone: 'infra' },
        { id: 'p-fail', cells: ['FAIL', 'stops every step after', 'G3'], tone: 'consume' },
      ],
    },
    {
      type: 'group', id: 'night', title: 'Tonight’s run', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'n-bronze', title: 'Bronze', sub: 'no new batch: every one already in', icon: 'layers' },
        { type: 'item', id: 'n-g2', title: g2.split(':')[0], sub: g2.split(': ')[1], icon: 'bell', tone: 'infra' },
        { type: 'item', id: 'n-silver', title: 'Silver', sub: 'merged', icon: 'layers' },
        { type: 'item', id: 'n-g3', title: 'G3 FAIL', sub: 'CP-1501 has no group', icon: 'lock', tone: 'consume' },
        { type: 'item', id: 'n-gold', title: 'Gold: not run', sub: g3.split('; ')[1], icon: 'archive' },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'A failed night leaves no wrong report: yesterday’s answer stays, clearly yesterday’s, until the mapping is fixed.' },
  ],
  edges: [
    { from: 'n-bronze', to: 'n-g2' },
    { from: 'n-g2', to: 'n-silver' },
    { from: 'n-silver', to: 'n-g3' },
    { from: 'n-g3', to: 'n-gold' },
  ],
})

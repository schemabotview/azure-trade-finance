import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { printed } from '../spark'
import { millions } from '../csv'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/silver/07-g3/project/pipeline/gates.py?raw'
import session from '../../../spine/silver/07-g3/session.txt?raw'

// §9.7 — G3 (runs locally). Three checks on Silver before Gold may run; the second fails on the one open LC
// whose counterparty the risk team never mapped. Every value is the gate's own output.
const out = printed(session, 'python pipeline/g3.py')
const checks = out.map((l) => /^\s+(.+?)\s{2,}(PASS|FAIL)\s+(.*)$/.exec(l)).filter(Boolean).map((m) => m!.slice(1))
const [cp, lc, ccy, amount] = checks.find((c) => c[1] === 'FAIL')![2].split(' ')

export const silverG3: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/gates.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py'], { fresh: ['pipeline/g3.py'] }),
  editor: { file: 'pipeline/gates.py', code, show: [[lineOf(code, 'def g3'), lineOf(code, 'without a limit"),') + 1]],
    highlight: linesFrom(code, 'unmapped = open_lcs.join', 'groups.counterparty_id, "left_anti")') },
  session,
  side: [
    {
      type: 'group', id: 'why', title: 'The one that fails', icon: 'search', tone: 'consume', children: [
        { type: 'item', id: 'w-silver', title: 'lc_current: the open LCs', sub: 'ISSUED, ACTIVE, AMENDED', icon: 'layers' },
        { type: 'item', id: 'w-lc', title: `${lc}: ${ccy} ${millions(amount)}`, sub: `open, applicant ${cp}`, icon: 'file' },
        { type: 'item', id: 'w-map', title: `${cp}: no group`, sub: 'not in counterparty_group', icon: 'search' },
        { type: 'item', id: 'w-join', title: `an inner join drops ${ccy} ${millions(amount)}`, sub: 'Gold would report less than is owed', icon: 'filter', tone: 'consume' },
        { type: 'item', id: 'w-stop', title: 'G3 FAIL', sub: 'Gold does not run tonight', icon: 'lock', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'checks', title: 'G3 on Silver', tone: 'infra', columns: ['check', 'result'],
      rows: checks.map(([c, r], i) => ({ id: `c${i}`, cells: [c, r] })),
    },
  ],
  edges: [
    { from: 'w-silver', to: 'w-lc' },
    { from: 'w-lc', to: 'w-map' },
    { from: 'w-map', to: 'w-join' },
    { from: 'w-join', to: 'w-stop' },
  ],
})

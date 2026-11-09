import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { printed } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/silver/06-reference/project/pipeline/reference_tables.py?raw'
import session from '../../../spine/silver/06-reference/session.txt?raw'
import limitsCsv from '../../../spine/land/08-reference/captured/reference/group_limits.csv?raw'

// §9.6 — reference tables (runs locally). The risk team's two files are checked BEFORE they are published to
// Silver: a wrong mapping moves exposure from one group to another, so one failed check publishes nothing.
const out = printed(session, 'python pipeline/reference_tables.py 2026-10-31')
const checks = out.map((l) => /^\s+(.+?)\s+(PASS|FAIL)$/.exec(l)).filter(Boolean).map((m) => m!.slice(1))
const [, maps, limits] = /published: (\d+) mappings, (\d+) limits/.exec(out.join('\n'))!

export const silverReference: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/reference_tables.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py'], { fresh: ['pipeline/reference_tables.py'] }),
  editor: { file: 'pipeline/reference_tables.py', code, show: [[lineOf(code, 'checks = {'), lineOf(code, 'spark = spark_session()')]],
    highlight: [lineOf(code, 'if not all(checks.values()):'), lineOf(code, 'sys.exit("refused')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        {
          type: 'group', id: 'flow', title: 'From the risk team to Silver', icon: 'workflow', tone: 'ingest', children: [
            { type: 'item', id: 'f-files', title: 'reference/ container', sub: 'the mapping and the limits', icon: 'adls' },
            { type: 'table', id: 'f-checks', title: 'five checks, all must pass', tone: 'infra', columns: ['check', 'result'], rows: checks.map(([c, r], i) => ({ id: `k${i}`, cells: [c, r] })) },
            { type: 'item', id: 'f-silver', title: `Silver: ${maps} mappings, ${limits} limits`, sub: 'as of 2026-10-31, Delta', icon: 'layers', tone: 'store' },
          ],
        },
        { type: 'note', id: 'note', tone: 'consume', text: 'One FAIL and nothing is published: Silver keeps yesterday’s tables, and the run says why.' },
      ],
    },
    {
      type: 'table', id: 'limits', title: 'lake/silver/group_limits', tone: 'store', columns: ['group', 'currency', 'limit_amount'],
      rows: limitsCsv.trim().split('\n').slice(1).map((l, i) => ({ id: `g${i}`, cells: l.split(',') })),
    },
  ],
  edges: [
    { from: 'f-files', to: 'f-checks' },
    { from: 'f-checks', to: 'f-silver' },
  ],
})

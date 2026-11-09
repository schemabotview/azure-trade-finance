import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { money, printed } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/gold/06-g4/project/pipeline/gates.py?raw'
import gold from '../../../spine/gold/06-g4/project/pipeline/gold.py?raw'
import session from '../../../spine/gold/06-g4/session.txt?raw'

// §10.6 — G4 (runs locally). Per currency, the aggregate must add up to the fact. The step plants a bug in
// gold.py (an "open" filter that forgets AMENDED); G4 catches it. The bad line and the totals are the step's own.
const checks = printed(session, 'python pipeline/g4.py').map((l) => /^\s+(\w+) fact = aggregate\s+(PASS|FAIL)\s+([\d.]+) vs ([\d.]+)/.exec(l)).filter(Boolean).map((m) => m!.slice(1))
const bug = gold.split('\n')[lineOf(gold, '.where(F.col("status").isin("ISSUED", "ACTIVE"))') - 1].trim().replace(/\s+#.*/, '')

export const goldG4: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/gates.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py', 'gold.py', 'fact.py', 'money.py', 'g4.py'], { fresh: ['pipeline/g4.py'] }),
  editor: { file: 'pipeline/gates.py', code, show: [[lineOf(code, 'def g4'), lineOf(code, 'def g4')], [lineOf(code, 'fact = ', lineOf(code, 'def g4')), lineOf(code, 'f"{facts[c]} vs {aggs.get(c)}") for c in sorted(facts)]')]] },
  session,
  keep: ['$ python pipeline/gold.py', ['|   Contoso|     EUR', '| Woodgrove|'], ['$ python pipeline/g4.py', 'G4 FAIL']],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        {
          type: 'group', id: 'rec', title: 'Two roads to one total', icon: 'workflow', tone: 'infra', dir: 'grid', cols: 2, children: [
            { type: 'item', id: 'r-fact', title: 'fact, summed', sub: 'per currency, mapped LCs', icon: 'layers' },
            { type: 'item', id: 'r-agg', title: 'aggregate, summed', sub: 'per currency, every group', icon: 'layers' },
            { type: 'item', id: 'r-eq', title: 'must be equal, to the cent', sub: 'or Gold is not published', icon: 'check', tone: 'store', span: 'all', fill: true },
          ],
        },
        { type: 'code', id: 'bug', filename: 'the planted bug, in pipeline/gold.py', lang: 'python', code: bug, tone: 'consume', wrap: true },
        {
          type: 'group', id: 'then', title: 'On a FAIL', icon: 'lock', tone: 'consume', dir: 'row', children: [
            { type: 'item', id: 't-fail', title: 'G4 FAIL', sub: 'exit 1', icon: 'lock', tone: 'consume', stack: true },
            { type: 'item', id: 't-hold', title: 'not published', sub: 'the report keeps', icon: 'archive', stack: true },
            { type: 'item', id: 't-old', title: 'the last good', sub: 'until gold.py is fixed', icon: 'clock', stack: true },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'checks', title: 'G4, on the planted bug', tone: 'consume', columns: ['currency', 'fact', 'aggregate', 'result'],
      rows: checks.map(([c, r, f, a]) => ({ id: `k-${c}`, cells: [c, money(f), money(a), r], tone: r === 'FAIL' ? 'consume' as const : undefined })),
    },
  ],
  edges: [
    { from: 'r-fact', to: 'r-eq' },
    { from: 'r-agg', to: 'r-eq' },
    { from: 't-fail', to: 't-hold' },
    { from: 't-hold', to: 't-old' },
  ],
})

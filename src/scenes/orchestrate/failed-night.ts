import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lastLine } from '../ide'
import { level } from '../level'
import { outputOf } from '../lab'
import { printed } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/orchestrate/07-failed-night/project/inbox/counterparty_group.csv?raw'
import session from '../../../spine/orchestrate/07-failed-night/session.txt?raw'
import before from '../../../spine/gold/07-answer/session.txt?raw'

// §11.7 — a failed night (run locally: open-source Spark standing in for the Databricks job). night-45 fails
// G3 on CP-1501; the risk team's corrected mapping is published through the reference checks; the rerun
// passes G3 and G4 and publishes Gold. Every value is a session's.
const fail = printed(session, 'python pipeline/run.py night-45').find((l) => l.startsWith('G3 FAIL'))!
const published = printed(session, 'python pipeline/reference_tables.py 2026-11-01').find((l) => l.startsWith('published'))!
const rerun = printed(session, 'python pipeline/run.py night-45-rerun')
const used = (s: string) => /utilisation\s+([\d.]+%)/.exec(s)![1]
const was = used(outputOf(before, 'python pipeline/gold.py').split('\n').filter((l) => l.includes('Northwind')).map((l) => `utilisation ${l.split('|')[5].trim()}%`)[0])
const now = used(outputOf(session, 'python pipeline/answer.py Northwind USD'))
const S = ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py',
  'reference_tables.py', 'g3.py', 'joins.py', 'gold.py', 'fact.py', 'money.py', 'g4.py', 'answer.py', 'run.py', 'audit.py']

export const orchestrateFailedNight: SceneModel = ideFrame({
  tree: pipelineTree('inbox/counterparty_group.csv', S, { fresh: ['inbox/counterparty_group.csv'] }),
  editor: { file: 'inbox/counterparty_group.csv', code, highlight: [lastLine(code)] },
  session,
  keep: ['$ python pipeline/run.py night-45', 'G3 FAIL', '$ python extract/reference.py', 'published:', '$ python pipeline/run.py night-45-rerun', 'counterparty mapped', 'night complete'],
  side: [
    level('emulated', 'open-source Spark, run locally, standing in for the Databricks job'),
    {
      type: 'group', id: 'night', title: 'One night, failed then fixed', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'n-fail', title: 'night-45: G3 FAIL', sub: fail.split(': ')[1], icon: 'lock', tone: 'consume' },
        { type: 'item', id: 'n-fix', title: 'the risk team maps CP-1501', sub: 'a corrected file: the fix is at the source', icon: 'users' },
        { type: 'item', id: 'n-ref', title: 'the reference checks: PASS', sub: published, icon: 'check' },
        { type: 'item', id: 'n-rerun', title: 'night-45-rerun: G3, G4 PASS', sub: rerun.find((l) => l.startsWith('night complete'))!, icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'nw', title: 'Northwind USD, before and after', tone: 'store', columns: ['night', 'utilisation'], rows: [
        { id: 'w-before', cells: ['Course 10 (CP-1501 unmapped)', was] },
        { id: 'w-after', cells: ['night-45-rerun', now] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'The fix is at the source: the pipeline never guesses a group, and no join is edited.' },
  ],
  edges: [
    { from: 'n-fail', to: 'n-fix' },
    { from: 'n-fix', to: 'n-ref' },
    { from: 'n-ref', to: 'n-rerun' },
  ],
})

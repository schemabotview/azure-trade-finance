import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { shown } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/orchestrate/03-audit/project/pipeline/run.py?raw'
import session from '../../../spine/orchestrate/03-audit/session.txt?raw'

// §11.3 — the audit table (runs locally). Every gate's every check is appended to lake/audit/gate_results
// with the run's id — the local stand-in for risk.audit.gate_results. The rows are the session's.
const t = shown(session, 'python pipeline/audit.py')

export const orchestrateAudit: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/run.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py', 'gold.py', 'fact.py', 'money.py', 'g4.py', 'answer.py', 'run.py', 'audit.py'], { fresh: ['pipeline/audit.py'] }),
  editor: { file: 'pipeline/run.py', code, show: [[lineOf(code, 'AUDIT = '), lineOf(code, '.mode("append").save(AUDIT))')]],
    highlight: linesFrom(code, 'rows = [(run_id, gate, check', 'for check, ok, detail in results]') },
  session,
  keep: ['$ python pipeline/run.py night-44', ['G3 FAIL: Gold', '|night-44|G3  |one row per'], '+--------+----+'],
  side: [
    {
      type: 'group', id: 'flow', title: 'Every check, written down', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'f-gates', title: 'G2, G3, G4', sub: 'each check, PASS / WARN / FAIL', icon: 'shield' },
        { type: 'item', id: 'f-row', title: 'one row per check', sub: 'run_id, gate, rule, status, detail', icon: 'file' },
        { type: 'item', id: 'f-audit', title: 'lake/audit/gate_results', sub: 'appended, never overwritten', icon: 'layers', tone: 'store' },
        { type: 'item', id: 'f-ask', title: 'answers “what failed, and when?”', sub: 'a query, not a log search', icon: 'search' },
        { type: 'item', id: 'f-alert', title: 'an alert on a FAIL row', sub: 'Course 12', icon: 'bell' },
      ],
    },
    {
      type: 'table', id: 'rows', title: 'night-44, as the audit table holds it', tone: 'store', columns: t.head,
      rows: t.rows.map((r, i) => ({ id: `r${i}`, cells: r, tone: r[3] === 'FAIL' ? 'consume' as const : r[3] === 'WARN' ? 'infra' as const : undefined })),
    },
    { type: 'note', id: 'note', tone: 'store', text: 'A PASS is written too: it is the evidence that the check ran.' },
  ],
  edges: [
    { from: 'f-gates', to: 'f-row' },
    { from: 'f-row', to: 'f-audit' },
    { from: 'f-audit', to: 'f-ask' },
    { from: 'f-ask', to: 'f-alert' },
  ],
})

import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { dbxTree } from '../databricks/tree'
import session from '../../../spine/bronze/01-workspace/session.txt?raw'
import code from '../../../spine/bronze/01-workspace/project/infra/job.tf?raw'

// §11.4 — failure email (compiled). The job tells the risk engineers when a night fails.
export const orchestrateEmail: SceneModel = ideFrame({
  tree: dbxTree('infra/job.tf'),
  editor: { file: 'infra/job.tf', code, show: [[lineOf(code, '# A failed night tells'), lineOf(code, 'on_failure = [') + 1]], highlight: [lineOf(code, 'on_failure = [')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'terraform validate, offline: real, not deployed'),
        {
          type: 'group', id: 'flow', title: 'A failed night, told', icon: 'workflow', tone: 'consume', children: [
            { type: 'item', id: 'e-fail', title: 'task g3 exits 1', sub: 'G3 FAIL: the run fails', icon: 'lock', tone: 'consume' },
            { type: 'item', id: 'e-job', title: 'the jobs service', sub: 'on_failure', icon: 'databricks' },
            { type: 'item', id: 'e-mail', title: 'trade-risk@syndicabank.example', sub: 'the run, its failed task, a link', icon: 'bell' },
            { type: 'item', id: 'e-audit', title: 'risk.audit.gate_results', sub: 'what failed and why: §11.3', icon: 'layers', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'ch', title: 'Three channels, three jobs', tone: 'infra', columns: ['channel', 'tells you'], rows: [
        { id: 'c-1', cells: ['the job’s email', 'that it failed'] },
        { id: 'c-2', cells: ['risk.audit.gate_results', 'which check, why'] },
        { id: 'c-3', cells: ['a log alert (Course 12)', 'a missed night'] },
      ],
    },
  ],
  edges: [
    { from: 'e-fail', to: 'e-job' },
    { from: 'e-job', to: 'e-mail' },
    { from: 'e-mail', to: 'e-audit' },
  ],
})

import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { dbxTree } from '../databricks/tree'
import session from '../../../spine/bronze/01-workspace/session.txt?raw'
import code from '../../../spine/bronze/01-workspace/project/infra/job.tf?raw'

// §11.1 — Databricks Jobs (compiled). The job's tasks are run.py's steps, each depending on the one before:
// a gate that exits 1 stops every task after it.
export const orchestrateJobs: SceneModel = ideFrame({
  tree: dbxTree('infra/job.tf'),
  editor: { file: 'infra/job.tf', code, show: [[lineOf(code, 'locals {'), lineOf(code, 'locals {') + 2], [lineOf(code, 'dynamic "task" {'), lineOf(code, 'python_file = ') + 3]],
    highlight: [lineOf(code, 'tasks = ['), lineOf(code, 'for_each = task.key == 0')] },
  session,
  side: [
    level('compiled', 'terraform validate, offline: real, not deployed'),
    {
      type: 'group', id: 'graph', title: 'lc-exposure: the task graph', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'j-bronze', title: 'bronze', sub: 'new sealed batches; G2 sets rows aside', icon: 'layers' },
        { type: 'item', id: 'j-silver', title: 'silver', sub: 'MERGE, batch by batch', icon: 'layers' },
        { type: 'item', id: 'j-g3', title: 'g3', sub: 'exits 1 on FAIL: nothing after it runs', icon: 'shield', tone: 'consume' },
        { type: 'item', id: 'j-gold', title: 'gold', sub: 'fact and aggregate', icon: 'layers' },
        { type: 'item', id: 'j-g4', title: 'g4', sub: 'fact = aggregate, or not published', icon: 'shield', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'vs', title: 'run.py and the job: the same night', tone: 'infra', columns: ['', 'run.py, locally', 'the job'], rows: [
        { id: 'v-1', cells: ['a gate fails', 'sys.exit: nothing after', 'task fails: nothing after'] },
        { id: 'v-2', cells: ['runs on', 'Ana’s laptop', 'a cluster, per run'] },
        { id: 'v-3', cells: ['its code', 'the working copy', 'Git, at the run’s start'] },
      ],
    },
  ],
  edges: [
    { from: 'j-bronze', to: 'j-silver' },
    { from: 'j-silver', to: 'j-g3' },
    { from: 'j-g3', to: 'j-gold' },
    { from: 'j-gold', to: 'j-g4' },
  ],
})

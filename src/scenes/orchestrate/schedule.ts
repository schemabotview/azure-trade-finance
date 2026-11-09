import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { dbxTree } from '../databricks/tree'
import session from '../../../spine/bronze/01-workspace/session.txt?raw'
import code from '../../../spine/bronze/01-workspace/project/infra/job.tf?raw'

// §11.6 — one schedule owner (compiled). Data Factory's trigger owns the night; the job's own schedule
// exists but is PAUSED, so the night can never run twice.
const setting = (k: string) => new RegExp(`${k}\\s*=\\s*"([^"]+)"`).exec(code)![1]

export const orchestrateSchedule: SceneModel = ideFrame({
  tree: dbxTree('infra/job.tf'),
  editor: { file: 'infra/job.tf', code, show: [[lineOf(code, '# ONE scheduler owns'), lineOf(code, 'pause_status') + 1]], highlight: [lineOf(code, 'pause_status')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'terraform validate, offline: real, not deployed'),
        {
          type: 'group', id: 'two', bare: true, dir: 'grid', cols: 2, children: [
            {
              type: 'group', id: 'bad', title: 'two schedulers', icon: 'bell', tone: 'consume', children: [
                { type: 'item', id: 'b-adf', title: '02:00 ADF starts the job', sub: 'after the extract', icon: 'datafactory' },
                { type: 'item', id: 'b-job', title: '02:30 the job starts itself', sub: 'whatever the extract did', icon: 'databricks' },
                { type: 'item', id: 'b-out', title: 'the night runs twice', sub: 'or before its batch landed', icon: 'lock', tone: 'consume' },
                { type: 'item', id: 'b-merge', title: 'two MERGEs, two publishes', sub: 'and nobody chose that', icon: 'bell', tone: 'consume' },
              ],
            },
            {
              type: 'group', id: 'good', title: 'one owner', icon: 'check', tone: 'store', children: [
                { type: 'item', id: 'g-adf', title: '02:00 tr_nightly_0200', sub: 'the only clock', icon: 'clock' },
                { type: 'item', id: 'g-job', title: 'the job: PAUSED', sub: 'runs only when pl_nightly says', icon: 'databricks' },
                { type: 'item', id: 'g-out', title: 'one run, in order', sub: 'extract, then the job', icon: 'check', tone: 'store' },
                { type: 'item', id: 'g-undo', title: 'nothing to undo', sub: 'one run, one answer', icon: 'check', tone: 'store' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'sched', title: 'The job’s schedule, as declared', tone: 'infra', columns: ['setting', 'value'], rows: [
        { id: 's-1', cells: ['quartz_cron_expression', setting('quartz_cron_expression')] },
        { id: 's-2', cells: ['timezone_id', setting('timezone_id')] },
        { id: 's-3', cells: ['pause_status', setting('pause_status')] },
      ],
    },
  ],
  edges: [
    { from: 'b-adf', to: 'b-job' },
    { from: 'b-job', to: 'b-out' },
    { from: 'b-out', to: 'b-merge' },
    { from: 'g-out', to: 'g-undo' },
    { from: 'g-adf', to: 'g-job' },
    { from: 'g-job', to: 'g-out' },
  ],
})

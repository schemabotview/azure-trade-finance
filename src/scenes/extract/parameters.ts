import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { extractTree } from './tree'
import code from '../../../spine/extract/06-parameters/project/adf/adf.sh?raw'
import session from '../../../spine/extract/06-parameters/session.txt?raw'

// §7.6 — parameters and expressions (recorded on Azure). The last run's parameters, as Data Factory stored
// them, and the query copy_window actually ran, every expression already resolved.
const params = JSON.parse(outputOf(session, 'bash adf/adf.sh get pipelineruns/$R --query parameters'))
const query = outputOf(session, 'bash adf/adf.sh input $R copy_window | grep -o \'"query": .*\'').replace(/\n/g, '')
const [, after, upto] = /updated_at > '([^']+)' AND updated_at <= '([^']+)'/.exec(query)!

export const extractParameters: SceneModel = ideFrame({
  tree: extractTree('06', 'adf/adf.sh'),
  editor: { file: 'adf/adf.sh', code, show: [[1, 11], [lineOf(code, 'last)'), lineOf(code, '[0].input" ;;')]], highlight: [lineOf(code, 'last)'), lineOf(code, 'input)')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'flow', title: 'One definition, a new night each run', icon: 'workflow', tone: 'ingest', children: [
            { type: 'item', id: 'p-trigger', title: 'from §7.7: the trigger', sub: 'passes both, every night', icon: 'clock' },
            { type: 'item', id: 'p-params', title: 'batch_id, window_end', sub: 'given when the run starts', icon: 'settings' },
            { type: 'item', id: 'p-outputs', title: '+ an earlier activity’s output', sub: 'the watermark lookup', icon: 'clock' },
            { type: 'item', id: 'p-query', title: 'the query and the folder', sub: 'resolved as the activity starts', icon: 'postgresql', tone: 'store' },
          ],
        },
        { type: 'note', id: 'note', tone: 'infra', text: `Data Factory hands window_end back as ${params.window_end}: its own date format. The query used the value as given.` },
      ],
    },
    {
      type: 'table', id: 'resolve', title: 'Each expression, as copy_window ran it', tone: 'infra', columns: ['expression', 'became'], rows: [
        { id: 'r-batch', cells: ['@{pipeline().parameters.batch_id}', params.batch_id] },
        { id: 'r-wm', cells: ['@{activity(\'lookup_watermark\')…Prop_0}', after] },
        { id: 'r-end', cells: ['@{pipeline().parameters.window_end}', upto] },
        { id: 'r-folder', cells: ['lc_deals/batch_id=@{…batch_id}', `lc_deals/batch_id=${params.batch_id}`] },
      ],
    },
  ],
  edges: [
    { from: 'p-trigger', to: 'p-params' },
    { from: 'p-params', to: 'p-outputs' },
    { from: 'p-outputs', to: 'p-query' },
  ],
})

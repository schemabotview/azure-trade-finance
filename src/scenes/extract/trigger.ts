import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { extractTree } from './tree'
import code from '../../../spine/extract/07-triggers/project/infra/trigger.tf?raw'
import session from '../../../spine/extract/07-triggers/session.txt?raw'

// §7.7 — triggers (recorded on Azure). tr_nightly_0200 is a tumbling window: 24-hour windows from 31 October
// 02:00, one at a time, each passing its own end and batch number to pl_extract. Created stopped.
const t = JSON.parse(outputOf(session, 'bash adf/adf.sh get triggers/tr_nightly_0200 --query "properties.$Q"'))

export const extractTrigger: SceneModel = ideFrame({
  tree: extractTree('07', 'infra/trigger.tf'),
  editor: { file: 'infra/trigger.tf', code, show: [[1, 4], [lineOf(code, 'resource "azurerm_data_factory_trigger'), lineOf(code, 'batch_id   =') + 3]], highlight: [lineOf(code, 'activated       = false'), lineOf(code, 'batch_id   =')] },
  session,
  keep: ['Apply complete!', ['$ bash adf/adf.sh get', '"startTime"']],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'line', title: `${t.type}: every ${t.window.interval} hours, ${t.state.toLowerCase()}`, icon: 'clock', tone: 'ingest', children: [
            { type: 'item', id: 'w-42', title: 'batch 42', sub: '31 Oct 02:00 → 1 Nov 02:00', icon: 'file', tone: 'store' },
            { type: 'item', id: 'w-43', title: 'batch 43', sub: '1 Nov → 2 Nov', icon: 'file' },
            { type: 'item', id: 'w-44', title: 'batch 44', sub: '2 Nov → 3 Nov', icon: 'file' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'vs', title: 'Two kinds of trigger', tone: 'infra', columns: ['', 'schedule', 'tumbling window'], rows: [
        { id: 'v-what', cells: ['fires', 'at a time', 'for a window of time'] },
        { id: 'v-miss', cells: ['a missed night', 'skipped', 'run later, in order'] },
        { id: 'v-pass', cells: ['knows its window', 'no', 'start and end'] },
        { id: 'v-rerun', cells: ['rerun one night', 'by hand', 'that window alone'] },
        { id: 'v-batch', cells: ['its batch number', 'typed by someone', 'from its window’s end'] },
      ],
    },
  ],
  edges: [
    { from: 'w-42', to: 'w-43' },
    { from: 'w-43', to: 'w-44' },
  ],
})

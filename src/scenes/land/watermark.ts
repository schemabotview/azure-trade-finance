import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom, lineOf } from '../ide'
import { outputOf } from '../lab'
import { AZURITE } from '../level'
import { landTree } from './tree'
import code from '../../../spine/land/04-watermark/project/extract/extract.py?raw'
import session from '../../../spine/land/04-watermark/session.txt?raw'
import before from '../../../spine/land/03-batch-folders/session.txt?raw'

// §5.4 — incremental by watermark. Between §5.3 and here the desk worked through 31 October (the
// step's setup applies tradebook_gen's desk day: off screen, as it is in the bank). The watermark
// starts at batch 41's window end; lookup counts what changed after it, up to tonight's window end.
const full = /batch 41: (\d+) rows/.exec(before)![1]
const look = outputOf(session, 'python extract/extract.py lookup --batch 42 --window-end 2026-11-01T02:00:00Z')
const [, changed, total] = /(\d+) of (\d+) LCs changed/.exec(look)!

export const landWatermark: SceneModel = ideFrame({
  tree: landTree('extract/extract.py'),
  editor: { file: 'extract/extract.py', code, show: [[lineOf(code, 'WATERMARK ='), lineOf(code, 'WATERMARK =')], [lineOf(code, 'def lookup'), lineOf(code, 'print(f"{changed}')]], highlight: [lineOf(code, 'WATERMARK ='), ...linesFrom(code, 'changed, total = db.execute(', '[start, window_end]')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        AZURITE,
        {
          type: 'group', id: 'line', title: 'updated_at, on one line', icon: 'clock', tone: 'ingest', children: [
            { type: 'item', id: 't-41', title: 'batch 41: up to 31 Oct 02:00', sub: `the full load · ${full} LCs`, icon: 'folder' },
            { type: 'item', id: 't-old', title: 'the watermark', sub: '2026-10-31T02:00:00Z · where the last good window ended', icon: 'key', tone: 'infra' },
            { type: 'item', id: 't-42', title: 'batch 42’s window', sub: `(31 Oct 02:00, 1 Nov 02:00] · ${changed} of ${total} LCs changed`, icon: 'filter', tone: 'store' },
            { type: 'item', id: 't-new', title: 'the next watermark', sub: '2026-11-01T02:00:00Z · once batch 42 is good', icon: 'key', tone: 'infra', muted: true },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'copies', title: 'What each batch copies', tone: 'ingest', columns: ['batch', 'updated_at', 'LCs'], rows: [
        { id: 'c-41', cells: [41, '≤ 31 Oct 02:00', full] },
        { id: 'c-42', cells: [42, '> watermark, ≤ window end', changed], tone: 'store' },
        { id: 'c-43', cells: [43, '> 1 Nov 02:00', 'tomorrow'] },
      ],
    },
  ],
  edges: [
    { from: 't-41', to: 't-old' },
    { from: 't-old', to: 't-42' },
    { from: 't-42', to: 't-new' },
  ],
})

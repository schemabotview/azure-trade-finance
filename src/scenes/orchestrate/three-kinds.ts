import type { SceneModel } from '@graphlearning/graphl-flow'
import { AZURITE } from '../level'
import session from '../../../spine/orchestrate/08-three-kinds/session.txt?raw'
import { SPARK_NOTICE } from '../spark'

// §11.8 — ◆ three kinds of progress (runs locally; the lake is Azurite). A rerun after any failure is safe
// because each stage remembers its progress differently: the extract a WATERMARK, Bronze which batches it
// took (a checkpoint), Silver the business state itself (MERGE: even a full replay changes nothing).
const blocks = session.trim().split(/^(?=\$ )/m).map((b) => b.split('\n').filter((l) => l && l !== SPARK_NOTICE).join('\n'))
const pane = (id: string, title: string, parts: string[]) => ({ type: 'code' as const, id, terminal: true, filename: title, code: parts.join('\n') })

const column = (id: string, title: string, tone: 'ingest' | 'infra' | 'store', icon: string, items: [string, string][], term: ReturnType<typeof pane>) => ({
  type: 'group' as const, id, title, icon, tone, children: [
    ...items.map(([t, s], i) => ({ type: 'item' as const, id: `${id}-${i}`, title: t, sub: s, icon: i === items.length - 1 ? 'check' : 'file' })),
    term,
  ],
})

export const orchestrateThreeKinds: SceneModel = {
  dir: 'col',
  nodes: [
    AZURITE,
    {
      type: 'group', id: 'cols', bare: true, dir: 'row', children: [
        column('wm', 'extraction: a watermark', 'ingest', 'clock', [
          ['the end of the last good window', 'moves only after G1 seals a batch'],
          ['a rerun asks for rows after it', 'a failed night is simply asked again'],
        ], pane('t-wm', 'extract', [blocks[0]])),
        column('ck', 'files: a checkpoint', 'infra', 'archive', [
          ['which batches Bronze has taken', 'a sealed batch is read once'],
          ['a rerun skips them', 'nothing is appended twice'],
        ], pane('t-ck', 'Bronze', [blocks[1]])),
        column('mg', 'business state: MERGE', 'store', 'layers', [
          ['Silver’s rows are the progress', 'newer source_version wins, or nothing'],
          ['even a full replay changes nothing', 'every row: equal or older, ignored'],
        ], pane('t-mg', 'Silver', [blocks[2], blocks[3], blocks[4]])),
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'Three different memories, one property: after a failure at any point, the same rerun is safe. That is what lets a night be retried without a person deciding what to undo.' },
  ],
  edges: [
    { from: 'wm-0', to: 'wm-1' },
    { from: 'ck-0', to: 'ck-1' },
    { from: 'mg-0', to: 'mg-1' },
  ],
}

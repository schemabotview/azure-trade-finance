import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { AZURITE } from '../level'
import { landTree } from './tree'
import code from '../../../spine/land/05-manifest/project/extract/extract.py?raw'
import session from '../../../spine/land/05-manifest/session.txt?raw'
import manifest from '../../../spine/land/05-manifest/captured/landing/lc_deals/batch_id=42/_manifest.json?raw'

// §5.5 — the manifest. lookup now writes batch 42's _manifest.json BEFORE anything is copied: the
// window, the row count, the files and the columns with their PostgreSQL types — what the copy must
// deliver. The JSON in the side pane is the blob itself, read back from the lake by the replay.
const m = manifest.trimEnd()
// the columns fold whole (the narration: "ten typed columns, folded in the middle"); their closing braces end it
const fold = [[1, lineOf(m, '"columns"')], [lineOf(m, '"updated_at"') + 1, lineOf(m, '"updated_at"') + 2]] as [number, number][]

export const landManifest: SceneModel = ideFrame({
  tree: landTree('extract/extract.py'),
  editor: { file: 'extract/extract.py', code, show: [[lineOf(code, 'def lookup'), lineOf(code, 'print(f"manifest')]], highlight: linesFrom(code, 'manifest = {', 'container("landing").upload_blob(path') },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        AZURITE,
        {
          type: 'group', id: 'order', title: 'Batch 42, in order', icon: 'workflow', tone: 'ingest', dir: 'grid', cols: 2, children: [
            { type: 'item', id: 'o-lookup', title: 'lookup', sub: 'counts the window', icon: 'search' },
            { type: 'item', id: 'o-manifest', title: '_manifest.json', sub: 'the promise, written first', icon: 'file', tone: 'store' },
            { type: 'item', id: 'o-copy', title: 'copy', sub: 'writes part-00000.csv', icon: 'database', muted: true },
            { type: 'item', id: 'o-g1', title: 'G1', sub: 'holds the folder to the promise', icon: 'shield', muted: true },
          ],
        },
        { type: 'code', id: 'manifest', filename: 'landing/lc_deals/batch_id=42/_manifest.json', lang: 'js', code: m, show: fold, tone: 'store', fill: true, wrap: true },
      ],
    },
  ],
  edges: [
    { from: 'o-lookup', to: 'o-manifest' },
    { from: 'o-manifest', to: 'o-g1', dashed: true },
    { from: 'o-copy', to: 'o-g1', dashed: true },
  ],
})

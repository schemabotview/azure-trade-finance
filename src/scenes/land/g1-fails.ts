import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { AZURITE } from '../level'
import { landTree } from './tree'
import code from '../../../spine/land/06-g1-fails/project/extract/g1.py?raw'
import session from '../../../spine/land/06-g1-fails/session.txt?raw'

// §5.6 — ⑂ G1 fails (a branch: run, then discarded; §5.7 starts from §5.5's state). Between lookup
// (§5.5) and the copy, at 02:00:07, the desk amends three LCs — the step's setup applies
// tradebook_gen's desk-late.sql, off screen, as the desk's application would. Their updated_at moves
// past the window's end, so the copy reads 117 rows where the manifest promised 120.
const g1 = outputOf(session, 'python extract/g1.py --batch 42').split('\n').filter((l) => /^ {2}\w/.test(l))
  .map((l) => l.trim().split(/\s+/)) // [check, got, 'of', want, verdict]
const late = outputOf(session, 'psql -Atc "SELECT lc_id, updated_at FROM lc_deals ORDER BY 2 DESC LIMIT 3"').split('\n').map((l) => l.split('|')[0])
const copied = /: (\d+) rows/.exec(session)![1]

export const landG1Fails: SceneModel = ideFrame({
  tree: landTree('extract/g1.py', { extra: ['extract/g1.py'], fresh: ['extract/g1.py'] }),
  editor: { file: 'extract/g1.py', code, show: [[lineOf(code, 'def check'), lineOf(code, 'return all(')]], highlight: [...linesFrom(code, 'results = [', '("rows", rows'), lineOf(code, 'return all(')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        AZURITE,
        {
          type: 'group', id: 'night', title: '⑂ The night batch 42 came up short', icon: 'clock', tone: 'consume', children: [
            { type: 'item', id: 'n-lookup', title: '02:00:00 lookup', sub: '120 LCs in the window: the manifest says 120', icon: 'search' },
            { type: 'item', id: 'n-desk', title: '02:00:07 the desk amends three LCs', sub: `${late.join(', ')}: now past the window’s end`, icon: 'users', tone: 'infra' },
            { type: 'item', id: 'n-copy', title: 'copy reads the window', sub: `${copied} rows land in part-00000.csv`, icon: 'database' },
            { type: 'item', id: 'n-g1', title: 'G1 FAIL', sub: 'not published · the watermark stays', icon: 'shield', tone: 'consume' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'checks', title: 'G1: the folder against its manifest', tone: 'consume', columns: ['check', 'found', 'promised', ''], rows:
        g1.map(([check, got, , want, verdict]) => ({ id: `g-${check}`, cells: [check, got, want, verdict], tone: verdict === 'FAIL' ? 'consume' as const : undefined })),
    },
  ],
  edges: [
    { from: 'n-lookup', to: 'n-desk' },
    { from: 'n-desk', to: 'n-copy' },
    { from: 'n-copy', to: 'n-g1' },
  ],
})

import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { printed, shown } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/silver/02-dedupe/project/pipeline/silver.py?raw'
import session from '../../../spine/silver/02-dedupe/session.txt?raw'

// §9.2 — deduplicate (runs locally). ROW_NUMBER over each lc_id, newest source_version first (a later batch
// wins a tie): row 1 is kept. Typed on the way: Bronze's strings become Silver's types, money decimal(18,2).
const [, before, after] = /Bronze (\d+) rows -> Silver (\d+) rows/.exec(printed(session, 'python pipeline/silver.py').join('\n'))!
const lc = shown(session, 'python pipeline/lc.py LC-2041').rows[0]

export const silverDedupe: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/silver.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py'], { fresh: ['pipeline/silver.py', 'pipeline/lc.py'] }),
  editor: { file: 'pipeline/silver.py', code, show: [[lineOf(code, 'def typed'), lineOf(code, 'rn = 1')]],
    highlight: [...linesFrom(code, 'newest = Window', 'F.col("batch_id").desc())'), lineOf(code, '.where("rn = 1")')] },
  session,
  side: [
    {
      type: 'group', id: 'flow', title: `${before} rows → ${after}`, icon: 'filter', tone: 'store', children: [
        { type: 'item', id: 'f-part', title: 'partition by lc_id', sub: 'one window per LC', icon: 'boxes' },
        { type: 'item', id: 'f-order', title: 'order by source_version desc', sub: 'then batch_id desc: a later delivery wins a tie', icon: 'filter' },
        { type: 'item', id: 'f-keep', title: `keep row 1: v${lc[1]}, ${lc[2]}`, sub: `LC-2041, ${lc[3]}`, icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'window', title: 'LC-2041 in Bronze, numbered', tone: 'ingest', columns: ['source_version', 'batch_id', 'row_number', 'kept'], rows: [
        { id: 'w-1', cells: ['2', '42', '1', 'yes'], tone: 'store' },
        { id: 'w-2', cells: ['1', '44', '2', 'no'] },
        { id: 'w-3', cells: ['1', '41', '3', 'no'] },
      ],
    },
  ],
  edges: [
    { from: 'f-part', to: 'f-order' },
    { from: 'f-order', to: 'f-keep' },
  ],
})

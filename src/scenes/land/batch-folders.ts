import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { AZURITE } from '../level'
import { millions, rowOf, rowsOf } from '../csv'
import { landTree } from './tree'
import code from '../../../spine/land/03-batch-folders/project/extract/extract.py?raw'
import session from '../../../spine/land/03-batch-folders/session.txt?raw'
import batch41 from '../../../spine/land/03-batch-folders/captured/landing/lc_deals/batch_id=41/part-00000.csv?raw'
import batch42 from '../../../spine/land/07-retry-safe/captured/landing/lc_deals/batch_id=42/part-00000.csv?raw'

// §5.3 — immutable batch folders (emulated). Batch 41 is the first delivery: every LC TradeBook
// held at its window end, written ONCE under batch_id=41/ (overwrite=False); the same run again is
// refused. The table is the lesson: a batch_id names a DELIVERY, source_version a REVISION of one
// LC — LC-2041's two versions arrive in two batches (v2's row is read from §5.7's batch 42).
const v1 = rowOf(batch41, 'LC-2041')
const v2 = rowOf(batch42, 'LC-2041')

export const landBatchFolders: SceneModel = ideFrame({
  tree: landTree('extract/extract.py', { fresh: ['extract/extract.py', 'extract/lake.py', 'requirements.txt'] }),
  editor: { file: 'extract/extract.py', code, show: [[lineOf(code, 'def main'), lineOf(code, 'print(f"batch')]], highlight: [lineOf(code, 'path = f"lc_deals'), lineOf(code, 'try:'), lineOf(code, 'overwrite=False'), lineOf(code, 'except ResourceExistsError')] },
  session,
  side: [
    AZURITE,
    {
      type: 'group', id: 'runs', title: 'Two runs of batch 41', icon: 'workflow', tone: 'ingest', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'run1', title: 'first run', sub: 'night of 31 October', icon: 'terminal' },
        { type: 'item', id: 'b41', title: 'batch_id=41/', sub: `part-00000.csv · ${rowsOf(batch41)} rows`, icon: 'folder', tone: 'store' },
        { type: 'item', id: 'run2', title: 'the same run again', sub: 'a retry, a double click', icon: 'terminal' },
        { type: 'item', id: 'refused', title: 'refused', sub: 'the blob already exists', icon: 'lock', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'path', title: 'landing/lc_deals/batch_id=41/part-00000.csv', tone: 'ingest', columns: ['part', 'names'], rows: [
        { id: 'p-zone', cells: ['landing', 'the zone: a container'] },
        { id: 'p-table', cells: ['lc_deals/', 'the source table'] },
        { id: 'p-batch', cells: ['batch_id=41/', 'the delivery'], tone: 'store' },
        { id: 'p-file', cells: ['part-00000.csv', 'the rows, as CSV'] },
      ],
    },
    {
      type: 'table', id: 'numbers', title: 'One LC, two numbers', tone: 'store', columns: ['lc_id', 'source_version', 'amount', 'batch_id'], rows: [
        { id: 'n-v1', cells: [v1.lc_id, v1.source_version, millions(v1.amount), 41] },
        { id: 'n-v2', cells: [v2.lc_id, v2.source_version, millions(v2.amount), '42, tomorrow'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'A batch_id names a delivery: one night’s copy, written once. source_version is TradeBook’s number for one LC’s revision. Bronze will keep both.' },
  ],
  edges: [
    { from: 'run1', to: 'b41', label: 'write' },
    { from: 'run2', to: 'refused', label: 'write', dashed: true },
  ],
})

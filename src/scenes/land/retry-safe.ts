import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { AZURITE } from '../level'
import { rowsOf } from '../csv'
import { landTree } from './tree'
import code from '../../../spine/land/07-retry-safe/project/extract/extract.py?raw'
import session from '../../../spine/land/07-retry-safe/session.txt?raw'
import batch42 from '../../../spine/land/07-retry-safe/captured/landing/lc_deals/batch_id=42/part-00000.csv?raw'

// §5.7 — retry-safe landing (emulated). The branch is gone: this night starts from §5.5's state
// (manifest written, nothing copied). Write-once is replaced by SEALING: until _SUCCESS exists a
// retry overwrites the same path; commit runs G1, writes _SUCCESS, THEN moves the watermark.
export const landRetrySafe: SceneModel = ideFrame({
  tree: landTree('extract/extract.py', { extra: ['extract/g1.py'] }),
  editor: {
    file: 'extract/extract.py', code,
    show: [[lineOf(code, 'def copy'), lineOf(code, 'def copy') + 3], [lineOf(code, '# Until the batch'), lineOf(code, 'overwrite=True)')], [lineOf(code, 'def commit'), lineOf(code, 'print(f"G1 PASS')]],
    highlight: [lineOf(code, '_SUCCESS").exists()'), lineOf(code, 'overwrite=True)'), ...linesFrom(code, 'if not g1.check(batch)', 'sys.exit(f"G1 FAIL'), ...linesFrom(code, 'landing.upload_blob(folder + "_SUCCESS"', 'moved = watermark')],
  },
  session,
  side: [
    AZURITE,
    {
      type: 'group', id: 'life', title: 'A batch folder’s life', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'l-open', title: 'open: manifest, no _SUCCESS', sub: 'copy may run again: same path, overwritten', icon: 'folder' },
        { type: 'item', id: 'l-commit', title: 'commit: G1 PASS', sub: 'seal first, then move the watermark', icon: 'shield', tone: 'store' },
        { type: 'item', id: 'l-sealed', title: 'sealed: _SUCCESS', sub: 'every later write is refused', icon: 'lock', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'folder', title: 'landing/lc_deals/batch_id=42/', tone: 'store', columns: ['blob', 'written by'], rows: [
        { id: 'f-manifest', cells: ['_manifest.json', 'lookup'] },
        { id: 'f-part', cells: ['part-00000.csv', `copy, twice · ${rowsOf(batch42)} rows`] },
        { id: 'f-success', cells: ['_SUCCESS', 'commit: sealed'], tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'steps', title: 'Each step, against each state', tone: 'ingest', columns: ['step', 'open batch', 'sealed batch'], rows: [
        { id: 's-copy', cells: ['copy', 'overwrites the part', 'refused'] },
        { id: 's-commit', cells: ['commit', 'G1, seal, watermark', 'G1, seal again: same result'] },
      ],
    },
  ],
  edges: [
    { from: 'l-open', to: 'l-commit' },
    { from: 'l-commit', to: 'l-sealed' },
  ],
})

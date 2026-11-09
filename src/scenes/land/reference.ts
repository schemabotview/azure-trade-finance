import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { AZURITE } from '../level'
import { landTree } from './tree'
import code from '../../../spine/land/08-reference/project/extract/reference.py?raw'
import session from '../../../spine/land/08-reference/session.txt?raw'
import limits from '../../../spine/land/08-reference/captured/reference/group_limits.csv?raw'

// §5.8 — reference files (emulated). The risk team's mapping and limits are not TradeBook deliveries:
// they go to their own zone, `reference`, by the date they hold for, and Silver reads them directly
// (Course 9 validates them). The limits table is the file itself, captured by the replay.
const rows = limits.trim().split('\n').slice(1).map((l) => l.split(','))

export const landReference: SceneModel = ideFrame({
  tree: landTree('extract/reference.py', {
    extra: ['extract/g1.py', 'extract/reference.py'], fresh: ['extract/reference.py'],
    made: { 'reference/counterparty_group.csv': '', 'reference/group_limits.csv': '' },
  }),
  editor: { file: 'extract/reference.py', code, show: [[lineOf(code, 'FILES ='), lineOf(code, 'print(f"')]], highlight: [lineOf(code, 'path = f"'), lineOf(code, 'zone.upload_blob')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        AZURITE,
        {
          type: 'group', id: 'paths', title: 'Two ways into Silver', icon: 'workflow', tone: 'ingest', dir: 'grid', cols: 2, children: [
            { type: 'item', id: 'p-tradebook', title: 'TradeBook', sub: 'the desk’s LCs', icon: 'postgresql' },
            { type: 'item', id: 'p-risk', title: 'the risk team', sub: 'mapping, limits', icon: 'users' },
            { type: 'item', id: 'p-landing', title: 'landing', sub: 'batch_id=42/', icon: 'adls' },
            { type: 'item', id: 'p-reference', title: 'reference', sub: 'as_of=2026-10-31/', icon: 'adls', tone: 'store' },
            { type: 'item', id: 'p-bronze', title: 'Bronze', sub: 'every version, raw', icon: 'layers', muted: true },
            { type: 'item', id: 'p-silver', title: 'Silver', sub: 'checked, then joined', icon: 'layers', muted: true },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'limits', title: 'reference/group_limits.csv', tone: 'store', columns: ['group', 'currency', 'limit'],
      rows: rows.map(([g, c, a]) => ({ id: `lim-${g}-${c}`, cells: [g, c, Number(a).toLocaleString('en-GB', { minimumFractionDigits: 2 })] })),
    },
  ],
  edges: [
    { from: 'p-tradebook', to: 'p-landing' },
    { from: 'p-landing', to: 'p-bronze' },
    { from: 'p-bronze', to: 'p-silver' },
    { from: 'p-risk', to: 'p-reference' },
    { from: 'p-reference', to: 'p-silver' },
  ],
})

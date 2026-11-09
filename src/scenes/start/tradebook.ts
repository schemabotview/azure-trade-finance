import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { TRADEBOOK, startTree } from './tree'
import code from '../../../spine/start/01-tradebook/project/tradebook/schema.sql?raw'
import session from '../../../spine/start/01-tradebook/session.txt?raw'

// §3.1 — TradeBook (runs locally). The desk's system of record, as a local PostgreSQL 18.6 copy seeded
// by tradebook_gen: counterparty → lc_deals (one CURRENT row per LC) → lc_amendments (every version).
// The status counts are the session's.

export const startTradebook: SceneModel = ideFrame({
  tree: startTree(TRADEBOOK, 'tradebook/schema.sql', { fresh: [...TRADEBOOK, 'env.sh'] }),
  editor: { file: 'tradebook/schema.sql', code, show: [[lineOf(code, '-- One row per'), lineOf(code, 'CREATE INDEX')]],
    highlight: [lineOf(code, 'source_version integer NOT NULL'), lineOf(code, 'updated_at     timestamptz')] },
  session,
  side: [
    {
      type: 'group', id: 'er', title: 'TradeBook, three tables', icon: 'postgresql', tone: 'source', children: [
        { type: 'item', id: 't-cpty', title: 'counterparty', sub: 'the desk’s clients: legal entities, no groups', icon: 'users' },
        { type: 'item', id: 't-deals', title: 'lc_deals', sub: 'one row per LC: its CURRENT version', icon: 'table', tone: 'ingest' },
        { type: 'item', id: 't-amend', title: 'lc_amendments', sub: 'every version an LC has had', icon: 'layers' },
      ],
    },
    {
      type: 'table', id: 'keys', title: 'The two columns the pipeline lives on', tone: 'ingest', columns: ['column', 'means'], rows: [
        { id: 'k-version', cells: ['source_version', 'which revision of this LC'] },
        { id: 'k-updated', cells: ['updated_at', 'when this row last changed'], tone: 'ingest' },
      ],
    },
  ],
  edges: [
    { from: 't-cpty', to: 't-deals', label: 'applies for' },
    { from: 't-deals', to: 't-amend', label: 'has versions' },
  ],
})

import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { QUERIES, TRADEBOOK, startTree } from './tree'
import code from '../../../spine/start/02-lc-life/project/tradebook/open.sql?raw'
import session from '../../../spine/start/02-lc-life/session.txt?raw'

// §3.2 — an LC's life (runs locally). LC-2052's four versions from lc_amendments, and the rule the whole
// pipeline answers to: ISSUED, ACTIVE and AMENDED are open (exposure = amount); the rest carry none.
// The open exposure per currency is the session's — two currencies, never one total.
const history = outputOf(session, 'psql -P footer=off -v lc=LC-2052 -f tradebook/history.sql').split('\n').slice(2).map((l) => l.split('|').map((c) => c.trim()))
const step = (v: string) => history.find((h) => h[0] === v)!

export const startLcLife: SceneModel = ideFrame({
  tree: startTree([...TRADEBOOK, ...QUERIES], 'tradebook/open.sql', { fresh: QUERIES }),
  editor: { file: 'tradebook/open.sql', code, highlight: [lineOf(code, "WHERE status IN"), lineOf(code, 'GROUP BY currency')] },
  session,
  side: [
    {
      type: 'group', id: 'life', title: 'LC-2052, version by version', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'v1', title: `v1 ${step('1')[1]}`, sub: `${step('1')[3]} · ${step('1')[2]}`, icon: 'file' },
        { type: 'item', id: 'v2', title: `v2 ${step('2')[1]}`, sub: `${step('2')[3]} · advised to the exporter`, icon: 'check' },
        { type: 'item', id: 'v3', title: `v3 ${step('3')[1]}`, sub: `${step('3')[3]} · ${step('3')[2]}`, icon: 'settings', tone: 'infra' },
        { type: 'item', id: 'v4', title: `v4 ${step('4')[1]}`, sub: `${step('4')[3]} · exposure 0`, icon: 'lock', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'rule', title: 'The exposure rule', tone: 'ingest', columns: ['status', 'open?', 'exposure'], rows: [
        { id: 'r-issued', cells: ['ISSUED', 'yes', 'amount'], tone: 'store' },
        { id: 'r-active', cells: ['ACTIVE', 'yes', 'amount'], tone: 'store' },
        { id: 'r-amended', cells: ['AMENDED', 'yes', 'amount'], tone: 'store' },
        { id: 'r-done', cells: ['EXPIRED, CLOSED, CANCELLED', 'no', '0'] },
      ],
    },
  ],
  edges: [
    { from: 'v1', to: 'v2' },
    { from: 'v2', to: 'v3' },
    { from: 'v3', to: 'v4' },
  ],
})

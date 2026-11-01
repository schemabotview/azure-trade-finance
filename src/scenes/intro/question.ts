import type { SceneModel } from '@graphlearning/graphl-flow'
import { money, shown } from '../spark'
import { millions } from '../csv'
import fact from '../../../spine/gold/02-fact/session.txt?raw'
import gold from '../../../spine/gold/07-answer/session.txt?raw'

// §1.2 — the question (runs locally: the finished Gold, from the spine's last Gold step). Exposure is summed
// per counterparty GROUP and currency, and compared with the group's limit. Every value is Spark's own.
const woodgrove = shown(fact, 'python pipeline/fact.py Woodgrove').rows
const agg = shown(gold, 'python pipeline/gold.py').rows
const w = agg.find((r) => r[0] === 'Woodgrove')!

export const introQuestion: SceneModel = {
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'how', title: 'From LCs to the question', icon: 'workflow', tone: 'ingest', children: [
        {
          type: 'group', id: 'lcs', title: 'Woodgrove’s open LCs', icon: 'file', children:
            woodgrove.map(([lc, cp, ccy, , , x]) => ({ type: 'item' as const, id: `w-${lc}`, title: `${lc}: ${ccy} ${millions(x)}`, sub: `applicant ${cp}`, icon: 'file' })),
        },
        { type: 'item', id: 'group', title: 'group: Woodgrove', sub: 'three companies, one risk', icon: 'building', tone: 'consume' },
        { type: 'item', id: 'limit', title: 'its limit, per currency', sub: 'set by the risk team', icon: 'shield' },
      ],
    },
    {
      type: 'group', id: 'right', bare: true, children: [
        {
          type: 'table', id: 'answer', title: 'The answer the desk reads every morning', tone: 'store',
          columns: ['group', 'currency', 'exposure', 'limit', 'used', 'breach'],
          rows: agg.map(([g, c, x, l, u, b]) => ({ id: `a-${g}-${c}`, cells: [g, c, money(x), money(l), `${u}%`, b], tone: b === 'Yes' ? 'consume' as const : g === 'Woodgrove' ? 'infra' as const : undefined })),
        },
        {
          type: 'group', id: 'read', title: 'Reading Woodgrove’s row', icon: 'search', tone: 'infra', dir: 'row', children: [
            { type: 'item', id: 'r-x', title: `${millions(w[2])} exposure`, sub: 'its open LCs, summed', icon: 'chart' },
            { type: 'item', id: 'r-l', title: `of ${millions(w[3])}`, sub: 'its USD limit', icon: 'shield' },
            { type: 'item', id: 'r-u', title: `${w[4]}% used`, sub: `breach: ${w[5]}`, icon: 'gauge', tone: 'infra' },
          ],
        },
        { type: 'note', id: 'note', tone: 'consume', text: 'Contoso has two rows: euros and dollars are never added together.' },
      ],
    },
  ],
  edges: [
    { from: 'lcs', to: 'group' },
    { from: 'group', to: 'limit' },
    { from: 'how', to: 'answer' },
    { from: 'r-x', to: 'r-l' },
    { from: 'r-l', to: 'r-u' },
  ],
}

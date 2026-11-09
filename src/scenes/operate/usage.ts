import type { SceneModel } from '@graphlearning/graphl-flow'
import { outputOf } from '../lab'
import { level } from '../level'
import { BUILT, mapFrame, mapTerminal } from '../map'
import session from '../../../spine/operate/04-usage/session.txt?raw'

// §12.4 — where the money goes (recorded on Azure: the Consumption API, read-only). What the course's
// resources used, by product; this offer reports no cost through the API, and the frame says so.
const products = outputOf(session, '$U --query "$Q.product" -o tsv | sort | uniq -c | sort -rn').trim().split('\n')
  .map((l) => /^\s*(\d+) (.+)$/.exec(l)!.slice(1))
const first = JSON.parse(outputOf(session, '$U --query "$Q | [0].$P"'))

export const operateUsage: SceneModel = mapFrame({
  built: BUILT.operate,
  side: [
    level('recorded on Azure', 'the Consumption API, read-only; its ids are normalised'),
    // the products, counted (the minor ones folded); the one record's JSON is the table's
    mapTerminal(session, ['$ $U --query "$Q.product"', ['Azure DNS - Private', 'NAT Gateway'], 'IP Addresses', 'Key Vault']),
    {
      type: 'group', id: 'record', bare: true, children: [
        {
          type: 'table', id: 'cost', title: 'One usage record, as this subscription gets it', tone: 'consume', columns: ['field', 'value'], rows: [
            { id: 'c-p', cells: ['product', first.product] },
            { id: 'c-q', cells: ['quantity', first.quantity] },
            { id: 'c-c', cells: ['cost', first.cost] },
          ],
        },
        { type: 'note', id: 'note', tone: 'consume', text: `${products.length} products, no cost: a free trial reports use, not price.` },
      ],
    },
  ],
})

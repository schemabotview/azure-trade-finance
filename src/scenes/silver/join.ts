import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { money, shown } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/silver/08-join/project/pipeline/joins.py?raw'
import session from '../../../spine/silver/08-join/session.txt?raw'
import g3 from '../../../spine/silver/07-g3/session.txt?raw'
import { millions } from '../csv'

// §9.8 — the join that loses money (runs locally). The same open LCs summed through a left join and an inner
// join: the inner join drops the unmapped LC without a word. Spark's own table.
const t = shown(session, 'python pipeline/joins.py')
// the LC G3 named, from G3's own output
const [cp, lc, ccy, amount] = /FAIL\s+(CP-\d+) (LC-\d+) ([A-Z]{3}) ([\d.]+)/.exec(g3)!.slice(1)

export const silverJoin: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/joins.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py'], { fresh: ['pipeline/joins.py'] }),
  editor: { file: 'pipeline/joins.py', code, show: [[lineOf(code, 'spark = spark_session()'), lineOf(code, '.orderBy("currency").show())')]],
    highlight: [lineOf(code, 'inner = open_lcs.join'), lineOf(code, 'left = open_lcs.join')] },
  session,
  side: [
    {
      type: 'group', id: 'two', bare: true, dir: 'grid', cols: 2, children: [
        {
          type: 'group', id: 'left', title: 'left join', icon: 'check', tone: 'store', children: [
            { type: 'item', id: 'l-in', title: 'open LCs', sub: 'ISSUED, ACTIVE, AMENDED', icon: 'layers' },
            { type: 'item', id: 'l-join', title: 'join counterparty_group', sub: 'no match: the row stays', icon: 'workflow' },
            { type: 'item', id: 'l-lc', title: `${lc}: kept`, sub: 'group_name NULL', icon: 'file' },
            { type: 'item', id: 'l-sum', title: `${ccy} ${money(t.rows.find((r) => r[0] === ccy)![1])}`, sub: 'every open LC counted', icon: 'chart', tone: 'store' },
            { type: 'item', id: 'l-gold', title: 'Gold: a NULL group', sub: 'visible, someone asks why', icon: 'search' },
          ],
        },
        {
          type: 'group', id: 'inner', title: 'inner join', icon: 'filter', tone: 'consume', children: [
            { type: 'item', id: 'i-in', title: 'open LCs', sub: 'ISSUED, ACTIVE, AMENDED', icon: 'layers' },
            { type: 'item', id: 'i-join', title: 'join counterparty_group', sub: 'no match: the row goes', icon: 'workflow' },
            { type: 'item', id: 'i-lc', title: `${lc}: dropped`, sub: 'no row, no message', icon: 'file', tone: 'consume' },
            { type: 'item', id: 'i-sum', title: `${ccy} ${money(t.rows.find((r) => r[0] === ccy)![2])}`, sub: `${ccy} ${millions(amount)} smaller`, icon: 'chart', tone: 'consume' },
            { type: 'item', id: 'i-gold', title: 'Gold: money missing', sub: 'nothing to see, nobody asks', icon: 'search', tone: 'consume' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'sums', title: 'Open amount per currency', tone: 'store', columns: t.head,
      rows: t.rows.map((r) => ({ id: `s-${r[0]}`, cells: [r[0], ...r.slice(1).map(money)] })),
    },
    { type: 'table', id: 'lost', title: 'the row the inner join dropped (G3 named it)', tone: 'consume', columns: ['lc_id', 'applicant_id', 'currency', 'amount'], rows: [{ id: 'x', cells: [lc, cp, ccy, money(amount)] }] },
    { type: 'note', id: 'note', tone: 'consume', text: 'No error, no warning: the total is just smaller. G3 is what catches it.' },
  ],
  edges: [
    { from: 'l-in', to: 'l-join' },
    { from: 'l-join', to: 'l-lc' },
    { from: 'l-sum', to: 'l-gold' },
    { from: 'l-lc', to: 'l-sum' },
    { from: 'i-in', to: 'i-join' },
    { from: 'i-join', to: 'i-lc' },
    { from: 'i-sum', to: 'i-gold' },
    { from: 'i-lc', to: 'i-sum' },
  ],
})

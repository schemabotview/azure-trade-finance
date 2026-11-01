import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { shown } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/gold/01-exposure-rule/project/pipeline/gold.py?raw'
import session from '../../../spine/gold/01-exposure-rule/session.txt?raw'

// §10.1 — the exposure rule (runs locally). An open LC (ISSUED, ACTIVE, AMENDED) is exposure at its amount;
// a closed one (CANCELLED, CLOSED, EXPIRED) is zero. The per-status counts are Spark's own.
const t = shown(session, 'python pipeline/gold.py').rows
const open = t.filter((r) => r[2] === 'true'), closed = t.filter((r) => r[2] === 'false')
const sum = (rows: string[][]) => rows.reduce((n, r) => n + Number(r[1]), 0)

export const goldRule: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/gold.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py', 'gold.py'], { fresh: ['pipeline/gold.py'] }),
  editor: { file: 'pipeline/gold.py', code, show: [[lineOf(code, 'FACT = '), lineOf(code, '.orderBy(F.col("counts_as_exposure")')]],
    highlight: [lineOf(code, 'F.col("status").isin(*OPEN)'), lineOf(code, '.otherwise(F.lit(0)')] },
  session,
  side: [
    {
      type: 'group', id: 'rule', bare: true, dir: 'grid', cols: 2, children: [
        {
          type: 'group', id: 'open', title: `open: ${sum(open)} LCs`, icon: 'check', tone: 'consume', children: [
            ...open.map(([s, n]) => ({ type: 'item' as const, id: `o-${s}`, title: s, sub: `${n} LCs`, icon: 'file' })),
            { type: 'item', id: 'o-x', title: 'exposure = amount', sub: 'the bank could still pay', icon: 'chart', tone: 'consume' },
          ],
        },
        {
          type: 'group', id: 'closed', title: `closed: ${sum(closed)} LCs`, icon: 'lock', tone: 'store', children: [
            ...closed.map(([s, n]) => ({ type: 'item' as const, id: `c-${s}`, title: s, sub: `${n} LCs`, icon: 'file' })),
            { type: 'item', id: 'c-x', title: 'exposure = 0', sub: 'nothing left to pay', icon: 'chart', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'counts', title: 'lc_current by status', tone: 'infra', columns: ['status', 'LCs', 'counts as exposure'],
      rows: [...t.map((r) => ({ id: `t-${r[0]}`, cells: r })), { id: 't-all', cells: ['all', String(sum(t)), `${sum(open)} open`] }],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'A closed LC keeps its amount in Silver; only its exposure is zero. Gold derives a new column, and never edits a fact it was given.' },
  ],
  edges: [
    { from: `o-${open.at(-1)![0]}`, to: 'o-x' },
    { from: `c-${closed.at(-1)![0]}`, to: 'c-x' },
  ],
})

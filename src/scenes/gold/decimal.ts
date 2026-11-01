import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame } from '../ide'
import { printed, shown } from '../spark'
import { pipelineTree } from '../bronze/tree'
import code from '../../../spine/gold/04-decimal/project/pipeline/money.py?raw'
import session from '../../../spine/gold/04-decimal/session.txt?raw'

// §10.4 — decimal money (runs locally). The same sum in Spark SQL as a double and as decimal(18,2); and the
// fact table's own column type, read from its schema.
const [asDouble, asDecimal] = shown(session, 'python pipeline/money.py').rows[0]
const dtype = printed(session, 'python pipeline/money.py').find((l) => l.startsWith('fact_lc_exposure.exposure is'))!.split(' is ')[1]

export const goldDecimal: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/money.py', ['session.py', 'bronze.py', 'versions.py', 'gates.py', 'quarantine.py', 'current.py', 'silver.py', 'lc.py', 'history.py', 'reference_tables.py', 'g3.py', 'joins.py', 'gold.py', 'fact.py', 'money.py'], { fresh: ['pipeline/money.py'] }),
  editor: { file: 'pipeline/money.py', code },
  session,
  side: [
    {
      type: 'group', id: 'two', bare: true, dir: 'grid', cols: 2, children: [
        {
          type: 'group', id: 'double', title: 'as a double', icon: 'zap', tone: 'consume', children: [
            { type: 'item', id: 'd-in', title: '0.10 + 0.20', sub: 'binary fractions', icon: 'code' },
            { type: 'item', id: 'd-out', title: asDouble, sub: 'neither number is exact in binary', icon: 'chart', tone: 'consume' },
            { type: 'item', id: 'd-sum', title: 'summed over many LCs', sub: 'drifts by cents: a breach can flip', icon: 'bell', tone: 'consume' },
          ],
        },
        {
          type: 'group', id: 'decimal', title: 'as decimal(18,2)', icon: 'check', tone: 'store', children: [
            { type: 'item', id: 'm-in', title: '0.10 + 0.20', sub: 'whole cents', icon: 'code' },
            { type: 'item', id: 'm-out', title: asDecimal, sub: 'exactly, every time', icon: 'chart', tone: 'store' },
            { type: 'item', id: 'm-sum', title: 'summed over many LCs', sub: 'still exact: two runs agree', icon: 'check', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'where', title: 'decimal(18,2) from end to end', icon: 'workflow', tone: 'store', children: [
        { type: 'item', id: 'w-tb', title: 'TradeBook lc_deals.amount', sub: 'numeric(18,2)', icon: 'postgresql' },
        { type: 'item', id: 'w-bronze', title: 'Bronze', sub: 'the string as received: nothing converted', icon: 'layers' },
        { type: 'item', id: 'w-silver', title: 'Silver lc_current.amount', sub: 'decimal(18,2)', icon: 'layers' },
        { type: 'item', id: 'w-gold', title: 'Gold fact_lc_exposure.exposure', sub: dtype, icon: 'layers', tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Money never touches a float.' },
  ],
  edges: [
    { from: 'd-in', to: 'd-out' },
    { from: 'm-in', to: 'm-out' },
    { from: 'd-out', to: 'd-sum' },
    { from: 'm-out', to: 'm-sum' },
    { from: 'w-tb', to: 'w-bronze' },
    { from: 'w-bronze', to: 'w-silver' },
    { from: 'w-silver', to: 'w-gold' },
  ],
})

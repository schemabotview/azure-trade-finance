import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { extractTree } from './tree'
import code from '../../../spine/extract/04-copy/project/infra/pipelines/pl_full_load.json?raw'
import session from '../../../spine/extract/04-copy/session.txt?raw'

// §7.4 — the Copy activity (recorded on Azure). pl_full_load copies lc_deals, whole, into
// landing/lc_deals/batch_id=41/ through the bank's runtime and the lake's private endpoint, then writes the
// watermark the nightly extract starts from. Rows copied are the activity's own output.
const acts = outputOf(session, 'bash adf/adf.sh activities $R').trim().split('\n').map((l) => l.split('\t'))
const copied = acts.find((a) => a[0] === 'copy_lc_deals')![2]

export const extractCopy: SceneModel = ideFrame({
  tree: extractTree('04', 'infra/pipelines/pl_full_load.json'),
  editor: { file: 'infra/pipelines/pl_full_load.json', lang: 'js', code, show: [[lineOf(code, '"name": "copy_lc_deals"'), lineOf(code, '"query": {') + 2], [lineOf(code, '"folder": {'), lineOf(code, '"file": "part-00000.csv"')]],
    highlight: [lineOf(code, '"value": "SELECT * FROM lc_deals ORDER BY lc_id"'), lineOf(code, '"value": "lc_deals/batch_id=@{pipeline().parameters.batch_id}"')] },
  session,
  keep: ['Apply complete!', ['$ W=', 'commit_watermark']],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    {
      type: 'group', id: 'flow', title: 'Source query → sink folder', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'f-src', title: 'TradeBook: SELECT * FROM lc_deals', sub: 'read by the bank’s runtime', icon: 'postgresql' },
        { type: 'item', id: 'f-shir', title: 'ir-tradebook-shir', sub: 'over the peering, to the private endpoint', icon: 'vm' },
        { type: 'item', id: 'f-sink', title: `landing/lc_deals/batch_id=41/: ${copied} rows`, sub: 'part-00000.csv, as the pipeline’s identity', icon: 'adls', tone: 'store' },
        { type: 'item', id: 'f-wm', title: '_control/lc_deals.watermark', sub: 'where tomorrow’s extract starts', icon: 'clock' },
      ],
    },
    {
      type: 'table', id: 'out', title: 'Each activity’s output', tone: 'store', columns: ['activity', 'status', 'rows'],
      rows: acts.map(([a, s, r]) => ({ id: `o-${a}`, cells: [a, s, r] })),
    },
    { type: 'note', id: 'note', tone: 'store', text: 'No key, no password, no public endpoint: the runtime wrote as the pipeline’s identity, over the private network.' },
  ],
  edges: [
    { from: 'f-src', to: 'f-shir' },
    { from: 'f-shir', to: 'f-sink' },
    { from: 'f-sink', to: 'f-wm' },
  ],
})

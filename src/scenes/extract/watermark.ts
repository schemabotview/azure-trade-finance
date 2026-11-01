import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { extractTree } from './tree'
import code from '../../../spine/extract/05-watermark/project/infra/pipelines/pl_extract.json?raw'
import session from '../../../spine/extract/05-watermark/session.txt?raw'

// §7.5 — the watermark pipeline (recorded on Azure). Off screen, the desk's business day reached TradeBook.
// pl_extract: read the watermark, count the window's rows, copy them, G1 compares the two, then seal and move
// the watermark. Every value is an activity's own output.
const acts = Object.fromEntries(outputOf(session, 'bash adf/adf.sh activities $R').trim().split('\n').map((l) => l.split('\t')).map((a) => [a[0], a]))
const wm = JSON.parse(acts.lookup_watermark[2]).Prop_0
const n = JSON.parse(acts.count_window[2]).n
const copied = acts.copy_window[2]
const item = (id: string, title: string, sub: string, icon: string, tone?: 'store' | 'infra') => ({ type: 'item' as const, id, title, sub, icon, tone })

export const extractWatermark: SceneModel = ideFrame({
  tree: extractTree('05', 'infra/pipelines/pl_extract.json'),
  editor: { file: 'infra/pipelines/pl_extract.json', lang: 'js', code, show: [[1, lineOf(code, '"name": "lookup_watermark"') + 1], [lineOf(code, '"dataset": {'), lineOf(code, '"file": "lc_deals.watermark"')]],
    highlight: [lineOf(code, '"name": "lookup_watermark"'), lineOf(code, '"file": "lc_deals.watermark"')] },
  session,
  keep: ['Apply complete!', ['$ R=', 'commit_watermark']],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    {
      type: 'group', id: 'chain', title: 'Batch 42, activity by activity', icon: 'workflow', tone: 'ingest', children: [
        item('a-wm', `lookup_watermark: ${wm}`, 'where the last good window ended', 'clock'),
        item('a-count', `count_window: ${n} rows`, 'TradeBook, after the watermark, up to window_end', 'postgresql'),
        item('a-copy', `copy_window: ${copied} rows`, 'into landing/lc_deals/batch_id=42/', 'adls'),
        item('a-g1', `G1: ${n} = ${copied}`, 'equal: seal the batch, move the watermark', 'check', 'store'),
        item('a-commit', 'seal + commit_watermark', '_SUCCESS, then the new window end', 'lock', 'store'),
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'If the two counts differ, a Fail activity stops the run with G1’s message, and the watermark stays: tomorrow asks again.' },
  ],
  edges: [
    { from: 'a-wm', to: 'a-count' },
    { from: 'a-count', to: 'a-copy' },
    { from: 'a-copy', to: 'a-g1' },
    { from: 'a-g1', to: 'a-commit' },
  ],
})

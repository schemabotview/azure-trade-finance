import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, trim } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { BUILT, mapFrame, mapTerminal } from '../map'
import code from '../../../spine/how-azure-runs/07-charges/project/model/charges.py?raw'
import session from '../../../spine/how-azure-runs/07-charges/session.txt?raw'

// §2.7 — how Azure charges (model: the usage is assumed; the prices are Azure's Retail Prices API, read once
// when the step was recorded). The meters and the month's total are the session's.
const out = outputOf(session, 'python model/charges.py').split('\n')
const rows = out.slice(1, -1).map((l) => [l.slice(0, 34).trim(), ...l.slice(34).trim().split(/\s+/)])
const total = out.at(-1)!.trim().split(/\s+/).at(-1)!

export const howCharges: SceneModel = mapFrame({
  built: BUILT['how-azure-runs'],
  side: [
    level('model', 'usage assumed; prices from prices.azure.com, as recorded'),
    { type: 'code', id: 'editor', filename: 'model/charges.py', lang: 'python', code: trim(code), tone: 'ingest', fill: true, wrap: true, show: [[lineOf(code, '("ADF activity runs, cloud'), lineOf(code, '2 * 0.75 * 0.5 * NIGHTS),')]] },
    mapTerminal(session),
    {
      type: 'table', id: 'month', title: `a month of lc-exposure: USD ${total}, before the VMs`, tone: 'store', columns: ['meter', 'units', 'a month'],
      // the terminal lists every meter; the table keeps the one that is most of the month
      rows: rows.filter((r) => Number(r[3]) > 1).map((r, i) => ({ id: `m${i}`, cells: [r[0], r[1], r[3]], tone: 'consume' as const })),
    },
  ],
})

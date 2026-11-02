import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, terminal, trim } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { BUILT, mapFrame } from '../map'
import code from '../../../spine/bronze/02-dbus/project/model/dbus.py?raw'
import session from '../../../spine/bronze/02-dbus/session.txt?raw'

// §8.2 — workspaces, compute, DBUs (model: the usage is assumed; the prices are Azure's Retail Prices API,
// read once when the step was recorded). A job cluster bills DBUs and VMs; serverless, DBUs only.
const out = outputOf(session, 'python model/dbus.py').split('\n').slice(1).map((l) => /^\s+(.+?)\s{2,}([\d.]+) a month$/.exec(l)!.slice(1))

export const bronzeDbus: SceneModel = mapFrame({
  built: BUILT.bronze,
  side: [
    level('model', 'usage assumed; unit prices from prices.azure.com, as it answered when recorded'),
    { type: 'code', id: 'editor', filename: 'model/dbus.py', lang: 'python', code: trim(code), tone: 'ingest', show: [[lineOf(code, 'NIGHTS = 30'), lineOf(code, 'SERVERLESS_DBUS')]] },
    { type: 'code', id: 'terminal', terminal: true, filename: 'terminal — lc-exposure', code: terminal(session) },
    {
      type: 'group', id: 'two', bare: true, dir: 'grid', cols: 2, children: [
        {
          type: 'group', id: 'job', title: 'job cluster', icon: 'vm', tone: 'infra', children: [
            { type: 'item', id: 'j-dbu', title: 'DBUs: Databricks’ meter', sub: 'per node-hour, by node type', icon: 'databricks' },
            { type: 'item', id: 'j-vm', title: 'VMs: Azure’s meter', sub: 'in our subscription, our quota', icon: 'vm' },
          ],
        },
        {
          type: 'group', id: 'srv', title: 'serverless', icon: 'cloud', tone: 'store', children: [
            { type: 'item', id: 's-dbu', title: 'DBUs only, at a higher rate', sub: 'the machines are Databricks’', icon: 'databricks' },
            { type: 'item', id: 's-start', title: 'no cluster to start', sub: 'seconds, not minutes', icon: 'zap' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'month', title: 'A month of nights, USD (retail)', tone: 'store', columns: ['plan', 'a month'],
      rows: out.map(([w, c], i) => ({ id: `m${i}`, cells: [w, c] })),
    },
  ],
  edges: [
    { from: 'j-dbu', to: 'j-vm' },
    { from: 's-dbu', to: 's-start' },
  ],
})

import type { SceneModel } from '@graphlearning/graphl-flow'
import { BUILT, mapFrame } from '../map'
import { printed } from '../spark'
import gold from '../../../spine/gold/07-answer/session.txt?raw'

// §1.3 — what we'll build: the map with every part lit, and the answer it ends in (runs locally: answer.py's
// output from the last Gold step).
const out = printed(gold, 'python pipeline/answer.py Woodgrove USD')
const v = (k: string) => out.find((l) => l.trim().startsWith(k))!.trim().slice(k.length).trim()

export const introBuild: SceneModel = mapFrame({
  built: BUILT.operate,
  side: [
    {
      type: 'group', id: 'card', title: 'Woodgrove · USD', icon: 'building', tone: 'store', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'a-x', title: v('gross exposure'), sub: 'gross exposure', icon: 'chart' },
        { type: 'item', id: 'a-l', title: v('limit'), sub: 'limit', icon: 'shield' },
        { type: 'item', id: 'a-u', title: v('utilisation'), sub: 'utilisation', icon: 'gauge' },
        { type: 'item', id: 'a-h', title: v('headroom'), sub: 'headroom', icon: 'chart' },
      ],
    },
    {
      type: 'table', id: 'courses', title: 'twelve courses, one pipeline', tone: 'ingest', columns: ['courses', 'build'], rows: [
        { id: 'c-1', cells: ['1–2', 'trade finance; how Azure is built'] },
        { id: 'c-2', cells: ['3–6', 'the source, identity, the lake, the network'] },
        { id: 'c-3', cells: ['7–10', 'extract, Bronze, Silver, Gold, gates G1–G4'] },
        { id: 'c-4', cells: ['11–12', 'every night; watch it, pay for it, ship it'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'Every resource is Terraform, every number is real output, and the subscription is empty again after each course.' },
  ],
})

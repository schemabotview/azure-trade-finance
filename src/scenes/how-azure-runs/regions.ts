import type { SceneModel } from '@graphlearning/graphl-flow'
import { terminal } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import session from '../../../spine/how-azure-runs/01-regions/session.txt?raw'

// §2.1 — ◆ regions, pairs and zones (recorded on Azure). The count of physical regions, the UK pair, and
// uksouth's three zones with the physical zones this subscription's logical numbers map to: the session's.
const count = outputOf(session, 'az account list-locations --query "length([?metadata.regionType==\'Physical\'])"').trim()
const zones = outputOf(session, 'az account list-locations --query "$Z.$F" -o table').split('\n').slice(2).map((l) => l.trim().split(/\s+/))
const pair = outputOf(session, 'az account list-locations --query "$Q.$F" -o table').split('\n').slice(2).map((l) => l.trim().split(/\s+/))

export const howRegions: SceneModel = {
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'left', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'geo', title: 'United Kingdom: a geography', sub: `one of the places Azure’s ${count} physical regions sit`, icon: 'globe', tone: 'ingest', dir: 'row', children: [
            {
              type: 'group', id: 'uksouth', title: 'uksouth', sub: 'London: our resources', icon: 'building', tone: 'store', children:
                zones.map(([logical, physical]) => ({ type: 'item' as const, id: `z-${logical}`, title: `zone ${logical}`, sub: `this subscription’s name for ${physical}`, icon: 'boxes' })),
            },
            {
              type: 'group', id: 'ukwest', title: 'ukwest', sub: 'Cardiff: the pair', icon: 'building', children: [
                { type: 'item', id: 'w-dc', title: 'datacenters', sub: 'its own, far from London', icon: 'boxes' },
                { type: 'item', id: 'w-use', title: 'our bank network', sub: 'Course 6: where VMs were allowed', icon: 'vm' },
              ],
            },
          ],
        },
        {
          type: 'table', id: 'terms', title: 'four words', tone: 'infra', columns: ['word', 'means'], rows: [
            { id: 't-geo', cells: ['geography', 'a country or area: where data may stay'] },
            { id: 't-region', cells: ['region', 'a set of datacenters, one name: uksouth'] },
            { id: 't-pair', cells: ['pair', `${pair[0][0]} ↔ ${pair[0][1]}: recovered together, updated apart`] },
            { id: 't-zone', cells: ['zone', 'datacenters with their own power and cooling'] },
          ],
        },
      ],
    },
    { type: 'code', id: 'terminal', terminal: true, filename: 'terminal — lc-exposure', code: terminal(session) },
  ],
  edges: [{ from: 'uksouth', to: 'ukwest', label: 'paired', bidirectional: true }],
}

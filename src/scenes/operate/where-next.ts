import type { SceneModel } from '@graphlearning/graphl-flow'
import { BUILT, mapFrame } from '../map'

// §12.7 — where next (a concept frame: nothing here was built or run). Each extension placed against the
// part of the map it changes.
export const operateWhereNext: SceneModel = mapFrame({
  built: BUILT.operate,
  side: [
    { type: 'note', id: 'concept', tone: 'infra', text: 'A concept frame: none of these extensions is built in this film.' },
    {
      type: 'table', id: 'next', title: 'Five extensions, and where each lands on the map', tone: 'infra', columns: ['extension', 'changes', 'why'], rows: [
        { id: 'n-cdc', cells: ['hard-delete CDC', 'the extract', 'a deleted row leaves no updated_at'] },
        { id: 'n-ver', cells: ['versioned Gold', 'gold', 'yesterday’s answer, queryable'] },
        { id: 'n-fx', cells: ['FX conversion', 'gold', 'one total per group, with a rate'] },
        { id: 'n-stream', cells: ['streaming', 'landing → bronze', 'minutes, not a night'] },
        { id: 'n-fabric', cells: ['Microsoft Fabric', 'the lake, the jobs', 'one platform for both'] },
      ],
    },
    {
      type: 'group', id: 'keep', title: 'What stays the same', icon: 'shield', tone: 'store', children: [
        { type: 'item', id: 'k-gates', title: 'the gates', sub: 'G1–G4 decide what moves on', icon: 'check' },
        { type: 'item', id: 'k-money', title: 'decimal money, per currency', sub: 'never a float, never mixed', icon: 'chart' },
        { type: 'item', id: 'k-tf', title: 'everything in Terraform', sub: 'and nothing left running', icon: 'code' },
      ],
    },
  ],
})

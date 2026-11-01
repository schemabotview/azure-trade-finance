import type { Item } from '@graphlearning/graphl-flow'

// Every frame states its verification level when it is not `runs locally` (COURSE-PLAN.md,
// "Verification levels"): nothing emulated or compiled is presented as Azure's own output. The
// label is the side pane's first node, at the same place in every frame that carries one.
export type Level = 'emulated' | 'recorded on Azure' | 'compiled' | 'doc-cited' | 'model'

const ICON: Record<Level, string> = {
  emulated: 'laptop', 'recorded on Azure': 'cloud', compiled: 'code', 'doc-cited': 'file', model: 'cpu',
}

export function level(kind: Level, sub: string): Item {
  return { type: 'item', id: 'level', icon: ICON[kind], title: kind, sub, tone: kind === 'emulated' ? 'neutral' : 'infra' }
}

/** The usual emulated label: the lake on Ana's laptop is Azurite, Azure Storage's emulator. */
export const AZURITE = level('emulated', 'the lake is Azurite, Azure Storage’s emulator: Blob API only, no hierarchical namespace')

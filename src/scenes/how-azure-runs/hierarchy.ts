import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'
import { BUILT, mapFrame, mapTerminal } from '../map'
import session from '../../../spine/how-azure-runs/02-hierarchy/session.txt?raw'

// §2.2 — the resource hierarchy (recorded on Azure, map frame; nothing built yet). Tenant, subscription and
// the empty filtered group list are the session's (ids normalised).
export const howHierarchy: SceneModel = mapFrame({
  built: BUILT['how-azure-runs'],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    mapTerminal(session),
    {
      type: 'group', id: 'tree', title: 'Five levels, each inside the one above', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'h-tenant', title: 'tenant', sub: 'the organisation’s Entra ID: who exists', icon: 'users' },
        { type: 'item', id: 'h-mg', title: 'management groups', sub: 'policy for many subscriptions (not ours to read)', icon: 'folder' },
        { type: 'item', id: 'h-sub', title: 'subscription: sub-tradefin-dev', sub: 'the bill, and a boundary for access', icon: 'cloud' },
        { type: 'item', id: 'h-rg', title: 'resource groups', sub: 'none yet: Course 3 makes rg-tradefin-dev', icon: 'boxes', muted: true },
        { type: 'item', id: 'h-res', title: 'resources', sub: 'a storage account, a vault, a factory…', icon: 'storage', muted: true },
      ],
    },
  ],
  edges: [
    { from: 'h-tenant', to: 'h-mg' },
    { from: 'h-mg', to: 'h-sub' },
    { from: 'h-sub', to: 'h-rg' },
    { from: 'h-rg', to: 'h-res' },
  ],
})

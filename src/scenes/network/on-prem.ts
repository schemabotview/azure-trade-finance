import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'
import { BUILT, mapFrame } from '../map'

// §6.5 — TradeBook is on-premises (doc-cited, map frame). Data Factory's own runtime runs in Azure's
// network: it can reach public endpoints, not a database behind the bank's firewall. Three ways a cloud
// service reaches a private database; the course takes the self-hosted integration runtime (§6.6).
export const networkOnPrem: SceneModel = mapFrame({
  built: [...BUILT.land, 'vnet', 'snet-pe', 'snet-dbx', 'pe-storage'],
  side: [
    level('doc-cited', 'learn.microsoft.com/azure/data-factory/concepts-integration-runtime'),
    {
      type: 'group', id: 'wall', title: 'Why Data Factory cannot see TradeBook', icon: 'firewall', tone: 'consume', children: [
        { type: 'item', id: 'w-adf', title: 'Data Factory’s Azure IR', sub: 'runs in Azure’s network, not ours', icon: 'datafactory' },
        { type: 'item', id: 'w-fw', title: 'the bank’s firewall', sub: 'nothing comes in from the internet', icon: 'firewall', tone: 'consume' },
        { type: 'item', id: 'w-db', title: 'TradeBook', sub: 'PostgreSQL, inside the bank', icon: 'postgresql' },
      ],
    },
    {
      type: 'table', id: 'ways', title: 'Three ways a cloud service reaches it', tone: 'ingest', columns: ['way', 'what moves', 'the course'], rows: [
        { id: 'y-open', cells: ['open the firewall', 'the database faces the internet', 'never'], tone: 'consume' },
        { id: 'y-vpn', cells: ['VPN or ExpressRoute', 'a private line into the bank', '§6.7'] },
        { id: 'y-shir', cells: ['self-hosted IR', 'an agent inside calls OUT on 443', '§6.6'], tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'w-adf', to: 'w-fw', label: 'refused', dashed: true },
    { from: 'w-fw', to: 'w-db', dashed: true },
  ],
})

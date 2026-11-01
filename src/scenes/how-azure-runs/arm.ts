import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'
import { outputOf } from '../lab'
import { BUILT, mapFrame, mapTerminal } from '../map'
import session from '../../../spine/how-azure-runs/03-arm/session.txt?raw'

// §2.3 — Azure Resource Manager (recorded on Azure, map frame). The CLI's own HTTPS request, and the number
// of resource providers registered on the subscription: the session's.
const providers = outputOf(session, 'az rest --url "$U?api-version=2021-04-01" --query "$R"').trim()

export const howArm: SceneModel = mapFrame({
  built: BUILT['how-azure-runs'],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    mapTerminal(session),
    {
      type: 'group', id: 'flow', title: 'Every request goes through one front door', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
        {
          type: 'group', id: 'clients', title: 'clients', icon: 'terminal', children: [
            { type: 'item', id: 'c-cli', title: 'Azure CLI', sub: 'az group list', icon: 'terminal' },
            { type: 'item', id: 'c-tf', title: 'Terraform', sub: 'azurerm', icon: 'code' },
            { type: 'item', id: 'c-portal', title: 'the portal', sub: 'a web page', icon: 'globe' },
          ],
        },
        { type: 'item', id: 'arm', title: 'Resource Manager', sub: 'management.azure.com: sign-in, RBAC, policy', icon: 'shield', tone: 'consume' },
        {
          type: 'group', id: 'rps', title: `${providers} providers`, sub: 'registered here', icon: 'boxes', children: [
            { type: 'item', id: 'p-storage', title: 'Microsoft.Storage', icon: 'storage' },
            { type: 'item', id: 'p-kv', title: 'Microsoft.KeyVault', icon: 'keyvault' },
            { type: 'item', id: 'p-adf', title: 'Microsoft.DataFactory', icon: 'datafactory' },
          ],
        },
      ],
    },
  ],
  edges: [
    { from: 'clients', to: 'arm' },
    { from: 'arm', to: 'rps' },
  ],
})

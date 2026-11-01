import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'
import { BUILT, mapFrame, mapTerminal } from '../map'
import session from '../../../spine/how-azure-runs/04-planes/session.txt?raw'

// §2.4 — control plane vs data plane (recorded on Azure, map frame). Listing storage accounts is a request
// to Resource Manager; reading a blob goes to the account's own endpoint under core.windows.net.
export const howPlanes: SceneModel = mapFrame({
  built: BUILT['how-azure-runs'],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    mapTerminal(session),
    {
      type: 'group', id: 'planes', bare: true, dir: 'grid', cols: 2, children: [
        {
          type: 'group', id: 'control', title: 'control plane', icon: 'settings', tone: 'infra', children: [
            { type: 'item', id: 'c-host', title: 'management.azure.com', sub: 'one host for every service', icon: 'globe' },
            { type: 'item', id: 'c-what', title: 'the resource itself', sub: 'create, configure, list accounts', icon: 'storage' },
            { type: 'item', id: 'c-who', title: 'role: Owner, Contributor', sub: 'says nothing about the data', icon: 'shield' },
          ],
        },
        {
          type: 'group', id: 'data', title: 'data plane', icon: 'database', tone: 'store', children: [
            { type: 'item', id: 'd-host', title: 'the account’s own host', sub: '<account>.blob.core.windows.net', icon: 'globe' },
            { type: 'item', id: 'd-what', title: 'what is inside', sub: 'read and write blobs', icon: 'file' },
            { type: 'item', id: 'd-who', title: 'role: Storage Blob Data …', sub: 'Course 4: Owner could not read', icon: 'key' },
          ],
        },
      ],
    },
  ],
  edges: [
    { from: 'c-host', to: 'c-what' },
    { from: 'c-what', to: 'c-who' },
    { from: 'd-host', to: 'd-what' },
    { from: 'd-what', to: 'd-who' },
  ],
})

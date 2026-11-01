import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'
import { BUILT, mapEditor, mapFrame, mapTerminal } from '../map'
import code from '../../../spine/how-azure-runs/05-three-clients/project/read/main.tf?raw'
import session from '../../../spine/how-azure-runs/05-three-clients/session.txt?raw'

// §2.5 — three clients, one API (recorded on Azure, map frame). The subscription's name read by the CLI, by
// a raw REST call and by a Terraform data source (plan only: no state written). The portal is never shown.
export const howClients: SceneModel = mapFrame({
  built: BUILT['how-azure-runs'],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    mapEditor('read/main.tf', code),
    mapTerminal(session),
    {
      type: 'group', id: 'three', title: 'Three clients, one answer', icon: 'workflow', tone: 'ingest', dir: 'grid', cols: 3, children: [
        { type: 'item', id: 'k-cli', title: 'CLI', sub: 'az account show', icon: 'terminal' },
        { type: 'item', id: 'k-rest', title: 'REST', sub: 'az rest, raw', icon: 'globe' },
        { type: 'item', id: 'k-tf', title: 'Terraform', sub: 'a data source', icon: 'code' },
        { type: 'item', id: 'k-arm', title: 'Resource Manager', sub: 'the same GET: one subscription, one name', icon: 'shield', tone: 'consume', span: 'all', fill: true },
      ],
    },
  ],
  edges: [
    { from: 'k-cli', to: 'k-arm' },
    { from: 'k-rest', to: 'k-arm' },
    { from: 'k-tf', to: 'k-arm' },
  ],
})

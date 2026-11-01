import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { networkTree } from './tree'
import code from '../../../spine/network/02-nsg/project/infra/modules/network/main.tf?raw'
import session from '../../../spine/network/02-nsg/session.txt?raw'

// §6.2 — network security groups (recorded on Azure). Two rules of ours (100, 200) and Azure's six
// defaults (65000+), evaluated by priority, lowest first, first match wins — as the session lists them.
const rules = outputOf(session, 'az network nsg rule list $N --query "$Q" -o tsv').trim().split('\n').map((l) => l.split('\t'))

export const networkNsg: SceneModel = ideFrame({
  tree: networkTree('infra/modules/network/main.tf'),
  editor: { file: 'infra/modules/network/main.tf', code, show: [[lineOf(code, "# The SHIR's subnet"), lineOf(code, 'destination_address_prefix = "AzureCloud"') + 1]],
    highlight: [lineOf(code, 'priority                   = 100'), lineOf(code, 'destination_port_range     = "443"')] },
  session,
  keep: ['$ terraform apply', ['$ az network nsg rule list', rules.at(-1)!.at(-1)!]],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    {
      type: 'table', id: 'rules', title: 'nsg-tradefin-shir, lowest priority first', tone: 'ingest', columns: ['priority', 'direction', 'access', 'rule'],
      rows: rules.map(([p, d, a, n]) => ({ id: `r-${p}-${d}`, cells: [p, d, a, n], tone: Number(p) < 1000 ? (a === 'Deny' ? 'consume' as const : 'store' as const) : undefined })),
    },
    {
      type: 'group', id: 'eval', title: 'How a packet is judged', icon: 'shield', tone: 'infra', children: [
        { type: 'item', id: 'e-sort', title: 'rules sorted by priority', sub: 'lowest number first, per direction', icon: 'filter' },
        { type: 'item', id: 'e-first', title: 'the first rule that matches decides', sub: 'allow or deny; the rest are not read', icon: 'check' },
        { type: 'item', id: 'e-default', title: 'Azure’s defaults catch the rest', sub: '65000 and up: VNet allowed, internet out allowed', icon: 'boxes' },
      ],
    },
  ],
  edges: [
    { from: 'e-sort', to: 'e-first' },
    { from: 'e-first', to: 'e-default' },
  ],
})

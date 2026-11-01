import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, terminal, trim } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import code from '../../../spine/network/04-private-endpoint/project/infra/main.tf?raw'
import session from '../../../spine/network/04-private-endpoint/session.txt?raw'

// §6.4 — ◆ full scene: a private endpoint (recorded on Azure). A request's path from inside the VNet:
// the account's usual name → the private DNS zone's A record (10.30.1.4, read from the session) → the
// private endpoint's network interface in snet-pe → the storage account. Nothing crosses the internet.
const [name, ip] = outputOf(session, 'az network private-dns record-set a list $Z --query "$Q" -o tsv').trim().split('\t')
const endpoints = outputOf(session, 'az network private-endpoint list -g rg-tradefin-dev --query "[].name" -o tsv').trim().split('\n')
// a host name has no spaces: let it wrap after its dots
const wrapDots = (s: string) => s.replaceAll('.', '.\u200b')
const rows = terminal(session).split('\n')
const from = rows.findIndex((l) => l.startsWith('Plan:')) + 1

export const networkPrivateEndpoint: SceneModel = {
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'path', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'vnet', icon: 'network', title: 'vnet-tradefin-dev', sub: 'a request from inside', tone: 'infra', children: [
            { type: 'item', id: 'p-ask', title: wrapDots(`${name}.blob.core.windows.net`), sub: 'the same name the laptop used', icon: 'search' },
            { type: 'item', id: 'p-dns', title: wrapDots('privatelink.blob.core.windows.net'), sub: `private DNS: ${name} → ${ip}`, icon: 'globe', tone: 'store' },
            { type: 'item', id: 'p-pe', title: endpoints[0], sub: `a network interface in snet-pe, ${ip}`, icon: 'network' },
            { type: 'item', id: 'p-st', title: 'sttradefindev', sub: 'public access: disabled', icon: 'storage', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'right', bare: true, children: [
        { type: 'code', id: 'editor', filename: 'infra/main.tf', lang: 'hcl', code: trim(code), tone: 'ingest',
          show: [[lineOf(code, 'resource "azurerm_private_endpoint"'), lineOf(code, 'private_dns_zone_ids') + 2]] },
        { type: 'code', id: 'terminal', terminal: true, filename: 'terminal — lc-exposure', code: rows.join('\n'), show: [[from, from], [rows.findIndex((l) => l.startsWith('Apply complete')) + 1, rows.length]] },
      ],
    },
  ],
  edges: [
    { from: 'p-ask', to: 'p-dns', label: 'resolve' },
    { from: 'p-dns', to: 'p-pe', label: ip },
    { from: 'p-pe', to: 'p-st', label: 'private link' },
  ],
}

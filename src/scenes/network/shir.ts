import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { networkTree } from './tree'
import code from '../../../spine/network/06-shir/project/infra/shir.tf?raw'
import session from '../../../spine/network/06-shir/session.txt?raw'

// §6.6 — ◆ the self-hosted integration runtime (recorded on Azure). The runtime belongs INSIDE the bank, beside
// TradeBook; the course stands the bank's network in for itself (vnet-bank-onprem, UK West — the only UK
// region this subscription may run VMs in): no inbound from the internet, a NAT gateway for the way out. A
// Windows VM installs the runtime and registers with the factory's key; Data Factory then reports it Online.
const state = /"state": "(\w+)"/.exec(session)![1]
const node = /"node": "([\w-]+)"/.exec(session)![1]

export const networkShir: SceneModel = ideFrame({
  tree: networkTree('infra/shir.tf', { fresh: ['infra/shir.tf', 'infra/shir-install.ps1'] }),
  editor: { file: 'infra/shir.tf', code, show: [[lineOf(code, '# The runtime belongs INSIDE'), lineOf(code, 'address_space       = ["10.10.0.0/16"]') + 1]],
    highlight: [lineOf(code, 'location            = "ukwest"')] },
  session,
  keep: ['$ terraform apply', 'Plan: 14 to add', 'Apply complete!', ['$ F=', '}']],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'the bank’s network is simulated: a VNet in UK West stands in for it'),
        {
          type: 'group', id: 'out', title: 'Calls out, never in', icon: 'workflow', tone: 'store', children: [
            { type: 'item', id: 'o-shir', title: `${node}`, sub: 'the runtime, beside TradeBook', icon: 'vm' },
            { type: 'item', id: 'o-nat', title: 'NAT gateway, 443 out', sub: 'the bank’s one way out', icon: 'network' },
            { type: 'item', id: 'o-adf', title: 'adf-tradefin-dev', sub: '“any work for me?”', icon: 'datafactory', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'pieces', title: 'What the apply built (14)', tone: 'infra', columns: ['piece', 'where'], rows: [
        { id: 'p-adf', cells: ['Data Factory + ir-tradebook-shir', 'UK South'] },
        { id: 'p-net', cells: ['vnet-bank-onprem, NSG, NAT', 'UK West: “the bank”'] },
        { id: 'p-vm', cells: ['Windows VM + install extension', 'UK West, no public IP'] },
        { id: 'p-state', cells: [`runtime: ${state}`, 'reported by Data Factory'], tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'o-shir', to: 'o-nat' },
    { from: 'o-nat', to: 'o-adf', label: 'HTTPS' },
  ],
})

import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { BUILT, mapEditor, mapFrame, mapTerminal } from '../map'
import code from '../../../spine/network/01-vnet/project/infra/modules/network/main.tf?raw'
import session from '../../../spine/network/01-vnet/session.txt?raw'

// §6.1 — VNets and subnets (recorded on Azure, map frame). 10.30.0.0/16 carved by job: private endpoints,
// the SHIR, Databricks' two /22s. The subnets and their prefixes are the session's.
const subnets = outputOf(session, 'az network vnet subnet list $V --query "[].[name, addressPrefixes[0]]" -o tsv').trim().split('\n').map((l) => l.split('\t'))
const JOB: Record<string, string> = { 'snet-pe': 'private endpoints (§6.4)', 'snet-shir': 'the self-hosted IR (§6.6)', 'snet-dbx-host': 'Databricks, host side', 'snet-dbx-container': 'Databricks, container side' }
const size = (cidr: string) => 2 ** (32 - Number(cidr.split('/')[1]))

export const networkVnet: SceneModel = mapFrame({
  built: [...BUILT.land, 'vnet', 'snet-pe', 'snet-shir', 'snet-dbx'],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    mapEditor('infra/modules/network/main.tf', code, [[lineOf(code, 'address_space'), lineOf(code, 'address_space')], [lineOf(code, 'locals {'), lineOf(code, 'snet-dbx-container') + 2]], [lineOf(code, 'address_space')]),
    mapTerminal(session, ['Plan: 5 to add', 'Apply complete!', ['$ V=', subnets.at(-1)![1]]]),
    {
      type: 'table', id: 'plan', title: '10.30.0.0/16: 65,536 addresses, carved by job', tone: 'infra', columns: ['subnet', 'range', 'addresses', 'for'],
      rows: [...subnets].sort((a, b) => a[1].localeCompare(b[1], 'en', { numeric: true })).map(([n, c]) => ({ id: `s-${n}`, cells: [n, c, size(c).toLocaleString('en-GB'), JOB[n] ?? ''] })),
    },
  ],
})

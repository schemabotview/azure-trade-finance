import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { INFRA_FLAT, QUERIES, TRADEBOOK, startTree } from './tree'
import code from '../../../spine/start/04-first-terraform/project/infra/main.tf?raw'
import session from '../../../spine/start/04-first-terraform/session.txt?raw'

// §3.4 — a first Terraform file (recorded on Azure). init, then apply: two resources created; state
// list names them. The state file sits in the working copy — the problem §3.5 solves.
const state = outputOf(session, 'terraform state list').trim().split('\n')

export const startFirstTerraform: SceneModel = ideFrame({
  tree: startTree([...TRADEBOOK, ...QUERIES, ...INFRA_FLAT], 'infra/main.tf', { fresh: INFRA_FLAT, made: { 'infra/.terraform/': 'providers', 'infra/terraform.tfstate': 'state!' } }),
  editor: { file: 'infra/main.tf', code, show: [[lineOf(code, 'resource "azurerm_resource_group"'), lineOf(code, 'min_tls_version') + 1]],
    highlight: [lineOf(code, 'resource "azurerm_resource_group"'), lineOf(code, 'resource "azurerm_storage_account"')] },
  session,
  keep: ['$ terraform apply', 'Plan: 2 to add', 'Apply complete!', ['$ terraform state list', 'terraform.tfstate']],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    {
      type: 'group', id: 'path', title: 'From a file to a resource', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'p-tf', title: 'main.tf', sub: 'what should exist', icon: 'code' },
        { type: 'item', id: 'p-provider', title: 'azurerm provider 5.12.0', sub: 'turns blocks into API calls', icon: 'package' },
        { type: 'item', id: 'p-arm', title: 'Azure Resource Manager', sub: 'management.azure.com: one API for all', icon: 'cloud' },
        { type: 'item', id: 'p-account', title: 'sttradefindev', sub: 'in rg-tradefin-dev, UK South', icon: 'storage', tone: 'store' },
      ],
    },
    { type: 'table', id: 'state', title: 'terraform state list', tone: 'infra', columns: ['address'], rows: state.map((a) => ({ id: `s-${a}`, cells: [a] })) },
  ],
  edges: [
    { from: 'p-tf', to: 'p-provider', label: 'plan, apply' },
    { from: 'p-provider', to: 'p-arm', label: 'HTTPS' },
    { from: 'p-arm', to: 'p-account' },
  ],
})

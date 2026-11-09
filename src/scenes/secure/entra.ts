import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { secureTree } from './tree'
import code from '../../../spine/secure/01-entra/project/infra/entra.tf?raw'
import session from '../../../spine/secure/01-entra/session.txt?raw'

// §4.1 — Entra ID (compiled: terraform validate). Users and groups are Microsoft Graph objects; the azuread
// provider manages them. Validated offline; applying needs Graph permissions this course's identity lacks.
export const secureEntra: SceneModel = ideFrame({
  tree: secureTree('infra/entra.tf', { extra: ['infra/entra.tf'], fresh: ['infra/entra.tf'] }),
  editor: { file: 'infra/entra.tf', code, show: [[1, 4], [lineOf(code, '# Roles go to the GROUP'), lineOf(code, 'members          =') + 1]],
    highlight: [lineOf(code, 'display_name     = "grp-trade-risk-eng"'), lineOf(code, 'members          =')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'validated offline: applying needs Graph permissions'),
        {
          type: 'group', id: 'tenant', title: 'Who exists: the tenant', icon: 'users', tone: 'ingest', children: [
            { type: 'item', id: 't-dir', title: 'Entra ID', sub: 'the organisation’s directory, read through Graph', icon: 'users' },
            { type: 'item', id: 't-users', title: 'users: Ana, the desk, the risk team', sub: 'people, by sign-in name', icon: 'users' },
            { type: 'item', id: 't-group', title: 'grp-trade-risk-eng', sub: 'a security group: its members, its owner', icon: 'shield', tone: 'store' },
            { type: 'item', id: 't-roles', title: 'Azure roles (§4.3)', sub: 'granted to the group, never to a person', icon: 'key' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'two', title: 'Two APIs, two kinds of permission', tone: 'infra', columns: ['', 'Azure resources', 'Entra ID objects'], rows: [
        { id: 'a-api', cells: ['API', 'Resource Manager', 'Microsoft Graph'] },
        { id: 'a-tf', cells: ['provider', 'azurerm', 'azuread'] },
        { id: 'a-perm', cells: ['needs', 'an Azure role', 'a Graph permission'] },
      ],
    },
  ],
  edges: [
    { from: 't-dir', to: 't-users' },
    { from: 't-users', to: 't-group' },
    { from: 't-group', to: 't-roles' },
  ],
})

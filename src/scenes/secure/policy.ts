import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { KEYVAULT, secureTree } from './tree'
import code from '../../../spine/secure/08-policy/project/infra/policy.tf?raw'
import session from '../../../spine/secure/08-policy/session.txt?raw'

// §4.8 — Azure Policy (recorded on Azure). Two attempts to create a storage account by hand, both refused
// by the assignments §4.7 applied: one in West Europe (not an allowed location), one in UK South without
// an owner tag. Nothing was created: the group still holds one account.
const accounts = outputOf(session, 'az storage account list -g rg-tradefin-dev --query "[].name" -o tsv').trim().split('\n')
const denied = [...session.matchAll(/^Code: RequestDisallowedByPolicy/gm)].length

export const securePolicy: SceneModel = ideFrame({
  tree: secureTree('infra/policy.tf', { extra: [...KEYVAULT, 'infra/policy.tf'] }),
  editor: { file: 'infra/policy.tf', code, show: [[lineOf(code, 'data "azurerm_policy_definition" "locations"'), lineOf(code, 'parameters           = jsonencode({ tagName')]],
    highlight: [lineOf(code, 'display_name = "Allowed locations"'), lineOf(code, 'display_name = "Require a tag on resources"')] },
  session,
  keep: ['$ G=', '-l francecentral', 'Code: RequestDisallowedByPolicy', '-l uksouth', 'Code: RequestDisallowedByPolicy', ['$ az storage account list', accounts.at(-1)!]],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    {
      type: 'group', id: 'flow', title: 'A rule, an assignment, a refusal', icon: 'shield', tone: 'consume', children: [
        { type: 'item', id: 'p-def', title: 'a definition', sub: 'Azure’s built-in: “Allowed locations”', icon: 'file' },
        { type: 'item', id: 'p-assign', title: 'an assignment', sub: 'on rg-tradefin-dev, with parameters', icon: 'boxes' },
        { type: 'item', id: 'p-deny', title: `deny: ${denied} refused`, sub: 'before anything is created', icon: 'shield', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'tries', title: 'Two tries, by hand', tone: 'consume', columns: ['create', 'refused by'], rows: [
        { id: 't-west', cells: ['francecentral, owner tag', 'UK regions only'], tone: 'consume' },
        { id: 't-tag', cells: ['uksouth, no tags', 'an owner tag on everything'], tone: 'consume' },
        { id: 't-after', cells: ['accounts in the group now', accounts.join(', ')] },
      ],
    },
  ],
  edges: [
    { from: 'p-def', to: 'p-assign' },
    { from: 'p-assign', to: 'p-deny' },
  ],
})

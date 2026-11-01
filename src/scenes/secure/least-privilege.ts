import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { KEYVAULT, secureTree } from './tree'
import code from '../../../spine/secure/07-least-privilege/project/infra/policy.tf?raw'
import session from '../../../spine/secure/07-least-privilege/session.txt?raw'

// §4.7 — least privilege (recorded on Azure). Every role assignment on a *tradefin* scope, as the session
// lists them (scope cut to its last segment): each identity has only what its job needs, on the narrowest
// scope that does. The two policy assignments applied here are §4.8's subject.
const matrix = outputOf(session, 'az role assignment list --all --query "$Q" -o tsv | sed -E \'s|\\t/.*/| on |\'').trim().split('\n')
  .map((l) => { const [who, rest] = l.split('\t'); const [role, on] = rest.split(' on '); return [who, role, on] })
const policies = outputOf(session, 'az policy assignment list -g rg-tradefin-dev --query "[].displayName" -o tsv').trim().split('\n')

export const secureLeastPrivilege: SceneModel = ideFrame({
  tree: secureTree('infra/policy.tf', { extra: [...KEYVAULT, 'infra/policy.tf'], fresh: ['infra/policy.tf'] }),
  editor: { file: 'infra/policy.tf', code, show: [[1, 2], [lineOf(code, 'resource "azurerm_resource_group_policy_assignment" "locations"'), lineOf(code, 'parameters           = jsonencode({ tagName')]],
    highlight: [lineOf(code, 'listOfAllowedLocations'), lineOf(code, 'tagName = { value = "owner" }')] },
  session,
  keep: ['$ terraform apply', 'Plan: 2 to add', 'Apply complete!', ['$ Q=', policies.at(-1)!]],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    {
      type: 'table', id: 'matrix', title: 'Every assignment on a tradefin scope', tone: 'ingest', columns: ['principal', 'role', 'on'],
      rows: matrix.map(([who, role, on], i) => ({ id: `m-${i}`, cells: [who, role, on], tone: role.includes('Reader') || role.includes('User') ? 'store' as const : undefined })),
    },
    {
      type: 'table', id: 'rule', title: 'The rule behind the matrix', tone: 'store', columns: ['ask', 'answer here'], rows: [
        { id: 'q-what', cells: ['the narrowest role?', 'read where reading is the job'] },
        { id: 'q-where', cells: ['the narrowest scope?', 'one account, one vault'] },
        { id: 'q-who', cells: ['a person, or an identity?', 'the pipeline is its own'] },
      ],
    },
  ],
})

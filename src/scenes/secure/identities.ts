import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { secureTree } from './tree'
import code from '../../../spine/secure/02-identities/project/infra/main.tf?raw'
import session from '../../../spine/secure/02-identities/session.txt?raw'

// §4.2 — service principals and managed identities (recorded on Azure). The pipeline gets its own
// identity, id-tradefin-pipeline, a user-assigned managed identity: Azure holds its credential. Ana's
// session runs as a service principal (the recording's sign-in), which DOES have a secret somewhere.
const [name] = outputOf(session, 'az identity list -g rg-tradefin-dev --query "[].[name,principalId]" -o tsv').trim().split('\t')
const me = outputOf(session, 'az account show --query user.type -o tsv').trim()

export const secureIdentities: SceneModel = ideFrame({
  tree: secureTree('infra/main.tf'),
  editor: { file: 'infra/main.tf', code, show: [[lineOf(code, "# The pipeline's own identity"), lineOf(code, 'tags                = local.tags', lineOf(code, '# The pipeline')) + 1]],
    highlight: [lineOf(code, 'resource "azurerm_user_assigned_identity"')] },
  session,
  keep: ['$ cd infra', '$ terraform apply', 'Plan: 1 to add', 'Apply complete!', ['$ az identity list', me]],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    {
      type: 'table', id: 'kinds', title: 'Three kinds of identity', tone: 'ingest', columns: ['kind', 'is', 'its secret'], rows: [
        { id: 'k-user', cells: ['user', 'a person: Ana, at the desk', 'a password + MFA, hers'] },
        { id: 'k-sp', cells: ['service principal', `an app: this session (${me})`, 'a secret or certificate, stored'], tone: 'infra' },
        { id: 'k-mi', cells: ['managed identity', `Azure-run code: ${name}`, 'none to store: Azure holds it'], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'flow', title: 'How the pipeline will sign in', icon: 'workflow', tone: 'store', children: [
        { type: 'item', id: 'f-adf', title: 'Data Factory (Course 7)', sub: 'wears id-tradefin-pipeline', icon: 'datafactory' },
        { type: 'item', id: 'f-token', title: 'a token from Entra ID', sub: 'asked for at run time, short-lived', icon: 'key' },
        { type: 'item', id: 'f-vault', title: 'Key Vault, the lake', sub: 'accept the token, check the role', icon: 'keyvault' },
      ],
    },
  ],
  edges: [
    { from: 'f-adf', to: 'f-token' },
    { from: 'f-token', to: 'f-vault' },
  ],
})

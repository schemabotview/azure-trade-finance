import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { KEYVAULT, secureTree } from './tree'
import code from '../../../spine/secure/06-no-secret/project/infra/main.tf?raw'
import session from '../../../spine/secure/06-no-secret/session.txt?raw'

// §4.6 — no secret anywhere (recorded on Azure). The pipeline's identity gets Key Vault Secrets User on the
// vault: it may read secrets, nothing more. The vault's assignments (inherited included) are the session's;
// grep shows no password assigned in any file of the project.
const rows = outputOf(session, 'az role assignment list --scope $KV --include-inherited --query "$Q" -o tsv').trim().split('\n').map((l) => l.split('\t'))
const grep = outputOf(session, 'grep -rnIiE "password *=" infra tradebook env.sh || echo "no password here"').trim()

export const secureNoSecret: SceneModel = ideFrame({
  tree: secureTree('infra/main.tf', { extra: KEYVAULT }),
  editor: { file: 'infra/main.tf', code, show: [[lineOf(code, "# The pipeline's identity may READ"), lineOf(code, 'principal_id         = azurerm_user_assigned_identity.pipeline.principal_id', lineOf(code, "may READ")) + 1]],
    highlight: [lineOf(code, 'role_definition_name = "Key Vault Secrets User"')] },
  session,
  keep: ['$ terraform apply', ['$ az role assignment list', grep]],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    {
      type: 'group', id: 'chain', title: 'How the pipeline gets the password', icon: 'workflow', tone: 'store', children: [
        { type: 'item', id: 'c-id', title: 'id-tradefin-pipeline', sub: 'a managed identity: no secret of its own', icon: 'key' },
        { type: 'item', id: 'c-token', title: 'a token from Entra ID', sub: 'minutes long, for the vault only', icon: 'cert' },
        { type: 'item', id: 'c-vault', title: 'kv-tradefin-dev', sub: 'role: Key Vault Secrets User → read', icon: 'keyvault', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'token', title: 'The token the identity gets', tone: 'store', columns: ['may', 'may not'], rows: [
        { id: 't-1', cells: ['read a secret’s value', 'set, change or delete one'] },
        { id: 't-2', cells: ['reach kv-tradefin-dev', 'reach anything else'] },
        { id: 't-3', cells: ['last minutes', 'be written down for later'] },
      ],
    },
    {
      type: 'table', id: 'who', title: 'Who holds what on the vault', tone: 'ingest', columns: ['principal', 'role'],
      rows: rows.map(([who, role], i) => ({ id: `r-${i}`, cells: [who, role], tone: role === 'Key Vault Secrets User' ? 'store' as const : undefined })),
    },
  ],
  edges: [
    { from: 'c-id', to: 'c-token' },
    { from: 'c-token', to: 'c-vault' },
  ],
})

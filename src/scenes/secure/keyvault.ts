import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { KEYVAULT, secureTree } from './tree'
import code from '../../../spine/secure/05-keyvault/project/infra/modules/keyvault/main.tf?raw'
import session from '../../../spine/secure/05-keyvault/session.txt?raw'

// §4.5 — Key Vault (recorded on Azure). The blob list now fails only because the container does not exist:
// §4.4's data role has arrived. The vault is RBAC-only; the password is made by openssl straight into the
// vault and never printed, never in a file, never in Terraform's state.
const secrets = outputOf(session, 'az keyvault secret list --vault-name $V --query "[].name" -o tsv').trim().split('\n')

export const secureKeyvault: SceneModel = ideFrame({
  tree: secureTree('infra/modules/keyvault/main.tf', { extra: KEYVAULT, fresh: KEYVAULT }),
  editor: { file: 'infra/modules/keyvault/main.tf', code, highlight: [lineOf(code, 'rbac_authorization_enabled'), lineOf(code, 'purge_protection_enabled')] },
  session,
  keep: [['$ az storage blob list', 'ERROR: The specified container'], '$ terraform apply', 'Apply complete!', ['$ V=', secrets[0]]],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'vault', title: 'A vault, a secret, its versions', icon: 'keyvault', tone: 'infra', children: [
            { type: 'item', id: 'v-vault', title: 'kv-tradefin-dev', sub: 'RBAC decides who may read: no access policies', icon: 'keyvault' },
            { type: 'item', id: 'v-secret', title: secrets[0], sub: 'a name the pipeline asks for', icon: 'key', tone: 'store' },
            { type: 'item', id: 'v-version', title: 'version 1', sub: 'setting it again makes version 2; the name stays', icon: 'layers' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'settings', title: 'The vault, as the module sets it', tone: 'infra', columns: ['setting', 'value'], rows: [
        { id: 's-rbac', cells: ['rbac_authorization_enabled', 'true'] },
        { id: 's-soft', cells: ['soft_delete_retention_days', '7'] },
        { id: 's-purge', cells: ['purge_protection_enabled', 'false'] },
      ],
    },
  ],
  edges: [
    { from: 'v-vault', to: 'v-secret' },
    { from: 'v-secret', to: 'v-version' },
  ],
})

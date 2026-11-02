import type { Course } from '../types'
import { entraId } from './01-entra-id'
import { identities } from './02-identities'
import { rbac } from './03-rbac'
import { ownerCannotReadABlob } from './04-owner-cannot-read-a-blob'
import { keyVault } from './05-key-vault'
import { noSecretAnywhere } from './06-no-secret-anywhere'
import { leastPrivilege } from './07-least-privilege'
import { azurePolicy } from './08-azure-policy'

// Course 4 · Identity first. All recorded on Azure (Terraform). §1 (Entra ID: users and groups) needs
// Microsoft Graph permissions for the recording identity and is not authored yet.
export const secure: Course = {
  id: 'secure',
  title: 'Identity first',
  sections: [entraId, identities, rbac, ownerCannotReadABlob, keyVault, noSecretAnywhere, leastPrivilege, azurePolicy],
}

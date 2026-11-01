import type { SceneModel } from '@graphlearning/graphl-flow'
import { secureIdentities } from './identities'
import { secureRbac } from './rbac'
import { secureOwnerNoData } from './owner-no-data'
import { secureKeyvault } from './keyvault'
import { secureNoSecret } from './no-secret'
import { secureLeastPrivilege } from './least-privilege'
import { securePolicy } from './policy'

export const secureScenes: Record<string, SceneModel> = {
  'secure-identities': secureIdentities,
  'secure-rbac': secureRbac,
  'secure-owner-no-data': secureOwnerNoData,
  'secure-keyvault': secureKeyvault,
  'secure-no-secret': secureNoSecret,
  'secure-least-privilege': secureLeastPrivilege,
  'secure-policy': securePolicy,
}

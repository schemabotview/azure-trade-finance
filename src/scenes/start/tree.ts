import type { TreeEntry } from '@graphlearning/graphl-flow'
import { projectTree } from '../tree'

// Course 3's explorer: lc-exposure as each step holds it. TradeBook's seed (data/) and what a run
// leaves (.terraform/, a local state file) are drawn muted, as an editor greys out what git ignores.
export function startTree(paths: string[], active: string, { fresh = [], made = {} }: { fresh?: string[]; made?: Record<string, string> } = {}): TreeEntry[] {
  return projectTree(['env.sh', ...paths], { active, fresh, made: { 'data/': 'tradebook_gen', ...made } })
}

export const TRADEBOOK = ['tradebook/schema.sql', 'tradebook/load.sql']
export const QUERIES = ['tradebook/history.sql', 'tradebook/open.sql']
export const INFRA_FLAT = ['infra/main.tf', 'infra/.terraform.lock.hcl']
export const INFRA = ['infra/main.tf', 'infra/backend.tf', 'infra/bootstrap.sh', 'infra/variables.tf', 'infra/envs/dev.tfvars',
  'infra/modules/storage/main.tf', 'infra/modules/storage/variables.tf', 'infra/modules/storage/outputs.tf', 'infra/.terraform.lock.hcl']

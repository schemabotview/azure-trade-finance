import type { TreeEntry } from '@graphlearning/graphl-flow'
import { INFRA, QUERIES, TRADEBOOK, startTree } from '../start/tree'

// Course 4's explorer: Course 3's project, with the files this course adds.
export const KEYVAULT = ['infra/modules/keyvault/main.tf', 'infra/modules/keyvault/variables.tf', 'infra/modules/keyvault/outputs.tf']

export function secureTree(active: string, { extra = [], fresh = [] }: { extra?: string[]; fresh?: string[] } = {}): TreeEntry[] {
  return startTree([...TRADEBOOK, ...QUERIES, ...INFRA, ...extra], active, { fresh })
}

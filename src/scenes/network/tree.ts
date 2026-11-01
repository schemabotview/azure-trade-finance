import type { TreeEntry } from '@graphlearning/graphl-flow'
import { INFRA, QUERIES, TRADEBOOK, startTree } from '../start/tree'
import { KEYVAULT } from '../secure/tree'

// Course 6's explorer: the infra the earlier courses built, and this course's network module.
export const NETWORK = ['infra/modules/network/main.tf', 'infra/modules/network/variables.tf', 'infra/modules/network/outputs.tf']

export function networkTree(active: string, { fresh = [] }: { fresh?: string[] } = {}): TreeEntry[] {
  return startTree([...TRADEBOOK, ...QUERIES, ...INFRA, ...KEYVAULT, 'infra/policy.tf', ...NETWORK], active, { fresh })
}

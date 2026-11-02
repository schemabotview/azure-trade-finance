import type { TreeEntry } from '@graphlearning/graphl-flow'
import { projectTree } from '../tree'

// Course 12's compiled lab: the infra as Course 7 left it, plus what this course adds.
const BEFORE = ['env.sh', 'adf/adf.sh', 'infra/main.tf', 'infra/backend.tf', 'infra/variables.tf', 'infra/policy.tf', 'infra/shir.tf',
  'infra/adf-links.tf', 'infra/adf-tradebook.tf', 'infra/pipelines.tf', 'infra/trigger.tf', 'infra/tradebook.tf',
  'infra/pipelines/pl_extract.json', 'infra/modules/network/main.tf', 'infra/envs/dev.tfvars']
export const OPS = ['infra/monitor.tf', 'infra/alerts.tf', 'infra/queries/failed.kql', 'infra/oidc.tf', '.github/workflows/terraform.yml']

export function opsTree(active: string): TreeEntry[] {
  return projectTree([...BEFORE, ...OPS], { active, fresh: OPS, closed: ['adf', 'infra/envs', 'infra/modules', 'infra/pipelines'], made: { 'data/': 'tradebook_gen' } })
}

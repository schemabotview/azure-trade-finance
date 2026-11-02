import type { TreeEntry } from '@graphlearning/graphl-flow'
import { projectTree } from '../tree'

// The Databricks lab's explorer (compiled frames): the infra as Course 7 left it, plus the files the lab adds.
const BEFORE = ['env.sh', 'adf/adf.sh', 'infra/main.tf', 'infra/backend.tf', 'infra/variables.tf', 'infra/policy.tf', 'infra/shir.tf',
  'infra/adf-links.tf', 'infra/adf-tradebook.tf', 'infra/pipelines.tf', 'infra/trigger.tf', 'infra/tradebook.tf',
  'infra/pipelines/pl_extract.json', 'infra/modules/network/main.tf', 'infra/envs/dev.tfvars']
export const DBX = ['infra/databricks.tf', 'infra/unity.tf', 'infra/job.tf', 'infra/adf-databricks.tf', 'infra/pipelines/pl_nightly.json']

export function dbxTree(active: string): TreeEntry[] {
  return projectTree([...BEFORE, ...DBX], { active, fresh: DBX, closed: ['adf', 'infra/envs'], made: { 'data/': 'tradebook_gen' } })
}

import type { TreeEntry } from '@graphlearning/graphl-flow'
import { projectTree } from '../tree'

// Course 7's explorer: the infra so far, closed where this course does not look (the modules, TradeBook's
// SQL, Course 5's extract), and what each section adds: Data Factory's files and Ana's adf.sh.
const BEFORE = ['env.sh', 'tradebook/schema.sql', 'tradebook/load.sql', 'extract/extract.py', 'extract/g1.py',
  'infra/main.tf', 'infra/backend.tf', 'infra/variables.tf', 'infra/policy.tf', 'infra/shir.tf', 'infra/shir-install.ps1',
  'infra/modules/storage/main.tf', 'infra/envs/dev.tfvars']

export const STEP_FILES: Record<string, string[]> = {
  '01': ['infra/adf-links.tf', 'adf/adf.sh'],
  '03': ['infra/tradebook.tf', 'infra/tradebook-init.yaml', 'infra/adf-tradebook.tf', 'infra/pipelines.tf',
    'infra/pipelines/pl_tradebook_ping.json'],
  '04': ['infra/pipelines/pl_full_load.json'],
  '05': ['infra/pipelines/pl_extract.json'],
  '07': ['infra/trigger.tf'],
}

/** The tree as step `nn` holds it: every file added up to it, its own drawn new. */
export function extractTree(nn: string, active: string): TreeEntry[] {
  const upto = Object.entries(STEP_FILES).filter(([k]) => k <= nn)
  return projectTree([...BEFORE, ...upto.flatMap(([, f]) => f)], {
    active, fresh: STEP_FILES[nn] ?? [], closed: ['tradebook', 'extract', 'infra/modules', 'infra/envs'],
    made: { 'data/': 'tradebook_gen' },
  })
}

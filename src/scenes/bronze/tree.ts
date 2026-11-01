import type { TreeEntry } from '@graphlearning/graphl-flow'
import { projectTree } from '../tree'

// Courses 8–11's explorer: the pipeline's code, with infra/ and tradebook/ closed — the scenes are
// about pipeline/ now. The lake's local Delta tables (lake/) and Spark's jars are drawn muted.
const BASE = ['env.sh', 'requirements.txt', 'jars.txt', 'conf/log4j2.properties', 'extract/extract.py', 'extract/g1.py', 'extract/lake.py',
  'extract/reference.py', 'infra/main.tf', 'tradebook/schema.sql']

export function pipelineTree(active: string, pipeline: string[], { fresh = [] }: { fresh?: string[] } = {}): TreeEntry[] {
  return projectTree([...BASE, ...pipeline.map((f) => `pipeline/${f}`)], {
    active, fresh, closed: ['infra', 'tradebook', 'extract', 'conf'],
    made: { '.venv/': 'PySpark 4.2.0', 'jars/': 'Delta 4.4.1', 'lake/': 'Delta tables' },
  })
}

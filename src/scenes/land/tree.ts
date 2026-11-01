import type { TreeEntry } from '@graphlearning/graphl-flow'
import { projectTree } from '../tree'

// Course 5's explorer: lc-exposure as the spine holds it, plus what runs made there — the venv,
// tradebook_gen's seed (data/), and from §5.8 the risk team's reference/ files — drawn muted.
const BASE = ['env.sh', 'requirements.txt', 'tradebook/schema.sql', 'tradebook/load.sql', 'extract/lake.py', 'extract/extract.py']

export function landTree(active: string, { extra = [], fresh = [], made = {} }: { extra?: string[]; fresh?: string[]; made?: Record<string, string> } = {}): TreeEntry[] {
  return projectTree([...BASE, ...extra], {
    active, fresh, closed: ['tradebook'],
    made: { '.venv/': 'Python 3.14.9', 'data/': 'tradebook_gen', ...made },
  })
}

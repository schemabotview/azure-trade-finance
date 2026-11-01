import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { AZURITE } from '../level'
import { pipelineTree } from './tree'
import code from '../../../spine/bronze/06-bronze/project/pipeline/bronze.py?raw'
import session from '../../../spine/bronze/06-bronze/session.txt?raw'

// §8.6 — Bronze (runs locally: PySpark 4.2.0 + Delta 4.4.1; the landing zone it reads is Azurite).
// Batch 41 predates seals, so Ana seals it by hand first. Each sealed batch is appended once, every
// column as the string it arrived as, plus batch_id, src_file, ingest_ts; a second run appends nothing.
// LC-2041's two rows are the session's.
const appended = [...session.matchAll(/batch (\d+): (\d+) rows appended/g)].map((m) => [m[1], m[2]])
const versions = outputOf(session, 'python pipeline/versions.py LC-2041').split('\n').filter((l) => l.startsWith('|LC-')).map((l) => l.split('|').map((c) => c.trim()).filter(Boolean))

export const bronzeBronze: SceneModel = ideFrame({
  tree: pipelineTree('pipeline/bronze.py', ['session.py', 'bronze.py', 'versions.py'], { fresh: ['pipeline/session.py', 'pipeline/bronze.py', 'pipeline/versions.py', 'requirements.txt', 'jars.txt'] }),
  editor: { file: 'pipeline/bronze.py', code, show: [[lineOf(code, 'def main'), lineOf(code, 'rows appended")')]],
    highlight: [lineOf(code, 'if batch in done'), ...linesFrom(code, '.withColumn("batch_id"', '.withColumn("ingest_ts"'), lineOf(code, 'mode("append")')] },
  session,
  keep: [['$ B=', '$ python pipeline/versions.py']],
  side: [
    AZURITE,
    {
      type: 'group', id: 'flow', title: 'Landing → Bronze, once per batch', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'f-sealed', title: 'sealed batches in landing', sub: '_SUCCESS: G1 passed', icon: 'adls' },
        { type: 'item', id: 'f-read', title: 'read as received', sub: 'every column a string: nothing parsed, nothing lost', icon: 'file' },
        { type: 'item', id: 'f-tag', title: '+ batch_id, src_file, ingest_ts', sub: 'where each row came from, and when', icon: 'layers' },
        { type: 'item', id: 'f-bronze', title: 'lake/bronze/lc_deals', sub: 'a Delta table: append only', icon: 'layers', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'appended', title: 'First run', tone: 'store', columns: ['batch', 'rows appended'],
      rows: appended.map(([b, n]) => ({ id: `a-${b}`, cells: [b, n] })),
    },
    {
      type: 'table', id: 'lc2041', title: 'LC-2041 in Bronze: every version', tone: 'ingest', columns: ['source_version', 'amount', 'batch_id'],
      rows: versions.map((v) => ({ id: `v-${v[1]}-${v[4]}`, cells: [v[1], v[2], v[4]] })),
    },
  ],
  edges: [
    { from: 'f-sealed', to: 'f-read' },
    { from: 'f-read', to: 'f-tag' },
    { from: 'f-tag', to: 'f-bronze' },
  ],
})

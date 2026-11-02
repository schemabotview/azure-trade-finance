import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, trim } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { SPARK_NOTICE } from '../spark'
import code from '../../../spine/bronze/05-autoload/project/pipeline/autoload.py?raw'
import session from '../../../spine/bronze/05-autoload/session.txt?raw'

// §8.5 — ◆ Auto Loader's mechanism (a lab, run locally: open-source Spark 4.2's file stream with a checkpoint
// and availableNow stands in for Databricks Auto Loader). Three runs: 200 rows, nothing new, then only the
// new file's 200. Every count is the session's.
const runs = session.trim().split(/^(?=\$ python pipeline\/autoload\.py$|\$ ls )/m).slice(1).filter((b) => !b.startsWith('$ ls'))
  .map((b) => b.split('\n').filter((l) => l && l !== SPARK_NOTICE && !l.startsWith('$ D=') && !l.startsWith('$ (head') && !l.startsWith('$ ls')).join('\n'))
const said = (b: string) => /this run: (\d+) rows read; the table: (\d+) rows/.exec(b)!.slice(1)
const files = outputOf(session, 'ls lake/_checkpoints/autoload/sources/0/').trim().split('\n')
const pane = (id: string, title: string, text: string) => ({ type: 'code' as const, id, terminal: true, filename: title, code: text })

export const bronzeAutoload: SceneModel = {
  dir: 'col',
  nodes: [
    level('emulated', 'open-source Spark’s file stream, run locally, standing in for Databricks Auto Loader'),
    {
      type: 'group', id: 'top', bare: true, dir: 'row', children: [
        { type: 'code', id: 'editor', filename: 'pipeline/autoload.py', lang: 'python', code: trim(code), tone: 'ingest',
          show: [[lineOf(code, 'rows = (spark.readStream'), lineOf(code, 'query.awaitTermination()')]],
          highlight: [lineOf(code, '.option("checkpointLocation"'), lineOf(code, '.trigger(availableNow=True)')] },
        {
          type: 'group', id: 'idea', title: 'Each file once', icon: 'workflow', tone: 'store', children: [
            { type: 'item', id: 'i-files', title: 'landing/*/*.csv', sub: 'every file there now', icon: 'adls' },
            { type: 'item', id: 'i-ck', title: `the checkpoint: ${files.length} batches`, sub: 'which files each run read', icon: 'archive' },
            { type: 'item', id: 'i-table', title: 'lake/autoload', sub: 'a Delta table, appended', icon: 'layers', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'runs', bare: true, dir: 'row', children: runs.map((b, i) => pane(`run-${i}`, `run ${i + 1}: ${said(b)[0]} rows read`, b)),
    },
  ],
  edges: [
    { from: 'i-files', to: 'i-ck' },
    { from: 'i-ck', to: 'i-table' },
  ],
}

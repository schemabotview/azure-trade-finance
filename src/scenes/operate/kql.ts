import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { opsTree } from './tree'
import session from '../../../spine/operate/01-monitor/session.txt?raw'
import code from '../../../spine/operate/01-monitor/project/infra/queries/failed.kql?raw'

// §12.2 — KQL (compiled: the query is the file the alert in §12.3 reads; the lab prints it). Each line takes
// the rows from the line above.
const lines = code.trim().split('\n').filter((l) => !l.startsWith('//'))

export const operateKql: SceneModel = ideFrame({
  tree: opsTree('infra/queries/failed.kql'),
  editor: { file: 'infra/queries/failed.kql', lang: 'sql', code, highlight: [lineOf(code, '| where Status == "Failed"')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'the query the alert runs (§12.3); validated with it, not run here'),
        {
          type: 'group', id: 'pipe', title: 'Each line takes the rows above it', icon: 'filter', tone: 'ingest', children:
            lines.map((l, i) => ({ type: 'item' as const, id: `k${i}`, title: l.replace(/^\| /, ''), sub: ['a table: every activity run', 'keep the failed ones', 'keep four columns', 'newest first'][i] ?? '', icon: i === 0 ? 'loganalytics' : 'filter', tone: i === lines.length - 1 ? 'store' as const : undefined })),
        },
      ],
    },
    {
      type: 'table', id: 'cols', title: 'The four columns it keeps', tone: 'infra', columns: ['column', 'answers'], rows: [
        { id: 'c-1', cells: ['TimeGenerated', 'when it failed'] },
        { id: 'c-2', cells: ['PipelineName', 'which night’s pipeline'] },
        { id: 'c-3', cells: ['ActivityName', 'which step'] },
        { id: 'c-4', cells: ['ErrorCode', 'what kind of failure'] },
      ],
    },
  ],
  edges: lines.slice(1).map((_, i) => ({ from: `k${i}`, to: `k${i + 1}` })),
})

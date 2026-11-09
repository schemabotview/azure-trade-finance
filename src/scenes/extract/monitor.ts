import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { extractTree } from './tree'
import code from '../../../spine/extract/08-monitor/project/adf/adf.sh?raw'
import session from '../../../spine/extract/08-monitor/session.txt?raw'

// §7.8 — monitoring a run (recorded on Azure). Off screen: the desk's late amendments reached TradeBook, and
// the runtime's service on vm-bank-shir did not come back after the night's patching. The run fails at its
// first activity; the service is started; the run is rerun FROM the failed activity and completes. Every
// status and count is the factory's own.
const rows = (cmd: string) => outputOf(session, cmd).trim().split('\n').map((l) => l.split('\t'))
const failed = rows('bash adf/adf.sh activities $R')
const again = rows('bash adf/adf.sh activities $N')
const state = outputOf(session, 'bash adf/adf.sh online ir-tradebook-shir').trim().split('\n')[0]

export const extractMonitor: SceneModel = ideFrame({
  tree: extractTree('08', 'adf/adf.sh'),
  editor: { file: 'adf/adf.sh', code, show: [[1, 11], [lineOf(code, 'rerun)'), lineOf(code, '--query runId -o tsv ;;', lineOf(code, 'rerun)'))]],
    highlight: [lineOf(code, 'again="referencePipelineRunId')] },
  session,
  keep: ['Failed', ['$ bash adf/adf.sh activities $R', 'lookup_watermark'], ['$ bash adf/adf.sh online', 'Online'], 'Succeeded', ['count_window', 'copy_window']],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'the night’s fault is staged: the runtime’s service was stopped before the run'),
        {
          type: 'group', id: 'runs', bare: true, dir: 'grid', cols: 2, children: [
            {
              type: 'group', id: 'first', title: 'the night’s run: Failed', icon: 'lock', tone: 'consume', children:
                failed.map(([a, s]) => ({ type: 'item' as const, id: `f-${a}`, title: a, sub: s, icon: 'clock', tone: 'consume' as const })),
            },
            {
              type: 'group', id: 'second', title: 'rerun from the failure', icon: 'check', tone: 'store', children:
                again.filter(([a]) => ['lookup_watermark', 'count_window', 'copy_window', 'g1'].includes(a))
                  .map(([a, s]) => ({ type: 'item' as const, id: `s-${a}`, title: a, sub: s, icon: 'check', tone: 'store' as const })),
            },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'when', title: 'Rerun from the failure, or not', tone: 'infra', columns: ['the failure', 'what helps'], rows: [
        { id: 'w-1', cells: [`runtime offline (now ${state})`, 'rerun the failed activity'] },
        { id: 'w-2', cells: ['a gate’s FAIL (§5.6)', 'fix the data, not a rerun'] },
        { id: 'w-3', cells: ['a window that failed', 'the trigger reruns it'] },
        { id: 'w-4', cells: ['TradeBook not answering', 'rerun once it answers'] },
      ],
    },
  ],
  edges: [
    { from: `f-${failed[0][0]}`, to: 's-lookup_watermark', label: 'rerun' },
  ],
})

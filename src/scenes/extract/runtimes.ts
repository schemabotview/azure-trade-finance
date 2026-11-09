import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { extractTree } from './tree'
import code from '../../../spine/extract/02-runtimes/project/infra/shir.tf?raw'
import session from '../../../spine/extract/02-runtimes/session.txt?raw'

// §7.2 — integration runtimes (recorded on Azure). The factory has one runtime of its own making, the
// self-hosted one in the bank; Azure's own runtime is always there and is not listed. Its state, node and
// version are what Data Factory reports.
const [state, node, version] = outputOf(session, 'bash adf/adf.sh status ir-tradebook-shir').trim().split('\n')

export const extractRuntimes: SceneModel = ideFrame({
  tree: extractTree('02', 'infra/shir.tf'),
  editor: { file: 'infra/shir.tf', code, show: [[1, lineOf(code, 'data_factory_id = azurerm_data_factory.main.id', lineOf(code, '"tradebook" {')) + 1]],
    highlight: [lineOf(code, 'resource "azurerm_data_factory_integration_runtime_self_hosted"')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'two', bare: true, dir: 'grid', cols: 2, children: [
            {
              type: 'group', id: 'azure', title: 'Azure’s runtime', icon: 'cloud', tone: 'infra', children: [
                { type: 'item', id: 'a-what', title: 'AutoResolve\u200bIntegration\u200bRuntime' /* break points: the name is one word */, sub: 'always there, never listed', icon: 'cloud' },
                { type: 'item', id: 'a-runs', title: 'runs: If, Fail, the logic', sub: 'and calls to public stores', icon: 'boxes' },
                { type: 'item', id: 'a-not', title: 'cannot reach the bank', sub: 'nothing gets in from Azure', icon: 'lock' },
              ],
            },
            {
              type: 'group', id: 'shir', title: 'ir-tradebook-shir', icon: 'vm', tone: 'store', children: [
                { type: 'item', id: 's-node', title: `${node}: ${state}`, sub: `runtime ${version}`, icon: 'vm' },
                { type: 'item', id: 's-runs', title: 'runs: TradeBook queries', sub: 'and every Copy into landing', icon: 'postgresql' },
                { type: 'item', id: 's-how', title: 'inside the bank', sub: 'it calls out; it is never called', icon: 'network' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'who', title: 'Which runtime runs each of the extract’s activities', tone: 'infra', columns: ['activity', 'touches', 'runtime'], rows: [
        { id: 'r-wm', cells: ['lookup_watermark', 'landing, private', 'bank'] },
        { id: 'r-count', cells: ['count_window', 'TradeBook', 'bank'] },
        { id: 'r-copy', cells: ['copy_window', 'TradeBook → landing', 'bank'] },
        { id: 'r-g1', cells: ['g1 (if), g1_fail', 'nothing outside', 'Azure'] },
        { id: 'r-seal', cells: ['seal', 'landing, private', 'bank'] },
        { id: 'r-commit', cells: ['commit_watermark', 'landing, private', 'bank'] },
      ],
    },
  ],
  edges: [
    { from: 'a-what', to: 'a-runs' },
    { from: 'a-runs', to: 'a-not' },
    { from: 's-node', to: 's-runs' },
    { from: 's-runs', to: 's-how' },
  ],
})

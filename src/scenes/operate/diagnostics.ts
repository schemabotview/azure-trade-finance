import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { opsTree } from './tree'
import session from '../../../spine/operate/01-monitor/session.txt?raw'
import code from '../../../spine/operate/01-monitor/project/infra/monitor.tf?raw'

// §12.1 — diagnostic settings (compiled). Data Factory's pipeline, activity and trigger runs, sent to a Log
// Analytics workspace, a table each.
export const operateDiagnostics: SceneModel = ideFrame({
  tree: opsTree('infra/monitor.tf'),
  editor: { file: 'infra/monitor.tf', code, show: [[lineOf(code, 'resource "azurerm_log_analytics_workspace"'), lineOf(code, 'category = enabled_log.value') + 3]], highlight: [lineOf(code, 'target_resource_id'), lineOf(code, 'for_each = ["PipelineRuns"')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'terraform validate, offline: real, not deployed'),
        {
          type: 'group', id: 'flow', title: 'From the factory to a query', icon: 'workflow', tone: 'ingest', children: [
            { type: 'item', id: 'f-adf', title: 'adf-tradefin-dev', sub: 'every run it makes, and every activity', icon: 'datafactory' },
            { type: 'item', id: 'f-diag', title: 'diag-adf-to-log', sub: 'a diagnostic setting: what to send, where', icon: 'settings' },
            { type: 'item', id: 'f-log', title: 'log-tradefin-dev', sub: 'Log Analytics: 30 days, queried in KQL', icon: 'loganalytics', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'tables', title: 'One table per category', tone: 'store', columns: ['category', 'table', 'one row per'], rows: [
        { id: 't-1', cells: ['PipelineRuns', 'ADFPipelineRun', 'pipeline run'] },
        { id: 't-2', cells: ['ActivityRuns', 'ADFActivityRun', 'activity run'] },
        { id: 't-3', cells: ['TriggerRuns', 'ADFTriggerRun', 'trigger firing'] },
      ],
    },
  ],
  edges: [
    { from: 'f-adf', to: 'f-diag' },
    { from: 'f-diag', to: 'f-log' },
  ],
})

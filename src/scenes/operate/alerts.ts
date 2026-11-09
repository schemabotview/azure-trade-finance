import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { opsTree } from './tree'
import session from '../../../spine/operate/01-monitor/session.txt?raw'
import code from '../../../spine/operate/01-monitor/project/infra/alerts.tf?raw'

// §12.3 — alerts (compiled). Every 15 minutes, the KQL of §12.2 over the last hour; any row → the risk team's
// action group (ag-trade-risk, Course 3).
export const operateAlerts: SceneModel = ideFrame({
  tree: opsTree('infra/alerts.tf'),
  editor: { file: 'infra/alerts.tf', code, show: [[lineOf(code, 'resource "azurerm_monitor_scheduled_query_rules_alert_v2"'), lineOf(code, 'action_groups') + 2]], highlight: [lineOf(code, 'evaluation_frequency'), lineOf(code, 'query                   ='), lineOf(code, 'action_groups')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'terraform validate, offline: real, not deployed'),
        {
          type: 'group', id: 'flow', title: 'Signal → rule → action group', icon: 'workflow', tone: 'consume', children: [
            { type: 'item', id: 'a-sig', title: 'ADFActivityRun rows, Failed', sub: 'the signal: queries/failed.kql', icon: 'loganalytics' },
            { type: 'item', id: 'a-rule', title: 'alert-adf-activity-failed', sub: 'every 15 min, over 1 hour: count > 0', icon: 'bell' },
            { type: 'item', id: 'a-ag', title: 'ag-trade-risk', sub: 'the action group from Course 3', icon: 'users' },
            { type: 'item', id: 'a-mail', title: 'trade-risk@syndicabank.example', sub: 'an email, with the rule and its rows', icon: 'bell', tone: 'consume' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'catch', title: 'What each alarm catches', tone: 'infra', columns: ['a night that…', 'who says so'], rows: [
        { id: 'c-1', cells: ['fails a gate', 'the job’s email (§11.4)'] },
        { id: 'c-2', cells: ['never reaches the job', 'this alert'] },
      ],
    },
  ],
  edges: [
    { from: 'a-sig', to: 'a-rule' },
    { from: 'a-rule', to: 'a-ag' },
    { from: 'a-ag', to: 'a-mail' },
  ],
})

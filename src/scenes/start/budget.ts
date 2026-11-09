import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { INFRA, QUERIES, TRADEBOOK, startTree } from './tree'
import code from '../../../spine/start/08-budget/project/infra/main.tf?raw'
import session from '../../../spine/start/08-budget/session.txt?raw'

// §3.8 — budgets (recorded on Azure). A monthly budget on the resource group, notifying the action group
// at 80% of the FORECAST; the action group emails trade-risk@. The amount is a setting, not a price.
const budget = outputOf(session, 'az consumption budget list -g rg-tradefin-dev --query "[].name" -o tsv').trim().split('\n').at(-1)!
const amount = /amount\s+=\s+(\d+)/.exec(code)![1]
const threshold = /threshold\s+=\s+(\d+)/.exec(code)![1]

export const startBudget: SceneModel = ideFrame({
  tree: startTree([...TRADEBOOK, ...QUERIES, ...INFRA], 'infra/main.tf'),
  editor: { file: 'infra/main.tf', code, show: [[lineOf(code, 'resource "azurerm_monitor_action_group"'), lineOf(code, 'resource "azurerm_monitor_action_group"')], [lineOf(code, 'email_address'), lineOf(code, 'email_address')], [lineOf(code, 'resource "azurerm_consumption_budget'), lineOf(code, 'contact_groups') + 2]],
    highlight: [lineOf(code, 'threshold      ='), lineOf(code, 'threshold_type')] },
  session,
  keep: ['$ cd infra', '$ terraform apply', 'Plan: 2 to add', 'actionGroups/ag-trade-risk', 'Apply complete!', '$ az consumption budget list', budget],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'chain', title: 'Before the money is spent', icon: 'gauge', tone: 'infra', children: [
            { type: 'item', id: 'b-budget', title: budget, sub: `${amount} a month, on rg-tradefin-dev`, icon: 'gauge' },
            { type: 'item', id: 'b-forecast', title: `forecast > ${threshold}%`, sub: 'the month’s spend, projected', icon: 'chart' },
            { type: 'item', id: 'b-group', title: 'ag-trade-risk', sub: 'an action group', icon: 'bell' },
            { type: 'item', id: 'b-mail', title: 'trade-risk@syndicabank.example', sub: 'an email, not a shutdown', icon: 'users', tone: 'consume' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'settings', title: 'The budget, as the code sets it', tone: 'infra', columns: ['setting', 'value'],
      rows: [['amount', amount], ['time_grain', /time_grain\s+=\s+"(\w+)"/.exec(code)![1]], ['threshold', `${threshold}%`],
        ['threshold_type', /threshold_type\s+=\s+"(\w+)"/.exec(code)![1]]].map(([k, v]) => ({ id: `set-${k}`, cells: [k, v] })),
    },
  ],
  edges: [
    { from: 'b-budget', to: 'b-forecast' },
    { from: 'b-forecast', to: 'b-group' },
    { from: 'b-group', to: 'b-mail' },
  ],
})

import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { INFRA, QUERIES, TRADEBOOK, startTree } from './tree'
import code from '../../../spine/start/07-drift/project/infra/main.tf?raw'
import session from '../../../spine/start/07-drift/session.txt?raw'

// §3.7 — what plan does to what is not in code (recorded on Azure). The moved blocks apply with nothing
// created or destroyed; a tag changed with az (owner=ops) is DRIFT: plan shows it going back, apply puts
// it back. The other two cases (in state only → destroy; in Azure only → unseen) are the side pane's.
const owner = outputOf(session, 'az group show -n rg-tradefin-dev --query tags.owner -o tsv').trim()

export const startDrift: SceneModel = ideFrame({
  tree: startTree([...TRADEBOOK, ...QUERIES, ...INFRA], 'infra/main.tf'),
  editor: { file: 'infra/main.tf', code, show: [[lineOf(code, 'locals {'), lineOf(code, 'tags     = local.tags') + 1], [lineOf(code, '# The same resources'), lineOf(code, 'to   = module.storage') + 1]],
    highlight: [lineOf(code, 'tags = { app')] },
  session,
  keep: ['$ terraform apply', 'Apply complete!', ['$ ID=', '$ terraform plan'], '"owner" = "ops" -> "trade-risk"', 'Apply complete! Resources: 0 added, 1 changed', ['$ az group show', owner]],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'loop', title: 'The tag’s night', icon: 'clock', tone: 'infra', children: [
            { type: 'item', id: 'd-code', title: 'code: owner = trade-risk', sub: 'what should be', icon: 'code' },
            { type: 'item', id: 'd-hand', title: 'az tag update: owner = ops', sub: 'a change outside Terraform', icon: 'terminal', tone: 'consume' },
            { type: 'item', id: 'd-back', title: `apply: owner = ${owner}`, sub: 'code wins', icon: 'check', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'cases', title: 'Three cases plan meets', tone: 'ingest', columns: ['case', 'plan says', 'here'], rows: [
        { id: 'c-drift', cells: ['changed in Azure', '~ change back', 'owner=ops'], tone: 'infra' },
        { id: 'c-removed', cells: ['deleted from code', '- destroy', ''] },
        { id: 'c-outside', cells: ['made by hand', 'nothing: unseen', ''] },
      ],
    },
  ],
  edges: [
    { from: 'd-code', to: 'd-hand', label: 'drift' },
    { from: 'd-hand', to: 'd-back', label: 'plan, apply' },
  ],
})

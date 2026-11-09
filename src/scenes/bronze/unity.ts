import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { dbxTree } from '../databricks/tree'
import session from '../../../spine/bronze/01-workspace/session.txt?raw'
import code from '../../../spine/bronze/01-workspace/project/infra/unity.tf?raw'

// §8.3 — Unity Catalog (compiled). One catalog, risk; a schema per zone and one for the audit table: the
// three-level name catalog.schema.table every table of the pipeline gets.
export const bronzeUnity: SceneModel = ideFrame({
  tree: dbxTree('infra/unity.tf'),
  editor: { file: 'infra/unity.tf', code, show: [[lineOf(code, '# The three-level namespace'), lineOf(code, 'name         = each.key') + 1]],
    highlight: [lineOf(code, 'name         = "risk"'), lineOf(code, 'for_each     = toset(["bronze"')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'terraform validate, offline: real, not deployed'),
        {
          type: 'group', id: 'ns', title: 'catalog . schema . table', icon: 'layers', tone: 'ingest', children: [
            { type: 'item', id: 'n-meta', title: 'the metastore', sub: 'one per region, the account’s', icon: 'databricks' },
            { type: 'item', id: 'n-cat', title: 'risk', sub: 'the catalog: the risk team’s data', icon: 'boxes' },
            { type: 'item', id: 'n-sch', title: 'bronze, silver, gold, audit', sub: 'schemas: one per zone, and the gates’ record', icon: 'folder' },
            { type: 'item', id: 'n-tab', title: 'risk.gold.agg_group_exposure', sub: 'a table, by its three-part name', icon: 'layers', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'map', title: 'Local Delta folder → its name in the catalog', tone: 'store', columns: ['on Ana’s laptop', 'in Unity Catalog'], rows: [
        { id: 'm-1', cells: ['lake/bronze/lc_deals', 'risk.bronze.lc_deals'] },
        { id: 'm-2', cells: ['lake/silver/lc_current', 'risk.silver.lc_current'] },
        { id: 'm-3', cells: ['lake/gold/agg_group_exposure', 'risk.gold.agg_group_exposure'] },
        { id: 'm-4', cells: ['lake/audit/gate_results', 'risk.audit.gate_results'] },
      ],
    },
  ],
  edges: [
    { from: 'n-meta', to: 'n-cat' },
    { from: 'n-cat', to: 'n-sch' },
    { from: 'n-sch', to: 'n-tab' },
  ],
})

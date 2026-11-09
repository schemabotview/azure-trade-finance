import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { dbxTree } from '../databricks/tree'
import session from '../../../spine/bronze/01-workspace/session.txt?raw'
import code from '../../../spine/bronze/01-workspace/project/infra/unity.tf?raw'

// §8.4 — reaching the lake (compiled). Access connector (an Azure identity) → a data role on the lake →
// a storage credential → one external location per zone. No key anywhere.
export const bronzeConnector: SceneModel = ideFrame({
  tree: dbxTree('infra/unity.tf'),
  editor: { file: 'infra/unity.tf', code, show: [[lineOf(code, 'resource "azurerm_role_assignment"'), lineOf(code, 'azurerm_databricks_access_connector.lake.identity') + 1], [lineOf(code, 'resource "databricks_storage_credential"'), lineOf(code, 'access_connector_id =') + 2], [lineOf(code, 'resource "databricks_external_location"'), lineOf(code, 'credential_name =') + 1]],
    highlight: [lineOf(code, 'role_definition_name = "Storage Blob Data Contributor"'), lineOf(code, 'access_connector_id =')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'terraform validate, offline: real, not deployed'),
        {
          type: 'group', id: 'chain', title: 'From an identity to a path', icon: 'workflow', tone: 'ingest', children: [
            { type: 'item', id: 'k-ac', title: 'ac-tradefin-dev', sub: 'access connector: Databricks’ Azure identity', icon: 'key' },
            { type: 'item', id: 'k-role', title: 'Storage Blob Data Contributor', sub: 'on the lake: Azure RBAC, as in §4.3', icon: 'shield' },
            { type: 'item', id: 'k-cred', title: 'sc-tradefin-lake', sub: 'storage credential: Unity Catalog’s handle on it', icon: 'lock' },
            { type: 'item', id: 'k-loc', title: 'el-landing … el-gold', sub: 'external locations: abfss://<zone>@sttradefindev', icon: 'adls', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'where', title: 'Where each piece lives', tone: 'infra', columns: ['piece', 'kind', 'managed by'], rows: [
        { id: 'w-1', cells: ['access connector', 'Azure resource', 'Resource Manager'] },
        { id: 'w-2', cells: ['data role', 'Azure RBAC', 'Resource Manager'] },
        { id: 'w-3', cells: ['storage credential', 'Unity Catalog', 'the workspace’s API'] },
        { id: 'w-4', cells: ['external location', 'Unity Catalog', 'the workspace’s API'] },
      ],
    },
  ],
  edges: [
    { from: 'k-ac', to: 'k-role' },
    { from: 'k-role', to: 'k-cred' },
    { from: 'k-cred', to: 'k-loc' },
  ],
})

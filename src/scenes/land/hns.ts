import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { BUILT, mapEditor, mapFrame, mapTerminal } from '../map'
import code from '../../../spine/land/01-hns/project/infra/modules/storage/main.tf?raw'
import session from '../../../spine/land/01-hns/session.txt?raw'

// §5.1 — the storage account and the hierarchical namespace (recorded on Azure, map frame).
// Course 3 made the account without HNS; switching it on is a creation-time choice, so Terraform
// REPLACES the account (and the data role that sits on it): -/+ in the plan. The account's two endpoints are read back: blob, the flat API, and dfs, the
// Data Lake API that HNS adds. The flat-vs-hierarchical table is doc-cited (the URL is in the note).
const hns = outputOf(session, 'az storage account show -n sttradefindev --query isHnsEnabled').trim()
const endpoints = outputOf(session, 'az storage account show -n sttradefindev --query "primaryEndpoints.[blob,dfs]"')
// shown without the account's name (it heads the table's rows already): blob.core… and dfs.core…
const [blob, dfs] = [...endpoints.matchAll(/"https:\/\/[^.]+\.([^/]+)\//g)].map((m) => m[1])

export const landHns: SceneModel = mapFrame({
  built: BUILT.secure,
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    mapEditor('infra/modules/storage/main.tf', code, [[lineOf(code, 'resource "azurerm_storage_account"'), lineOf(code, 'min_tls_version') + 1]],
      [lineOf(code, 'is_hns_enabled'), lineOf(code, 'shared_access_key_enabled')]),
    mapTerminal(session, ['$ terraform apply', 'azurerm_storage_account.lake must be replaced', 'is_hns_enabled', 'Plan:', 'Apply complete!', ['isHnsEnabled', 'dfs.core']]),
    {
      type: 'table', id: 'namespace', title: `isHnsEnabled: ${hns}`, tone: 'store', columns: ['', 'flat namespace', 'hierarchical'], rows: [
        { id: 'ns-path', cells: ['landing/lc_deals/', 'part of each blob’s name', 'a real directory'] },
        { id: 'ns-rename', cells: ['rename a folder', 'copy, then delete, every blob', 'one operation'], tone: 'store' },
        { id: 'ns-api', cells: ['endpoint', blob, dfs] },
      ],
    },
    { type: 'note', id: 'source', tone: 'store', text: 'doc-cited: learn.microsoft.com/azure/storage/blobs/data-lake-storage-namespace' },
  ],
})

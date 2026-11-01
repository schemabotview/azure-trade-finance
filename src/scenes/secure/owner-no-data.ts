import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { secureTree } from './tree'
import code from '../../../spine/secure/04-owner-no-data/project/infra/modules/storage/main.tf?raw'
import session from '../../../spine/secure/04-owner-no-data/session.txt?raw'

// §4.4 — Owner cannot read a blob (recorded on Azure). As Owner, listing CONTAINERS works (a management
// action Owner holds); listing BLOBS is a data action, and is refused. The fix is a data role: Storage Blob
// Data Contributor on this one account (and, for §4.5, Key Vault Secrets Officer on the group).
export const secureOwnerNoData: SceneModel = ideFrame({
  tree: secureTree('infra/modules/storage/main.tf'),
  editor: { file: 'infra/modules/storage/main.tf', code, show: [[lineOf(code, '# Owner manages'), lineOf(code, 'principal_id') + 1]],
    highlight: [lineOf(code, 'role_definition_name = "Storage Blob Data Contributor"')] },
  session,
  keep: [['$ export', '"Storage Blob Data Reader"'], '$ terraform apply', 'Plan: 2 to add', 'Apply complete!'],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    {
      type: 'table', id: 'planes', title: 'Two planes, two kinds of role', tone: 'ingest', columns: ['', 'control plane', 'data plane'], rows: [
        { id: 'pl-what', cells: ['acts on', 'the account, its containers', 'the blobs inside'] },
        { id: 'pl-owner', cells: ['Owner may', 'yes: container list → []', 'no: blob list refused'], tone: 'consume' },
        { id: 'pl-role', cells: ['granted by', 'Owner, Contributor…', 'Storage Blob Data …'], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'fix', title: 'The fix: data roles, narrowly', icon: 'key', tone: 'store', children: [
        { type: 'item', id: 'x-blob', title: 'Storage Blob Data Contributor', sub: 'on sttradefindev only', icon: 'storage' },
        { type: 'item', id: 'x-vault', title: 'Key Vault Secrets Officer', sub: 'on rg-tradefin-dev: for §4.5’s vault', icon: 'keyvault' },
        { type: 'item', id: 'x-wait', title: 'a minute or two', sub: 'before a new role reaches the data plane', icon: 'clock' },
      ],
    },
  ],
  edges: [
    { from: 'x-blob', to: 'x-vault' },
    { from: 'x-vault', to: 'x-wait' },
  ],
})

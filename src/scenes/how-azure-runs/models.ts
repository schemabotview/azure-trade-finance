import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'

// §2.6 — ◆ IaaS, PaaS, SaaS (doc-cited: Microsoft's shared responsibility model). Each part of the pipeline
// placed on the line between what the bank runs and what Microsoft runs.
const row = (id: string, layer: string, cells: string[]) => ({ id, cells: [layer, ...cells] })

export const howModels: SceneModel = {
  dir: 'col',
  nodes: [
    level('doc-cited', 'Microsoft’s shared responsibility model: learn.microsoft.com › azure › security › fundamentals › shared-responsibility'),
    {
      type: 'table', id: 'who', title: 'Who runs each layer', tone: 'infra', columns: ['layer', 'on-premises', 'IaaS', 'PaaS', 'SaaS'], rows: [
        row('r-data', 'data, identities, access', ['the bank', 'the bank', 'the bank', 'the bank']),
        row('r-app', 'application, its settings', ['the bank', 'the bank', 'shared', 'Microsoft']),
        row('r-os', 'operating system, patches', ['the bank', 'the bank', 'Microsoft', 'Microsoft']),
        row('r-net', 'network controls', ['the bank', 'shared', 'shared', 'Microsoft']),
        row('r-phys', 'hosts, datacenter', ['the bank', 'Microsoft', 'Microsoft', 'Microsoft']),
      ],
    },
    {
      type: 'group', id: 'ours', title: 'lc-exposure’s parts, on that line', icon: 'workflow', tone: 'ingest', dir: 'grid', cols: 4, children: [
        { type: 'item', id: 'o-tb', title: 'on-premises', sub: 'TradeBook, the desk', icon: 'postgresql' },
        { type: 'item', id: 'o-iaas', title: 'IaaS', sub: 'the runtime’s Windows VM: the bank patches it', icon: 'vm' },
        { type: 'item', id: 'o-paas', title: 'PaaS', sub: 'storage, Key Vault, Data Factory, Databricks', icon: 'storage' },
        { type: 'item', id: 'o-saas', title: 'SaaS', sub: 'Entra ID, GitHub', icon: 'users' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Whatever the model, the data and who may read it stay the bank’s. That is why Courses 4 and 6 exist.' },
  ],
  edges: [
    { from: 'o-tb', to: 'o-iaas' },
    { from: 'o-iaas', to: 'o-paas' },
    { from: 'o-paas', to: 'o-saas' },
  ],
}

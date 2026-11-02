import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, trim } from '../ide'
import { level } from '../level'
import code from '../../../spine/bronze/01-workspace/project/infra/databricks.tf?raw'
import session from '../../../spine/bronze/01-workspace/session.txt?raw'

// §8.1 — ◆ Databricks' two planes (compiled: terraform validate). The control plane in Databricks' own
// subscription; the compute plane's VMs in ours, injected into Course 6's two subnets, no public IP.
export const bronzePlanes: SceneModel = {
  dir: 'col',
  nodes: [
    level('compiled', 'terraform validate, offline: real, not deployed'),
    {
      type: 'group', id: 'planes', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'control', title: 'control plane: Databricks’ subscription', icon: 'databricks', tone: 'infra', children: [
            { type: 'item', id: 'c-web', title: 'the workspace’s web app and API', sub: 'notebooks, the jobs service', icon: 'globe' },
            { type: 'item', id: 'c-uc', title: 'Unity Catalog', sub: 'who may read which table (§8.3)', icon: 'shield' },
            { type: 'item', id: 'c-sched', title: 'cluster manager', sub: 'starts and stops our VMs', icon: 'settings' },
          ],
        },
        {
          type: 'group', id: 'compute', title: 'compute plane: our subscription', icon: 'cloud', tone: 'store', children: [
            { type: 'item', id: 'p-vnet', title: 'vnet-tradefin-dev', sub: 'snet-dbx-host, snet-dbx-container', icon: 'network' },
            { type: 'item', id: 'p-vms', title: 'cluster VMs, no public IP', sub: 'Spark runs here: our data stays here', icon: 'vm' },
            { type: 'item', id: 'p-lake', title: 'sttradefindev', sub: 'through the private endpoint (§6.4)', icon: 'adls' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'code', bare: true, dir: 'row', children: [
    { type: 'code', id: 'editor', filename: 'infra/databricks.tf', lang: 'hcl', code: trim(code), tone: 'ingest',
      show: [[lineOf(code, 'resource "azurerm_databricks_workspace"'), lineOf(code, 'private_subnet_name')]],
      highlight: [lineOf(code, 'no_public_ip        = true'), lineOf(code, 'virtual_network_id')] },
    { type: 'code', id: 'terminal', terminal: true, filename: 'terminal — lc-exposure', code: trim(session) },
      ],
    },
  ],
  edges: [
    { from: 'c-sched', to: 'p-vms', label: 'start, stop' },
  ],
}

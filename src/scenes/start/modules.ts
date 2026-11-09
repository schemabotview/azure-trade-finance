import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { INFRA, QUERIES, TRADEBOOK, startTree } from './tree'
import code from '../../../spine/start/06-modules/project/infra/main.tf?raw'
import session from '../../../spine/start/06-modules/session.txt?raw'

// §3.6 — variables and modules (compiled: offline, nothing deployed). main.tf takes `env` and calls
// ./modules/storage; two `moved` blocks say the resources only changed address (§3.7 applies them:
// nothing is re-created). fmt, validate and the file tree are the session's.
const files = outputOf(session, "find . -name '*.tf*' -not -path './.terraform/*' | sort").trim().split('\n')

export const startModules: SceneModel = ideFrame({
  tree: startTree([...TRADEBOOK, ...QUERIES, ...INFRA], 'infra/main.tf', { fresh: ['infra/variables.tf', 'infra/envs/dev.tfvars', 'infra/modules/storage/main.tf', 'infra/modules/storage/variables.tf', 'infra/modules/storage/outputs.tf'] }),
  editor: { file: 'infra/main.tf', code, show: [[lineOf(code, 'module "storage"'), lineOf(code, 'to   = module.storage') + 1]],
    highlight: [lineOf(code, 'source              ='), lineOf(code, 'name                = "sttradefin'), lineOf(code, 'moved {')] },
  session,
  keep: ['$ terraform fmt', 'formatted', 'Success!', ['$ find', './variables.tf']],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'terraform fmt and validate: real, offline, nothing deployed'),
        {
          type: 'group', id: 'flow', title: 'One root module, one child', icon: 'boxes', tone: 'ingest', children: [
            { type: 'item', id: 'm-vars', title: 'envs/dev.tfvars', sub: 'env = "dev"', icon: 'file' },
            { type: 'item', id: 'm-root', title: 'main.tf (root)', sub: 'names from env; tags in one place', icon: 'code' },
            { type: 'item', id: 'm-storage', title: 'modules/storage', sub: 'inputs: name, group, location, tags', icon: 'storage', tone: 'store' },
          ],
        },
      ],
    },
    { type: 'table', id: 'files', title: 'infra/, as found', tone: 'infra', columns: ['file'], rows: files.map((f) => ({ id: `f-${f}`, cells: [f] })) },
  ],
  edges: [
    { from: 'm-vars', to: 'm-root', label: 'var.env' },
    { from: 'm-root', to: 'm-storage', label: 'inputs' },
  ],
})

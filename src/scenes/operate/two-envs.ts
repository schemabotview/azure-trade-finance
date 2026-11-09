import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'
import { lineOf } from '../ide'
import { BUILT, mapEditor, mapFrame, mapTerminal } from '../map'
import code from '../../../spine/operate/05-two-environments/project/infra/backend.tf?raw'
import session from '../../../spine/operate/05-two-environments/session.txt?raw'

// §12.5 — two environments (compiled: validated offline, not deployed). One root module; each environment is
// a .tfvars and a backend key, so dev and prod share every line of code and never a state file.
export const operateTwoEnvs: SceneModel = mapFrame({
  built: BUILT.operate,
  side: [
    level('compiled', 'validated offline: real, not deployed'),
    mapEditor('infra/backend.tf', code, [[lineOf(code, 'backend "azurerm"'), lineOf(code, 'use_azuread_auth')]]),
    mapTerminal(session, ['$ cd infra', 'key = "dev.tfstate"', 'key = "prod.tfstate"', ['$ terraform validate', 'Success!']]),
    {
      type: 'group', id: 'envs', title: 'One module, two environments', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'e-code', title: 'infra/: one root module', sub: 'every resource, written once', icon: 'code', stack: true },
        {
          type: 'group', id: 'e-files', bare: true, children: [
            { type: 'item', id: 'e-dev', title: 'dev.tfvars + dev.backend.hcl', sub: 'dev.tfstate · sub-tradefin-dev', icon: 'file' },
            { type: 'item', id: 'e-prod', title: 'prod.tfvars + prod.backend.hcl', sub: 'prod.tfstate · its own subscription', icon: 'file', tone: 'consume' },
          ],
        },
      ],
    },
  ],
  edges: [
    { from: 'e-code', to: 'e-dev' },
    { from: 'e-code', to: 'e-prod' },
  ],
})

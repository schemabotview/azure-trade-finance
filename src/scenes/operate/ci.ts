import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { opsTree } from './tree'
import session from '../../../spine/operate/01-monitor/session.txt?raw'
import code from '../../../spine/operate/01-monitor/project/.github/workflows/terraform.yml?raw'
import tf from '../../../spine/operate/01-monitor/project/infra/oidc.tf?raw'

// §12.6 — CI with no stored secret (compiled: the Terraform validated; the workflow shown, not run). GitHub
// signs a token for the run; Entra ID trusts it for this repository's main branch through a federated
// credential on a managed identity.
const subject = /subject\s*=\s*"([^"]+)"/.exec(tf)![1]

export const operateCi: SceneModel = ideFrame({
  tree: opsTree('.github/workflows/terraform.yml'),
  editor: { file: '.github/workflows/terraform.yml', lang: 'shell', code, show: [[lineOf(code, 'permissions:'), lineOf(code, 'subscription-id:')]],
    highlight: [lineOf(code, 'id-token: write'), lineOf(code, 'uses: azure/login@v2')] },
  session,
  side: [
    level('compiled', 'the identity validated in Terraform; the workflow shown, not run'),
    {
      type: 'group', id: 'flow', title: 'A token, not a secret', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'o-gh', title: 'GitHub Actions, on main', sub: 'asks GitHub for the run’s OIDC token', icon: 'githubactions' },
        { type: 'item', id: 'o-entra', title: 'Entra ID', sub: `trusts it only for ${subject.endsWith('refs/heads/main') ? 'this repository’s main branch' : subject}`, icon: 'users' },
        { type: 'item', id: 'o-id', title: 'id-tradefin-deploy', sub: 'a managed identity, with its federated credential', icon: 'key' },
        { type: 'item', id: 'o-tf', title: 'terraform plan, apply', sub: 'Contributor on rg-tradefin-dev, nothing more', icon: 'code', tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'Nothing secret is stored in GitHub: the three ids are variables, and a token lives minutes, for one run.' },
  ],
  edges: [
    { from: 'o-gh', to: 'o-entra', label: 'token' },
    { from: 'o-entra', to: 'o-id' },
    { from: 'o-id', to: 'o-tf' },
  ],
})

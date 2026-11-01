import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, terminal, trim } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import code from '../../../spine/secure/03-rbac/project/infra/main.tf?raw'
import session from '../../../spine/secure/03-rbac/session.txt?raw'

// §4.3 — ◆ full scene: RBAC (recorded on Azure). An assignment is WHO × WHAT × WHERE; a role given at a
// scope applies to everything beneath it. The subscription's two Owner assignments (the owner, and the
// recording's service principal) are inherited by the resource group, which holds its own Reader for the
// pipeline's identity: the session lists each scope, then the group with inheritance.
const roles = (cmd: string) => outputOf(session, cmd).trim().split('\n')
const atSub = roles('az role assignment list --scope $SUB --query "$Q" -o tsv')
const atRg = roles('az role assignment list --scope $RG --query "$Q" -o tsv')
const inherited = roles('az role assignment list --scope $RG --include-inherited --query "$Q" -o tsv')
const rows = terminal(session).split('\n')
const from = rows.findIndex((l) => l.startsWith('$ SUB=')) + 1

export const secureRbac: SceneModel = {
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'scopes', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'sub', icon: 'cloud', title: 'subscription · sub-tradefin-dev', sub: `${atSub.length} assignments here: ${atSub.join(', ')}`, dashed: true, children: [
            {
              type: 'group', id: 'rg', icon: 'boxes', title: 'resource group · rg-tradefin-dev', sub: `here: ${atRg.join(', ')} · with inherited: ${inherited.join(', ')}`, tone: 'infra', children: [
                { type: 'item', id: 'mi', title: 'id-tradefin-pipeline', sub: 'Reader: may see, may not change', icon: 'key', tone: 'store' },
                { type: 'item', id: 'st', title: 'sttradefindev', sub: 'nothing of its own yet: §4.4', icon: 'storage' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'right', bare: true, children: [
        { type: 'code', id: 'editor', filename: 'infra/main.tf', lang: 'hcl', code: trim(code), tone: 'ingest',
          show: [[lineOf(code, '# RBAC is three things'), lineOf(code, 'principal_id         = azurerm_user_assigned_identity.pipeline.principal_id', lineOf(code, '# RBAC')) + 1]] },
        { type: 'code', id: 'terminal', terminal: true, filename: 'terminal — lc-exposure', code: rows.join('\n'), show: [[from, rows.length]] },
        {
          type: 'table', id: 'parts', title: 'An assignment, in three parts', tone: 'infra', columns: ['part', 'here'], rows: [
            { id: 'p-who', cells: ['who: a principal', 'id-tradefin-pipeline'] },
            { id: 'p-what', cells: ['what: a role', 'Reader (a list of allowed actions)'] },
            { id: 'p-where', cells: ['where: a scope', 'rg-tradefin-dev, and all inside it'], tone: 'infra' },
          ],
        },
      ],
    },
  ],
  edges: [],
}

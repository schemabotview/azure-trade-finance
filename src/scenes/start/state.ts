import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { INFRA_FLAT, QUERIES, TRADEBOOK, startTree } from './tree'
import code from '../../../spine/start/05-state/project/infra/backend.tf?raw'
import session from '../../../spine/start/05-state/session.txt?raw'

// §3.5 — state, and where it lives (recorded on Azure). bootstrap.sh makes the state's home with the CLI
// (the one thing the CLI creates); init -migrate-state moves the local file there; the blob's LEASE is
// Terraform's lock: a lease taken by hand makes the next plan fail, breaking it lets the plan run.
const blob = outputOf(session, 'az storage blob list -c tfstate --query "[].name" -o tsv').trim()

export const startState: SceneModel = ideFrame({
  tree: startTree([...TRADEBOOK, ...QUERIES, ...INFRA_FLAT, 'infra/backend.tf', 'infra/bootstrap.sh'], 'infra/backend.tf', { fresh: ['infra/backend.tf', 'infra/bootstrap.sh'] }),
  editor: { file: 'infra/backend.tf', code, highlight: [lineOf(code, 'storage_account_name'), lineOf(code, 'key '), lineOf(code, 'use_azuread_auth')] },
  session,
  keep: ['$ bash infra/bootstrap.sh', 'state: ', ['$ az storage blob lease acquire', '$ terraform plan -lock-timeout'], 'Error message:', '$ az storage blob lease break', 'No changes.'],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'three', title: 'Three things Terraform compares', icon: 'workflow', tone: 'ingest', children: [
            { type: 'item', id: 'c-code', title: 'the code', sub: 'infra/*.tf: what should exist', icon: 'code' },
            { type: 'item', id: 'c-state', title: 'the state', sub: `tfstate/${blob} in sttradefintfstate`, icon: 'database', tone: 'infra' },
            { type: 'item', id: 'c-azure', title: 'Azure', sub: 'what does exist', icon: 'cloud' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'where', title: 'Where the state lives', tone: 'infra', columns: ['', 'laptop, §3.4', 'blob, now'], rows: [
        { id: 'w-who', cells: ['who has it', 'one person', 'all who may'] },
        { id: 'w-lock', cells: ['two applies', 'nothing stops', 'one waits'], tone: 'infra' },
        { id: 'w-read', cells: ['read with', 'file system', 'an identity'] },
      ],
    },
  ],
  edges: [
    { from: 'c-code', to: 'c-state', label: 'plan reads' },
    { from: 'c-state', to: 'c-azure', label: 'refresh' },
  ],
})

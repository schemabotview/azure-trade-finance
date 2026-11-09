import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { networkTree } from './tree'
import code from '../../../spine/network/03-public-off/project/infra/modules/storage/main.tf?raw'
import session from '../../../spine/network/03-public-off/session.txt?raw'

// §6.3 — public access off (recorded on Azure). Before: Ana's laptop lists the zones over the internet.
// The account's public endpoint is disabled (one attribute, changed in place); after: the same command is
// blocked by the account's network rules. Identity was not enough to keep the data private; now the path
// is closed too.
const state = outputOf(session, 'az storage account show -n sttradefindev --query publicNetworkAccess -o tsv').trim()
const before = outputOf(session, 'az storage fs list --query "[].name" -o tsv').trim().split('\n').length

export const networkPublicOff: SceneModel = ideFrame({
  tree: networkTree('infra/modules/storage/main.tf'),
  editor: { file: 'infra/modules/storage/main.tf', code, show: [[lineOf(code, 'resource "azurerm_storage_account"'), lineOf(code, 'public_network_access ') + 1]],
    highlight: [lineOf(code, 'public_network_access ')] },
  session,
  keep: ['$ az storage fs list', 'silver', '$ terraform apply', 'Apply complete!', ['$ az storage account show', 'blocked by network rules']],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'layers', title: 'Two locks on the same door', icon: 'lock', tone: 'infra', children: [
            { type: 'item', id: 'l-net', title: 'the network', sub: 'where may a request come from? (this section)', icon: 'network', tone: 'infra' },
            { type: 'item', id: 'l-id', title: 'the identity', sub: 'who is asking? (Course 4)', icon: 'key' },
            { type: 'item', id: 'l-role', title: 'the role', sub: 'what may they do? (Course 4)', icon: 'shield' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'before', title: 'From the laptop: az storage fs list, twice', tone: 'consume', columns: ['', 'result'], rows: [
        { id: 'b-1', cells: ['before', `${before} zones listed`] },
        { id: 'b-2', cells: [`after (${state})`, 'blocked by network rules'], tone: 'consume' },
      ],
    },
  ],
  edges: [
    { from: 'l-net', to: 'l-id' },
    { from: 'l-id', to: 'l-role' },
  ],
})

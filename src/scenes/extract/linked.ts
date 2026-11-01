import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { extractTree } from './tree'
import code from '../../../spine/extract/03-linked-service/project/infra/adf-tradebook.tf?raw'
import session from '../../../spine/extract/03-linked-service/session.txt?raw'

// §7.3 — a linked service to TradeBook (recorded on Azure). TradeBook stands in as a PostgreSQL VM in the
// simulated bank network, peered to the lake's VNet (the VPN's stand-in). The linked service goes through the
// bank's runtime and reads its password from Key Vault at run time; the ping's answer is TradeBook's own.
const ping = JSON.parse(outputOf(session, 'bash adf/adf.sh activities $R').trim().split('\t')[2])

export const extractLinked: SceneModel = ideFrame({
  tree: extractTree('03', 'infra/adf-tradebook.tf'),
  editor: { file: 'infra/adf-tradebook.tf', code, show: [[lineOf(code, '# azurerm 5.12'), lineOf(code, '# reads, Course 2)')], [lineOf(code, 'type = "PostgreSqlV2"'), lineOf(code, 'type = "AzureKeyVaultSecret"')]],
    highlight: [...linesFrom(code, 'connectVia = {', 'referenceName = local.ir'), lineOf(code, 'type = "AzureKeyVaultSecret"')] },
  session,
  keep: ['Apply complete!', '$ az vm run-command invoke $T', 'status: done', ['$ R=$(bash adf/adf.sh run', ping.lcs + ',']],
  side: [
    level('recorded on Azure', 'TradeBook stands in: a PostgreSQL VM in the simulated bank network'),
    {
      type: 'group', id: 'path', title: 'How the factory reaches TradeBook', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'p-kv', title: 'kv-tradefin-dev', sub: 'tradebook-adf-password', icon: 'keyvault' },
        { type: 'item', id: 'p-adf', title: 'adf-tradefin-dev', sub: 'pl_tradebook_ping: one Lookup', icon: 'datafactory' },
        { type: 'item', id: 'p-shir', title: 'ir-tradebook-shir', sub: 'asks for work, runs the query', icon: 'vm' },
        { type: 'item', id: 'p-tb', title: `TradeBook: ${ping.lcs} LCs`, sub: 'PostgreSQL, 10.10.1.10:5432', icon: 'postgresql', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'built', title: 'What the apply built (12)', tone: 'infra', columns: ['piece', 'for'], rows: [
        { id: 'b-vm', cells: ['vm-bank-tradebook, its NIC', 'TradeBook, in the bank'] },
        { id: 'b-peer', cells: ['two peerings, two DNS links', 'the bank ↔ the lake, privately'] },
        { id: 'b-kv', cells: ['a secret, two passwords', 'the factory’s login'] },
        { id: 'b-adf', cells: ['ls_tradebook (ARM), a dataset', 'the factory’s view of TradeBook'] },
        { id: 'b-pl', cells: ['pl_tradebook_ping', 'one Lookup: can we reach it?'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'The password is never in the linked service: the factory reads it from the vault at run time, as the pipeline’s identity.' },
  ],
  edges: [
    { from: 'p-kv', to: 'p-adf', label: 'password' },
    { from: 'p-adf', to: 'p-shir', label: 'work' },
    { from: 'p-shir', to: 'p-tb', label: '5432' },
  ],
})

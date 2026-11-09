import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { extractTree } from './tree'
import code from '../../../spine/extract/01-adf-parts/project/infra/adf-links.tf?raw'
import session from '../../../spine/extract/01-adf-parts/session.txt?raw'

// §7.1 — Data Factory's parts (recorded on Azure). The factory already exists (§6.6); this step gives it its
// first connections: the pipeline identity as a credential, linked services to Key Vault and the lake, and
// the landing datasets. The names and types are what Data Factory reports.
const rows = (cmd: string) => outputOf(session, cmd).trim().split('\n').map((l) => l.split('\t'))
const links = rows('bash adf/adf.sh get linkedservices --query "$Q" -o tsv')
const sets = rows('bash adf/adf.sh get datasets --query "$Q" -o tsv')

export const extractParts: SceneModel = ideFrame({
  tree: extractTree('01', 'infra/adf-links.tf'),
  editor: { file: 'infra/adf-links.tf', code, show: [[1, 5], [lineOf(code, '# The lake, also through'), lineOf(code, '# The pipeline may write') - 2]],
    highlight: [lineOf(code, 'integration_runtime {'), lineOf(code, 'credential = local.as_me')] },
  session,
  keep: ['$ terraform apply', 'Apply complete!', ['$ Q=', sets.at(-1)![0]]],
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'group', id: 'model', title: 'How a factory is put together', icon: 'datafactory', tone: 'ingest', children: [
            { type: 'item', id: 'm-pipe', title: 'pipeline', sub: 'a unit of work: run, scheduled, monitored', icon: 'workflow' },
            { type: 'item', id: 'm-act', title: 'activities', sub: 'Lookup, Copy, If, Fail: one step each', icon: 'boxes' },
            { type: 'item', id: 'm-ds', title: `datasets: ${sets.map((s) => s[0]).join(', ')}`, sub: 'named data inside a store', icon: 'file' },
            { type: 'item', id: 'm-ls', title: `linked services: ${links.map((s) => s[0]).join(', ')}`, sub: 'how to reach a store, and as whom', icon: 'key' },
            { type: 'item', id: 'm-ir', title: 'an integration runtime', sub: 'the compute that does the reaching', icon: 'vm', tone: 'store' },
          ],
        },
      ],
    },
  ],
  edges: [
    { from: 'm-pipe', to: 'm-act' },
    { from: 'm-act', to: 'm-ds' },
    { from: 'm-ds', to: 'm-ls' },
    { from: 'm-ls', to: 'm-ir' },
  ],
})

import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { level } from '../level'
import { dbxTree } from '../databricks/tree'
import session from '../../../spine/bronze/01-workspace/session.txt?raw'
import code from '../../../spine/bronze/01-workspace/project/infra/pipelines/pl_nightly.json?raw'

// §11.5 — the ADF parent (compiled). pl_nightly runs Course 7's extract, then the Databricks job, through a
// linked service that signs in as the factory's identity.
export const orchestrateParent: SceneModel = ideFrame({
  tree: dbxTree('infra/pipelines/pl_nightly.json'),
  editor: { file: 'infra/pipelines/pl_nightly.json', lang: 'js', code, show: [[lineOf(code, '"name": "extract"'), lineOf(code, '"type": "ExecutePipeline"')], [lineOf(code, '"waitOnCompletion": true'), lineOf(code, '"waitOnCompletion": true')], [lineOf(code, '"name": "lc_exposure"'), lineOf(code, '"name": "lc_exposure"') + 1], [lineOf(code, '"activity": "extract"'), lineOf(code, '"Succeeded"')], [lineOf(code, '"jobId": {'), lineOf(code, '"jobId": {') + 1]],
    highlight: [lineOf(code, '"type": "ExecutePipeline"'), lineOf(code, '"type": "DatabricksJob"')] },
  session,
  side: [
    {
      type: 'group', id: 'diagram', bare: true, children: [
        level('compiled', 'terraform validate, offline: real, not deployed'),
        {
          type: 'group', id: 'parent', title: 'pl_nightly', icon: 'datafactory', tone: 'ingest', children: [
            { type: 'item', id: 'p-trig', title: 'tr_nightly_0200', sub: 'the window, its batch, the job’s id', icon: 'clock' },
            { type: 'item', id: 'p-ext', title: 'extract: pl_extract', sub: 'copy, G1, seal, watermark (Course 7)', icon: 'datafactory' },
            { type: 'item', id: 'p-job', title: 'lc_exposure: run the Databricks job', sub: 'only if the extract succeeded', icon: 'databricks' },
            { type: 'item', id: 'p-gold', title: 'Gold, published or held', sub: 'G2–G4 inside the job', icon: 'layers', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'own', title: 'Who owns which part of the night', tone: 'infra', columns: ['part', 'owns'], rows: [
        { id: 'o-1', cells: ['tr_nightly_0200', 'when, and which window'] },
        { id: 'o-2', cells: ['pl_extract', 'the batch: landed, checked, sealed'] },
        { id: 'o-3', cells: ['the Databricks job', 'the gates and Gold'] },
      ],
    },
  ],
  edges: [
    { from: 'p-trig', to: 'p-ext' },
    { from: 'p-ext', to: 'p-job' },
    { from: 'p-job', to: 'p-gold' },
  ],
})

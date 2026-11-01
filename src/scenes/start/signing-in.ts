import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'
import { BUILT, mapFrame, mapTerminal } from '../map'
import session from '../../../spine/start/03-signing-in/session.txt?raw'

// §3.3 — signing in (recorded on Azure, map frame). Ana is signed in (az login, before the frame);
// the subscription is the course's, normalised to sub-tradefin-dev. Nothing named *tradefin* exists
// yet: the whole map is grey. The naming rule and the tags are the plan's (Facts).
export const startSigningIn: SceneModel = mapFrame({
  built: BUILT['how-azure-runs'],
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    mapTerminal(session),
    {
      type: 'table', id: 'names', title: 'Names say what, which app, which environment', tone: 'infra', columns: ['prefix', 'kind', 'here'], rows: [
        { id: 'n-rg', cells: ['rg-', 'resource group', 'rg-tradefin-dev'] },
        { id: 'n-st', cells: ['st', 'storage account', 'sttradefindev'] },
        { id: 'n-kv', cells: ['kv-', 'key vault', 'kv-tradefin-dev'] },
        { id: 'n-adf', cells: ['adf-', 'data factory', 'adf-tradefin-dev'] },
      ],
    },
    {
      type: 'table', id: 'tags', title: 'Tags on everything', tone: 'infra', columns: ['tag', 'value', 'answers'], rows: [
        { id: 't-app', cells: ['app', 'lc-exposure', 'what is this for?'] },
        { id: 't-env', cells: ['env', 'dev', 'can I delete it?'] },
        { id: 't-owner', cells: ['owner', 'trade-risk', 'who pays, who to call?'] },
      ],
    },
  ],
})

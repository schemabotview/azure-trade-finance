import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'

// §1.1 — ◆ a letter of credit, in one picture (doc-cited: the documentary credit as the ICC's UCP 600
// defines it). Goods go one way, documents and money the other; the issuing bank's promise to pay
// against complying documents is what the bank is exposed to until the LC closes.
export const introLc: SceneModel = {
  dir: 'col',
  nodes: [
    level('doc-cited', 'the documentary credit as the ICC’s Uniform Customs and Practice (UCP 600) defines it'),
    {
      type: 'group', id: 'parties', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'buyer', title: 'the importer’s side', icon: 'building', tone: 'ingest', children: [
            { type: 'item', id: 'importer', title: 'the importer', sub: 'the applicant: Woodgrove Retail Ltd', icon: 'building' },
            { type: 'item', id: 'issuer', title: 'the issuing bank', sub: 'Syndica Bank: promises to pay', icon: 'shield', tone: 'consume' },
          ],
        },
        {
          type: 'group', id: 'seller', title: 'the exporter’s side', icon: 'globe', tone: 'store', children: [
            { type: 'item', id: 'exporter', title: 'the exporter', sub: 'the beneficiary: ships the goods', icon: 'package' },
            { type: 'item', id: 'advising', title: 'the advising bank', sub: 'passes the LC on, and the documents back', icon: 'building' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'life', title: 'One LC’s life, and the bank’s exposure', icon: 'clock', tone: 'consume', dir: 'row', children: [
        { type: 'item', id: 'l-issued', title: 'ISSUED', sub: 'the promise is made', icon: 'file' },
        { type: 'item', id: 'l-amended', title: 'AMENDED', sub: 'amount or terms change', icon: 'settings' },
        { type: 'item', id: 'l-paid', title: 'documents presented', sub: 'the bank pays the exporter', icon: 'check' },
        { type: 'item', id: 'l-closed', title: 'CLOSED / EXPIRED', sub: 'nothing left to pay', icon: 'lock', tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Until the LC closes, the bank owes its amount whatever the importer does. That open amount is the exposure this film computes, every night.' },
  ],
  edges: [
    { from: 'importer', to: 'issuer', label: 'applies' },
    { from: 'issuer', to: 'advising', label: 'issues the LC' },
    { from: 'advising', to: 'exporter', label: 'advises' },
    { from: 'l-issued', to: 'l-amended' },
    { from: 'l-amended', to: 'l-paid' },
    { from: 'l-paid', to: 'l-closed' },
  ],
}

import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { BUILT, mapEditor, mapFrame, mapTerminal } from '../map'
import code from '../../../spine/land/02-zones/project/infra/modules/storage/main.tf?raw'
import session from '../../../spine/land/02-zones/session.txt?raw'

// §5.2 — containers as zones (recorded on Azure, map frame). One for_each makes five containers (ADLS
// file systems) through the control plane. The data plane then lists them and makes a real directory,
// lc_deals/batch_id=42: two directories, which a flat namespace does not have.
const zones = outputOf(session, 'az storage fs list --query "[].name" -o tsv').trim().split('\n')
const HOLDS: Record<string, [string, string]> = {
  landing: ['TradeBook’s batches, as delivered', '§5.3'],
  bronze: ['every version received, as Delta', 'Course 8'],
  silver: ['one current row per LC', 'Course 9'],
  gold: ['exposure by group and currency', 'Course 10'],
  reference: ['the risk team’s mapping and limits', '§5.8'],
}

export const landZones: SceneModel = mapFrame({
  built: BUILT.land,
  side: [
    level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
    mapEditor('infra/modules/storage/main.tf', code, [[lineOf(code, 'resource "azurerm_storage_container"'), lineOf(code, 'for_each')]], [lineOf(code, 'for_each')]),
    mapTerminal(session, ['$ az storage fs list', ['$ az storage fs directory create', 'batch_id=42']]),
    {
      type: 'table', id: 'zones', title: 'sttradefindev: five zones', tone: 'store', columns: ['container', 'holds', 'filled in'],
      rows: zones.map((z) => ({ id: `z-${z}`, cells: [z, ...(HOLDS[z] ?? ['', ''])], tone: z === 'landing' ? 'store' as const : undefined })),
    },
  ],
})

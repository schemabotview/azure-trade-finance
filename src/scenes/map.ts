import type { Code, Edge, Group, Item, SceneModel, SceneNode } from '@graphlearning/graphl-flow'
import { keepLines, terminal, trim, type Keep } from './ide'

// THE PIPELINE'S MAP — ported from aws-ecommerce's map.ts, drawn the way Azure draws its own: the
// subscription and its resource group as boundaries; inside, the VNet with its subnets, the storage
// account whose containers ARE the zones (landing → Bronze → Silver → Gold, the gates G1–G4 on the
// arrows between them), and the platform services along the bottom. TradeBook sits outside, in the
// bank's own network.
//
// It is the WHOLE finished pipeline from its first appearance to the end. A part not built yet is
// drawn — same size, same place — greyed (graphl-flow's `muted`), so the map never moves and a
// section shows what it ADDS by colour and by its `focus` ring, not by layout. check-render asserts
// every map frame lands on one fit.
//
// `BUILT[course]` is what exists at the END of that course — extend it as courses are authored, and
// never rename a part: section focus and later scenes name these ids.

interface Part { id: string; icon: string; title: string; sub?: string }
const p = (id: string, icon: string, title: string, sub?: string): Part => ({ id, icon, title, sub })

const TRADEBOOK = p('tradebook', 'postgresql', 'TradeBook', 'PostgreSQL · the desk')
const DESK = p('risk-desk', 'users', 'Risk, each morning', 'exposure by group')
const ZONES = [
  p('landing', 'adls', 'landing', 'batch_id=42/ + manifest'),
  p('bronze', 'layers', 'bronze', 'every version, raw'),
  p('silver', 'layers', 'silver', 'one row per LC'),
  p('gold', 'layers', 'gold', 'G4 reconciles, then publishes'),
]
const REFERENCE = p('reference', 'adls', 'reference', 'mapping, limits')
const SUBNETS: [string, string, Part][] = [
  ['snet-shir', '10.30.2.0/24', p('shir', 'vm', 'Self-hosted IR', 'ir-tradebook-shir')],
  ['snet-pe', '10.30.1.0/24', p('pe-storage', 'network', 'Private endpoints', 'storage, key vault')],
  ['snet-dbx', '10.30.8.0/22 ×2', p('dbx-compute', 'databricks', 'Databricks compute', 'job clusters')],
]
const SERVICES = [
  p('adf', 'datafactory', 'Data Factory', 'adf-tradefin-dev'),
  p('dbw', 'databricks', 'Databricks', 'dbw-tradefin-dev'),
  p('keyvault', 'keyvault', 'Key Vault', 'kv-tradefin-dev'),
  p('connector', 'key', 'Access connector', 'ac-tradefin-dev'),
]
const CONTROLS = [
  p('entra', 'users', 'Entra ID', 'grp-trade-risk-eng'),
  p('policy', 'shield', 'Policy', 'locations, tags'),
  p('budget', 'gauge', 'Budget', '80% forecast'),
  p('logs', 'loganalytics', 'Log Analytics', 'diagnostics, KQL'),
  p('alerts', 'bell', 'Action group', 'ag-trade-risk'),
]

/** What exists at the end of each course (cumulative). Courses 1–2 build nothing. */
export const BUILT: Record<string, string[]> = { intro: [], 'how-azure-runs': [] }
BUILT.start = ['tradebook', 'rg', 'storage', 'budget']
BUILT.secure = [...BUILT.start, 'entra', 'keyvault', 'policy']
// §5.2 makes all five zones as containers; what fills bronze, silver and gold comes in Courses 8–10
BUILT.land = [...BUILT.secure, 'landing', 'bronze', 'silver', 'gold', 'reference', 'g1']
BUILT.network = [...BUILT.land, 'vnet', 'snet-shir', 'snet-pe', 'snet-dbx', 'shir', 'pe-storage']
BUILT.extract = [...BUILT.network, 'adf']
BUILT.bronze = [...BUILT.extract, 'dbw', 'dbx-compute', 'connector', 'bronze', 'g2']
BUILT.silver = [...BUILT.bronze, 'silver', 'g3']
BUILT.gold = [...BUILT.silver, 'gold', 'g4', 'risk-desk']
BUILT.orchestrate = [...BUILT.gold, 'alerts']
BUILT.operate = [...BUILT.orchestrate, 'logs']

/** The map, given what exists. What a section adds is ringed by the section's `focus`. */
export function pipelineMap(built: string[]): SceneNode {
  const later = (id: string) => !built.includes(id) || undefined
  const it = (part: Part): Item => ({ type: 'item', id: part.id, title: part.title, sub: part.sub, icon: part.icon, muted: later(part.id) })
  const onprem: Group = {
    type: 'group', id: 'onprem', icon: 'building', title: 'Syndica Bank', sub: 'on-premises', dashed: true, children: [it(TRADEBOOK), it(DESK)],
  }
  const vnet: Group = {
    type: 'group', id: 'vnet', icon: 'network', title: 'vnet-tradefin-dev', sub: '10.30.0.0/16', tone: 'infra', muted: later('vnet'),
    children: SUBNETS.map(([id, cidr, part]) => ({ type: 'group', id, title: id, sub: cidr, muted: later(id), children: [it(part)] } as Group)),
  }
  const storage: Group = {
    type: 'group', id: 'storage', icon: 'storage', title: 'sttradefindev', sub: 'ADLS Gen2', tone: 'store', muted: later('storage'),
    children: [...ZONES.map(it), it(REFERENCE)],
  }
  const services: Group = { type: 'group', id: 'services', bare: true, children: SERVICES.map(it) }
  const rg: Group = {
    type: 'group', id: 'rg', icon: 'boxes', title: 'rg-tradefin-dev', sub: 'uksouth', dir: 'row', muted: later('rg'),
    children: [vnet, storage, services],
  }
  const controls: Group = { type: 'group', id: 'controls', bare: true, dir: 'grid', cols: CONTROLS.length, span: 'all', children: CONTROLS.map(it) }
  const sub: Group = {
    type: 'group', id: 'subscription', icon: 'cloud', title: 'sub-tradefin-dev', sub: 'subscription', dashed: true, dir: 'grid', cols: 1,
    children: [rg, controls],
  }
  return { type: 'group', id: 'map', bare: true, dir: 'row', children: [onprem, sub] }
}

/** The data's path, always drawn: an arrow into a part not built yet is still where it will run.
 *  The gates sit on the arrows between the zones. */
export const MAP_EDGES: Edge[] = [
  { from: 'tradebook', to: 'shir' },
  { from: 'shir', to: 'landing' },
  { from: 'landing', to: 'bronze', label: 'G1' },
  { from: 'bronze', to: 'silver', label: 'G2' },
  { from: 'silver', to: 'gold', label: 'G3' },
]

/** A full-frame map (Course 1's "what we'll build"; the preview). */
export function mapScene(built: string[]): SceneModel {
  return { nodes: [pipelineMap(built)], edges: MAP_EDGES }
}

// ── the map frame ─────────────────────────────────────────────────────────────────────────────────
//
//   the map (MAP_W × MAP_H, fixed)  |  side pane (MAP_SIDE_W): an 80-column terminal, and a diagram
//
// Both columns are FIXED, width AND height, so every map frame has the same natural box and the same
// fit (check-render asserts it), and the map's parts sit at the same pixels in every section.

export const MAP_W = 1150
export const MAP_H = 1040
export const MAP_SIDE_W = 787

export interface MapFrame {
  built: string[]
  side: SceneNode[]
  edges?: Edge[]
}

export function mapFrame({ built, side, edges = [] }: MapFrame): SceneModel {
  return {
    dir: 'row',
    nodes: [
      { type: 'group', id: 'map-pane', bare: true, w: MAP_W, h: MAP_H, children: [pipelineMap(built)] },
      { type: 'group', id: 'map-side', bare: true, w: MAP_SIDE_W, h: MAP_H, children: side },
    ],
    edges: [...MAP_EDGES, ...edges],
  }
}

/** A map side pane's terminal: an 80-column pane, the session's lines folded to `keep`. */
export function mapTerminal(session: string, keep?: Keep[]): Code {
  const rows = terminal(session)
  return { type: 'code', id: 'terminal', terminal: true, filename: 'terminal — lc-exposure', code: rows, fill: true, show: keep && keepLines(rows, keep) }
}

/** A map side pane's editor: a file from the step, its lines folded to `show`. */
export function mapEditor(file: string, code: string, show?: [number, number][], highlight?: number[]): Code {
  return { type: 'code', id: 'editor', filename: file, lang: 'hcl', code: trim(code), show, highlight, tone: 'ingest', fill: true }
}

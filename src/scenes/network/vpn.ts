import type { SceneModel } from '@graphlearning/graphl-flow'
import { level } from '../level'

// §6.7 — VPN and ExpressRoute (doc-cited, full scene). Two ways to join the bank's network to the VNet:
// an encrypted tunnel over the internet (site-to-site VPN, a VPN gateway in the VNet), or a private
// circuit through a connectivity provider (ExpressRoute). What each gives; no prices quoted as facts.
export const networkVpn: SceneModel = {
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'left', bare: true, children: [
        level('doc-cited', 'Azure’s ExpressRoute and VPN Gateway documentation (below)'),
        {
          type: 'group', id: 'vpn', title: 'Site-to-site VPN', icon: 'lock', tone: 'ingest', dir: 'row', children: [
            { type: 'item', id: 'v-bank', title: 'the bank’s VPN device', sub: 'on-premises', icon: 'building' },
            { type: 'item', id: 'v-net', title: 'the internet', sub: 'an IPsec tunnel through it', icon: 'globe' },
            { type: 'item', id: 'v-gw', title: 'VPN gateway', sub: 'in the VNet’s GatewaySubnet', icon: 'network' },
          ],
        },
        {
          type: 'group', id: 'er', title: 'ExpressRoute', icon: 'network', tone: 'store', dir: 'row', children: [
            { type: 'item', id: 'e-bank', title: 'the bank’s router', sub: 'on-premises', icon: 'building' },
            { type: 'item', id: 'e-prov', title: 'a connectivity provider', sub: 'a private circuit, not the internet', icon: 'network' },
            { type: 'item', id: 'e-gw', title: 'ExpressRoute gateway', sub: 'in the VNet', icon: 'network' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'sources', title: 'Sources', tone: 'neutral', columns: ['page'], rows: [
        { id: 'src-er', cells: ['learn.microsoft.com/azure/expressroute/\u200bexpressroute-introduction'] },
        { id: 'src-vpn', cells: ['learn.microsoft.com/azure/vpn-gateway/\u200bvpn-gateway-about-vpngateways'] },
      ],
    },
    {
      type: 'table', id: 'compare', title: 'What each gives', tone: 'ingest', columns: ['', 'site-to-site VPN', 'ExpressRoute'], rows: [
        { id: 'c-path', cells: ['the path', 'the public internet, encrypted', 'a provider’s private circuit'] },
        { id: 'c-speed', cells: ['bandwidth', 'limited by the gateway SKU', 'up to the circuit’s size'] },
        { id: 'c-time', cells: ['to set up', 'hours: a device and a gateway', 'weeks: a provider and a contract'] },
        { id: 'c-who', cells: ['who chooses it', 'smaller sites, a start', 'banks with steady volume'] },
        { id: 'c-here', cells: ['in this course', 'not built', 'not built'], tone: 'infra' },
      ],
    },
  ],
  edges: [
    { from: 'v-bank', to: 'v-net' },
    { from: 'v-net', to: 'v-gw' },
    { from: 'e-bank', to: 'e-prov' },
    { from: 'e-prov', to: 'e-gw' },
  ],
}

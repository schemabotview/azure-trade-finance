import type { SceneModel } from '@graphlearning/graphl-flow'
import { networkVnet } from './vnet'
import { networkNsg } from './nsg'
import { networkPublicOff } from './public-off'
import { networkPrivateEndpoint } from './private-endpoint'
import { networkOnPrem } from './on-prem'
import { networkVpn } from './vpn'

export const networkScenes: Record<string, SceneModel> = {
  'network-vnet': networkVnet,
  'network-nsg': networkNsg,
  'network-public-off': networkPublicOff,
  'network-private-endpoint': networkPrivateEndpoint,
  'network-on-prem': networkOnPrem,
  'network-vpn': networkVpn,
}

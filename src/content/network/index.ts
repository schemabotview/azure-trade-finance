import type { Course } from '../types'
import { vnetsAndSubnets } from './01-vnets-and-subnets'
import { networkSecurityGroups } from './02-network-security-groups'
import { publicAccessOff } from './03-public-access-off'
import { aPrivateEndpoint } from './04-a-private-endpoint'
import { tradebookIsOnPremises } from './05-tradebook-is-on-premises'
import { theSelfHostedIr } from './06-the-self-hosted-ir'
import { vpnAndExpressroute } from './07-vpn-and-expressroute'

// Course 6 · Private by default. §1–4 and §6 recorded on Azure; §5 and §7 doc-cited.
export const network: Course = {
  id: 'network',
  title: 'Private by default',
  sections: [vnetsAndSubnets, networkSecurityGroups, publicAccessOff, aPrivateEndpoint, tradebookIsOnPremises, theSelfHostedIr, vpnAndExpressroute],
}

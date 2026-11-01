import type { Section } from '../types'

export const vpnAndExpressroute: Section = {
  id: 'vpn-and-expressroute',
  title: 'VPN and ExpressRoute: joining the bank to Azure',
  scene: 'network-vpn',
  narration:
    "The self hosted runtime reaches TradeBook without joining the networks. Many banks go further, and connect their data centre to Azure so that the two behave as one network. This detour is drawn from Azure's documentation, cited in the label, and none of it is built in this course. There are two ways. The first is a site to site V P N. A V P N device in the bank and a V P N gateway in the V Net build an encrypted tunnel through the public internet. It is quick to set up, hours rather than weeks, but its speed is limited by the gateway's size, and it shares the internet's path. The second is ExpressRoute: a private circuit, arranged through a connectivity provider, that never touches the public internet at all. It takes weeks and a contract to set up, and it is chosen by organisations that move a lot of data steadily, which is why banks so often have one. The table compares them on the path, the bandwidth, the time to set up, and who usually chooses each. For this pipeline, a few hundred rows a night, neither is needed: the self hosted runtime calling out on port four four three is enough. If the desk's volumes grew, or Databricks needed to read TradeBook directly, a private line would be the next step. Next course, Data Factory, and the nightly copy.",
}

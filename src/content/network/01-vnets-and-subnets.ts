import type { Section } from '../types'

export const vnetsAndSubnets: Section = {
  id: 'vnets-and-subnets',
  title: 'VNets and subnets: a private network, carved by job',
  scene: 'network-vnet',
  focus: 'vnet',
  narration:
    "So far, everything the pipeline uses is reached over the internet, protected by identities and roles. A bank wants the path closed too, and that starts with a private network: on the map, the V Net appears in colour, ringed, with its subnets inside. The new Terraform module declares it. One address space, ten dot thirty dot zero dot zero slash sixteen: sixty five thousand addresses that belong to this network alone. Then a map of subnets, one per job, so that each kind of thing lives in its own room and can get its own rules. A slash twenty four for private endpoints, the doors to the lake in the coming sections. Another slash twenty four for a self hosted integration runtime, should one ever run inside Azure; section six shows why ours lives in the bank instead. And two slash twenty twos for Databricks, which needs a host side and a container side, each with room for many machines. The new module is initialised and applied, five resources, the network and four subnets, and the terminal lists them back with their ranges, recorded on Azure. The table orders them by address. Notice the gaps between them: the plan leaves room for each subnet to grow, and for subnets nobody has thought of yet. A subnet's range cannot easily change once something lives in it, so this is the moment to be generous. Next, rules for what may enter and leave a subnet.",
}

import type { Section } from '../types'

export const networkSecurityGroups: Section = {
  id: 'network-security-groups',
  title: 'Network security groups: rules, by priority',
  scene: 'network-nsg',
  narration:
    "A subnet can carry a network security group: a list of rules about which traffic may enter and leave. The one in the editor guards the subnet set aside for a runtime inside Azure, and has two rules. Priority one hundred allows outbound H T T P S, port four four three, from the V Net to Azure's own addresses, which is all such a runtime needs to call out to Data Factory. Priority two hundred denies anything inbound from the internet. The apply creates the group and attaches it to the subnet, recorded on Azure. Then the terminal lists every rule, including Azure's defaults, and the table shows them in the order they are judged. That order is the whole mechanism, drawn underneath. Rules are sorted by priority, lowest number first, separately for inbound and outbound. The first rule that matches a packet decides, allow or deny, and nothing after it is read. Whatever no rule of ours matches falls through to Azure's defaults, numbered sixty five thousand and up. Read them: traffic inside the V Net is allowed, inbound from the load balancer is allowed, everything else inbound is denied. And outbound to the internet is allowed by default. So the inbound deny we wrote is already the default's behaviour, made explicit; outbound, our rule is a statement of intent, not a lock. Next, the lake closes its public door.",
}

import type { Section } from '../types'

export const theSelfHostedIr: Section = {
  id: 'the-self-hosted-ir',
  title: 'The self-hosted integration runtime: an agent that only calls out',
  scene: 'network-shir',
  narration:
    "This detour builds the agent that will reach TradeBook, recorded on Azure. It belongs inside the bank, beside the database, so the course builds a stand in for the bank's network, as the label says: a virtual network of its own in U K West, with a firewall rule that refuses anything from the internet, and a NAT gateway as its single way out. The editor shows the start of that network. Then the pieces in the side pane. A Data Factory, wearing the pipeline's managed identity from Course four, and inside it a self hosted integration runtime: at first, only a name and a key. A Windows virtual machine in the bank network, with no public address, because the runtime only runs on Windows. And an extension that runs once on that machine: it downloads the runtime, installs it, and registers it with the factory's key, which travels encrypted and never appears in any output. The apply builds all fourteen resources. Then the terminal waits, asking Data Factory every twenty seconds, until the runtime reports Online, and the last query shows it: online, on the bank's machine. The chain at the top is the whole point. The runtime calls out, through the NAT gateway, over H T T P S, and asks Data Factory whether there is any work. Nothing ever connects in, so the bank's firewall can stay shut. Next, joining the bank to Azure properly.",
}

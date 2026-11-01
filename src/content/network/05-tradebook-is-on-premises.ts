import type { Section } from '../types'

export const tradebookIsOnPremises: Section = {
  id: 'tradebook-is-on-premises',
  title: 'TradeBook is on-premises: why Data Factory cannot see it',
  scene: 'network-on-prem',
  narration:
    "The lake is now private inside Azure. The source is private too, but somewhere else. TradeBook runs in Syndica Bank's own data centre, on the left of the map, behind the bank's firewall, and this frame is drawn from Azure's documentation, whose address is in the label. Data Factory's built in runtime, the Azure integration runtime, runs inside Microsoft's network. It can reach anything with a public endpoint, but a database inside the bank has none, and the bank's firewall lets nothing in from the internet. So the arrow in the side pane is refused. There are three ways a cloud service can reach a private database, and the table weighs them. The first is to open the firewall and give the database a public address; for a bank's system of record, that is never the answer. The second is to join the networks with a private line, a V P N or ExpressRoute, so that Azure becomes part of the bank's network; that is the last section of this course. The third is to put a small agent inside the bank, next to the database, which calls out to Data Factory over port four four three and asks for work. Nothing ever connects in. That agent is the self hosted integration runtime, and it is what this pipeline uses. Next, the self hosted runtime itself.",
}

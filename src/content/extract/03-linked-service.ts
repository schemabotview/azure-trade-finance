import type { Section } from '../types'

export const linkedService: Section = {
  id: 'linked-service',
  title: 'A linked service to TradeBook',
  scene: 'extract-linked-service',
  narration:
    "TradeBook is the desk's PostgreSQL database, inside the bank. On Ana's laptop it was a local copy; on Azure, the course stands it in as a server in the simulated bank network, as the label says, beside the runtime, loaded with the desk's data as it stood at batch forty one. The bank's network is peered to the lake's virtual network, standing in for the bank's V P N, and the lake's private names are made to resolve there too. The editor shows the linked service. It names TradeBook's address, port and database, a login that may only read, and two things worth highlighting. It goes through the bank's runtime. And its password is not in it: it points at a Key Vault secret, which the factory reads at run time, wearing the pipeline's identity. One honest detail is in the comment. The Terraform provider's model of this linked service drops a field PostgreSQL requires, so this one resource is deployed as an A R M template, the language Resource Manager itself reads, still from Terraform. The terminal shows the apply, twelve resources, then waits for the server's first boot to finish, and runs a one activity pipeline that asks TradeBook how many letters of credit it holds. The answer, four hundred, is TradeBook's own, fetched by the bank's runtime and returned to the factory. The side pane draws that path. Next, copying a whole table into landing.",
}

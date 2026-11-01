import type { Section } from '../types'

export const threeClients: Section = {
  id: 'three-clients',
  title: 'Portal, CLI, Terraform: three clients, one API',
  scene: 'how-azure-runs-three-clients',
  narration:
    "If every client talks to the same Resource Manager, then reading one thing three ways should give one answer. This section checks it, on the simplest resource there is: the subscription itself. The first command is the Azure command line, asking for the subscription's name. The second skips the friendly command and calls the Resource Manager A P I directly, a GET on the subscription's U R L, and asks for its display name. The third is Terraform. The file in the editor declares a data source, a thing Terraform only reads, and an output with the subscription's display name. Terraform plan shows that output without changing anything and without writing any state. All three answer sub tradefin dev. The side pane draws why: three clients, each sending the same GET to Resource Manager. The portal is a fourth client, and this film never shows it, for a practical reason: a portal page changes its layout often, and every number on screen here must be real output that can be read again. From Course three on, every resource is written in Terraform, the command line is used to look and to move data, and both are just ways of writing requests to the same A P I. Next, a step back from the commands, to what Microsoft runs and what the bank must still run itself.",
}

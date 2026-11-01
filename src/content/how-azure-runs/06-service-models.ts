import type { Section } from '../types'

export const serviceModels: Section = {
  id: 'service-models',
  title: 'IaaS, PaaS, SaaS: who runs what',
  scene: 'how-azure-runs-service-models',
  narration:
    "Moving to the cloud does not move every responsibility to Microsoft. How much moves depends on the kind of service, and the frame draws Microsoft's shared responsibility model. Down the side are the layers, from the data at the top to the datacenter at the bottom. Across are four ways to run something. On premises, the bank runs every layer. Infrastructure as a service, I a a S, is a virtual machine: Microsoft runs the hosts and the datacenter, and the bank still runs the operating system, its patches and the application. Platform as a service, P a a S, is a managed service: Microsoft runs the operating system too, and the bank configures the service. Software as a service, S a a S, is a finished application. Below the table, the pipeline's own parts sit on that line. TradeBook and the desk are on premises. The runtime that carries data out of the bank runs on a Windows virtual machine, which is I a a S: the bank patches it. Storage, Key Vault, Data Factory and Databricks are P a a S. Entra I D and GitHub are S a a S. One row never changes, whatever the column: the data, the identities and who may read what are always the bank's. That is why whole courses here are about identity and private networking. Next, the last question before building: what all of this costs.",
}

import type { Section } from '../types'

export const aFirstTerraformFile: Section = {
  id: 'a-first-terraform-file',
  title: 'A first Terraform file: a storage account from code',
  scene: 'start-first-terraform',
  narration:
    "The pipeline's infrastructure is written as code, with Terraform, and this is the first file. Main dot t f names the provider, azure r m, pinned to one exact version, and declares two resources: the resource group, with its three tags, and the storage account that will become the lake, with account keys switched off from the start. Nothing in the file says how to create them, only what should exist. The terminal runs it. Init downloads the pinned provider. Apply compares the file with what exists, finds nothing, and plans two additions; then it creates them, and the run ends with two resources added. The side pane shows the path a block of code takes. Terraform reads main dot t f; the provider turns each block into calls to Azure Resource Manager, the one A P I behind the portal, the C L I and every other tool; and Resource Manager creates the account in U K South. State list names what Terraform now manages: the resource group and the storage account. Look at the last line, the folder listing. Terraform has written a file called terraform dot t f state, on Ana's laptop, and it is how Terraform knows what it created. Next, why that file cannot stay there.",
}

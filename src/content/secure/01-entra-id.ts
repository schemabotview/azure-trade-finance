import type { Section } from '../types'

export const entraId: Section = {
  id: 'entra-id',
  title: 'Entra ID: who exists',
  scene: 'secure-entra-id',
  narration:
    "Before anyone can be given access to anything, they have to exist, and in Azure, who exists is Entra I D's business: the organisation's directory of users and groups. The side pane draws it as a chain. The directory holds users: Ana, the desk, the risk team. Users are gathered into groups. And it is groups, not people, that the next sections give Azure roles to, so that someone joining or leaving the team changes one membership, not a dozen role assignments. The editor shows this course's group in Terraform: a security group called g r p trade risk eng, owned by whoever applies it, whose members are looked up by their sign in names. The label says how far this section goes, and why. Entra I D's users and groups are not Azure resources. They live behind a different A P I, Microsoft Graph, with its own permissions, and the identity that records this course has Azure roles but no Graph permissions. So this file is validated, not applied: the terminal shows Terraform loading the azure A D provider and confirming the configuration is valid. The table at the bottom makes the split explicit. Azure resources go through Resource Manager, with the azure R M provider, and need an Azure role. Directory objects go through Graph, with the azure A D provider, and need a Graph permission. A bank keeps those two powers in different hands. Next, an identity for the pipeline itself.",
}

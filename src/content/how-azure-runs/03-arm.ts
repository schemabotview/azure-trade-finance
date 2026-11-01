import type { Section } from '../types'

export const arm: Section = {
  id: 'arm',
  title: 'Azure Resource Manager: one front door',
  scene: 'how-azure-runs-arm',
  narration:
    "When the Azure command line lists resource groups, what does it actually do? The debug flag shows it, and the terminal keeps just three lines of that debug output. The command made one H T T P S request: a GET, to management dot azure dot com, for the resource groups of this subscription, with an A P I version in the U R L. The answer was status two hundred. Every client does the same. The side pane draws it: the command line, Terraform and the portal are all clients of one service, Azure Resource Manager, at that one host name. Resource Manager is the front door. It checks who is signed in, checks their role, checks policy, and only then passes the request to a resource provider: the part of Azure that actually runs storage accounts, or key vaults, or data factories. The last command asks Resource Manager directly, through the raw R E S T client, how many resource providers are registered on this subscription: twenty seven. Microsoft dot Storage, Microsoft dot Key Vault and Microsoft dot Data Factory are three of them, and they are the ones this pipeline will use. This is why the course can say, honestly, that Terraform and the command line are equivalent: they are both ways of writing these requests. Next, a second kind of request, which does not go through this front door at all.",
}

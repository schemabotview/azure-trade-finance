import type { Section } from '../types'

export const planes: Section = {
  id: 'planes',
  title: 'Control plane and data plane',
  scene: 'how-azure-runs-planes',
  narration:
    "There are two kinds of request in Azure, and the difference decides who can do what. The first command asks the command line which endpoints it uses. Resource Manager is management dot azure dot com. Storage is a suffix, core dot windows dot net, because every storage account gets its own host name under it. The second command lists storage accounts, and its debug output shows where that went: to management dot azure dot com, under the provider Microsoft dot Storage. Listing, creating and configuring a storage account is the control plane, drawn on the left of the side pane: one host for every service, and roles like Owner or Contributor decide it. Reading and writing the blobs inside an account is the data plane, on the right: a request to the account's own endpoint, account name dot blob dot core dot windows dot net. The data plane has its own roles, the Storage Blob Data roles. And the two are separate. In Course four, the recording identity was Owner of the subscription, and still could not read a single blob until it was given a data role. Owner can manage the lake; it does not make you a reader of what is in it. That is exactly the separation a bank wants. Next, one more look at the control plane, read three different ways.",
}

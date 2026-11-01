import type { Section } from '../types'

export const ownerCannotReadABlob: Section = {
  id: 'owner-cannot-read-a-blob',
  title: 'Owner cannot read a blob: control plane and data plane',
  scene: 'secure-owner-no-data',
  narration:
    "The session's identity is Owner of the whole subscription. Surely it can read the lake. The terminal tries, recorded on Azure. First it lists the storage account's containers, and that works: an empty list, because none exist yet. Then it lists the blobs in a container, and Azure refuses: you do not have the required permissions, and it names the roles that would grant them, every one a data role. The side pane explains why. Azure has two planes. The control plane manages resources: the account, its settings, its containers, and that is what Owner and Contributor grant. The data plane is the contents: the blobs inside, the secrets inside a vault. Owner grants nothing there, so a person who can delete the account still cannot read what is in it, which is exactly what a bank wants. The fix is in the editor. The storage module grants Storage Blob Data Contributor to whoever applies it, on this one account and nowhere else. The root module does the same for Key Vault's data plane, Key Vault Secrets Officer, on this resource group, ready for the next section. The apply adds both. One more thing the side pane notes: a new role takes a minute or two to reach the data plane, so the proof comes at the start of the next section. Next, a vault for the one password the pipeline needs.",
}

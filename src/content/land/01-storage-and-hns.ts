import type { Section } from '../types'

export const storageAndHns: Section = {
  id: 'storage-and-hns',
  title: 'Storage accounts and the hierarchical namespace: a lake with real folders',
  scene: 'land-hns',
  focus: 'storage',
  narration:
    "The lake starts as one storage account, and on the map it is the green box in the middle of the resource group, ringed. This frame was recorded once on a real Azure subscription, and the label says so. The Terraform module on the right declares the account: standard tier, locally redundant, in U K South. Two lines matter most. The hierarchical namespace is switched on, which is what makes this an A D L S Gen two account rather than a plain blob store. And account keys are switched off: nobody reaches this data with a shared secret, only with an identity and a role. The module also gives whoever runs it the data role on this one account, because owning a subscription lets you manage an account, not read what is inside it. Terraform plans three resources, the resource group, the account and the role, and applies them. The two queries underneath read the account back: the hierarchical namespace is true, and the account answers on two addresses, the blob endpoint and the D F S endpoint, the Data Lake A P I. The table shows what the switch changes. Without it, a folder is only part of each file's name, and renaming a folder means copying and deleting every file under it. With it, a folder is a real directory, and a rename is one operation. Next, the zones inside it.",
}

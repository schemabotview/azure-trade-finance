import type { Section } from '../types'

export const storageAndHns: Section = {
  id: 'storage-and-hns',
  title: 'Storage accounts and the hierarchical namespace: a lake with real folders',
  scene: 'land-hns',
  focus: 'storage',
  narration:
    "The storage account has existed since Course three, on the map in the middle of the resource group, ringed. Now it has to become a lake, recorded once on Azure. The Terraform module on the right gains one highlighted line: the hierarchical namespace is switched on, which is what makes an account A D L S Gen two rather than a plain blob store. Account keys stay off, as they have been from the start. The plan shows something one line of code would not suggest: the storage account must be replaced. The hierarchical namespace is chosen when an account is created, and cannot be switched on for an account that already exists, so Terraform destroys the old account and creates a new one with the same name; the data role that sat on the old account goes with it, and is granted again. That is safe today only because the account is still empty, which is the reason to decide this early. The apply destroys two resources and adds two. The queries underneath read the new account back: the hierarchical namespace is true, and the account answers on two addresses, the blob endpoint and the D F S endpoint, the Data Lake A P I. The table shows what the switch changes. Without it, a folder is only part of each file's name, and renaming one means copying every file under it. With it, a folder is a real directory, and a rename is one operation. Next, the zones inside it.",
}

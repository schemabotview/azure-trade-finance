import type { Section } from '../types'

export const publicAccessOff: Section = {
  id: 'public-access-off',
  title: 'Public access off: the lake leaves the internet',
  scene: 'network-public-off',
  narration:
    "Until now, anyone with the right identity and role could reach the lake from anywhere on the internet, including Ana's laptop. The first command proves it: it lists the five zones, from outside Azure. Now the lake's public endpoint closes. In the editor, the storage module gains one line: public network access, disabled. Terraform changes the account in place, one resource changed, nothing destroyed, recorded on Azure. The account now reports its public network access as disabled, and the same listing that worked a minute ago fails: the request may be blocked by the storage account's network rules. The identity is the same, the role is the same, and the data is still refused, because of where the request came from. The side pane draws why that matters. A request to the lake now has to pass three locks in a row. The network: is it coming from somewhere allowed? That is this section. The identity: who is asking? And the role: what may they do? Those were Course four. Each lock covers a different failure: a leaked token is useless from the wrong network, and the right network is useless without a role. It also means Terraform must manage the account without touching its data, which is what the provider was told to do in Course five. Next, a private door into the closed lake.",
}

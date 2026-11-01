import type { Section } from '../types'

export const whoMayRead: Section = {
  id: 'who-may-read',
  title: 'Who may read a batch: RBAC, ACLs, SAS, and a lifecycle',
  scene: 'land-who-may-read',
  narration:
    "Last in this course: who may read what lands, and for how long it stays. This frame was recorded on Azure, against the same account. The session first applies one more Terraform resource, a lifecycle policy, then publishes the reference files to the real lake with the same script that ran against the emulator: only the environment changed, a U R L and a sign in instead of a connection string. There are three ways in, and the table in the side pane holds one of each, read from the terminal. R B A C grants a role on the whole account: here, Storage Blob Data Contributor, given to the identity that deployed it. An access control list works per directory, like file permissions: on group limits, the owner can read and write, the group can read, and everyone else gets nothing. The third way is a shared access signature, a link that carries its own permission. Share dot p y signs one with a key that Azure lends to the signed in identity, never an account key, because the account has none. The link reads one file for four hours. With its signature, the request returns two hundred. The same address without the signature returns four hundred and nine: public access is off. At the bottom, the lifecycle: landing's batches stay hot for thirty days while Bronze reads them, cool after that, move to archive after ninety, and are deleted after four hundred. Next, the network around all of this.",
}

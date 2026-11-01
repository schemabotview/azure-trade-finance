import type { Section } from '../types'

export const stateAndWhereItLives: Section = {
  id: 'state-and-where-it-lives',
  title: 'State, and where it lives: a lease for a lock',
  scene: 'start-state',
  narration:
    "Terraform's state is its memory: which real resource each block of code became. On a laptop it is one person's, and it can be lost. So it moves into Azure. The new file, backend dot t f, points Terraform at a container called t f state, in a storage account of its own, with one blob per environment, read with Ana's identity rather than a key. That account has to exist before Terraform can use it, so a small script, bootstrap dot s h, creates it with the C L I: the only thing in this course the C L I creates. The terminal runs it, then init with migrate state, which copies the local state into the blob; the listing shows dev dot t f state. The side pane draws what Terraform compares on every plan: the code, the state, and Azure itself. The state also needs a lock, so two people never apply at once, and the lock is the blob's lease. To see it, the session takes the lease by hand. The next plan fails at once: error acquiring the state lock, the state blob is already locked. The lease is broken, and the same plan runs, and finds no changes. Next, the code is reshaped for more than one environment.",
}

import type { Section } from '../types'

export const leastPrivilege: Section = {
  id: 'least-privilege',
  title: 'Least privilege: every role, against its job',
  scene: 'secure-least-privilege',
  narration:
    "With a few roles granted, it is worth stepping back and looking at all of them at once, which is how an auditor would. The terminal lists every role assignment on a scope with tradefin in its name, recorded on Azure, with each scope cut to its last part, and the table in the side pane is that list. Each row should answer three questions, written underneath. Is this the narrowest role that does the job? The pipeline identity reads, so it has Reader and Secrets User, never Contributor. Is this the narrowest scope? The data roles sit on one storage account and one vault, not on the subscription; the second Storage Blob Data Contributor is on the Terraform state's own account, where Ana must read and write state. And is the holder the right kind of principal? The pipeline acts as itself, never as a person. Least privilege is not a setting you switch on; it is this list, reviewed whenever it changes. The editor shows the other half of this section's apply: two policy assignments, written in a new file, policy dot t f. One allows only U K regions, and the other requires an owner tag on every resource. The apply adds both, and the last listing shows their names. Next, what they do to someone who ignores them.",
}

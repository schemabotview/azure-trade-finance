import type { Section } from '../types'

export const noSecretAnywhere: Section = {
  id: 'no-secret-anywhere',
  title: 'No secret anywhere: the identity reads, nobody types',
  scene: 'secure-no-secret',
  narration:
    "The password is in the vault. Now the pipeline must be allowed to read it, and nothing else. The Terraform block in the editor grants one role, Key Vault Secrets User, to the pipeline's managed identity, on this one vault. Secrets User can read a secret's value; it cannot create, change or delete one. The apply adds the assignment, recorded on Azure. The terminal then asks the vault who holds what, inherited assignments included, and the table in the side pane is that answer. The subscription's two Owners inherit down to the vault, the pipeline identity's Reader comes from the resource group, Ana's Secrets Officer lets her manage the secret, and the new line, Secrets User, belongs to the pipeline. The chain at the top is how the password will travel when Data Factory runs. The managed identity, which has no secret of its own, asks Entra I D for a token; the token lasts minutes and is good only for the vault; the vault checks the role and returns the password. At no point does anyone type it, store it in code, or see it. The last command proves the project's side of that promise: a search through every file for a password being assigned finds nothing at all. Next, the whole set of roles, checked against what each one needs.",
}

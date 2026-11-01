import type { Section } from '../types'

export const keyVault: Section = {
  id: 'key-vault',
  title: 'Key Vault: one place for the one password',
  scene: 'secure-keyvault',
  narration:
    "The pipeline needs exactly one secret: the password Data Factory will use to read TradeBook. It belongs in a vault, and this section builds one, recorded on Azure. First, the proof the last section promised. Listing the blobs again no longer says permission denied; it says the container does not exist, which means the identity is now allowed to look. The data role has arrived. The editor shows the new Key Vault module. Two lines matter. R B A C authorization is on, so the same role assignments as everywhere else decide who may read a secret, instead of the vault's older access policies. And purge protection is off, because this course deletes its vault after every recording, and a protected vault's name could not be used again for days. The apply creates the vault. Then the password. Open S S L makes twenty four random bytes, straight into a shell variable; a z keyvault secret set stores them as tradebook password; and the variable is unset. The value was never printed, never written to a file, and never passed through Terraform, so it is not in the state either. The listing shows the secret's name, and only its name. The side pane draws the vault, the secret, and its versions: setting it again makes version two, and the name stays the same. Next, who may read it.",
}

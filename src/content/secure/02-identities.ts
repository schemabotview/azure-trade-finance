import type { Section } from '../types'

export const identities: Section = {
  id: 'identities',
  title: 'Service principals and managed identities: who the pipeline is',
  scene: 'secure-identities',
  narration:
    "Before the pipeline touches any data, it needs to be someone. In Azure, everything that acts has an identity, and the side pane lists the three kinds. A user is a person, like Ana, with a password and a second factor, hers alone. A service principal is an identity for an application: this very session runs as one, as the last line of the terminal shows, and somewhere a secret or a certificate proves it is who it says. And a managed identity is an identity for code that runs inside Azure, with one difference that matters: nobody stores its secret, because Azure holds the credential and hands out tokens itself. The Terraform block in the editor creates one for the pipeline: i d tradefin pipeline, a user assigned managed identity, which means it is a resource of its own, and can be given to Data Factory when Course seven builds it. The apply adds it, and the listing shows its name and its principal I D, the identifier that roles will be granted to. At the bottom of the side pane is how it will be used. Data Factory, wearing this identity, asks Entra I D for a token at run time; the token is short lived; and Key Vault or the lake checks the token, then checks the role. No password appears anywhere in that chain. Next, what a role is, and where it applies.",
}

import type { Section } from '../types'

export const ciNoSecret: Section = {
  id: 'ci-no-secret',
  title: 'CI with no stored secret',
  scene: 'operate-ci-no-secret',
  narration:
    "Everything in this film was applied by a person at a terminal. A bank wants changes applied by a pipeline instead, from reviewed code, the same way every time. The usual risk is the credential: a pipeline that deploys to Azure needs to sign in, and a password stored in the C I system can leak. This section removes it. The editor shows a GitHub Actions workflow, and the label is precise about what is real: the Azure side is validated in Terraform, and the workflow is shown, not run. Two lines are highlighted. The workflow asks GitHub for an identity token for this run, and the Azure login step exchanges that token, instead of a secret, for access. The side pane follows it. GitHub signs a short lived token that says which repository and which branch this run is from. Entra I D trusts that token through a federated credential, on a managed identity made for deployment, and only for this repository's main branch: a fork, another branch or another repository gets nothing. The identity is allowed to change this resource group, and nothing more. Then Terraform plans and applies, exactly as at the terminal. Nothing secret is stored in GitHub at all. The three identifiers it needs are variables, because an identifier says who, but proves nothing. Next, where this pipeline could go from here.",
}

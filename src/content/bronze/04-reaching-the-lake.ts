import type { Section } from '../types'

export const reachingTheLake: Section = {
  id: 'reaching-the-lake',
  title: 'Reaching the lake with no key',
  scene: 'bronze-reaching-the-lake',
  narration:
    "Databricks needs to read and write the lake, and the lake has no account keys: Course four switched them off. So Databricks needs an identity, and this section builds the chain, validated in Terraform, as the label says. The side pane draws it from top to bottom. First, an access connector: an Azure resource whose only job is to be an identity for Databricks, a managed identity Azure holds. Second, that identity gets a data role on the lake, Storage Blob Data Contributor, highlighted in the editor, the same kind of role assignment as Course four's. Third, Unity Catalog wraps the connector in a storage credential, its own handle on that identity. And fourth, external locations say which paths the credential unlocks: one per zone, landing, bronze, silver and gold, each an a b f s s address on the lake. The editor shows all four pieces. Notice what is not there: no key, no secret, no connection string, nothing that could be copied out of a file and used elsewhere. Access is a chain of identities and grants, each one visible in code, and each one removable by deleting a line. The terminal shows the configuration validated. In the bank, this is the difference between a lake that anyone with a key can read, and a lake whose every reader can be named. Next, how Databricks reads each new file exactly once.",
}

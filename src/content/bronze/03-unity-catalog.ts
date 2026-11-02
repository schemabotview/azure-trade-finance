import type { Section } from '../types'

export const unityCatalog: Section = {
  id: 'unity-catalog',
  title: 'Unity Catalog: catalog, schema, table',
  scene: 'bronze-unity-catalog',
  narration:
    "On Ana's laptop, a table is a folder: lake slash silver slash lc current. On Databricks, every table has a three part name, and a catalog that decides who may read it. That catalog is Unity Catalog, and this section declares its pieces in Terraform, validated, as the label says. The side pane draws the levels. At the top is the metastore, one per region, belonging to the Databricks account. In it, this course has one catalog, risk, for the risk team's data. In the catalog are schemas: bronze, silver and gold, one per zone, and audit, for the gates' record from Course eleven. And in a schema, tables. So the answer the desk reads is not a folder path but risk dot gold dot agg group exposure. The editor shows the catalog and the four schemas, highlighted: two resources, made through the workspace's own A P I. The catalog stores its managed data under the gold zone's external location, which is the next section's subject. The table at the bottom maps each local Delta folder the earlier courses used to the name it would have in the catalog. Nothing else about the tables changes: they are the same Delta tables, read and written by the same Spark. What Unity Catalog adds is a single place where access is granted, to groups, per catalog, schema or table, and where every read is audited. Next, how Databricks reaches the lake without a key.",
}

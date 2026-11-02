# Reaching the lake with no key: an ACCESS CONNECTOR is an Azure identity for
# Databricks; it gets a data role on the lake. Unity Catalog wraps it in a
# STORAGE CREDENTIAL, and an EXTERNAL LOCATION says which path it unlocks.
resource "azurerm_databricks_access_connector" "lake" {
  name                = "ac-tradefin-${var.env}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_role_assignment" "connector_lake" {
  scope                = module.storage.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id = (
  azurerm_databricks_access_connector.lake.identity[0].principal_id)
}

resource "databricks_storage_credential" "lake" {
  name = "sc-tradefin-lake"
  azure_managed_identity {
    access_connector_id = azurerm_databricks_access_connector.lake.id
  }
}

locals {
  zones = toset(["landing", "bronze", "silver", "gold"])
  lake  = "${module.storage.name}.dfs.core.windows.net"
}

resource "databricks_external_location" "zone" {
  for_each        = local.zones
  name            = "el-${each.key}"
  url             = "abfss://${each.key}@${local.lake}/"
  credential_name = databricks_storage_credential.lake.name
}

# The three-level namespace: catalog.schema.table. One catalog for the risk
# team, one schema per zone, and the audit table's own.
resource "databricks_catalog" "risk" {
  name         = "risk"
  storage_root = databricks_external_location.zone["gold"].url
  comment      = "LC exposure by counterparty group"
}

resource "databricks_schema" "zone" {
  for_each     = toset(["bronze", "silver", "gold", "audit"])
  catalog_name = databricks_catalog.risk.name
  name         = each.key
}

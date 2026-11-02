# The parent pipeline's way into Databricks: a linked service that signs in
# as the factory's identity, and the job's id for pl_nightly (§11.5).
locals {
  dbw = azurerm_databricks_workspace.main
}

resource "azurerm_data_factory_linked_custom_service" "databricks" {
  name            = "ls_databricks"
  data_factory_id = azurerm_data_factory.main.id
  type            = "AzureDatabricks"
  type_properties_json = jsonencode({
    domain              = "https://${local.dbw.workspace_url}"
    authentication      = "MSI"
    workspaceResourceId = local.dbw.id
    credential          = local.as_me
  })
}

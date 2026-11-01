# The lake: a storage account with the hierarchical namespace on (ADLS Gen2).
resource "azurerm_storage_account" "lake" {
  name                            = var.name
  resource_group_name             = var.resource_group_name
  location                        = var.location
  tags                            = var.tags
  account_kind                    = "StorageV2"
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  is_hns_enabled                  = true  # real directories, not name prefixes
  shared_access_key_enabled       = false # no account keys: identities only
  allow_nested_items_to_be_public = false
  min_tls_version                 = "TLS1_2"
}

# Owner manages the account but cannot read its data: whoever applies gets
# Storage Blob Data Contributor on this one account.
data "azurerm_client_config" "me" {}

resource "azurerm_role_assignment" "data" {
  scope                = azurerm_storage_account.lake.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = data.azurerm_client_config.me.object_id
}

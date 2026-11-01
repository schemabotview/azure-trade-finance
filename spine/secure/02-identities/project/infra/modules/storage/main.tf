# The lake's storage account: identities only, no public blobs.
resource "azurerm_storage_account" "lake" {
  name                            = var.name
  resource_group_name             = var.resource_group_name
  location                        = var.location
  tags                            = var.tags
  account_kind                    = "StorageV2"
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  shared_access_key_enabled       = false # no account keys: identities only
  allow_nested_items_to_be_public = false
  min_tls_version                 = "TLS1_2"
}

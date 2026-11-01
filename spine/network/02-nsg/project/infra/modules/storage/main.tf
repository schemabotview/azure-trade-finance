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

# The zones: one container (an ADLS file system) each, made through the
# control plane, as the account is.
resource "azurerm_storage_container" "zone" {
  for_each = toset(["landing", "bronze", "silver", "gold", "reference"])

  name               = each.key
  storage_account_id = azurerm_storage_account.lake.id
}

# Landing's batches cool after 30 days, archive after 90, go after 400: a
# sealed batch is read in its first days, and kept for audit after that.
resource "azurerm_storage_management_policy" "lifecycle" {
  storage_account_id = azurerm_storage_account.lake.id
  rule {
    name    = "landing-batches"
    enabled = true
    filters {
      blob_types   = ["blockBlob"]
      prefix_match = ["landing/lc_deals/"]
    }
    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than    = 30
        tier_to_archive_after_days_since_modification_greater_than = 90
        delete_after_days_since_modification_greater_than          = 400
      }
    }
  }
}

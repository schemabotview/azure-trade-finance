# lc-exposure on Azure: a resource group and the lake's storage account.
terraform {
  required_version = "~> 1.17.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "5.12.0"
    }
  }
}

provider "azurerm" {
  features {}
  storage_use_azuread = true # the account will have no keys
}

resource "azurerm_resource_group" "dev" {
  name     = "rg-tradefin-dev"
  location = "uksouth"
  tags     = { app = "lc-exposure", env = "dev", owner = "trade-risk" }
}

resource "azurerm_storage_account" "lake" {
  name                            = "sttradefindev"
  resource_group_name             = azurerm_resource_group.dev.name
  location                        = azurerm_resource_group.dev.location
  tags                            = azurerm_resource_group.dev.tags
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  shared_access_key_enabled       = false # identities only
  allow_nested_items_to_be_public = false
  min_tls_version                 = "TLS1_2"
}

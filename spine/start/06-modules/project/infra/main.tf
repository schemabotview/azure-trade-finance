# lc-exposure on Azure: one resource group per environment, and what is in it.
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
  storage_use_azuread = true # the lake has no account keys
}

locals {
  tags = { app = "lc-exposure", env = var.env, owner = "trade-risk" }
}

resource "azurerm_resource_group" "main" {
  name     = "rg-tradefin-${var.env}"
  location = var.location
  tags     = local.tags
}

module "storage" {
  source              = "./modules/storage"
  name                = "sttradefin${var.env}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
}

# The same resources at new addresses: moved, not destroyed and re-created.
moved {
  from = azurerm_resource_group.dev
  to   = azurerm_resource_group.main
}

moved {
  from = azurerm_storage_account.lake
  to   = module.storage.azurerm_storage_account.lake
}

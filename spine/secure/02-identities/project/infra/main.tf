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

# A budget on the resource group: at 80% of the month's FORECAST, email the
# risk team's engineers, before the money is spent, not after.
resource "azurerm_monitor_action_group" "risk" {
  name                = "ag-trade-risk"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "traderisk"
  tags                = local.tags

  email_receiver {
    name          = "trade-risk"
    email_address = "trade-risk@syndicabank.example"
  }
}

resource "azurerm_consumption_budget_resource_group" "main" {
  name              = "budget-tradefin-${var.env}"
  resource_group_id = azurerm_resource_group.main.id
  amount            = 50
  time_grain        = "Monthly"

  time_period {
    start_date = "2026-11-01T00:00:00Z"
  }

  notification {
    threshold      = 80
    threshold_type = "Forecasted"
    operator       = "GreaterThan"
    contact_groups = [azurerm_monitor_action_group.risk.id]
  }
}

# The pipeline's own identity: Azure holds its credential, so there is no
# password or key to store, rotate or leak. Data Factory will wear it.
resource "azurerm_user_assigned_identity" "pipeline" {
  name                = "id-tradefin-pipeline"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
}

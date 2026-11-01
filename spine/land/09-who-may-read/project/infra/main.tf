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
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true # a teardown leaves no name behind
      recover_soft_deleted_key_vaults = true
    }
    storage {
      # manage storage accounts through ARM alone: no data-plane calls (the
      # lake has no keys, and Course 6 closes its public endpoint)
      data_plane_available = false
    }
  }
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

# RBAC is three things: WHO (the identity), WHAT (a role) and WHERE (a scope).
# Reader on the resource group: it may see every resource in it, change none.
resource "azurerm_role_assignment" "pipeline_reader" {
  scope                = azurerm_resource_group.main.id
  role_definition_name = "Reader"
  principal_id         = azurerm_user_assigned_identity.pipeline.principal_id
}

# The vault's data plane needs a data role too: Ana may manage the secrets of
# this resource group's vaults.
data "azurerm_client_config" "me" {}

resource "azurerm_role_assignment" "secrets_officer" {
  scope                = azurerm_resource_group.main.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.me.object_id
}

module "keyvault" {
  source              = "./modules/keyvault"
  name                = "kv-tradefin-${var.env}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
  tenant_id           = data.azurerm_client_config.me.tenant_id
}

# The pipeline's identity may READ secrets in the vault, and nothing else.
resource "azurerm_role_assignment" "pipeline_secrets" {
  scope                = module.keyvault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.pipeline.principal_id
}

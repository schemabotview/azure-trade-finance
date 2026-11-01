# Terraform's state lives in Azure, not on a laptop: one blob per environment,
# its lease the lock, read with Ana's identity (no account key). The blob's
# name is the environment's: init -backend-config=envs/<env>.backend.hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-tradefin-tfstate"
    storage_account_name = "sttradefintfstate"
    container_name       = "tfstate"
    use_azuread_auth     = true
  }
}

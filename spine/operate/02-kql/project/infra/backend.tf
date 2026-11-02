# Terraform's state lives in Azure, not on a laptop: one blob per environment,
# its lease the lock, read with Ana's identity (no account key).
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-tradefin-tfstate"
    storage_account_name = "sttradefintfstate"
    container_name       = "tfstate"
    key                  = "dev.tfstate"
    use_azuread_auth     = true
  }
}

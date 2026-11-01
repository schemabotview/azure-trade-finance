# Read one thing three ways: this is the Terraform way. A data source only
# reads; `terraform plan` shows the output without writing any state.
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
}
data "azurerm_subscription" "this" {}
output "subscription" {
  value = data.azurerm_subscription.this.display_name
}

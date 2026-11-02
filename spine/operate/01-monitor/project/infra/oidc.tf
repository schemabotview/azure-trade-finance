# CI with no stored secret. GitHub Actions proves who it is with a token
# GitHub signs (OIDC); Entra ID trusts that token for ONE repository and
# branch, through a federated credential on a managed identity. Nothing
# secret is stored in GitHub: no password to leak, nothing to rotate.
resource "azurerm_user_assigned_identity" "deploy" {
  name                = "id-tradefin-deploy"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
}

locals {
  repo = "schemabotview/azure-trade-finance"
}

resource "azurerm_federated_identity_credential" "github" {
  name                      = "fic-github-main"
  user_assigned_identity_id = azurerm_user_assigned_identity.deploy.id
  audience                  = ["api://AzureADTokenExchange"]
  issuer                    = "https://token.actions.githubusercontent.com"
  subject                   = "repo:${local.repo}:ref:refs/heads/main"
}

# What a deployment from main may do: change this resource group.
resource "azurerm_role_assignment" "deploy" {
  scope                = azurerm_resource_group.main.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_user_assigned_identity.deploy.principal_id
}

# TradeBook as Data Factory sees it: a linked service through the bank's
# runtime, and a dataset each pipeline's query reads.
# TradeBook, through the bank's own runtime: Data Factory never connects in.
# azurerm 5.12's model of this linked service drops authenticationType, which
# PostgreSqlV2 requires; an ARM template (the language Resource Manager itself
# reads, Course 2) deploys it exactly as written.
locals {
  arm          = "https://schema.management.azure.com/schemas/2019-04-01"
  tradebook_ip = azurerm_network_interface.tradebook.private_ip_address
}

resource "azurerm_resource_group_template_deployment" "tradebook" {
  name                = "ls-tradebook"
  resource_group_name = azurerm_resource_group.main.name
  deployment_mode     = "Incremental"
  template_content = jsonencode({
    "$schema"      = "${local.arm}/deploymentTemplate.json#"
    contentVersion = "1.0.0.0"
    resources = [{
      type       = "Microsoft.DataFactory/factories/linkedservices"
      apiVersion = "2018-06-01"
      name       = "${azurerm_data_factory.main.name}/ls_tradebook"
      properties = {
        type = "PostgreSqlV2"
        connectVia = {
          referenceName = local.ir
          type          = "IntegrationRuntimeReference"
        }
        typeProperties = {
          server             = local.tradebook_ip
          port               = 5432
          database           = "tradebook"
          username           = "adf"
          sslMode            = 2 # prefer
          authenticationType = "Basic"
          password = {
            type = "AzureKeyVaultSecret"
            store = {
              referenceName = local.vault
              type          = "LinkedServiceReference"
            }
            secretName = azurerm_key_vault_secret.tradebook.name
          }
        }
      }
    }]
  })
  depends_on = [
    azurerm_data_factory_linked_custom_service.vault,
    azurerm_data_factory_integration_runtime_self_hosted.tradebook,
  ]
}

resource "azurerm_data_factory_custom_dataset" "tradebook" {
  name            = "ds_tradebook"
  data_factory_id = local.adf
  type            = "PostgreSqlV2Table"
  linked_service {
    name = "ls_tradebook"
  }
  type_properties_json = jsonencode({})
  depends_on           = [azurerm_resource_group_template_deployment.tradebook]
}

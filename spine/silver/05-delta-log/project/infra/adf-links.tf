# Data Factory's connections. A LINKED SERVICE says how to reach a store (and
# through which runtime); a DATASET names data inside it. TradeBook's own are
# in adf-tradebook.tf. The factory wears
# the pipeline's identity, so every credential below is a reference to it or
# to a Key Vault secret: nothing secret is written here.
locals {
  landing = "${module.storage.id}/blobServices/default/containers/landing"
  cred    = azurerm_data_factory_credential_user_managed_identity.pipeline
  adf     = azurerm_data_factory.main.id
  ir      = azurerm_data_factory_integration_runtime_self_hosted.tradebook.name
  vault   = "ls_keyvault"
  as_me = {
    referenceName = local.cred.name
    type          = "CredentialReference"
  }
}

resource "azurerm_data_factory_credential_user_managed_identity" "pipeline" {
  name            = "cred-pipeline"
  data_factory_id = local.adf
  identity_id     = azurerm_user_assigned_identity.pipeline.id
}

resource "azurerm_data_factory_linked_custom_service" "vault" {
  name            = local.vault
  data_factory_id = local.adf
  type            = "AzureKeyVault"
  type_properties_json = jsonencode({
    baseUrl    = "https://kv-tradefin-${var.env}.vault.azure.net/"
    credential = local.as_me
  })
}

# The lake, also through the runtime: the bank's server writes to landing over
# the peering, to the lake's private endpoint, as the pipeline's identity.
resource "azurerm_data_factory_linked_custom_service" "lake" {
  name            = "ls_lake"
  data_factory_id = local.adf
  type            = "AzureBlobFS"
  integration_runtime {
    name = local.ir
  }
  type_properties_json = jsonencode({
    url        = "https://${module.storage.name}.dfs.core.windows.net/"
    credential = local.as_me
  })
}

# The pipeline may write to landing, and only landing.
resource "azurerm_role_assignment" "pipeline_landing" {
  scope                = local.landing
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.pipeline.principal_id
}

# A file in landing; each pipeline says which folder and file.
resource "azurerm_data_factory_custom_dataset" "landing" {
  # text has no header: a watermark, or a seal
  for_each        = { csv = true, text = false }
  name            = "ds_landing_${each.key}"
  data_factory_id = local.adf
  type            = "DelimitedText"
  linked_service {
    name = azurerm_data_factory_linked_custom_service.lake.name
  }
  parameters = { folder = "", file = "" }
  type_properties_json = jsonencode({
    location = {
      type       = "AzureBlobFSLocation"
      fileSystem = "landing"
      folderPath = { value = "@dataset().folder", type = "Expression" }
      fileName   = { value = "@dataset().file", type = "Expression" }
    }
    columnDelimiter  = ","
    quoteChar        = "\""
    escapeChar       = "\""
    firstRowAsHeader = each.value
  })
}

# Azure Policy: rules every deployment in the group must keep, whoever deploys
# it and with whatever tool: two of Azure's built-in definitions, assigned.
data "azurerm_policy_definition" "locations" {
  display_name = "Allowed locations"
}

data "azurerm_policy_definition" "tag" {
  display_name = "Require a tag on resources"
}

resource "azurerm_resource_group_policy_assignment" "locations" {
  name                 = "allowed-locations"
  display_name         = "lc-exposure: UK regions only"
  resource_group_id    = azurerm_resource_group.main.id
  policy_definition_id = data.azurerm_policy_definition.locations.id
  parameters = jsonencode({
    listOfAllowedLocations = { value = ["uksouth", "ukwest"] }
  })
}

resource "azurerm_resource_group_policy_assignment" "owner_tag" {
  name                 = "require-owner-tag"
  display_name         = "lc-exposure: every resource has an owner tag"
  resource_group_id    = azurerm_resource_group.main.id
  policy_definition_id = data.azurerm_policy_definition.tag.id
  parameters           = jsonencode({ tagName = { value = "owner" } })
}

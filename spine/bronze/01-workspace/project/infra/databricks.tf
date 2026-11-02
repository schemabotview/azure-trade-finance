# Course 8: Azure Databricks, compiled. terraform validate checks it offline;
# this film does not deploy it (its Spark runs locally instead).
#
# Two planes. The CONTROL plane (the web app, the jobs service, the catalog)
# runs in Databricks' own subscription. The COMPUTE plane, the clusters'
# virtual machines, runs in ours, injected into our network: no public IP,
# in the two subnets Course 6 set aside.
resource "azurerm_network_security_group" "dbx" {
  name                = "nsg-tradefin-dbx"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
}

resource "azurerm_subnet_network_security_group_association" "dbx" {
  for_each                  = toset(["snet-dbx-host", "snet-dbx-container"])
  subnet_id                 = module.network.subnet_ids[each.key]
  network_security_group_id = azurerm_network_security_group.dbx.id
}

locals {
  joined = azurerm_subnet_network_security_group_association.dbx
  nsg = {
    for k in ["host", "container"] : k => local.joined["snet-dbx-${k}"].id
  }
}

resource "azurerm_databricks_workspace" "main" {
  name                        = "dbw-tradefin-${var.env}"
  resource_group_name         = azurerm_resource_group.main.name
  location                    = var.location
  tags                        = local.tags
  sku                         = "premium" # Unity Catalog needs it
  managed_resource_group_name = "rg-tradefin-${var.env}-dbx"

  custom_parameters {
    no_public_ip        = true
    virtual_network_id  = module.network.id
    public_subnet_name  = "snet-dbx-host"
    private_subnet_name = "snet-dbx-container"
    # each subnet's NSG association (Azure requires the pair)
    public_subnet_network_security_group_association_id = (
    local.nsg["host"])
    private_subnet_network_security_group_association_id = (
    local.nsg["container"])
  }
}

# Unity Catalog and the job are the WORKSPACE's objects, made through its own
# API, signed in with the same Azure identity as everything else.
provider "databricks" {
  host                        = azurerm_databricks_workspace.main.workspace_url
  azure_workspace_resource_id = azurerm_databricks_workspace.main.id
}

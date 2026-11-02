# The pipeline's private network: one address space, carved into subnets by
# job. Nothing here is reachable from the internet.
resource "azurerm_virtual_network" "main" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags
  address_space       = ["10.30.0.0/16"]
}

locals {
  subnets = {
    snet-pe            = "10.30.1.0/24"  # private endpoints
    snet-shir          = "10.30.2.0/24"  # the self-hosted integration runtime
    snet-dbx-host      = "10.30.8.0/22"  # Databricks, host side
    snet-dbx-container = "10.30.12.0/22" # Databricks, container side
  }
}

resource "azurerm_subnet" "main" {
  for_each             = local.subnets
  name                 = each.key
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [each.value]
}

# The SHIR's subnet: it calls OUT to Data Factory on 443 and nothing calls in.
resource "azurerm_network_security_group" "shir" {
  name                = "nsg-tradefin-shir"
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags

  security_rule {
    name                       = "allow-https-out"
    priority                   = 100
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "VirtualNetwork"
    destination_address_prefix = "AzureCloud"
  }

  security_rule {
    name                       = "deny-internet-in"
    priority                   = 200
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "shir" {
  subnet_id                 = azurerm_subnet.main["snet-shir"].id
  network_security_group_id = azurerm_network_security_group.shir.id
}

# TradeBook, in the bank: the desk's PostgreSQL on a server in the bank's own
# network (UK West), beside the integration runtime. Nothing on the internet
# reaches it; the runtime does, on 5432, and nothing else needs to.
resource "random_password" "tradebook" {
  length  = 24
  special = false # it travels inside a connection string
}

# The password Data Factory logs in with lives in Key Vault, never in a
# linked service: the factory reads it at run time, wearing its identity.
resource "azurerm_key_vault_secret" "tradebook" {
  name         = "tradebook-adf-password"
  value        = random_password.tradebook.result
  key_vault_id = module.keyvault.id
  depends_on   = [azurerm_role_assignment.secrets_officer]
}

resource "random_password" "tradebook_admin" {
  length  = 24
  special = false
}

resource "azurerm_network_interface" "tradebook" {
  name                = "nic-bank-tradebook"
  resource_group_name = azurerm_resource_group.main.name
  location            = "ukwest"
  tags                = local.tags

  ip_configuration {
    name                          = "ipconfig"
    subnet_id                     = azurerm_subnet.bank.id
    private_ip_address_allocation = "Static"
    private_ip_address            = "10.10.1.10"
  }
}

# The server's first boot installs PostgreSQL and loads TradeBook as it stood
# at batch 41 (tradebook_gen's seed). The desk's later days are applied by
# the course, as they happen.
locals {
  dir = "data/tradebook" # tradebook_gen's files
  seed = ["counterparties.csv", "lc_deals.csv", "lc_amendments.csv",
  "desk-2026-10-31.sql", "desk-late.sql"]
}

resource "azurerm_linux_virtual_machine" "tradebook" {
  name                            = "vm-bank-tradebook"
  resource_group_name             = azurerm_resource_group.main.name
  location                        = "ukwest"
  tags                            = local.tags
  size                            = "Standard_D2als_v7"
  disk_controller_type            = "NVMe"
  admin_username                  = "dbadmin"
  admin_password                  = random_password.tradebook_admin.result
  disable_password_authentication = false
  network_interface_ids           = [azurerm_network_interface.tradebook.id]
  custom_data = base64encode(templatefile("tradebook-init.yaml", {
    password = random_password.tradebook.result
    files = merge(
      { for f in ["schema.sql", "load.sql"] : f => "../tradebook/${f}" },
      { for f in local.seed : "${local.dir}/${f}" => "../${local.dir}/${f}" },
    )
  }))

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = "latest"
  }
}

# The bank reaches Azure over its VPN; the course stands a peering in for it.
# Traffic between the two networks stays on Microsoft's backbone.
resource "azurerm_virtual_network_peering" "bank_to_tradefin" {
  name                      = "peer-bank-to-tradefin"
  resource_group_name       = azurerm_resource_group.main.name
  virtual_network_name      = azurerm_virtual_network.bank.name
  remote_virtual_network_id = module.network.id
}

resource "azurerm_virtual_network_peering" "tradefin_to_bank" {
  name                      = "peer-tradefin-to-bank"
  resource_group_name       = azurerm_resource_group.main.name
  virtual_network_name      = "vnet-tradefin-${var.env}"
  remote_virtual_network_id = azurerm_virtual_network.bank.id
  depends_on                = [module.network]
}

# The bank's servers must resolve the lake's name to its PRIVATE endpoint:
# the same two private DNS zones, linked to the bank's network too.
resource "azurerm_private_dns_zone_virtual_network_link" "bank" {
  for_each            = azurerm_private_dns_zone.lake
  name                = "link-bank-${each.key}"
  private_dns_zone_id = each.value.id
  virtual_network_id  = azurerm_virtual_network.bank.id
  tags                = local.tags
}

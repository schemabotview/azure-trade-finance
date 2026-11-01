# Data Factory, wearing the pipeline's identity, and its self-hosted
# integration runtime: an agent on a VM in snet-shir that calls OUT to Data
# Factory over 443 and asks for work. Nothing connects in.
resource "azurerm_data_factory" "main" {
  name                = "adf-tradefin-${var.env}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.pipeline.id]
  }
}

resource "azurerm_data_factory_integration_runtime_self_hosted" "tradebook" {
  name            = "ir-tradebook-shir"
  data_factory_id = azurerm_data_factory.main.id
}

# A new VNet's subnets have no default way out: a NAT gateway gives snet-shir
# one fixed public address for outbound traffic only.
resource "azurerm_public_ip" "nat" {
  name                = "pip-tradefin-nat"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
  sku                 = "Standard"
  allocation_method   = "Static"
}

resource "azurerm_nat_gateway" "shir" {
  name                = "ng-tradefin-shir"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
  sku_name            = "Standard"
}

resource "azurerm_nat_gateway_public_ip_association" "shir" {
  nat_gateway_id       = azurerm_nat_gateway.shir.id
  public_ip_address_id = azurerm_public_ip.nat.id
}

resource "azurerm_subnet_nat_gateway_association" "shir" {
  subnet_id      = module.network.subnet_ids["snet-shir"]
  nat_gateway_id = azurerm_nat_gateway.shir.id
}

# The VM: Windows (the runtime runs only there), no public address.
resource "random_password" "shir" {
  length = 24
}

resource "azurerm_network_interface" "shir" {
  name                = "nic-tradefin-shir"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags

  ip_configuration {
    name                          = "internal"
    subnet_id                     = module.network.subnet_ids["snet-shir"]
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_windows_virtual_machine" "shir" {
  name                  = "vm-tradefin-shir"
  computer_name         = "tradefin-shir"
  resource_group_name   = azurerm_resource_group.main.name
  location              = var.location
  tags                  = local.tags
  size                  = "Standard_D2s_v5"
  admin_username        = "shiradmin"
  admin_password        = random_password.shir.result
  network_interface_ids = [azurerm_network_interface.shir.id]
  patch_mode            = "AutomaticByPlatform" # Azure Edition images require it

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2022-datacenter-azure-edition-core"
    version   = "latest"
  }
}

locals {
  shir_key = (
    azurerm_data_factory_integration_runtime_self_hosted.tradebook
    .primary_authorization_key
  )
}

# Install the runtime and register it with the factory's key. The key goes in
# protected settings: Azure encrypts it, and no output prints it.
resource "azurerm_virtual_machine_extension" "shir" {
  name                 = "install-shir"
  virtual_machine_id   = azurerm_windows_virtual_machine.shir.id
  publisher            = "Microsoft.Compute"
  type                 = "CustomScriptExtension"
  type_handler_version = "1.10"
  tags                 = local.tags

  protected_settings = jsonencode({
    commandToExecute = join(" ", [
      "powershell -ExecutionPolicy Unrestricted -EncodedCommand",
      textencodebase64(templatefile("${path.module}/shir-install.ps1", {
        key = local.shir_key
      }), "UTF-16LE"),
    ])
  })
}

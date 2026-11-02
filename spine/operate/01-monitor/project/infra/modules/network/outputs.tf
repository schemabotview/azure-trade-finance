output "id" { value = azurerm_virtual_network.main.id }
output "subnet_ids" { value = { for k, s in azurerm_subnet.main : k => s.id } }

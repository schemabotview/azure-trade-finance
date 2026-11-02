# Course 12: the factory's own records, kept where they can be queried. A
# Log Analytics workspace, and a diagnostic setting that sends Data
# Factory's pipeline, activity and trigger runs to it, one table each.
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-tradefin-${var.env}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_monitor_diagnostic_setting" "adf" {
  name                           = "diag-adf-to-log"
  target_resource_id             = azurerm_data_factory.main.id
  log_analytics_workspace_id     = azurerm_log_analytics_workspace.main.id
  log_analytics_destination_type = "Dedicated" # a table per category

  dynamic "enabled_log" {
    for_each = ["PipelineRuns", "ActivityRuns", "TriggerRuns"]
    content {
      category = enabled_log.value
    }
  }
}

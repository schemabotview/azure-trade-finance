# A failed activity is somebody's morning: every 15 minutes, look back an
# hour for failed activity runs, and tell the risk team's action group.
resource "azurerm_monitor_scheduled_query_rules_alert_v2" "failed" {
  name                 = "alert-adf-activity-failed"
  resource_group_name  = azurerm_resource_group.main.name
  location             = var.location
  tags                 = local.tags
  scopes               = [azurerm_log_analytics_workspace.main.id]
  severity             = 2
  evaluation_frequency = "PT15M"
  window_duration      = "PT1H"
  description          = "A Data Factory activity failed: see ADFActivityRun"

  criteria {
    query                   = file("${path.module}/queries/failed.kql")
    time_aggregation_method = "Count"
    operator                = "GreaterThan"
    threshold               = 0
  }

  action {
    action_groups = [azurerm_monitor_action_group.risk.id]
  }
}

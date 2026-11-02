# The pipelines: one file each in pipelines/, holding its parameters and its
# activities in the shape Data Factory itself stores. A new file is a new
# pipeline; Terraform deploys each as written.
locals {
  pipelines = {
    for f in fileset("${path.module}/pipelines", "*.json") :
    trimsuffix(f, ".json") => jsondecode(file("${path.module}/pipelines/${f}"))
  }
}

resource "azurerm_data_factory_pipeline" "main" {
  for_each        = local.pipelines
  name            = each.key
  data_factory_id = azurerm_data_factory.main.id
  parameters      = { for p in each.value.parameters : p => "" }
  activities_json = jsonencode(each.value.activities)
  depends_on = [
    azurerm_data_factory_custom_dataset.tradebook,
    azurerm_data_factory_custom_dataset.landing,
  ]
}

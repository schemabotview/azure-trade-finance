# Who exists. Entra ID's users and groups are Microsoft Graph objects, not
# Azure resources: Terraform's azuread provider manages them through Graph.
# This file is validated offline; applying it needs Graph permissions
# (Group.ReadWrite.All, User.Read.All) that this course's identity lacks.
data "azuread_client_config" "me" {}

variable "risk_engineers" {
  description = "the trade risk platform's engineers, by sign-in name"
  type        = list(string)
  default     = ["ana@syndicabank.onmicrosoft.example"]
}

data "azuread_users" "risk_engineers" {
  user_principal_names = var.risk_engineers
}

# Roles go to the GROUP, never to a person: someone who joins or leaves the
# team changes one membership, not every role assignment (§4.3).
resource "azuread_group" "risk_eng" {
  display_name     = "grp-trade-risk-eng"
  description      = "lc-exposure's engineers: Azure roles are granted here"
  security_enabled = true
  owners           = [data.azuread_client_config.me.object_id]
  members          = data.azuread_users.risk_engineers.object_ids
}

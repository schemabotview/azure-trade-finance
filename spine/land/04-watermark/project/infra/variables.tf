variable "env" {
  description = "dev or prod: names every resource, and picks the state file"
  type        = string
}

variable "location" {
  type    = string
  default = "uksouth"
}

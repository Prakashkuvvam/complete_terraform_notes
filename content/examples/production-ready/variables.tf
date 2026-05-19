---
title: "variable "availability_zones" {"
type: docs
---

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "app_version" {
  description = "Application version to deploy"
  type        = string
  default     = "latest"
}

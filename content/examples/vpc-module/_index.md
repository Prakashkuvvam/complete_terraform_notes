---
title: "VPC Module Example"
weight: 20
type: docs
bookToc: false
---

# Reusable VPC Module

This example demonstrates how to use the official [AWS VPC Terraform module](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws) from the Terraform Registry to create a production-grade VPC.

## Files

| File | Description |
|------|-------------|
| `main.tf` | Usage of the terraform-aws-modules/vpc module with public/private subnets, NAT Gateway, and VPC endpoints |

## Code

### `main.tf`

```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.0"

  name = "example-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway       = true
  enable_vpn_gateway       = false
  enable_dns_hostnames     = true
  enable_dns_support       = true
  enable_s3_endpoint       = true
  enable_dynamodb_endpoint = true

  public_subnet_tags = {
    Name = "example-public"
    Tier = "public"
  }

  private_subnet_tags = {
    Name = "example-private"
    Tier = "private"
  }

  tags = {
    Environment = "example"
    Terraform   = "true"
  }
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = module.vpc.public_subnets
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = module.vpc.private_subnets
}

output "nat_public_ips" {
  description = "List of NAT Gateway public IPs"
  value       = module.vpc.nat_public_ips
}
```

## Features

- **Public subnets** across 3 Availability Zones
- **Private subnets** across 3 Availability Zones
- **NAT Gateway** for private subnet internet access
- **VPC Endpoints** for S3 and DynamoDB
- **DNS** support enabled

## Usage

```bash
terraform init
terraform plan
terraform apply
```

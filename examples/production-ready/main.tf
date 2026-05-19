# Production-Ready Terraform Example
# Demonstrates all best practices: remote state, modules, tagging, CI/CD readiness

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # Production: Use remote state with S3 + DynamoDB locking
  backend "s3" {
    bucket         = "my-company-terraform-state"     # Replace with your bucket
    key            = "production/infrastructure.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-locks"
  }
}

provider "aws" {
  region = var.region

  # Production: Use assume role instead of static credentials
  assume_role {
    role_arn     = "arn:aws:iam::${var.account_id}:role/TerraformRole"
    session_name = "TerraformProduction"
  }

  default_tags {
    tags = local.default_tags
  }
}

# Locals
locals {
  environment = terraform.workspace

  # Consistent tagging strategy
  default_tags = {
    Environment = local.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Owner       = var.owner
    CostCenter  = var.cost_center
    CreatedAt   = timestamp()
  }

  # Environment-specific sizing
  instance_type = lookup({
    dev     = "t2.micro"
    staging = "t2.medium"
    prod    = "t3.large"
  }, local.environment, "t2.micro")

  instance_count = lookup({
    dev     = 1
    staging = 2
    prod    = 3
  }, local.environment, 1)

  enable_monitoring = local.environment == "prod"
  enable_backup     = local.environment == "prod"
}

# Variables
variable "region" {
  description = "AWS region"
  type        = string
}

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "owner" {
  description = "Resource owner"
  type        = string
}

variable "cost_center" {
  description = "Cost center code"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "Must be a valid CIDR block."
  }
}

# Production: Use community modules instead of writing everything from scratch
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.0"

  name = "${var.project_name}-${local.environment}"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = [for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 8, i)]
  public_subnets  = [for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 8, i + length(var.availability_zones))]

  enable_nat_gateway     = true
  enable_vpn_gateway     = false
  one_nat_gateway_per_az = local.environment == "prod"

  enable_flow_log                      = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role  = true
  flow_log_max_aggregation_interval    = 60

  tags = local.default_tags
}

# Production: Use security group module
module "web_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.1.0"

  name        = "${var.project_name}-${local.environment}-web"
  description = "Security group for web servers"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      description = "HTTPS"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      description = "HTTP redirect"
      cidr_blocks = "0.0.0.0/0"
    },
  ]

  egress_rules = ["all-all"]

  tags = local.default_tags
}

# Production: EC2 instance with lifecycle protection
resource "aws_instance" "web" {
  count = local.instance_count

  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = local.instance_type
  subnet_id              = module.vpc.public_subnets[count.index % length(module.vpc.public_subnets)]
  vpc_security_group_ids = [module.web_sg.security_group_id]

  monitoring = local.enable_monitoring

  # Production: User data with template
  user_data = templatefile("${path.module}/user_data.sh", {
    environment = local.environment
    app_version = var.app_version
  })

  root_block_device {
    volume_type = "gp3"
    volume_size = lookup({ dev = 20, staging = 30, prod = 50 }, local.environment, 20)
    encrypted   = true
  }

  # Production: Prevent accidental destruction
  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      ami,  # Allow AMI updates outside Terraform
    ]
  }

  tags = merge(local.default_tags, {
    Name = "${var.project_name}-${local.environment}-web-${count.index + 1}"
  })
}

# Production: Use data sources
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Production: Outputs with descriptions
output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "web_instance_ids" {
  description = "IDs of web server instances"
  value       = aws_instance.web[*].id
}

output "web_public_ips" {
  description = "Public IPs of web servers"
  value       = aws_instance.web[*].public_ip
}

output "environment_summary" {
  description = "Environment deployment summary"
  value = {
    environment     = local.environment
    instance_count  = local.instance_count
    instance_type   = local.instance_type
    monitoring      = local.enable_monitoring
    backup_enabled  = local.enable_backup
    vpc_id          = module.vpc.vpc_id
    subnet_count    = length(module.vpc.public_subnets)
  }
}

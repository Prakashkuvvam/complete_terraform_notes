---
title: "Hands-On Labs"
weight: 20
chapter: true
---

# Hands-On Labs 🛠️

> **Practice makes perfect!** These labs take you from basic to advanced Terraform skills.

## Lab Progression

| Lab | Topic | Difficulty | Time |
|-----|-------|------------|------|
| 01 | Deploy an EC2 Instance | ⭐ Beginner | 15 min |
| 02 | VPC with Public/Private Subnets | ⭐ Beginner | 20 min |
| 03 | Reusable VPC Module | ⭐⭐ Intermediate | 25 min |
| 04 | Multi-Environment with Workspaces | ⭐⭐ Intermediate | 30 min |
| 05 | Remote State with S3 + DynamoDB | ⭐⭐⭐ Advanced | 20 min |
| 06 | Production 3-Tier Web Architecture | ⭐⭐⭐ Advanced | 45 min |

---

## Lab 01: Deploy an EC2 Instance

### Prerequisites
- Terraform installed
- AWS CLI configured
- AWS credentials with EC2 permissions

### Objectives
- Write your first Terraform configuration
- Use data sources to find an AMI
- Create a security group and EC2 instance
- Understand outputs

### Steps

```hcl
# Step 1: Create main.tf
provider "aws" {
  region = "us-east-1"
}

# Step 2: Find the latest Amazon Linux 2 AMI
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

# Step 3: Create a security group
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow HTTP and SSH"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Step 4: Create the EC2 instance
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y httpd
    systemctl enable httpd
    systemctl start httpd
    echo "<h1>Hello from Terraform Lab 01</h1>" > /var/www/html/index.html
  EOF

  tags = {
    Name = "Terraform-Lab-01"
  }
}

# Step 5: Create outputs
output "instance_id" {
  value = aws_instance.web.id
}

output "public_ip" {
  value = aws_instance.web.public_ip
}
```

### Commands

```bash
# Initialize
terraform init

# Plan
terraform plan

# Apply (type 'yes' when prompted)
terraform apply

# Test: Open http://<public_ip> in browser

# Destroy when done
terraform destroy
```

### Validation
- Run `terraform state list` — should show resources
- Visit `http://<public_ip>` — should see "Hello from Terraform Lab 01"

---

## Lab 02: VPC with Public/Private Subnets

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "Lab-02-VPC" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "Lab-02-IGW" }
}

resource "aws_subnet" "public" {
  count = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "Lab-02-Public-${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "Lab-02-Private-${count.index + 1}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "Lab-02-Public-RT" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

### Challenges
1. Add a NAT Gateway for private subnets
2. Add a private route table with NAT Gateway
3. Deploy an EC2 instance in the private subnet

---

## Lab 03: Reusable VPC Module

### Module Structure
```
modules/
└── vpc/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── README.md
```

```hcl
# modules/vpc/variables.tf
variable "name" {
  description = "Name prefix for resources"
  type        = string
}

variable "cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "azs" {
  description = "Availability Zones"
  type        = list(string)
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
```

```hcl
# modules/vpc/main.tf
locals {
  az_count = length(var.azs)
}

resource "aws_vpc" "this" {
  cidr_block           = var.cidr
  enable_dns_hostnames = true
  tags = merge(var.tags, { Name = "${var.name}-vpc" })
}

resource "aws_subnet" "public" {
  count = local.az_count
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.cidr, 8, count.index)
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true
  tags = merge(var.tags, { Name = "${var.name}-public-${count.index + 1}" })
}

resource "aws_subnet" "private" {
  count = local.az_count
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.cidr, 8, count.index + local.az_count)
  availability_zone = var.azs[count.index]
  tags = merge(var.tags, { Name = "${var.name}-private-${count.index + 1}" })
}
```

```hcl
# modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}
```

---

## Lab 04: Multi-Environment with Workspaces

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-123456789012"
    key            = "workspace-lab/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# main.tf
locals {
  config = {
    default = { instance_type = "t2.micro", count = 1 }
    dev     = { instance_type = "t2.nano",   count = 1 }
    staging = { instance_type = "t2.small",  count = 2 }
    prod    = { instance_type = "t3.medium", count = 3 }
  }
  env_config = lookup(local.config, terraform.workspace, local.config.default)
}

resource "aws_instance" "web" {
  count = local.env_config.count
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = local.env_config.instance_type
  tags = {
    Name        = "webserver-${terraform.workspace}-${count.index + 1}"
    Environment = terraform.workspace
  }
}
```

### Commands

```bash
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod
terraform workspace select dev
terraform plan
terraform apply
```

---

## Lab 05: Remote State with S3 + DynamoDB

```hcl
# backend-infra/main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}

data "aws_caller_identity" "current" {}
```

---

## Lab 06: Production 3-Tier Web Architecture

Build a production-ready architecture:

```
                    ┌─────────────┐
                    │  Route 53   │
                    └──────┬──────┘
                    ┌──────▼──────┐
                    │  CloudFront  │
                    └──────┬──────┘
                    ┌──────▼──────┐
                    │    ALB       │
                    └──────┬──────┘
              ┌────────────┼────────────┐
        ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐
        │  ASG Web   │ │ ASG App│ │  ASG App  │
        └───────────┘ └────────┘ └──────────┘
                            │
                    ┌───────▼───────┐
                    │     RDS        │
                    └───────────────┘
```

### Key Components
- **Networking**: VPC with public/private subnets across 3 AZs
- **Web Tier**: Auto-scaling group with ALB in public subnets
- **App Tier**: Auto-scaling group in private subnets
- **Database**: RDS PostgreSQL in private subnets with Multi-AZ
- **Security**: Security groups with least privilege
- **Monitoring**: CloudWatch alarms and dashboards

> See [examples directory]({{< relref "/examples" >}}) for the full implementation.

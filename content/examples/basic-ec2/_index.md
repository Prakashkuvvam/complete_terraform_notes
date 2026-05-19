---
title: "Basic EC2 Example"
weight: 10
type: docs
bookToc: false
---

# Basic EC2 Instance

This example demonstrates the simplest Terraform setup for deploying a single EC2 instance with a security group on AWS.

## Files

| File | Description |
|------|-------------|
| `main.tf` | Main configuration: provider, data source (AMI), security group, EC2 instance, outputs |
| `variables.tf` | Input variables for customization (instance type, key name, tags) |
| `terraform.tfvars.example` | Example variable values (copy to `terraform.tfvars` and edit) |

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
  region = var.region
}

# Variables
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

# Data Sources
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

# Security Group
resource "aws_security_group" "web" {
  name        = "basic-ec2-web-sg"
  description = "Security group for basic EC2 example"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound"
  }

  tags = { Name = "basic-ec2-web-sg" }
}

# EC2 Instance
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.key_name

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y httpd
    systemctl enable httpd
    systemctl start httpd
    echo "<h1>Welcome to Terraform Basic EC2 Example</h1>" > /var/www/html/index.html
    echo "<p>Instance: $(curl -s http://169.254.169.254/latest/meta-data/instance-id)</p>" >> /var/www/html/index.html
    echo "<p>AZ: $(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)</p>" >> /var/www/html/index.html
  EOF

  tags = {
    Name = "basic-ec2-web"
  }
}

# Outputs
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.web.id
}

output "public_ip" {
  description = "Public IP address"
  value       = aws_instance.web.public_ip
}

output "public_dns" {
  description = "Public DNS name"
  value       = aws_instance.web.public_dns
}

output "website_url" {
  description = "URL to access the web server"
  value       = "http://${aws_instance.web.public_ip}"
}
```

### `variables.tf`

```hcl
variable "key_name" {
  description = "SSH key pair name for EC2 instance"
  type        = string
  default     = null
}
```

### `terraform.tfvars.example`

```hcl
region         = "us-east-1"
instance_type  = "t2.micro"
# key_name = "your-key-pair-name"  # Uncomment and set if you want SSH access
```

## Usage

```bash
# Initialize
terraform init

# Review the plan
terraform plan

# Apply (type 'yes' when prompted)
terraform apply

# Destroy when done
terraform destroy
```

## Resources Created

- **EC2 Instance** (`t2.micro` by default) with Amazon Linux 2
- **Security Group** allowing SSH (22) and HTTP (80) from anywhere

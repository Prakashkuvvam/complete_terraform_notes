---
title: "Chapter 4: Resources, Data Sources & Meta-Arguments"
weight: 4
bookFlatSection: false
bookToc: true
---

# Chapter 4: Resources, Data Sources & Meta-Arguments

## 🎯 Learning Objectives

- Master resource configuration and attributes
- Use data sources to query existing infrastructure
- Understand and apply meta-arguments (count, for_each, depends_on, lifecycle)
- Handle resource dependencies and creation order
- Use dynamic blocks for flexible configurations

---

## 4.1 Resources Deep Dive

### Resource Behavior (Exam Critical)

Terraform resources have specific behaviors based on which attributes change:

| Change Type | Behavior | Example |
|-------------|----------|---------|
| **In-place update** | Resource modified without destroying | Changing tags on an instance |
| **Recreation** | Destroyed and re-created | Changing AMI on an EC2 instance |
| **Destroy and recreate** | Old destroyed, new created (order depends on lifecycle) | Changing immutable field |

### Resource Behaviors

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  # Some changes cause recreation
  # Changing AMI → forces recreation
  # Changing instance_type → forces recreation (for most instance types)
  # Changing tags → in-place update
  
  tags = {
    Name = "WebServer"
  }
}

# What "forces new resource" is documented in each resource's docs
# Example from AWS provider docs:
# "ami" - (Required) ... Forces new resource
# "instance_type" - (Optional) ... Not all instance types force new resource
```

---

## 4.2 Resource Meta-Arguments

### `count` — Create Multiple Resources from a Count

```hcl
variable "instance_count" {
  type    = number
  default = 3
}

# Create 3 EC2 instances
resource "aws_instance" "web" {
  count = var.instance_count
  #   ↑ Creates this many instances
  
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  # Use count.index to differentiate instances
  tags = {
    Name = "WebServer-${count.index + 1}"
    #                          ↑ 0, 1, 2 → WebServer-1, WebServer-2, WebServer-3
  }
}

# Accessing resources created with count
output "instance_ids" {
  value = aws_instance.web[*].id
  # Returns all instance IDs as a list
}

output "first_instance" {
  value = aws_instance.web[0].id
  # Access specific index
}
```

### `for_each` — Create Resources from a Map or Set

```hcl
# For each from a map
variable "users" {
  type = map(object({
    role        = string
    groups      = list(string)
  }))
  default = {
    "alice" = { role = "developer", groups = ["dev", "read-only"] }
    "bob"   = { role = "admin",      groups = ["admin", "devops"] }
  }
}

resource "aws_iam_user" "this" {
  for_each = var.users
  #   ↑ Creates one resource per map entry
  
  name = each.key
  #     ↑ "alice", "bob"
  
  tags = {
    Role = each.value.role
    #     ↑ "developer", "admin"
  }
}

# For each from a set
resource "aws_iam_user_group_membership" "this" {
  for_each = var.users
  
  user = each.key
  groups = each.value.groups
}

# For each with a list (convert to set first)
variable "instance_names" {
  type    = list(string)
  default = ["web", "app", "db"]
}

resource "aws_instance" "web" {
  for_each = toset(var.instance_names)
  #                ↑ Converts list to set for for_each
  
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "${each.key}-instance"
    #     ↑ "web-instance", "app-instance", "db-instance"
  }
}
```

### `count` vs `for_each` — When to Use Which (Exam Critical)

| Use Case | Use `count` | Use `for_each` |
|----------|-------------|----------------|
| Simple numbered resources | ✅ | ❌ |
| Resources from a map | ❌ | ✅ |
| Resources need unique names | ❌ | ✅ |
| You need to delete specific items | ❌ (shifts indexes) | ✅ (stable keys) |
| Resources from a list | ✅ | ✅ (use `toset()`) |
| Conditional resource creation | ✅ (`count = 0 or 1`) | ❌ |

**Important:** With `count`, if you remove an item from the middle of a list, all subsequent resources get recreated (index shift). With `for_each`, each resource has a stable key, so removing one doesn't affect others.

```hcl
# BAD: Count with mutable list — removing index 1 shifts all others
variable "azs" {
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
  #        If "us-east-1b" is removed:
  #        - us-east-1a[0] → stays the same
  #        - us-east-1b[1] → was index 1, now index 1 becomes us-east-1c (recreated!)
  #        - us-east-1c[2] → removed
}

resource "aws_subnet" "bad" {
  count = length(var.azs)
  availability_zone = var.azs[count.index]
  cidr_block = cidrsubnet("10.0.0.0/16", 8, count.index)
}

# GOOD: For each with set
resource "aws_subnet" "good" {
  for_each = toset(var.azs)
  #         ↑ Each AZ has a stable key
  
  availability_zone = each.key
  cidr_block = cidrsubnet("10.0.0.0/16", 8, index(var.azs, each.key))
}
```

---

## 4.3 Data Sources

**Data Sources** allow Terraform to read information from existing infrastructure that is not managed by your configuration.

### Data Source Syntax

```hcl
data "aws_ami" "ubuntu" {
  #  ↑ Data source type
  #              ↑ Local name
  
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
  owners = ["099720109477"]  # Canonical
}

# Using the data source
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  #                 ↑ Reference to data source
  instance_type = "t2.micro"
}
```

### Common Data Source Patterns

```hcl
# 1. Get the default VPC
data "aws_vpc" "default" {
  default = true
}

# 2. Get specific VPC
data "aws_vpc" "selected" {
  tags = {
    Name = "production"
  }
}

# 3. Get availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# 4. Get current AWS caller identity
data "aws_caller_identity" "current" {}

# 5. Get current AWS region
data "aws_region" "current" {}

# 6. Get existing security group
data "aws_security_group" "existing" {
  name = "default"
}

# 7. Get S3 bucket
data "aws_s3_bucket" "existing" {
  bucket = "my-existing-bucket"
}

# 8. Get IAM policy document (build JSON)
data "aws_iam_policy_document" "s3_policy" {
  statement {
    effect = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${var.bucket_name}/*"]
    
    principals {
      type        = "AWS"
      identifiers = [data.aws_caller_identity.current.arn]
    }
  }
}
```

### Using Data Sources in Practice

```hcl
# Full example: Deploy EC2 using latest AMI in default VPC
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

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow web traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t2.micro"
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.web.id]
  
  tags = {
    Name = "WebServer"
  }
}
```

### Data Sources for Cross-Reference

```hcl
# Reference resources in another account or region
data "aws_vpc" "shared" {
  provider = aws.shared_account
  tags = {
    Name = "shared-vpc"
  }
}

# Reference Route53 zone
data "aws_route53_zone" "selected" {
  name         = "example.com."
  private_zone = false
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = "www.${data.aws_route53_zone.selected.name}"
  type    = "A"
  
  alias {
    name                   = aws_lb.web.dns_name
    zone_id                = aws_lb.web.zone_id
    evaluate_target_health = true
  }
}
```

---

## 4.4 Dynamic Blocks

**Dynamic blocks** allow you to create repeatable nested blocks inside resources.

```hcl
# Without dynamic blocks (hardcoded)
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Web security group"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
    description = "SSH"
  }
}

# With dynamic blocks
variable "ingress_rules" {
  type = list(object({
    port        = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Web security group"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.ingress_rules
    #        ↑ Iterates over each rule
    
    content {
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
      description = ingress.value.description
    }
  }
}
```

### Dynamic Block with Condition

```hcl
variable "enable_ssh" {
  type    = bool
  default = true
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Web security group"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.enable_ssh ? [1] : []
    content {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["10.0.0.0/8"]
    }
  }
}
```

### Nested Dynamic Blocks

```hcl
# Complex example: EBS block devices
variable "block_devices" {
  type = list(object({
    device_name  = string
    volume_type  = string
    volume_size  = number
    encrypted    = bool
    kms_key_id   = optional(string)
    delete_on_termination = optional(bool, true)
  }))
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  dynamic "ebs_block_device" {
    for_each = var.block_devices
    
    content {
      device_name = ebs_block_device.value.device_name
      volume_type = ebs_block_device.value.volume_type
      volume_size = ebs_block_device.value.volume_size
      encrypted   = ebs_block_device.value.encrypted
      
      dynamic "kms_key" {
        for_each = ebs_block_device.value.kms_key_id != null ? [ebs_block_device.value.kms_key_id] : []
        content {
          key_id = kms_key.value
        }
      }
    }
  }
}
```

---

## 4.5 Resource Behavior and Timeouts

Some resources support configurable timeouts for create, update, and delete operations.

```hcl
resource "aws_db_instance" "database" {
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.r6g.large"
  
  timeouts {
    create = "60m"
    update = "30m"
    delete = "2h"
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  timeouts {
    create = "15m"
    update = "15m"
    delete = "15m"
  }
}
```

---

## 4.6 Resource Providers Configuration

### Multiple Provider Instances

```hcl
# providers.tf
provider "aws" {
  region = "us-east-1"
}

provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

provider "aws" {
  alias  = "europe"
  region = "eu-west-1"
}

# main.tf
resource "aws_instance" "primary" {
  # Uses default provider (us-east-1)
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

resource "aws_instance" "secondary" {
  provider      = aws.west
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

resource "aws_instance" "europe" {
  provider      = aws.europe
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
```

### Provider with Assume Role

```hcl
provider "aws" {
  region = "us-east-1"
  
  assume_role {
    role_arn     = "arn:aws:iam::123456789012:role/TerraformRole"
    session_name = "TerraformSession"
    duration     = "1h"
  }
}

# Cross-account provider
provider "aws" {
  alias  = "production"
  region = "us-east-1"
  
  assume_role {
    role_arn = "arn:aws:iam::PRODUCTION_ACCOUNT:role/TerraformRole"
  }
}

# Use the cross-account provider
resource "aws_s3_bucket" "production_logs" {
  provider = aws.production
  bucket   = "production-logs"
}
```

---

## 4.7 Complete Practical Example

```hcl
# variables.tf
variable "environment" {
  type        = string
  description = "Environment name"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}

variable "instance_type" {
  type        = string
  default     = "t2.micro"
  description = "EC2 instance type"
}

# data.tf
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# main.tf
locals {
  az_count = min(3, length(data.aws_availability_zones.available.names))
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "main-vpc-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count = local.az_count

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet("10.0.0.0/16", 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "public-${count.index + 1}"
    Environment = var.environment
    Tier        = "public"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "main-igw-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "public-rt-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = local.az_count
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "web" {
  name        = "web-sg-${var.environment}"
  description = "Web server security group"
  vpc_id      = aws_vpc.main.id

  dynamic "ingress" {
    for_each = var.environment == "prod" ? [80, 443] : [80]
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "web-sg-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_instance" "web" {
  for_each = var.environment == "prod" ? { "web1" = {}, "web2" = {} } : { "web1" = {} }

  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.web.id]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "web-${each.key}-${var.environment}"
    Environment = var.environment
  }
}

# outputs.tf
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "web_instance_ids" {
  value = { for k, v in aws_instance.web : k => v.id }
}

output "web_public_ips" {
  value = { for k, v in aws_instance.web : k => v.public_ip }
}
```

---

## 📝 Exam Tips

1. **`count` creates numbered resources** — Use with caution when list order might change
2. **`for_each` creates keyed resources** — Prefer over `count` for dictionaries/sets
3. **Data sources are read-only** — They don't modify infrastructure
4. **Data sources use the `data` keyword** — Not `resource`
5. **Dynamic blocks create nested blocks** — Use for security group rules, tags, etc.
6. **`depends_on` is for explicit dependencies** — Use only when Terraform can't infer
7. **`lifecycle` rules control update behavior** — prevent_destroy, create_before_destroy, ignore_changes
8. **`timeouts` configures max wait times** — For resources that take long to provision
9. **Data sources are refreshed during plan** — To get current state of external resources
10. **`count.index` and `each.key`/`each.value`** — Used inside resources with count/for_each

---

## ✅ Chapter 4 Quiz

1. **Which meta-argument should you use to create resources from a map of unique keys?**
   - a) `count`
   - b) `for_each`
   - c) `depends_on`
   - d) `lifecycle`

2. **What is the purpose of a data source?**
   - a) To create new infrastructure
   - b) To read information from existing infrastructure
   - c) To modify existing infrastructure
   - d) To delete existing infrastructure

3. **Which keyword accesses the current iteration value inside a `for_each` block?**
   - a) `count.index`
   - b) `each.value`
   - c) `self`
   - d) `this`

4. **True or False:** `count` blocks cause all resources after a removed item to be recreated.

5. **What does `dynamic` block allow you to do?**
   - a) Dynamically change provider versions
   - b) Create repeatable nested blocks inside resources
   - c) Dynamically change variable values
   - d) Create resources at runtime

<details>
<summary>📌 Answers</summary>

1. **b** — `for_each` works with maps/sets, providing stable keys
2. **b** — Data sources read information from existing infrastructure
3. **b** — `each.value` (and `each.key`) access iteration values in for_each
4. **True** — Removing an item from the middle shifts all subsequent indices
5. **b** — Dynamic blocks create repeatable nested blocks
</details>

---

*Continue to → <a href="{{< relref "05-variables-and-outputs" >}}">Chapter 5: Variables, Outputs & Locals</a>*

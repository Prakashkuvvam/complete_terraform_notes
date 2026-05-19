---
title: "Chapter 12: Importing, Refactoring & State Migrations"
weight: 12
bookFlatSection: false
bookToc: true
---

# Chapter 12: Importing, Refactoring & State Migrations

## 🎯 Learning Objectives

- Import existing infrastructure into Terraform management
- Refactor resources without destroying them
- Use moved blocks for safe resource renaming
- Manage state operations (state mv, state rm, state pull/push)
- Handle module refactoring gracefully

---

## 12.1 Why Import?

**Importing** brings existing infrastructure under Terraform management without recreating it.

### When to Import

- Resources created outside Terraform (console, CLI, SDK)
- Legacy infrastructure
- Migrating from another IaC tool
- Resources created by other teams

### The Import Workflow

```
1. Write configuration   → main.tf with resource block
2. Run terraform import  → Links state to real resource
3. Run terraform plan    → Should show "No changes"
4. Run terraform apply   → Not needed (already exists)
```

---

## 12.2 The `terraform import` Command

### Basic Import

```bash
# Syntax: terraform import <RESOURCE_TYPE>.<LOCAL_NAME> <ID>
terraform import aws_instance.web i-0abcd1234efgh5678

# Import to resource with count index
terraform import 'aws_instance.web[0]' i-0abcd1234efgh5678

# Import to resource with for_each key
terraform import 'aws_instance.web["web1"]' i-0abcd1234efgh5678

# Import a module resource
terraform import 'module.vpc.aws_vpc.this' vpc-12345678
```

### Step-by-Step Import Example

```hcl
# Step 1: Write the configuration
resource "aws_s3_bucket" "data" {
  bucket = "my-existing-data-bucket"  # Must match existing bucket
  
  tags = {
    Name = "My Data Bucket"
  }
}

resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

```bash
# Step 2: Import
terraform import aws_s3_bucket.data my-existing-data-bucket

# Step 3: Import dependent resources
terraform import aws_s3_bucket_versioning.data my-existing-data-bucket

# Step 4: Verify
terraform plan
# Should show: "No changes. Your infrastructure matches the configuration."
```

### Importing Resources Created with `count`

```hcl
# Configuration using count
resource "aws_instance" "web" {
  count = 3
  
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
```

```bash
# Import each instance by index
terraform import 'aws_instance.web[0]' i-0abcd1234efgh5678
terraform import 'aws_instance.web[1]' i-0abcd1234efgh5679
terraform import 'aws_instance.web[2]' i-0abcd1234efgh5680
```

---

## 12.3 The `terraform state` Commands

### state list

```bash
# List all resources in state
terraform state list

# Filter by resource type
terraform state list aws_instance

# List resources in a module
terraform state list module.vpc

# Example output:
# aws_instance.web[0]
# aws_instance.web[1]
# aws_vpc.main
# aws_subnet.public[0]
# data.aws_ami.ubuntu
# module.vpc.aws_vpc.this
```

### state show

```bash
# Show all attributes of a resource
terraform state show aws_instance.web[0]

# Show module resource
terraform state show 'module.vpc.aws_vpc.this'

# Example output:
# # aws_instance.web[0]:
# resource "aws_instance" "web" {
#     ami                          = "ami-0c55b159cbfafe1f0"
#     arn                          = "arn:aws:ec2:us-east-1:123456789012:instance/i-0abcd1234efgh5678"
#     associate_public_ip_address  = true
#     availability_zone            = "us-east-1a"
#     id                           = "i-0abcd1234efgh5678"
#     instance_state               = "running"
#     instance_type                = "t2.micro"
#     private_ip                   = "10.0.1.5"
#     public_ip                    = "54.123.45.67"
#     subnet_id                    = "subnet-12345678"
#     tags                         = {
#         "Name" = "web-0"
#     }
# }
```

### state mv

```hcl
# Move/rename resource in state (NOT in config)
# Use before changing the resource name in config
```

```bash
# Rename a resource
terraform state mv aws_instance.web aws_instance.app_server

# Move within a module
terraform state mv aws_instance.web module.compute.aws_instance.app

# Move between modules
terraform state mv module.old.aws_instance.web module.new.aws_instance.web

# Move with indexing
terraform state mv 'aws_instance.web[0]' 'aws_instance.web["web1"]'

# Move address
terraform state mv \
  'module.vpc.aws_subnet.public' \
  'module.network.aws_subnet.public'
```

### state rm

```bash
# Remove resource from state (NOT from real world)
terraform state rm aws_instance.web_to_manage_externally

# Remove resource with index
terraform state rm 'aws_instance.web[2]'
```

### state pull and push

```bash
# Pull state to local file (backup)
terraform state pull > backup.tfstate

# Push state (use with extreme caution!)
terraform state push backup.tfstate

# Check if state is locked
terraform state pull | head -5  # Will fail if locked
```

---

## 12.4 The `moved` Block (Terraform 1.1+)

The `moved` block allows refactoring without `terraform state mv`.

### Renaming Resources

```hcl
# Before refactoring
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

# After refactoring
resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

moved {
  from = aws_instance.web
  to   = aws_instance.app_server
}
```

### Moving Resources to Modules

```hcl
# Before: resource in root module
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

# After: resource moved to module
module "compute" {
  source = "./modules/compute"
}

moved {
  from = aws_instance.web
  to   = module.compute.aws_instance.this
}
```

### Moving Resources Between Modules

```hcl
# Before
module "old_networking" {
  source = "./modules/old-network"
}

# After
module "new_networking" {
  source = "./modules/new-network"
}

# Migrate all resources from old to new module
moved {
  from = module.old_networking
  to   = module.new_networking
}

# Or specific resources
moved {
  from = module.old_networking.aws_vpc.main
  to   = module.new_networking.aws_vpc.main
}

moved {
  from = module.old_networking.aws_subnet.public
  to   = module.new_networking.aws_subnet.public
}
```

### Moving Resources with Count/For_each

```hcl
# Before: using count
resource "aws_instance" "web" {
  count = 3
  # ...
}

# After: using for_each
resource "aws_instance" "web" {
  for_each = toset(["web1", "web2", "web3"])
  # ...
}

moved {
  from = aws_instance.web[0]
  to   = aws_instance.web["web1"]
}

moved {
  from = aws_instance.web[1]
  to   = aws_instance.web["web2"]
}

moved {
  from = aws_instance.web[2]
  to   = aws_instance.web["web3"]
}
```

---

## 12.5 Refactoring Strategies

### Strategy 1: Split Configuration

```hcl
# Before: Monolithic
resource "aws_vpc" "main" { }
resource "aws_subnet" "public" { }
resource "aws_instance" "web" { }
resource "aws_db_instance" "db" { }

# After: Modular
module "network" {
  source = "./modules/network"
}

module "compute" {
  source = "./modules/compute"
}

module "database" {
  source = "./modules/database"
}

# Moved blocks
moved {
  from = aws_vpc.main
  to   = module.network.aws_vpc.main
}

moved {
  from = aws_instance.web
  to   = module.compute.aws_instance.web
}

moved {
  from = aws_db_instance.db
  to   = module.database.aws_db_instance.db
}
```

### Strategy 2: Rename Resources

```hcl
# Before
resource "aws_instance" "old_name" { }

# After
resource "aws_instance" "new_name" { }

moved {
  from = aws_instance.old_name
  to   = aws_instance.new_name
}
```

### Strategy 3: Reorganize State Files

```hcl
# Before: all in one state
# - vpc
# - security groups
# - compute
# - database

# After: separated states
# State 1: vpc
# State 2: security (references vpc state)
# State 3: compute (references vpc + security state)
# State 4: database (references vpc + security state)
```

```bash
# 1. Remove resources from old state
terraform state rm aws_vpc.main
terraform state rm aws_subnet.public

# 2. Import into new state file (cd to new directory)
cd vpc/
terraform import aws_vpc.main vpc-12345678
terraform import aws_subnet.public subnet-12345678
```

---

## 12.6 Import with `import` Block (Terraform 1.5+)

Terraform 1.5 introduced the `import` block for declarative importing.

```hcl
# declarative-import.tf
import {
  to = aws_s3_bucket.existing
  id = "my-existing-bucket"
}

resource "aws_s3_bucket" "existing" {
  bucket = "my-existing-bucket"
  # No need to run terraform import command!
  # Just run terraform plan → terraform apply
}
```

### Import Block with For_each

```hcl
import {
  for_each = {
    "bucket1" = "my-bucket-1"
    "bucket2" = "my-bucket-2"
  }
  to = aws_s3_bucket.this[each.key]
  id = each.value
}

resource "aws_s3_bucket" "this" {
  for_each = {
    "bucket1" = "my-bucket-1"
    "bucket2" = "my-bucket-2"
  }
  
  bucket = each.value
}
```

### Generate Configuration from Import

```bash
# Terraform 1.5+ can generate config for imported resources
terraform plan -generate-config-out=generated.tf

# Then:
# 1. Move generated config to main.tf
# 2. Customize as needed
# 3. Run terraform apply
```

---

## 12.7 Refactoring Modules

### Splitting a Module

```hcl
# Before: one big module
module "infrastructure" {
  source = "./modules/infrastructure"
  # Handles VPC, compute, database
}

# After: multiple focused modules
module "network" {
  source = "./modules/network"
}

module "compute" {
  source = "./modules/compute"
  vpc_id = module.network.vpc_id
}

module "database" {
  source = "./modules/database"
  vpc_id = module.network.vpc_id
}
```

### Module Version Upgrades

```hcl
# Before: old version
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.0.0"
}

# After: new version
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
}

# Best practice: Check changelog for moved resources
# Use moved blocks if the new version renamed resources
```

---

## 12.8 Practical Refactoring Examples

### Example 1: Converting `count` to `for_each`

```hcl
# Before: count
resource "aws_instance" "web" {
  count        = 3
  ami          = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "web-${count.index}"
  }
}

# After: for_each
locals {
  instance_names = toset(["web-0", "web-1", "web-2"])
}

resource "aws_instance" "web" {
  for_each = local.instance_names
  
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = each.key
  }
}

# Moved blocks
moved {
  from = aws_instance.web[0]
  to   = aws_instance.web["web-0"]
}

moved {
  from = aws_instance.web[1]
  to   = aws_instance.web["web-1"]
}

moved {
  from = aws_instance.web[2]
  to   = aws_instance.web["web-2"]
}
```

### Example 2: Renaming Module Outputs

```hcl
# Old module output
output "vpc_id_output" {
  value = aws_vpc.main.id
}

# New module output (renamed)
output "vpc_id" {
  value = aws_vpc.main.id
}

# Kept old output for backward compatibility
output "vpc_id_output" {
  value = aws_vpc.main.id
}
```

---

## 12.9 State Recovery and Troubleshooting

### Backup and Recovery

```bash
# Automatic backup
# Terraform always creates terraform.tfstate.backup
# This contains the previous state

# Manual backup
terraform state pull > backup_$(date +%Y%m%d).tfstate

# Restore from backup
terraform state push backup_20240101.tfstate

# Restore from S3 versioning
aws s3api get-object-version \
  --bucket my-terraform-state \
  --key prod/terraform.tfstate \
  --version-id VERSION_ID \
  restored.tfstate
```

### State Lock Issues

```bash
# Check if state is locked
# Error: "Error acquiring the state lock"

# Find lock info
# In DynamoDB, check the lock table

# Force unlock (ONLY when certain no other operation is running)
terraform force-unlock LOCK_ID
```

### State Migration Between Backends

```bash
# Migrate from local state to S3
terraform init -backend-config="bucket=my-bucket" -migrate-state

# Migrate from S3 to Terraform Cloud
terraform init -migrate-state

# Migrate between S3 buckets
terraform init -reconfigure -backend-config="bucket=new-bucket"
```

---

## 📝 Exam Tips

1. **`terraform import`** brings existing resources under Terraform management
2. **`moved` block** (Terraform 1.1+) refactors resources without destroy/recreate
3. **`state mv`** renames resources in state (use moved block instead when possible)
4. **`state rm`** removes from state but does NOT delete real resources
5. **`state pull/push`** — Backup and restore state files
6. **`terraform plan` after import** should show "No changes"
7. **`import` block** (Terraform 1.5+) enables declarative importing
8. **`-generate-config-out`** generates config for imported resources
9. **State backup** is automatically created before modifications
10. **Force unlock** only when no other operation is running

---

## ✅ Chapter 12 Quiz

1. **What does `terraform import` do?**
   - a) Creates new resources
   - b) Adds existing resources to state without recreating
   - c) Deletes resources from state
   - d) Exports state to a file

2. **Which block allows refactoring resources without `terraform state mv`?**
   - a) `refactor`
   - b) `moved`
   - c) `rename`
   - d) `migrate`

3. **True or False:** `terraform state rm` deletes the real-world resource.

4. **What is the `import` block introduced in Terraform 1.5+?**
   - a) A way to import modules
   - b) A declarative way to import resources
   - c) A way to import providers
   - d) A way to import functions

5. **What command should you run after importing to verify everything is correct?**
   - a) `terraform apply`
   - b) `terraform destroy`
   - c) `terraform plan`
   - d) `terraform fmt`

<details>
<summary>📌 Answers</summary>

1. **b** — Import adds existing resources to state without recreating
2. **b** — The `moved` block refactors resources with safe state migration
3. **False** — `state rm` removes from state only, real resources remain
4. **b** — Declarative way to import resources (run plan/apply instead of import command)
5. **c** — `terraform plan` verifies state matches configuration
</details>

---

*Continue to → <a href="{{< relref "13-security-best-practices" >}}">Chapter 13: Security & Compliance</a>*

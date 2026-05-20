---
title: "Chapter 16: Interview Questions & Answers"
weight: 16
bookFlatSection: false
bookToc: true
---

# Chapter 16: Interview Questions & Answers

> **Prepare for your Terraform interview with categorized questions ranging from beginner to expert level.**

---

## 📋 Table of Contents

- [Beginner Level Questions](#161-beginner-level-questions)
- [Intermediate Level Questions](#162-intermediate-level-questions)
- [Advanced Level Questions](#163-advanced-level-questions)
- [Scenario-Based Questions](#165-scenario-based-questions)
- [Coding Questions](#166-coding-questions)
- [Quick Reference](#167-quick-reference)

---

## 16.1 Beginner Level Questions

### Q1: What is Terraform and how does it work?

**Answer:** Terraform is an Infrastructure as Code (IaC) tool by HashiCorp that allows you to define and provision infrastructure using a declarative configuration language called HCL (HashiCorp Configuration Language). It works by:

1. **Write**: Define infrastructure in `.tf` files
2. **Plan**: Terraform creates an execution plan showing what will be created/modified/destroyed
3. **Apply**: Terraform executes the plan to reach the desired state
4. **Manage**: Continuously manage infrastructure through updates and changes

Terraform uses **providers** to interact with cloud APIs (AWS, Azure, GCP) and maintains a **state file** to track resource mappings.

---

### Q2: Explain the difference between `terraform init`, `terraform plan`, and `terraform apply`.

**Answer:**

| Command | Purpose | When to Run |
|---------|---------|-------------|
| `terraform init` | Initializes the working directory, downloads providers and modules | First command after cloning/writing config |
| `terraform plan` | Creates an execution plan (dry run) — shows what will happen | Before applying changes; save with `-out=plan.tfplan` |
| `terraform apply` | Executes a plan to create/modify/destroy resources | Apply exact plan with `terraform apply "plan.tfplan"` |

---

### Q3: What is a Terraform provider?

**Answer:** A provider is a plugin that enables Terraform to interact with a specific cloud/platform API. Providers manage resources and data sources for a specific service.

```hcl
# Example providers
provider "aws" {
  region = "us-east-1"
}

provider "azurerm" {
  features {}
}
```

Key points:
- Providers are downloaded during `terraform init`
- Version constraints ensure reproducibility
- Some providers require configuration (region, credentials, etc.)

---

### Q4: What is Terraform state?

**Answer:** Terraform state is a file (typically `terraform.tfstate`) that maps real-world infrastructure to your configuration. It:

- **Tracks resource metadata** (IDs, attributes, dependencies)
- **Enables updates and deletions** by knowing what exists
- **Improves performance** by caching attribute values
- **Is critical for team collaboration** — must be shared securely

```hcl
# State file structure (simplified)
{
  "resources": [
    {
      "type": "aws_instance",
      "name": "web",
      "instances": [
        {
          "attributes": {
            "id": "i-12345",
            "instance_type": "t2.micro",
            "public_ip": "54.123.45.67"
          }
        }
      ]
    }
  ]
}
```

---

### Q5: What is the difference between `count` and `for_each`?

**Answer:**

| Feature | `count` | `for_each` |
|---------|---------|------------|
| **Input type** | Integer | Map or set of strings |
| **Access key** | `count.index` (integer) | `each.key` / `each.value` |
| **Stability** | ❌ Index shifting when items are removed | ✅ Stable keys |
| **Use case** | Simple numbered resources | Resources identified by unique keys |

```hcl
# count — less stable, index-based
resource "aws_instance" "web" {
  count = 3
  tags  = { Name = "web-${count.index}" }
}

# for_each — more stable, key-based
resource "aws_instance" "web" {
  for_each = toset(["web-1", "web-2", "web-3"])
  tags     = { Name = each.key }
}
```

---

### Q6: What is HCL and what are its key features?

**Answer:** HCL (HashiCorp Configuration Language) is Terraform's configuration language. Key features:

- **Declarative**: You define the desired state, not the steps
- **Human-readable**: Clean syntax with blocks and labels
- **Expressions**: Support for conditionals, loops, and functions
- **Interpolation**: `${...}` syntax for referencing values
- **Typed values**: Strings, numbers, bools, lists, maps, objects

```hcl
# HCL example
resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.environment == "prod" ? "t3.large" : "t2.micro"
  
  tags = {
    Name  = "web-${count.index + 1}"
    Env   = var.environment
  }
}
```

---

### Q7: Explain variables, outputs, and locals in Terraform.

**Answer:**

| Concept | Purpose | Definition | Reference |
|---------|---------|------------|-----------|
| **Input Variable** | Parameterize configurations | `variable "name" {}` | `var.name` |
| **Output Value** | Return values to the user | `output "ip" {}` | Displayed after apply |
| **Local Value** | Internal computed values | `locals { name = "..." }` | `local.name` |

```hcl
# Variable
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

# Local
locals {
  name_prefix = "${var.environment}-web"
}

# Output
output "instance_ip" {
  value       = aws_instance.web.public_ip
  description = "Public IP of the instance"
  sensitive   = false
}
```

---

## 16.2 Intermediate Level Questions

### Q8: What is remote state and why should you use it?

**Answer:** Remote state stores the Terraform state file in a remote backend (S3, Azure Storage, GCS, Terraform Cloud) instead of locally. Benefits:

- **Team collaboration**: Multiple team members can access the same state
- **State locking**: Prevents concurrent modifications (e.g., DynamoDB for S3)
- **Security**: State is encrypted at rest and in transit
- **Backup**: Versioning enables state history and recovery

```hcl
# S3 backend with DynamoDB locking
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/network/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

---

### Q9: Explain `depends_on` vs implicit dependencies.

**Answer:**

- **Implicit dependencies**: Automatically detected by Terraform when one resource references another's attribute
  ```hcl
  resource "aws_instance" "web" {
    # Implicit dependency on aws_security_group.web
    vpc_security_group_ids = [aws_security_group.web.id]
  }
  ```

- **Explicit dependencies** (`depends_on`): Used when Terraform cannot infer the dependency
  ```hcl
  resource "aws_s3_bucket" "logs" {
    bucket = "app-logs"
  }
  
  resource "aws_iam_role_policy" "allow_logging" {
    # Must create the bucket first
    depends_on = [aws_s3_bucket.logs]
    # ... policy details
  }
  ```

> **Best practice**: Prefer implicit dependencies. Only use `depends_on` when Terraform can't detect the dependency automatically.

---

### Q10: What are lifecycle rules in Terraform?

**Answer:** Lifecycle rules control how resources are created, updated, or destroyed:

```hcl
resource "aws_instance" "web" {
  # ... config

  lifecycle {
    create_before_destroy = true  # Create new before destroying old
    prevent_destroy       = true  # Prevent accidental deletion
    ignore_changes = [           # Ignore specific attribute changes
      ami,
      tags["updated_at"],
    ]
  }
}
```

| Rule | Purpose |
|------|---------|
| `create_before_destroy` | Zero-downtime deployments (new resource created before old is destroyed) |
| `prevent_destroy` | Protection against accidental deletion |
| `ignore_changes` | Ignore specific attribute changes (e.g., auto-scaling group desired count) |

---

### Q11: What are Terraform modules and why use them?

**Answer:** Modules are reusable, composable building blocks for infrastructure. Like functions in programming:

- **Encapsulation**: Group related resources together
- **Reusability**: Share across projects and teams
- **Versioning**: Version-controlled, publishable to registries
- **Abstraction**: Hide complexity behind a clean interface

```hcl
# Calling a module
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"
  azs  = ["us-east-1a", "us-east-1b"]
}
```

Module structure:
```
modules/
├── my-module/
│   ├── main.tf      # Resources
│   ├── variables.tf # Inputs
│   ├── outputs.tf   # Outputs
│   └── README.md    # Documentation
```

---

### Q12: Explain Terraform workspaces and when to use them.

**Answer:** Workspaces manage multiple distinct state files within a single configuration:

```bash
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod
terraform workspace select dev
```

```hcl
# Using workspaces
resource "aws_instance" "web" {
  instance_type = var.environment[terraform.workspace]
  
  tags = {
    Environment = terraform.workspace
  }
}
```

**When to use workspaces:**
- ✅ Quick environment separation for small projects
- ✅ Identical infrastructure in multiple environments

**When NOT to use workspaces:**
- ❌ Different infrastructure topologies per environment
- ❌ Strict separation of concerns (use directory layout instead)
- ❌ Large-scale production environments

---

### Q13: What is the difference between `terraform.tfvars` and `.tfvars` files?

**Answer:**

| File | Loading | Use Case |
|------|---------|----------|
| `terraform.tfvars` | Loaded **automatically** | Main variable definitions |
| `*.auto.tfvars` | Loaded **automatically** (alphabetical order) | Environment-specific values |
| `custom.tfvars` | Must be loaded with `-var-file=custom.tfvars` | Named variable files |

**Variable precedence (highest to lowest):**
1. `-var` or `-var-file` CLI flags
2. `*.auto.tfvars` (alphabetically sorted)
3. `terraform.tfvars`
4. `TF_VAR_` environment variables
5. Default values in variable declarations

---

### Q14: What are data sources in Terraform?

**Answer:** Data sources fetch or compute data from providers for use in your configuration. They are **read-only** and don't create resources.

```hcl
# Fetch the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Use the data source
resource "aws_instance" "web" {
  ami = data.aws_ami.amazon_linux_2.id
}
```

**Common use cases:**
- Fetching AMIs, IP ranges, availability zones
- Reading existing infrastructure for reference
- Getting account/region information

---

## 16.3 Advanced Level Questions

### Q15: What are `dynamic` blocks and when should you use them?

**Answer:** `dynamic` blocks allow you to construct repeatable nested blocks within a resource dynamically. They are useful when the number of nested blocks depends on a variable.

```hcl
variable "ingress_rules" {
  description = "Security group ingress rules"
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
  }))
  default = [
    { from_port = 80,   to_port = 80,   protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] },
    { from_port = 443,  to_port = 443,  protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] },
  ]
}

resource "aws_security_group" "web" {
  name_prefix = "web-"
  vpc_id      = aws_vpc.main.id

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

**Key points:**
- Use `dynamic` blocks when the count of nested blocks is variable
- Prefer static blocks for fixed configurations (more readable)
- The `content` block accesses the current iteration via `block_name.value`
- Can be nested for complex multi-level dynamic structures

---

### Q16: What is the `templatefile()` function and how is it used?

**Answer:** The `templatefile()` function reads a file and renders it as a template using Terraform's template syntax. It is commonly used for user data scripts, policy documents, and configuration files.

```hcl
# templates/user_data.sh.tftpl
#!/bin/bash
echo "Server: ${server_name}" > /etc/motd
echo "Environment: ${environment}" >> /etc/motd
systemctl start ${service_name}

# main.tf
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"

  user_data = templatefile("${path.module}/templates/user_data.sh.tftpl", {
    server_name  = "web-01"
    environment  = var.environment
    service_name = "nginx"
  })
}
```

**Key points:**
- Template files typically use the `.tftpl` extension
- Supports conditionals and `for` loops within templates
- `path.module` refers to the current module's directory
- More maintainable than inline heredocs for complex scripts

---

### Q17: What are the `try()` and `can()` functions in Terraform?

**Answer:** `try()` and `can()` are built-in functions for handling errors and optional attributes gracefully without causing plan failures.

```hcl
# try() — returns the first expression that doesn't error
locals {
  # If tags.Name doesn't exist, returns "unknown"
  instance_name = try(aws_instance.web.tags["Name"], "unknown")

  # Chaining multiple fallbacks
  vpc_id = try(
    data.aws_vpc.prod.id,       # Try production VPC first
    data.aws_vpc.default.id,     # Fall back to default VPC
    null                         # Return null if neither exists
  )
}

# can() — returns true if the expression succeeds
locals {
  is_prod      = can(regex("^prod", var.environment))
  has_database = can(aws_db_instance.main.id)
}

resource "aws_instance" "web" {
  count = local.is_prod ? 3 : 1
  # ...
}
```

**Common use cases:**
- Gracefully handling optional resource attributes
- Validating variable formats with `regex` inside `can()`
- Providing fallback values when data sources don't exist
- Writing robust configurations that work across environments

---

### Q18: How do you handle secrets in Terraform?

**Answer:** Multiple approaches from least to most secure:

```hcl
# 1. Mark outputs as sensitive (basic protection)
output "db_password" {
  value     = random_password.db.result
  sensitive = true
}

# 2. Use environment variables
variable "db_password" {}
# Set: export TF_VAR_db_password="my-password"

# 3. Use a secrets manager (recommended)
data "aws_secretsmanager_secret_version" "db" {
  secret_id = "prod/db/password"
}

# 4. Use Terraform Cloud variable sets with "sensitive" checkbox

# 5. Use external secret stores (Vault, AWS Secrets Manager, etc.)
data "vault_generic_secret" "db" {
  path = "secret/database"
}
```

**Best practices:**
- ✅ Never store secrets in `.tf` files or state files in Git
- ✅ Use `.gitignore` for `terraform.tfvars` and state files
- ✅ Enable state encryption (server-side and in-transit)
- ✅ Use secrets managers or Vault for production
- ✅ Mark sensitive variables as `sensitive = true`

---

### Q19: Explain `terraform import` and how it works.

**Answer:** `terraform import` brings existing infrastructure under Terraform management without recreating it.

```bash
# Syntax: terraform import <resource_type>.<name> <provider_id>
terraform import aws_instance.web i-1234567890abcdef0
```

**Requirements:**
1. Resource block must exist in configuration
2. Know the provider-specific resource ID
3. Run `terraform plan` after import to detect drift

```hcl
# Resource must exist in config BEFORE import
resource "aws_instance" "web" {
  # Attributes will be populated by import
}
```

**Use cases:**
- Migrating from manual/console-managed infrastructure
- Adopting existing infrastructure into IaC
- Recovering from state file loss

---

### Q20: How does Terraform handle state locking?

**Answer:** State locking prevents concurrent operations that could corrupt the state file.

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"  # DynamoDB provides locking
  }
}
```

**How it works:**
1. Before running `apply`, Terraform creates a lock entry in DynamoDB
2. Other operations must wait or will fail if they try to acquire the lock
3. The lock is released after the operation completes
4. If Terraform crashes, the lock may need manual removal:

```bash
# Force unlock (use with caution!)
terraform force-unlock <LOCK_ID>
```

---

### Q21: What is the `sensitive` parameter and how does it work?

**Answer:** The `sensitive` parameter prevents values from being displayed in CLI output:

```hcl
variable "db_password" {
  type      = string
  sensitive = true  # Won't show in plan output
}

output "db_password" {
  value     = aws_db_instance.main.password
  sensitive = true  # Won't show after apply
}
```

**Limitations:**
- ❌ State file still contains the value (encrypt state!)
- ❌ Logs may still capture values
- ❌ Only masks CLI output, not API calls

---

### Q22: How do you handle Terraform at scale in a team environment?

**Answer:** Key strategies for team-scale Terraform:

**1. Project Structure**
```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── backend.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── prod/
├── modules/
│   ├── vpc/
│   ├── ecs/
│   └── rds/
├── global/
│   ├── iam/
│   └── route53/
```

**2. State Management**
- Remote state with locking (S3 + DynamoDB)
- Separate state files per environment
- State file encryption

**3. CI/CD Pipeline**
- Automated `terraform plan` on PRs
- Manual approval for `terraform apply`
- `terraform fmt` and `validate` in CI

**4. Code Review**
- Review plans, not just config
- Module versioning and changelogs
- Policy as code (Sentinel, OPA)

**5. Testing**
- `terraform validate` for syntax
- `terraform fmt --check` for formatting
- Terratest or `terraform test` for integration testing

---

### Q23: Explain the `moved` block for refactoring.

**Answer:** The `moved` block renames/moves resources without destroying and recreating them:

```hcl
# Old: module "web" was in a different location
# New: module "web_app" is the new location

moved {
  from = module.web
  to   = module.web_app
}
```

**Use cases:**
- Renaming resources
- Moving resources into or out of modules
- Restructuring module hierarchy
- Changing `count` to `for_each` or vice versa

```hcl
# Moving individual resources
moved {
  from = aws_instance.web
  to   = aws_instance.app_server
}

# Moving from count to for_each
moved {
  from = aws_instance.web[0]
  to   = aws_instance.web["web-1"]
}
```

**Requirements:**
- Terraform v1.1+
- Both old and new resource names must be valid
- Run `terraform plan` to verify the move

---

## 16.5 Scenario-Based Questions

### Scenario 1: Team Collaboration Nightmare

**Problem:** Your team of 5 DevOps engineers keeps running into "state file locked" errors. Someone applies changes, others get locked out, and sometimes state gets corrupted.

**Solution:**
1. **Implement remote state** with S3 backend and DynamoDB locking
2. **Separate state files** per environment and per component
3. **Use CI/CD pipeline** instead of running apply locally
4. **Set S3 bucket versioning** for state recovery
5. **Create separate workspaces** or directories per team member for testing

---

### Scenario 2: Accidental Resource Deletion

**Problem:** A junior engineer ran `terraform apply` with a misconfigured variable that would delete production databases.

**Solution:**
1. **Use `prevent_destroy`** on critical resources:
   ```hcl
   resource "aws_db_instance" "main" {
     lifecycle {
       prevent_destroy = true
     }
   }
   ```
2. **Implement approval gates** in CI/CD
3. **Use separate AWS accounts** for environments
4. **Enable S3 bucket versioning** on state files for rollback
5. **Use Sentinel policies** (Terraform Cloud) to enforce rules

---

### Scenario 3: Migrating from Console to Terraform

**Problem:** Your organization has 500+ AWS resources created manually. You need to bring them under Terraform management.

**Solution:**
1. **Start small**: Pick a non-critical service
2. **Write Terraform config** that matches the resource
3. **Use `terraform import`** for each resource
4. **Use `terraform state rm`** and re-import if needed
5. **Use tools** like `terraformer` or `terracognita` for bulk import
6. **Iterate**: Import related groups, verify with `terraform plan`
7. **Use `moved` blocks** for refactoring to modules later

---

### Scenario 4: Multi-Region Disaster Recovery

**Problem:** You need to deploy infrastructure in two AWS regions for high availability.

**Solution:**
```hcl
# provider.tf
provider "aws" {
  alias  = "us_east"
  region = "us-east-1"
}

provider "aws" {
  alias  = "us_west"
  region = "us-west-2"
}

# main.tf
resource "aws_instance" "web" {
  provider = aws.us_east  # Also deploy in us-west-2
  # ...
}
```

**Approach:**
1. Use provider aliases per region
2. Use remote state to share outputs between regions
3. Use `terraform_remote_state` data source for cross-region references
4. Deploy Route53 failover routing for DNS

---

### Scenario 5: Secrets Leaked in State File

**Problem:** A database password was stored in the state file, which is committed to Git.

**Solution:**
1. **Rotate the exposed password** immediately
2. **Use `git filter-branch` or BFG Repo Cleaner** to remove state from Git history
3. **Add state files to `.gitignore`** and `.gitattributes`
4. **Use AWS Secrets Manager or Vault** for secrets
5. **Enable state encryption**:
   ```hcl
   backend "s3" {
     encrypt = true  # SSE-S3 or SSE-KMS
   }
   ```
6. **Use `sensitive = true`** on outputs and variables
7. **Audit Git history** for other leaked secrets

---

## 16.6 Coding Questions

### Q1: Write a Terraform configuration that deploys an EC2 instance with specific tags.

```hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2
  instance_type = "t2.micro"
  
  tags = {
    Name        = "web-server"
    Environment = "production"
    ManagedBy   = "Terraform"
    CostCenter  = "CC123"
    Owner       = "DevOps Team"
  }
}
```

**Expected improvements:**
- Use data source for AMI (avoid hardcoding)
- Add variables for flexibility
- Add outputs for useful information
- Use `terraform.tfvars` for environment-specific values

---

### Q2: Create a reusable VPC module with inputs and outputs.

```hcl
# modules/vpc/variables.tf
variable "name" {
  description = "VPC name"
  type        = string
}

variable "cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
}

variable "private_subnets" {
  description = "Private subnet CIDRs"
  type        = list(string)
}

variable "public_subnets" {
  description = "Public subnet CIDRs"
  type        = list(string)
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

# modules/vpc/main.tf
resource "aws_vpc" "this" {
  cidr_block           = var.cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = var.name }
}

resource "aws_subnet" "public" {
  count = length(var.public_subnets)
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "${var.name}-public-${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count = length(var.private_subnets)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.azs[count.index]
  tags = { Name = "${var.name}-private-${count.index + 1}" }
}

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

### Q3: Implement multi-environment deployments with workspaces.

```hcl
# variables.tf
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "instance_config" {
  description = "Instance configuration per environment"
  type = map(object({
    instance_type = string
    count         = number
  }))
  default = {
    dev  = { instance_type = "t2.nano",  count = 1 }
    staging = { instance_type = "t2.small", count = 2 }
    prod    = { instance_type = "t3.medium", count = 3 }
  }
}

locals {
  env_config = var.instance_config[terraform.workspace]
}

# main.tf
resource "aws_instance" "web" {
  count         = local.env_config.count
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = local.env_config.instance_type
  
  tags = {
    Name        = "web-${terraform.workspace}-${count.index + 1}"
    Environment = terraform.workspace
    ManagedBy   = "Terraform"
  }
}
```

---

### Q4: Set up remote state with S3 and DynamoDB.

```hcl
# backend-infra/main.tf — Run this first
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "company-terraform-state-${data.aws_caller_identity.current.account_id}"
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
  name         = "terraform-state-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}

data "aws_caller_identity" "current" {}
```

```hcl
# application/backend.tf
terraform {
  backend "s3" {
    bucket         = "company-terraform-state-xxxxxxxxxxxx"
    key            = "app/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-locks"
  }
}
```

> **Note:** Backend configurations don't support interpolation, so the bucket name placeholder (`xxxxxxxxxxxx`) must be replaced with the actual bucket name after `backend-infra` creates it. Use the `terraform output` command from the backend-infra directory to get the full bucket name.

## 16.7 Quick Reference

### Terraform CLI Commands

| Command | Purpose |
|---------|---------|
| `terraform init` | Initialize directory, download providers |
| `terraform plan` | Show execution plan |
| `terraform apply` | Apply changes |
| `terraform destroy` | Destroy resources |
| `terraform fmt` | Format configuration |
| `terraform validate` | Validate syntax |
| `terraform state list` | List resources in state |
| `terraform import` | Import existing resources |
| `terraform output` | Show output values |
| `terraform console` | Interactive console for testing |
| `terraform graph` | Visualize dependency graph (outputs DOT format) |
| `terraform test` | Run integration tests (v1.6+) |
| `terraform force-unlock` | Release stuck state lock |
| `terraform taint` | Mark resource for recreation |

### Key Built-in Functions

| Function | Purpose |
|----------|---------|
| `templatefile(path, vars)` | Render a template file with variables |
| `try(expr1, fallback, ...)` | Return first successful expression |
| `can(expr)` | Return true if expression succeeds |

### Common Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| Hardcoding secrets | Use variables, secrets manager, environment variables |
| Local state in teams | Use remote state with locking |
| Missing `.gitignore` | Ignore `.terraform/`, `*.tfstate`, `*.tfvars` |
| Using `latest` provider version | Pin provider versions |
| Manual state edits | Always use CLI commands |
| Ignoring `terraform plan` | Always review plan before apply |
| Sharing state across environments | Separate state per environment |

### Terraform Associate Exam Topics

| Domain | Weight | Key Topics |
|--------|--------|-----------|
| IaC Concepts | 12% | Benefits, declarative vs imperative |
| Terraform Basics | 18% | Providers, resources, state |
| Terraform Workflow | 16% | Init, plan, apply, destroy, fmt, validate |
| Configuration | 18% | Variables, outputs, locals, expressions |
| State Management | 14% | Remote state, backends, locking |
| Modules | 12% | Module structure, registry, versioning |
| Terraform Cloud | 10% | Workspaces, Sentinel, remote operations |

---

*Good luck with your interview! Remember: understanding concepts deeply is more important than memorizing syntax.*

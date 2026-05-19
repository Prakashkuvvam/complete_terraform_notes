---
title: "Chapter 8: Workspaces & Environments"
weight: 8
bookFlatSection: false
bookToc: true
---

# Chapter 8: Workspaces & Environments

## 🎯 Learning Objectives

- Understand Terraform workspaces and when to use them
- Compare workspace-based vs directory-based environment strategies
- Implement multi-environment deployment patterns
- Manage environment-specific configurations
- Understand the pros and cons of each approach

---

## 8.1 What are Workspaces?

**Workspaces** allow you to manage multiple distinct sets of infrastructure resources using the same configuration.

```
Same Terraform Configuration
         │
    ┌────┴────┐
    │         │
  Workspace  Workspace
    dev       prod
    │         │
  State A   State B
```

### Workspace State Storage

```bash
# Default workspace
terraform workspace show  # "default"

# Workspace state files in S3:
# env:/default/my-app/terraform.tfstate
# env:/dev/my-app/terraform.tfstate
# env:/prod/my-app/terraform.tfstate
```

### Basic Workspace Commands

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch workspace
terraform workspace select staging

# List all workspaces
terraform workspace list

# Show current workspace
terraform workspace show

# Delete workspace (must be empty of resources)
terraform workspace delete old-workspace
```

---

## 8.2 Using Workspaces in Configuration

### Workspace in Configuration

```hcl
# Use terraform.workspace for environment-specific values
locals {
  # The current workspace name
  environment = terraform.workspace
  
  # Environment-specific configurations
  instance_type = {
    default = "t2.micro"
    dev     = "t2.nano"
    staging = "t2.small"
    prod    = "t3.large"
  }
  
  # Look up the current workspace's instance type
  current_instance_type = lookup(local.instance_type, terraform.workspace, "t2.micro")
  
  # Environment-specific tags
  common_tags = {
    Environment = terraform.workspace
    ManagedBy   = "Terraform"
    Name        = "${var.project_name}-${terraform.workspace}"
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = local.current_instance_type  # Different per workspace
  
  tags = local.common_tags
}

# Workspace-specific counts
resource "aws_instance" "app" {
  count = terraform.workspace == "prod" ? 3 : 1
  ami   = data.aws_ami.ubuntu.id
  instance_type = "t3.small"
  
  tags = local.common_tags
}
```

### Workspace-Specific Variable Files

```hcl
# dev.workspace.tfvars
instance_type = "t2.nano"
instance_count = 1
enable_monitoring = false

# staging.workspace.tfvars
instance_type = "t2.small"
instance_count = 2
enable_monitoring = true

# prod.workspace.tfvars
instance_type = "t3.large"
instance_count = 5
enable_monitoring = true
```

```bash
# Apply with workspace-specific variables
terraform workspace select dev
terraform apply -var-file="dev.workspace.tfvars"

terraform workspace select prod
terraform apply -var-file="prod.workspace.tfvars"
```

---

## 8.3 Workspace Limitations (Exam Critical)

| Limitation | Explanation |
|------------|-------------|
| **No isolation** | Workspaces share the same backend configuration |
| **No provider config** | Can't have different providers per workspace |
| **No variable locking per workspace** | One lock per entire workspace set |
| **Code branches can diverge** | Different workspaces may have different code versions |
| **Testing complexity** | Harder to test workspaces in isolation |

### When to Use Workspaces (Exam Critical)

**✅ Good for:**
- Quick experimentation
- Short-lived environments (feature branches)
- Simple development/staging/prod splits
- Single-account deployments
- Small teams

**❌ Bad for:**
- Production-critical infrastructure
- Multi-account deployments
- Compliance/audit requirements
- Large enterprise teams
- Environments with vastly different configurations

---

## 8.4 Directory-Based Environment Strategy (Recommended for Production)

Instead of workspaces, use separate directories with their own state files.

### Directory Structure

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── providers.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── providers.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── terraform.tfvars
│       └── providers.tf
└── modules/
    ├── vpc/
    ├── security/
    ├── ec2/
    └── database/
```

### Shared Module Approach

```hcl
# environments/dev/main.tf
module "vpc" {
  source = "../../modules/vpc"
  
  environment = "dev"
  vpc_cidr    = "10.0.0.0/16"
  azs         = ["us-east-1a", "us-east-1b"]
}

module "web_app" {
  source = "../../modules/web-app"
  
  environment     = "dev"
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnet_ids
  instance_type   = "t2.nano"
  instance_count  = 1
}

# environments/prod/main.tf
module "vpc" {
  source = "../../modules/vpc"
  
  environment = "production"
  vpc_cidr    = "10.0.0.0/16"
  azs         = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

module "web_app" {
  source = "../../modules/web-app"
  
  environment     = "production"
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnet_ids
  instance_type   = "t3.large"
  instance_count  = 5
  enable_monitoring = true
  enable_auto_scaling = true
}
```

### Separate Backend per Environment

```hcl
# environments/dev/backend.hcl
bucket         = "my-terraform-state"
key            = "env/dev/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "terraform-state-lock"
encrypt        = true

# environments/prod/backend.hcl
bucket         = "my-terraform-state"
key            = "env/prod/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "terraform-state-lock"
encrypt        = true
```

```bash
# Initialize per environment
cd environments/dev
terraform init -backend-config=backend.hcl
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars

cd environments/prod
terraform init -backend-config=backend.hcl
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

---

## 8.5 Multi-Account Strategy

For production environments, use separate AWS accounts per environment.

```
AWS Organization
├── Management Account
│   └── Terraform state bucket (shared)
├── Dev Account
│   └── Dev infrastructure
├── Staging Account
│   └── Staging infrastructure
└── Prod Account
    └── Production infrastructure
```

### Cross-Account Provider Configuration

```hcl
# environments/dev/providers.tf
provider "aws" {
  region = "us-east-1"
  
  assume_role {
    role_arn = "arn:aws:iam::DEV_ACCOUNT_ID:role/TerraformRole"
  }
}

terraform {
  backend "s3" {
    bucket         = "org-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

---

## 8.6 Environment Comparison

| Approach | Isolation | State | Complexity | Cost | Best For |
|----------|-----------|-------|------------|------|----------|
| **Workspaces** | Low | Shared backend | Low | Low | Simple projects, experiments |
| **Directories** | Medium | Separate backends | Medium | Medium | Multi-environment setups |
| **Multi-Account** | High | Separate per account | High | Higher | Enterprise, production |

---

## 8.7 Best Practices for Environments (Exam Critical)

### 1. Use Consistent Naming

```hcl
locals {
  # Consistently name resources across environments
  name_prefix = "${var.project}-${var.environment}"
  
  # Example: myapp-dev-web-sg, myapp-prod-web-sg
}
```

### 2. Environment-Specific Defaults

```hcl
# Module that adapts to environment
variable "environment" {
  type = string
}

locals {
  # Production-sensible defaults
  is_production = var.environment == "production"
  
  # Auto-scale settings vary by environment
  asg_min_size = local.is_production ? 2 : 1
  asg_max_size = local.is_production ? 10 : 3
  asg_desired  = local.is_production ? 3 : 1
  
  # Production gets larger instances
  instance_type = local.is_production ? "t3.large" : "t2.micro"
  
  # Only production has multi-AZ and backups
  multi_az = local.is_production
  backup_retention = local.is_production ? 30 : 7
}
```

### 3. Protect Production

```hcl
# Prevent accidental production destruction
resource "aws_s3_bucket" "production_data" {
  count  = var.environment == "production" ? 1 : 0
  bucket = "myapp-production-data"

  lifecycle {
    prevent_destroy = true
  }
}

# Only allow certain resources in production
resource "aws_db_instance" "main" {
  count = var.environment == "production" ? 2 : 1
  # Two DB instances in prod for HA
}
```

### 4. CI/CD Integration

```yaml
# .github/workflows/terraform.yml (simplified)
name: Terraform
on:
  push:
    branches: [dev, staging, main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    environment: ${{ github.ref_name }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
    
    - name: Terraform Init
      run: |
        cd environments/${{ github.ref_name }}
        terraform init -backend-config=backend.hcl
    
    - name: Terraform Plan
      run: |
        cd environments/${{ github.ref_name }}
        terraform plan -var-file=terraform.tfvars
    
    - name: Terraform Apply
      if: github.ref == 'refs/heads/main'
      run: |
        cd environments/${{ github.ref_name }}
        terraform apply -auto-approve -var-file=terraform.tfvars
```

---

## 8.8 Complete Multi-Environment Example

```hcl
# modules/web-app/main.tf
variable "environment" {
  type        = string
  description = "Environment name"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs"
}

locals {
  # Environment-specific configuration
  config = {
    dev = {
      instance_type  = "t2.nano"
      instance_count = 1
      domain_name    = "dev.example.com"
    }
    staging = {
      instance_type   = "t2.small"
      instance_count  = 2
      domain_name     = "staging.example.com"
    }
    prod = {
      instance_type   = "t3.medium"
      instance_count  = 3
      domain_name     = "example.com"
      enable_monitoring = true
    }
  }
  
  env_config = local.config[var.environment]
}

resource "aws_security_group" "web" {
  name        = "${var.environment}-web-sg"
  description = "Web server SG for ${var.environment}"
  vpc_id      = var.vpc_id

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

resource "aws_instance" "web" {
  count = local.env_config.instance_count

  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = local.env_config.instance_type
  subnet_id              = var.public_subnet_ids[count.index % length(var.public_subnet_ids)]
  vpc_security_group_ids = [aws_security_group.web.id]

  monitoring = local.env_config.enable_monitoring
  
  tags = {
    Name        = "${var.environment}-web-${count.index + 1}"
    Environment = var.environment
  }
}
```

---

## 📝 Exam Tips

1. **`terraform.workspace`** returns the current workspace name
2. **Default workspace** exists automatically — you can't delete it
3. **Workspaces share the same backend** and provider configuration
4. **Directory-based environments** offer better isolation than workspaces
5. **Multi-account strategy** provides the strongest environment isolation
6. **Workspaces store state** in `env:/WORKSPACE_NAME/prefix/`
7. **`terraform workspace new`** creates and switches to a new workspace
8. **`terraform workspace select`** changes the current workspace
9. **Workspace names** must be valid identifiers (no special characters)
10. **Production protection** — Use `prevent_destroy`, separate accounts, approvals

---

## ✅ Chapter 8 Quiz

1. **How do you reference the current workspace name in a configuration?**
   - a) `var.workspace`
   - b) `terraform.workspace`
   - c) `workspace.name`
   - d) `current.workspace`

2. **Which approach provides the best environment isolation?**
   - a) Workspaces
   - b) Separate directories
   - c) Separate AWS accounts
   - d) Environment variables

3. **True or False:** Workspaces allow different provider configurations per workspace.

4. **What is a key limitation of using workspaces for environments?**
   - a) They're too slow
   - b) They share the same backend and provider config
   - c) They can't use remote state
   - d) They require Terraform Cloud

5. **Which command creates and switches to a new workspace?**
   - a) `terraform workspace create`
   - b) `terraform workspace new`
   - c) `terraform workspace init`
   - d) `terraform workspace switch`

<details>
<summary>📌 Answers</summary>

1. **b** — `terraform.workspace` returns the current workspace name
2. **c** — Separate AWS accounts provide the strongest isolation
3. **False** — Workspaces share the same provider configuration
4. **b** — Workspaces share the same backend and provider configuration
5. **b** — `terraform workspace new` creates and switches to a new workspace
</details>

---

*Continue to → <a href="{{< relref "09-functions-expressions-dynamic" >}}">Chapter 9: Functions, Expressions & Dynamic Blocks</a>*

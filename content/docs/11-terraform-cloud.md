---
title: "Chapter 11: Terraform Cloud & Enterprise"
weight: 11
bookFlatSection: false
bookToc: true
---

# Chapter 11: Terraform Cloud & Enterprise

## 🎯 Learning Objectives

- Understand Terraform Cloud features and architecture
- Configure remote execution and state management
- Implement VCS-driven workflows
- Use Sentinel policy as code
- Manage workspaces and teams in Terraform Cloud

---

## 11.1 What is Terraform Cloud?

**Terraform Cloud** is HashiCorp's managed service that provides:

- Remote state management
- Team collaboration
- Policy as code (Sentinel)
- VCS integration (GitHub, GitLab, etc.)
- Private module registry
- Run tasks and cost estimation

### Terraform Cloud vs Open Source

| Feature | Open Source | Terraform Cloud | Terraform Enterprise |
|---------|-------------|-----------------|---------------------|
| State management | Local/S3/etc. | Managed remote | Managed remote |
| Team collaboration | Manual | Built-in | Built-in |
| VCS integration | Manual | Automatic | Automatic |
| Sentinel policies | ❌ | Limited | ✅ Full |
| Private module registry | ❌ | ✅ | ✅ |
| Cost estimation | ❌ | ✅ | ✅ |
| SSO/SAML | ❌ | ✅ | ✅ |
| Audit logging | ❌ | ✅ | ✅ |
| Run tasks | ❌ | ✅ | ✅ |
| Self-hosted | ❌ | ❌ | ✅ |

---

## 11.2 Terraform Cloud Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your VCS (GitHub/GitLab)                │
└────────────────────┬──────────────────────────────────────┘
                     │ Push/Pull Request
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Terraform Cloud                            │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Workspace│  │  Runs    │  │  State   │  │  Policies  │ │
│  │ (Dev)    │  │          │  │  (Shared)│  │ (Sentinel) │ │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├────────────┤ │
│  │ Workspace│  │  Runs    │  │  State   │  │  Policies  │ │
│  │ (Prod)   │  │          │  │  (Shared)│  │ (Sentinel) │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                    API / CLI                              ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 11.3 Remote State in Terraform Cloud

### Free Tier State Storage

```hcl
# main.tf
terraform {
  cloud {
    organization = "my-company"
    
    workspaces {
      name = "my-app-production"
    }
  }
}
```

### Using Remote State from Other Workspaces

```hcl
# Read outputs from another workspace
data "terraform_remote_state" "vpc" {
  backend = "remote"
  
  config = {
    organization = "my-company"
    workspaces = {
      name = "vpc-production"
    }
  }
}

resource "aws_instance" "web" {
  subnet_id = data.terraform_remote_state.vpc.outputs.public_subnet_ids[0]
}
```

---

## 11.4 VCS-Driven Workflow

### Connecting VCS

```hcl
# Link a workspace to a VCS repo
# In Terraform Cloud UI:
# 1. Settings → Version Control → Connect to VCS
# 2. Select repository
# 3. Configure working directory
```

### Pull Request Workflow

```
Developer creates PR
        ↓
Terraform Cloud runs `terraform plan`
        ↓
Plan comment posted on PR
        ↓
Team reviews PR + plan
        ↓
PR merged to main branch
        ↓
Terraform Cloud runs `terraform apply`
        ↓
Infrastructure updated
```

### Speculatives Plans

```bash
# Trigger a speculative plan on a PR
# Terraform Cloud automatically creates a plan
# Plan output is posted as a PR comment
# Plan is NOT applied until merge
```

---

## 11.5 Workspace Configuration in Terraform Cloud

### Workspace Types

```hcl
# CLI-driven workspace
terraform {
  cloud {
    organization = "my-company"
    
    workspaces {
      name = "my-app-dev"
    }
  }
}

# VCS-driven workspace (set in cloud UI)
# Workspace connected to GitHub repo
# Auto-triggers on push to specific branch
```

### Workspace Variables

```hcl
# Terraform variables are set in workspace UI or API
# Two types:
# 1. Terraform variables (Terraform inputs)
# 2. Environment variables (for providers, etc.)

# In workspace UI:
# Key:   AWS_ACCESS_KEY_ID
# Value: AKIAIOSFODNN7EXAMPLE
# Type:  Environment Variable (sensitive)

# Key:   instance_type
# Value: t2.micro
# Type:  Terraform Variable
```

### Workspace Settings

```hcl
# Workspace execution mode
# - Local: Runs on your machine
# - Remote: Runs on Terraform Cloud
# - Agent: Runs on self-hosted agent

# Workspace terraform version
# - Version specified or "latest"
```

---

## 11.6 Remote Execution

### Local vs Remote Execution

```hcl
# Local execution (default for CLI-driven)
terraform {
  cloud {
    organization = "my-company"
    
    workspaces {
      name = "my-app-local"
    }
    
    # Default: Runs plan locally, state stored in cloud
  }
}
```

```bash
# Running locally
terraform plan    # Reads remote state, plans locally
terraform apply   # Applies locally, state stored in cloud
```

```hcl
# Remote execution
# Set in workspace settings: Execution Mode = "Remote"
# All runs happen on Terraform Cloud servers
```

```bash
# With remote execution:
# terraform plan/apply runs on Terraform Cloud
# No local credentials needed!
```

---

## 11.7 Sentinel Policy as Code

**Sentinel** is HashiCorp's policy-as-code framework.

### Policy Structure

```hcl
# policy/require-approval.sentinel
import "tfplan"
import "strings"

# Require all resources to have mandatory tags
mandatory_tags = ["Environment", "Owner", "CostCenter"]

# Get all resources that support tags
all_resources = filter tfplan.resource_changes as _, rc {
  rc.mode is "managed" and strings.has_prefix(rc.type, "aws_")
}

# Check each resource
main = rule {
  all all_resources as _, rc {
    all mandatory_tags as tag {
      rc.change.after.tags contains tag
    }
  }
}
```

### Policy Types

| Policy | Scope | Example |
|--------|-------|---------|
| **Hard mandatory** | Cannot be overridden | "Block all public S3 buckets" |
| **Soft mandatory** | Can be overridden with reason | "Require tags on all resources" |
| **Advisory** | Informational only | "Suggest using encryption" |

### Common Sentinel Policies

```hcl
# 1. Restrict allowed regions
import "tfplan"

allowed_regions = ["us-east-1", "us-west-2", "eu-west-1"]

providers = filter tfplan.providers as _, p {
  p.type is "aws"
}

main = rule {
  all providers as _, p {
    p.config.region in allowed_regions
  }
}

# 2. Block public S3 buckets
import "tfplan"

s3_buckets = filter tfplan.resource_changes as _, rc {
  rc.type is "aws_s3_bucket_public_access_block"
}

main = rule {
  all s3_buckets as _, bucket {
    bucket.change.after.block_public_acls is true and
    bucket.change.after.block_public_policy is true
  }
}

# 3. Enforce cost limits
import "tfplan"

ec2_instances = filter tfplan.resource_changes as _, rc {
  rc.type is "aws_instance"
}

main = rule {
  all ec2_instances as _, instance {
    instance.change.after.instance_type not in ["m5.24xlarge", "m5.12xlarge"]
  }
}
```

---

## 11.8 Private Module Registry

Terraform Cloud provides a **private module registry** for sharing modules within your organization.

### Publishing Modules

```bash
# Steps to publish a module:
# 1. Create a GitHub repo named terraform-<PROVIDER>-<NAME>
# 2. Push with git tags (v1.0.0, etc.)
# 3. Add to Terraform Cloud registry
```

```hcl
# Using a private module
module "vpc" {
  source  = "app.terraform.io/my-company/vpc/aws"
  version = "1.2.0"
  
  name = "my-vpc"
  cidr = "10.0.0.0/16"
}
```

### Module Version Constraints

```hcl
module "vpc" {
  source  = "app.terraform.io/my-company/vpc/aws"
  version = "~> 1.0"  # >= 1.0, < 2.0
}
```

---

## 11.9 Run Tasks

Run tasks integrate third-party services into the Terraform Cloud workflow.

```bash
# Examples:
# - Checkov: Security scanning
# - Infracost: Cost estimation
# - tfsec: Security linting
# - Custom webhook integrations
```

### API-Driven Run Tasks

```bash
# A run task makes an API call to a third-party service
# Service returns pass/fail/error result
# Result appears in the Terraform Cloud run UI
```

---

## 11.10 Terraform Cloud Teams and Permissions

### Team Structure

| Team | Permissions | Responsibilities |
|------|-------------|------------------|
| **Owners** | Full access | Manage organization, billing |
| **Admins** | Manage workspaces | Configure VCS, variables |
| **Writers** | Plan and apply | Deploy infrastructure |
| **Readers** | Read-only | View state and plans |
| **Plan-only** | Plan only | View plans, no apply |

### Team-Based Workspace Access

```hcl
# Managed in Terraform Cloud UI
# Assign teams to workspaces with permissions:
# - Read
# - Plan
# - Write
# - Admin
```

---

## 11.11 Cost Estimation

Terraform Cloud provides **cost estimation** on each plan.

```bash
# Cost estimation shows:
# - Monthly cost of new resources
# - Monthly cost change from current state
# - Per-resource cost breakdown
```

```hcl
# Cost estimation appears in the plan output
# Example:
# Resource changes: +5 to create, 0 to change, 0 to destroy
# Monthly cost: +$234.56 (if applied)
```

---

## 11.12 API and CLI Integration

### TFE Provider

```hcl
# Manage Terraform Cloud resources with Terraform!
provider "tfe" {
  hostname = var.tfc_hostname  # app.terraform.io or custom
  token    = var.tfc_token
}

# Create a workspace
resource "tfe_workspace" "production" {
  name         = "my-app-production"
  organization = tfe_organization.my_org.name
  execution_mode = "remote"
  
  vcs_repo {
    identifier     = "my-company/my-app"
    branch         = "main"
    oauth_token_id = tfe_oauth_client.github.oauth_token_id
  }
}

# Create a variable
resource "tfe_variable" "instance_type" {
  workspace_id = tfe_workspace.production.id
  key          = "instance_type"
  value        = "t3.large"
  category     = "terraform"
}

# Create an environment variable
resource "tfe_variable" "aws_access_key" {
  workspace_id = tfe_workspace.production.id
  key          = "AWS_ACCESS_KEY_ID"
  value        = var.aws_access_key
  category     = "env"
  sensitive    = true
}

# Create an organization
resource "tfe_organization" "my_org" {
  name  = "my-company"
  email = "admin@my-company.com"
}
```

---

## 11.13 Migration to Terraform Cloud

### Migrating from State File

```bash
# 1. Add cloud block to configuration
# 2. Run init with migration
terraform init -migrate-state

# Terraform will:
# - Ask for workspace name
# - Copy state to Terraform Cloud
# - Update local configuration
```

### Migrating from S3 Backend

```hcl
# Before: S3 backend
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
  }
}

# After: Terraform Cloud
terraform {
  cloud {
    organization = "my-company"
    
    workspaces {
      name = "my-app-prod"
    }
  }
}
```

```bash
# Migrate existing state to Terraform Cloud
terraform init -migrate-state
```

---

## 11.14 Terraform Enterprise

**Terraform Enterprise** is the self-hosted version of Terraform Cloud.

### When to Use Terraform Enterprise

- Air-gapped environments (no internet access)
- Compliance requirements (data residency)
- Custom integrations
- Enterprise SSO requirements
- Audit requirements

### Deployment Options

| Environment | Method | Requirements |
|-------------|--------|--------------|
| AWS | EC2 + RDS + S3 | AWS account |
| Azure | Azure VM + DB + Storage | Azure subscription |
| VMware | vSphere VM | vSphere environment |
| Docker | Docker containers | Docker hosts |
| Kubernetes | Helm chart | Kubernetes cluster |

---

## 📝 Exam Tips

1. **Terraform Cloud manages state** — No more manual S3 configuration
2. **VCS-driven workflow** — Plan on PR, apply on merge
3. **Sentinel** — Policy as code for governance
4. **Private module registry** — Share modules within organization
5. **Cost estimation** — See cost impact before applying
6. **Run tasks** — Integrate third-party tools (Checkov, Infracost)
7. **Remote execution** — Run Terraform on Cloud servers
8. **Team permissions** — Control who can plan/apply
9. **Cloud block replaces backend block** — For Terraform Cloud
10. **Free tier** — Includes 5 users, state storage, and more

---

## ✅ Chapter 11 Quiz

1. **What are the two variable types in Terraform Cloud workspaces?**
   - a) Terraform variables and Environment variables
   - b) Input variables and Output variables
   - c) String variables and Number variables
   - d) Sensitive and Public

2. **What is Sentinel?**
   - a) A Terraform provider
   - b) A policy as code framework
   - c) A state backend
   - d) A module registry

3. **True or False:** Speculative plans are applied automatically.

4. **What happens when a VCS pull request is opened for a connected workspace?**
   - a) Terraform applies the changes
   - b) Terraform creates a speculative plan
   - c) Nothing — manual trigger required
   - d) The PR is automatically merged

5. **Which TFE resource would you use to create a workspace programmatically?**
   - a) `tfe_workspace`
   - b) `tfe_org`
   - c) `tfe_variable`
   - d) `tfe_run`

<details>
<summary>📌 Answers</summary>

1. **a** — Terraform variables and Environment variables
2. **b** — Sentinel is HashiCorp's policy-as-code framework
3. **False** — Speculative plans show what would happen but are not applied
4. **b** — Terraform Cloud creates a speculative plan (does not apply)
5. **a** — `tfe_workspace` creates a workspace programmatically
</details>

---

*Continue to → <a href="{{< relref "12-importing-refactoring" >}}">Chapter 12: Importing, Refactoring & State Migrations</a>*

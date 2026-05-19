---
title: "Chapter 6: State Management"
weight: 6
bookFlatSection: false
bookToc: true
---

# Chapter 6: State Management

## 🎯 Learning Objectives

- Understand Terraform state and why it's critical
- Configure remote state backends (S3, etc.)
- Implement state locking with DynamoDB
- Manage state across teams and environments
- Handle state migration and recovery
- Use terraform_remote_state data source

---

## 6.1 What is Terraform State?

**State** is the mapping between your Terraform configuration and the real-world infrastructure. It's stored in `terraform.tfstate` by default.

### What State Contains

```json
{
  "version": 4,
  "terraform_version": "1.9.0",
  "resources": [
    {
      "module": "",
      "mode": "managed",
      "type": "aws_instance",
      "name": "web",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "id": "i-0abcd1234efgh5678",
            "ami": "ami-0c55b159cbfafe1f0",
            "availability_zone": "us-east-1a",
            "instance_state": "running",
            "instance_type": "t2.micro",
            "private_ip": "10.0.1.5",
            "public_ip": "54.123.45.67",
            "subnet_id": "subnet-12345678",
            "tags": {
              "Name": "WebServer"
            },
            "vpc_security_group_ids": ["sg-12345678"]
          },
          "dependencies": [
            "aws_security_group.web"
          ]
        }
      ]
    }
  ]
}
```

### Why State is Essential (Exam Critical)

| Purpose | Explanation |
|---------|-------------|
| **Mapping** | Maps config resources to real-world resources (by ID) |
| **Metadata** | Stores resource attributes, dependencies, and provider metadata |
| **Performance** | Caches attribute values instead of querying API for every resource |
| **Syncing** | Enables team collaboration with remote state |
| **Drift Detection** | Compares config vs state vs real-world to detect changes |

---

## 6.2 Local State (Default)

### How Local State Works

```bash
# Default: state stored in current directory
terraform apply  # Creates terraform.tfstate
                 # Creates terraform.tfstate.backup
```

### Problems with Local State

| Problem | Impact |
|---------|--------|
| **Single point of failure** | Lose the file → lose track of resources |
| **No team collaboration** | Only one person can run Terraform at a time |
| **No state locking** | Concurrent runs can corrupt state |
| **No version history** | Can't see what changed and when |

```hcl
# terraform { } BACKEND CONFIGURATION IS THE KEY. 
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
```

---

## 6.3 Remote State Backends

**Remote state** stores the state file in a shared, durable location.

### Supported Backends

| Backend | Description | Use Case |
|---------|-------------|----------|
| `s3` | AWS S3 bucket | AWS-native, most common |
| `azurerm` | Azure Storage Account | Azure-native |
| `gcs` | Google Cloud Storage | GCP-native |
| `consul` | HashiCorp Consul | Hashicorp stack |
| `terraform cloud` | Terraform Cloud | Managed service |
| `pg` | PostgreSQL database | Custom setups |
| `http` | REST API endpoint | Advanced custom setups |

### S3 Backend Configuration

```hcl
# backend-config.tf
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

### Setting Up S3 Backend with DynamoDB Locking

```hcl
# Step 1: Create the infrastructure (run with local state first)
# init-backend/main.tf

provider "aws" {
  region = "us-east-1"
}

# S3 bucket for state storage
resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# DynamoDB table for state locking
resource "aws_dynamodb_table" "terraform_lock" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

data "aws_caller_identity" "current" {}

output "bucket_name" {
  value = aws_s3_bucket.terraform_state.id
}

output "dynamodb_table" {
  value = aws_dynamodb_table.terraform_lock.name
}
```

### Step 2: Configure Backend

```hcl
# After creating the S3 bucket + DynamoDB table, update your Terraform config:
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-123456789012"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

### Step 3: Migrate State

```bash
# Migrate local state to S3
terraform init -migrate-state

# Terraform will:
# 1. Detect existing local state
# 2. Ask if you want to copy it to S3
# 3. Copy state to S3 bucket

# Confirm migration
# Initializing the backend...
# Do you want to copy existing state to the new backend?
#   Enter a value: yes
```

---

## 6.4 State Locking

**State locking** prevents concurrent operations that could corrupt your state file.

### How Locking Works

```
User A runs terraform apply
  → DynamoDB acquires lock
  → Lock prevents User B from running terraform apply
  → User A completes
  → DynamoDB releases lock
  → User B can now run terraform apply
```

### Locking with DynamoDB

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"  # ← Enables locking
  }
}
```

### Force Unlock (Use Sparingly!)

```bash
# If a lock isn't released properly (e.g., process killed)
terraform force-unlock LOCK_ID

# Find the lock ID from error message or Amazon DynamoDB console
# CAUTION: Only use when you're sure no other process is using state
```

---

## 6.5 State File Management

### State Commands (Exam Critical)

```bash
# List all resources in state
terraform state list

# Show attributes of a specific resource
terraform state show aws_instance.web

# Pull state to local file
terraform state pull > backup.tfstate

# Push state (use with extreme caution!)
terraform state push backup.tfstate

# Move a resource (rename/refactor)
terraform state mv aws_instance.old_name aws_instance.new_name

# Remove resource from state (NOT from real world)
terraform state rm aws_instance.to_be_removed

# Replace provider
terraform state replace-provider hashicorp/aws registry.example.com/hashicorp/aws
```

### State with `count` and `for_each`

```hcl
# State list with count resources
terraform state list
# aws_instance.web[0]
# aws_instance.web[1]
# aws_instance.web[2]

# State list with for_each resources
terraform state list
# aws_instance.web["web1"]
# aws_instance.web["web2"]

# Show specific indexed resource
terraform state show 'aws_instance.web[0]'
terraform state show 'aws_instance.web["web1"]'
```

---

## 6.6 Terraform_remote_state Data Source

Use `terraform_remote_state` to read outputs from other Terraform configurations.

```hcl
# In a different configuration (e.g., app module)
data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state"
    key    = "vpc/terraform.tfstate"
    region = "us-east-1"
  }
}

# Use VPC outputs from another configuration
resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t2.micro"
  subnet_id              = data.terraform_remote_state.vpc.outputs.public_subnet_ids[0]
  vpc_security_group_ids = [data.terraform_remote_state.vpc.outputs.vpc_default_sg_id]
  
  tags = {
    Name = "WebServer"
  }
}
```

---

## 6.7 State Isolation Strategies (Exam Critical)

### Strategy 1: Separate State Files per Environment

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   └── backend.hcl
│   ├── staging/
│   │   ├── main.tf
│   │   └── backend.hcl
│   └── prod/
│       ├── main.tf
│       └── backend.hcl
```

```hcl
# Each environment has its own state file
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "dev/terraform.tfstate"      # ← Different per environment
    region = "us-east-1"
    encrypt = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

### Strategy 2: Separate State Files per Component

```
terraform/
├── vpc/
│   └── terraform.tfstate (S3 key: vpc/terraform.tfstate)
├── security/
│   └── terraform.tfstate (S3 key: security/terraform.tfstate)
├── databases/
│   └── terraform.tfstate (S3 key: databases/terraform.tfstate)
└── app/
    └── terraform.tfstate (S3 key: app/terraform.tfstate)
```

### Strategy 3: Workspaces (Built-in Environment Isolation)

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "my-app/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch workspace
terraform workspace select prod

# List workspaces
terraform workspace list

# Show current workspace
terraform workspace show

# The state file in S3 becomes:
# env:/dev/my-app/terraform.tfstate
# env:/staging/my-app/terraform.tfstate
# env:/prod/my-app/terraform.tfstate
```

---

## 6.8 State File Security

### Sensitive Data in State

```hcl
# Sensitive data in variables
variable "db_password" {
  type      = string
  sensitive = true
}

# Sensitive data in resources
resource "aws_db_instance" "main" {
  master_password = var.db_password
  # This password WILL be stored in state (encrypted at rest)
}

# Sensitive outputs
output "db_password" {
  value     = aws_db_instance.main.master_password
  sensitive = true
}
```

### State Encryption

```hcl
# S3 bucket with encryption
resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state"
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"  # or aws:kms
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning for recovery
resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

### State Bucket Policy

```hcl
# Restrict S3 bucket access with IAM policy
data "aws_iam_policy_document" "state_bucket" {
  statement {
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [
      aws_s3_bucket.terraform_state.arn,
      "${aws_s3_bucket.terraform_state.arn}/*"
    ]
    
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}
```

---

## 6.9 State Recovery

### From S3 Versioning

```bash
# List versions of state file
aws s3api list-object-versions \
  --bucket my-terraform-state \
  --prefix production/terraform.tfstate

# Download specific version
aws s3api get-object-version \
  --bucket my-terraform-state \
  --key production/terraform.tfstate \
  --version-id VERSION_ID \
  terraform.tfstate

# Restore from backup
terraform state push terraform.tfstate  # CAUTION!
```

### From Local Backup

```bash
# Terraform always creates a backup before modifying state
# terraform.tfstate.backup contains the previous state

# Restore from backup
cp terraform.tfstate.backup terraform.tfstate

# Or use the backup option
terraform init -reconfigure  # If state is corrupted
```

---

## 6.10 Common State Scenarios (Exam Critical)

### Scenario 1: Manual Resource Deletion

```hcl
# Someone manually deletes a resource in AWS console
# The next terraform plan will show:
# aws_instance.web will be created
#   + resource "aws_instance" "web" { ... }

# Terraform detects drift and wants to recreate the resource
```

### Scenario 2: Importing Existing Resources

```hcl
# Import an existing EC2 instance into state
terraform import aws_instance.web i-0abcd1234efgh5678

# Now write the config that matches the imported resource
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  # Must match the imported resource
}
```

### Scenario 3: Refactoring Resources

```hcl
# Before refactoring: resource name is "web"
resource "aws_instance" "web" {
  # ...
}

# After refactoring: rename to "app_server"
# Use moved block (Terraform 1.1+)
moved {
  from = aws_instance.web
  to   = aws_instance.app_server
}

# OR use state mv
# terraform state mv aws_instance.web aws_instance.app_server
```

---

## 📝 Exam Tips

1. **State is the source of truth** — Not your configuration files
2. **S3 + DynamoDB** is the recommended remote backend for AWS
3. **State locking prevents corruption** — DynamoDB provides locking for S3
4. **Versioning on S3 bucket** enables state recovery
5. **Encrypt state at rest** — Always enable SSE on S3 bucket
6. **Sensitive data in state** — State can contain secrets, secure it
7. **`terraform_remote_state`** reads outputs from other state files
8. **Workspaces** provide environment isolation with separate state files
9. **`terraform state mv`** renames resources without recreating
10. **`terraform import`** brings existing resources under Terraform management
11. **Backend configuration cannot use interpolation** — No variables in backend
12. **`terraform init -reconfigure`** forces backend reconfiguration
13. **`terraform init -migrate-state`** copies state between backends
14. **State file contains all resource attributes**, including sensitive ones
15. **Terraform's `state list/show` commands help with troubleshooting**

---

## ✅ Chapter 6 Quiz

1. **Which services provide remote state storage and locking for AWS?**
   - a) S3 + RDS
   - b) S3 + DynamoDB
   - c) EBS + DynamoDB
   - d) SQS + DynamoDB

2. **What is the purpose of state locking?**
   - a) To encrypt the state file
   - b) To prevent concurrent operations from corrupting state
   - c) To lock the configuration files
   - d) To prevent resource deletion

3. **True or False:** You can use variables in backend configuration blocks.

4. **Which command migrates state between backends?**
   - a) `terraform state migrate`
   - b) `terraform init -migrate-state`
   - c) `terraform state push`
   - d) `terraform apply -migrate`

5. **How does Terraform detect drift?**
   - a) It doesn't — you must manually check
   - b) By comparing config vs state vs real-world API
   - c) By reading CloudTrail logs
   - d) By using AWS Config

<details>
<summary>📌 Answers</summary>

1. **b** — S3 for state storage, DynamoDB for locking
2. **b** — Locking prevents concurrent operations from corrupting state
3. **False** — Backend configuration cannot use variables or interpolation
4. **b** — `terraform init -migrate-state` copies state between backends
5. **b** — Terraform compares config, state, and API to detect drift
</details>

---

*Continue to → <a href="{{< relref "07-terraform-modules" >}}">Chapter 7: Terraform Modules</a>*

---
title: "Chapter 13: Security & Compliance"
weight: 13
bookFlatSection: false
bookToc: true
---

# Chapter 13: Security & Compliance

## 🎯 Learning Objectives

- Implement secrets management in Terraform
- Understand IAM least privilege for Terraform
- Use Sentinel policy as code for compliance
- Encrypt sensitive data in state and backends
- Implement secure CI/CD pipelines

---

## 13.1 Secrets Management

### What NOT to Do

```hcl
# ❌ NEVER: Hardcode secrets in configuration
variable "db_password" {
  default = "SuperSecret123!"  # TERRIBLE IDEA
}

# ❌ NEVER: Store secrets in terraform.tfvars
# terraform.tfvars
db_password = "SuperSecret123!"  # Committed to git?!

# ❌ NEVER: Commit secrets to version control
# .gitignore should include:
# *.tfvars (except example files)
# terraform.tfstate
# *.pem
```

### Best Practices for Secrets

```hcl
# ✅ DO: Use sensitive flag for variables
variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# ✅ DO: Use environment variables
# export TF_VAR_db_password="SuperSecret123!"

# ✅ DO: Use AWS Secrets Manager
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/myapp/db/password"
}

resource "aws_db_instance" "main" {
  master_password = data.aws_secretsmanager_secret_version.db_password.secret_string
}

# ✅ DO: Use HashiCorp Vault
data "vault_kv_secret_v2" "db_creds" {
  mount = "secret"
  name  = "database/prod"
}

resource "aws_db_instance" "main" {
  master_password = data.vault_kv_secret_v2.db_creds.data["password"]
}
```

### Marking Outputs as Sensitive

```hcl
# Sensitive outputs are hidden in CLI output
output "db_password" {
  value     = random_password.db.result
  sensitive = true
  description = "Database master password"
}

output "api_key" {
  value     = aws_api_gateway_api_key.main.value
  sensitive = true
}

# Non-sensitive output (safe to display)
output "db_endpoint" {
  value = aws_db_instance.main.endpoint
  # Not sensitive — it's just a DNS name
}
```

### Random Provider for Secrets

```hcl
# Generate random passwords
resource "random_password" "db" {
  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
  min_upper        = 1
  min_lower        = 1
  min_numeric      = 1
  min_special      = 1
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket" "app" {
  bucket = "my-app-${random_string.suffix.result}"
}

resource "aws_db_instance" "main" {
  master_password = random_password.db.result
}
```

---

## 13.2 IAM Least Privilege

### Principle of Least Privilege

The **principle of least privilege** means giving Terraform only the permissions it needs to perform its work — nothing more.

### IAM Policies for Terraform Execution

```hcl
# ✅ GOOD: Minimal IAM policy for S3 bucket management
data "aws_iam_policy_document" "terraform_s3" {
  statement {
    effect = "Allow"
    actions = [
      "s3:CreateBucket",
      "s3:PutBucketAcl",
      "s3:PutBucketPolicy",
      "s3:PutBucketVersioning",
      "s3:PutBucketPublicAccessBlock",
      "s3:PutEncryptionConfiguration",
      "s3:GetBucket*",
      "s3:ListBucket",
      "s3:DeleteBucket",
    ]
    resources = ["arn:aws:s3:::my-terraform-managed-*"]
  }
}

# 🤔 BETTER: Use IAM conditions to restrict
data "aws_iam_policy_document" "terraform_restricted" {
  statement {
    effect = "Allow"
    actions = [
      "ec2:DescribeInstances",
      "ec2:RunInstances",
      "ec2:TerminateInstances",
    ]
    resources = ["*"]
    
    condition {
      test     = "StringEquals"
      variable = "aws:RequestedRegion"
      values   = ["us-east-1", "us-west-2"]
    }
    
    condition {
      test     = "StringEquals"
      variable = "ec2:InstanceType"
      values   = ["t2.micro", "t2.small", "t3.micro"]
    }
  }
}
```

### Required Permissions for State Backend

```hcl
# Permissions needed for S3 state backend
data "aws_iam_policy_document" "state_backend" {
  statement {
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = [
      "arn:aws:s3:::my-terraform-state",
      "arn:aws:s3:::my-terraform-state/*"
    ]
  }
  
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:DescribeTable",
    ]
    resources = ["arn:aws:dynamodb:*:*:table/terraform-state-lock"]
  }
}
```

### Separate IAM Roles for Environments

```hcl
# Dev role: Broad permissions, fewer restrictions
resource "aws_iam_role" "terraform_dev" {
  name = "terraform-dev"
  assume_role_policy = data.aws_iam_policy_document.terraform_assume.json
}

# Prod role: Strict permissions, approvals required
resource "aws_iam_role" "terraform_prod" {
  name = "terraform-prod"
  assume_role_policy = data.aws_iam_policy_document.terraform_assume.json
}
```

---

## 13.3 State File Security

### State File Contains Secrets

```
⚠️ CRITICAL: State files can contain plaintext secrets!

Even if you mark a variable as `sensitive = true`,
the value is still stored IN PLAINTEXT in the state file!
```

### Protecting the State File

```hcl
# 1. Encrypt state at rest
resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.terraform_state.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"  # KMS for extra security
    }
  }
}

# 2. Block public access
resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.terraform_state.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 3. Enable versioning (for recovery)
resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 4. Restrict access with bucket policy
data "aws_iam_policy_document" "state_bucket_policy" {
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

### State Access Audit

```bash
# Monitor state file access with CloudTrail
# Check: GetObject, PutObject on state bucket
# Set up alarms for suspicious access patterns
```

---

## 13.4 Provider Credentials

### Secure Provider Configuration

```hcl
# ❌ BAD: Hardcoded credentials
provider "aws" {
  region     = "us-east-1"
  access_key = "AKIAIOSFODNN7EXAMPLE"  # NEVER!
  secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"  # NEVER!
}

# ✅ GOOD: Use credentials chain (default)
provider "aws" {
  region = "us-east-1"
  # Uses: Environment vars → AWS config file → IAM role
}

# ✅ GOOD: Use IAM role (recommended for EC2/ECS)
provider "aws" {
  region = "us-east-1"
  # EC2 instance automatically uses attached IAM role
}

# ✅ GOOD: Use profile
provider "aws" {
  region  = "us-east-1"
  profile = "my-terraform-profile"
}

# ✅ GOOD: Use assume role (cross-account)
provider "aws" {
  region = "us-east-1"
  
  assume_role {
    role_arn     = "arn:aws:iam::123456789012:role/TerraformRole"
    session_name = "TerraformSession"
  }
}
```

### Environment Variables for Credentials

```bash
# Set in CI/CD system (NOT in code)
export AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
export AWS_DEFAULT_REGION="us-east-1"
```

---

## 13.5 Sentinel Policy as Code

### Policy Structure

```hcl
# enforce-mandatory-tags.sentinel
import "tfplan"
import "strings"

mandatory_tags = ["Environment", "Owner", "CostCenter"]

resource_changes = filter tfplan.resource_changes as _, rc {
  rc.mode is "managed" and
  rc.type is "aws_instance" or
  rc.type is "aws_s3_bucket" or
  rc.type is "aws_vpc"
}

main = rule {
  all resource_changes as _, rc {
    all mandatory_tags as tag {
      rc.change.after.tags contains tag
    }
  }
}
```

### Common Sentinel Policies

```hcl
# 1. Restrict EC2 instance types
import "tfplan"

ec2_instances = filter tfplan.resource_changes as _, rc {
  rc.type is "aws_instance"
}

allowed_types = ["t2.micro", "t2.small", "t3.micro", "t3.small"]

main = rule {
  all ec2_instances as _, rc {
    rc.change.after.instance_type in allowed_types
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
    bucket.change.after.block_public_policy is true and
    bucket.change.after.restrict_public_buckets is true
  }
}

# 3. Require encryption
import "tfplan"

ebs_volumes = filter tfplan.resource_changes as _, rc {
  rc.type is "aws_ebs_volume"
}

main = rule {
  all ebs_volumes as _, volume {
    volume.change.after.encrypted is true
  }
}
```

---

## 13.6 Encryption at Rest and in Transit

### S3 Bucket Encryption

```hcl
resource "aws_s3_bucket" "data" {
  bucket = "my-secure-bucket"
}

# SSE-S3 (AES256)
resource "aws_s3_bucket_server_side_encryption_configuration" "data_sse" {
  bucket = aws_s3_bucket.data.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# SSE-KMS (more control)
resource "aws_s3_bucket_server_side_encryption_configuration" "data_kms" {
  bucket = aws_s3_bucket.data.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.data.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_kms_key" "data" {
  description             = "Data encryption key"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}
```

### RDS Encryption

```hcl
resource "aws_db_instance" "main" {
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.r6g.large"
  
  storage_encrypted = true  # Enable encryption
  kms_key_id        = aws_kms_key.rds.arn  # Custom KMS key
}

resource "aws_kms_key" "rds" {
  description             = "RDS encryption key"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}
```

### EBS Encryption

```hcl
# Enable EBS encryption by default
resource "aws_ebs_encryption_by_default" "this" {
  enabled = true
}

# Or per volume
resource "aws_ebs_volume" "data" {
  availability_zone = "us-east-1a"
  size              = 100
  encrypted         = true
  kms_key_id        = aws_kms_key.ebs.arn
}
```

---

## 13.7 Network Security

### Security Groups Best Practices

```hcl
# Principle: Least privilege
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  # Only open necessary ports
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from anywhere"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from anywhere (redirect to HTTPS)"
  }

  # SSH only from bastion
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]  # Only internal
    description = "SSH from internal network"
  }

  # Outbound: restrict to what's needed
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### VPC Flow Logs

```hcl
resource "aws_flow_log" "vpc" {
  log_destination      = aws_cloudwatch_log_group.flow_log.arn
  log_destination_type = "cloud-watch-logs"
  traffic_type         = "ALL"
  vpc_id               = aws_vpc.main.id
  
  tags = {
    Name = "vpc-flow-logs"
  }
}

resource "aws_cloudwatch_log_group" "flow_log" {
  name              = "/aws/vpc/flow-logs"
  retention_in_days = 90
}
```

---

## 13.8 CI/CD Security

### GitHub Actions Security

```yaml
name: Terraform
on:
  pull_request:
    branches: [main]

jobs:
  terraform-plan:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
        aws-region: us-east-1
        # Uses OIDC — no static credentials!
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
    
    - name: Terraform Plan
      run: |
        terraform plan -no-color
      env:
        TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}
```

### OIDC Authentication

```hcl
# IAM role for GitHub Actions (OIDC)
resource "aws_iam_role" "github_actions" {
  name = "github-actions-terraform"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "arn:aws:iam::${var.account_id}:oidc-provider/token.actions.githubusercontent.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*"
          }
        }
      }
    ]
  })
}
```

---

## 13.9 Compliance Checklist

| Check | Description | Implementation |
|-------|-------------|----------------|
| **Encryption at rest** | All data stores encrypted | S3 SSE, EBS encryption, RDS encryption |
| **Encryption in transit** | TLS for all traffic | HTTPS, TLS-enabled services |
| **Access logging** | Log all API calls | CloudTrail, VPC Flow Logs |
| **Least privilege** | Minimal IAM permissions | Targeted policies, conditions |
| **Network segmentation** | Public/private subnets | VPC design, security groups |
| **Secrets management** | No hardcoded secrets | Vault, Secrets Manager, env vars |
| **State protection** | Secure state storage | Encrypted S3, DynamoDB locking |
| **Policy as code** | Automated compliance | Sentinel policies |
| **Backup and recovery** | State backups | S3 versioning |
| **Audit trail** | Who changed what | Terraform Cloud audit logs |

---

## 📝 Exam Tips

1. **`sensitive = true`** hides values but state file still stores them in plaintext
2. **State files contain secrets** — Always encrypt the state backend
3. **Least privilege** — Grant only necessary permissions
4. **Assume role** — Use for cross-account access without static credentials
5. **OIDC** — Eliminates static credentials in CI/CD pipelines
6. **Sentinel** — Policy as code for compliance enforcement
7. **KMS** — Use for state file encryption (SSE-KMS)
8. **Secrets Manager / Vault** — External secrets management
9. **`random_password`** — Generate secure passwords in Terraform
10. **Plan output contains sensitive values** — Be careful who can view plans

---

## ✅ Chapter 13 Quiz

1. **True or False:** Setting `sensitive = true` on a variable prevents it from being stored in the state file.

2. **Which is the most secure way to pass AWS credentials to Terraform in CI/CD?**
   - a) Hardcoded in variables
   - b) OIDC (OpenID Connect)
   - c) Static keys in environment variables
   - d) AWS CLI config file

3. **What should you use to generate a secure random password in Terraform?**
   - a) `random_id`
   - b) `random_password`
   - c) `random_string`
   - d) `random_uuid`

4. **What is the purpose of Sentinel policies?**
   - a) To improve Terraform performance
   - b) To enforce compliance rules on Terraform configurations
   - c) To encrypt state files
   - d) To manage modules

5. **Which service should you use to rotate secrets in AWS?**
   - a) IAM
   - b) Secrets Manager
   - c) CloudTrail
   - d) Config

<details>
<summary>📌 Answers</summary>

1. **False** — `sensitive = true` hides values from output but they're still stored in state
2. **b** — OIDC eliminates the need for static credentials
3. **b** — `random_password` generates secure passwords
4. **b** — Sentinel enforces compliance rules on Terraform configurations
5. **b** — AWS Secrets Manager handles secret rotation
</details>

---

*Continue to → <a href="{{< relref "14-production-grade-terraform" >}}">Chapter 14: Production-Grade Terraform</a>*

---
title: "Chapter 14: Production-Grade Terraform"
weight: 14
bookFlatSection: false
bookToc: true
---

# Chapter 14: Production-Grade Terraform

## 🎯 Learning Objectives

- Design scalable Terraform project structures
- Implement CI/CD pipelines for infrastructure
- Write and run infrastructure tests
- Establish code review and collaboration workflows
- Adopt incident response and disaster recovery patterns

---

## 14.1 Project Structure Patterns

### Monorepo Structure (Recommended for Teams)

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── providers.tf
│   │   ├── backend.hcl
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   ├── providers.tf
│   │   ├── backend.hcl
│   │   └── terraform.tfvars
│   └── prod/
│       ├── main.tf
│       ├── providers.tf
│       ├── backend.hcl
│       └── terraform.tfvars
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── database/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   └── monitoring/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── README.md
├── tests/
│   ├── network_test.go
│   └── compliance_test.go
├── scripts/
│   ├── validate.sh
│   └── destroy.sh
├── .github/
│   └── workflows/
│       └── terraform.yml
├── .gitignore
├── README.md
└── terragrunt.hcl
```

### Multi-Repo Structure (for Large Organizations)

```
github.com/company/
├── terraform-modules/          # Central module repository
├── terraform-networking/       # Network team's repo
├── terraform-security/         # Security team's repo
├── terraform-platform/         # Platform team's repo
└── terraform-applications/     # App team's repo
```

---

## 14.2 CI/CD Pipeline Design

### GitHub Actions Workflow (Full Example)

```yaml
# .github/workflows/terraform.yml
name: 'Terraform Infrastructure'

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'environments/**'
      - 'modules/**'
  pull_request:
    branches:
      - main
    paths:
      - 'environments/**'
      - 'modules/**'

env:
  TF_VERSION: '1.9.0'
  WORKING_DIR: './environments/${{ github.ref_name }}'

permissions:
  id-token: write
  contents: read
  pull-requests: write

jobs:
  validate:
    name: 'Validate'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Format Check
        run: terraform fmt -check -recursive
      
      - name: Terraform Init
        run: terraform init -backend=false
        working-directory: ${{ env.WORKING_DIR }}
      
      - name: Terraform Validate
        run: terraform validate
        working-directory: ${{ env.WORKING_DIR }}
      
      - name: Checkov Security Scan
        uses: bridgecrewio/checkov-action@master
        with:
          directory: ${{ env.WORKING_DIR }}
          framework: terraform
  
  plan:
    name: 'Plan'
    needs: validate
    runs-on: ubuntu-latest
    environment: ${{ github.ref_name }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Init
        id: init
        run: terraform init -backend-config=backend.hcl
        working-directory: ${{ env.WORKING_DIR }}
      
      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        working-directory: ${{ env.WORKING_DIR }}
      
      - name: Post Plan Comment
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const output = `#### Terraform Plan 📋
            <details><summary>Show Plan</summary>
            
            \`\`\`terraform\n${{ steps.plan.outputs.stdout }}\n\`\`\`
            </details>
            
            *Pusher: @${{ github.actor }}*
            *Action: ${{ github.event_name }}*`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })
  
  apply:
    name: 'Apply'
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: plan
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Init
        run: terraform init -backend-config=backend.hcl
        working-directory: ${{ env.WORKING_DIR }}
      
      - name: Terraform Apply
        run: terraform apply -auto-approve tfplan
        working-directory: ${{ env.WORKING_DIR }}
```

### GitLab CI Pipeline

```yaml
# .gitlab-ci.yml
image: hashicorp/terraform:1.9

cache:
  key: "${CI_PROJECT_NAME}"
  paths:
    - .terraform

variables:
  TF_ROOT: ${CI_PROJECT_DIR}/environments/${CI_COMMIT_REF_NAME}
  TF_IN_AUTOMATION: "true"

before_script:
  - cd ${TF_ROOT}
  - terraform init -backend-config=backend.hcl

stages:
  - validate
  - plan
  - apply
  - destroy

validate:
  stage: validate
  script:
    - terraform fmt -check
    - terraform validate

plan:
  stage: plan
  script:
    - terraform plan -out=tfplan
  artifacts:
    paths:
      - ${TF_ROOT}/tfplan

apply:
  stage: apply
  script:
    - terraform apply tfplan
  when: manual
  only:
    - main

destroy:
  stage: destroy
  script:
    - terraform destroy -auto-approve
  when: manual
```

---

## 14.3 Infrastructure Testing

### Terratest (Go-based Testing)

```go
// tests/network_test.go
package test

import (
  "testing"
  "github.com/gruntwork-io/terratest/modules/terraform"
  "github.com/gruntwork-io/terratest/modules/aws"
  "github.com/stretchr/testify/assert"
)

func TestVPCDeployment(t *testing.T) {
  t.Parallel()

  terraformOptions := &terraform.Options{
    TerraformDir: "../environments/dev",
    
    Vars: map[string]interface{}{
      "environment": "test",
      "vpc_cidr":    "10.0.0.0/16",
    },
  }

  // Clean up after test
  defer terraform.Destroy(t, terraformOptions)

  // Deploy
  terraform.InitAndApply(t, terraformOptions)

  // Test outputs
  vpcId := terraform.Output(t, terraformOptions, "vpc_id")
  assert.NotEmpty(t, vpcId)

  // Verify VPC exists in AWS
  vpc := aws.GetVpcById(t, vpcId, "us-east-1")
  assert.Equal(t, "10.0.0.0/16", vpc.CidrBlock)
}
```

### terraform test (Built-in, Terraform 1.6+)

```hcl
# tests/vpc_test.tftest.hcl
run "test_vpc_creation" {
  # Override variables for test
  variables {
    environment = "test"
    vpc_cidr    = "10.0.0.0/16"
    az_count    = 2
  }

  # Assertions
  assert {
    condition     = aws_vpc.main.cidr_block == "10.0.0.0/16"
    error_message = "VPC CIDR should be 10.0.0.0/16"
  }

  assert {
    condition     = length(aws_subnet.public) == 2
    error_message = "Should create 2 public subnets"
  }

  assert {
    condition     = length(aws_subnet.private) == 2
    error_message = "Should create 2 private subnets"
  }
}

run "test_subnet_connectivity" {
  variables {
    environment = "test"
    vpc_cidr    = "10.0.0.0/16"
    az_count    = 2
  }

  # Verify subnets are in correct CIDR range
  assert {
    condition     = can(regex("^10\\.0\\.", aws_subnet.public[0].cidr_block))
    error_message = "Subnet should be in 10.0.x.x range"
  }
}
```

### Running Tests

```bash
# Run terraform tests
terraform test

# Run terratest
go test -v -timeout 30m ./tests/

# Run with specific test
go test -v -run TestVPCDeployment -timeout 30m
```

---

## 14.4 Code Review Practices

### Pull Request Checklist

```markdown
## Terraform PR Checklist

- [ ] `terraform fmt` run and no changes
- [ ] `terraform validate` passes
- [ ] `terraform plan` reviewed — expected changes only
- [ ] New resources have proper tags
- [ ] Variables have descriptions and types
- [ ] No hardcoded values (unless necessary)
- [ ] Secrets are not in version control
- [ ] Backend configuration is correct
- [ ] Module versions are pinned (for registry modules)
- [ ] Security groups follow least privilege
- [ ] IAM policies follow least privilege
- [ ] Resources have lifecycle rules (prevent_destroy for critical)
```

### Plan Review Process

```
1. Developer opens PR with Terraform changes
2. CI runs `terraform plan`
3. Plan output is posted as PR comment
4. Reviewer checks:
   - Expected resources are being created
   - No unexpected destructions
   - Sensible configuration for the environment
   - Security implications
5. After approval, PR is merged
6. CI runs `terraform apply` on merge
```

---

## 14.5 Change Management

### Safe Apply Strategies

```bash
# 1. Plan and save to file (for applying later)
terraform plan -out=plan.tfplan
terraform apply plan.tfplan

# 2. Approve with caution
terraform apply  # Interactive approval

# 3. Auto-approve (only in CI/CD)
terraform apply -auto-approve

# 4. Target specific resources (use sparingly)
terraform apply -target=aws_instance.web
```

### Rollback Strategies

```hcl
# Strategy 1: Revert the Git commit
git revert HEAD
# Then run terraform apply to rollback

# Strategy 2: Keep previous plan files
terraform plan -out=plan-$(date +%Y%m%d-%H%M).tfplan

# Strategy 3: Use state rollback
terraform state pull > backup.tfstate
# If something goes wrong:
terraform state push backup.tfstate

# Strategy 4: Destroy specific resources
terraform destroy -target=aws_instance.bad_deploy
```

---

## 14.6 Disaster Recovery

### State Backup Strategy

```bash
# 1. Automated backups (S3 versioning)
aws s3api list-object-versions \
  --bucket my-terraform-state \
  --prefix prod/terraform.tfstate

# 2. Regular state exports
AWS_COMMAND="aws s3 cp"
BACKUP_BUCKET="my-terraform-backups"
DATE=$(date +%Y-%m-%d)

aws s3 cp s3://my-terraform-state/prod/terraform.tfstate \
  s3://${BACKUP_BUCKET}/state-backups/${DATE}/terraform.tfstate
```

### Disaster Recovery Plan

```bash
#!/bin/bash
# scripts/disaster-recovery.sh

# 1. Assess damage
echo "1. Checking state file integrity..."
aws s3api head-object --bucket my-terraform-state --key prod/terraform.tfstate

# 2. Restore state from backup
echo "2. Restoring state from latest backup..."
LATEST=$(aws s3api list-object-versions \
  --bucket my-terraform-state \
  --key prod/terraform.tfstate \
  --query 'Versions[?IsLatest].[VersionId]' \
  --output text)

terraform state pull > recovered.tfstate

# 3. Verify recovery
echo "3. Verifying state..."
terraform plan
```

---

## 14.7 Team Workflows

### Git Branching Strategy

```
main          ──●────────────────●──────────
                 \              /
staging         ──●────────────●────────────
                   \          /
develop           ──●────────●──────────────
                     \      /
feature/my-feature    ●────●
```

| Branch | Environment | Trigger |
|--------|-------------|---------|
| `feature/*` | None | Manual plan only |
| `develop` | Dev | Auto-trigger plan + apply |
| `staging` | Staging | Auto plan, manual apply |
| `main` | Production | Auto plan, approved apply |

### Approval Workflows

```yaml
# Require environment approval in GitHub
jobs:
  apply:
    environment:
      name: production
      url: https://console.aws.amazon.com
    # Requires approval from designated reviewers
    # Only runs after approval
```

---

## 14.8 Cost Management

### Cost Estimation Tools

```bash
# Infracost — Cost estimation for Terraform
infracost breakdown --path environments/prod

# Example output:
# NAME                               MONTHLY QTY  UNIT         PRICE   HOURLY COST
# aws_instance.web[0]                         1  months       $56.84        $0.078
# aws_db_instance.main                        1  months      $346.72       $0.475
# aws_s3_bucket.logs                          1  months        $2.30       $0.003
# ───────────────────────────────────────────────────────────────────────────────
# TOTAL                                                             $405.86
```

### Cost Optimization Patterns

```hcl
# Use cheaper instances for non-production
locals {
  instance_type = var.environment == "prod" ? "t3.medium" : "t2.nano"
}

# Use reserved instances for production
resource "aws_ec2_capacity_reservation" "prod" {
  count = var.environment == "prod" ? 1 : 0
  # ...
}

# Right-size volumes
locals {
  volume_size = var.environment == "prod" ? 50 : 20
  volume_type = var.environment == "prod" ? "gp3" : "gp2"
}

# Delete non-production resources outside business hours
# (Use AWS Instance Scheduler or similar)
```

---

## 14.9 Incident Response

### Common Terraform Incidents

| Incident | Symptoms | Response |
|----------|----------|----------|
| **State corruption** | `terraform plan` errors | Restore from backup |
| **Lock timeout** | "Error acquiring state lock" | Force unlock after verifying |
| **Drift** | Unexpected changes in plan | Investigate root cause |
| **API rate limiting** | Throttling errors | Implement retries, backoff |
| **Provider bug** | Unexpected resource behavior | Pin provider version, report bug |

### Runbook Template

```markdown
# Incident: State File Corruption

## Detection
- terraform plan fails with "Error loading state"
- terraform state list returns errors

## Response
1. Check state file in S3
2. List versions: `aws s3api list-object-versions`
3. Restore previous version
4. Run `terraform plan` to verify
5. If successful, `terraform apply`

## Prevention
- Enable S3 versioning on state bucket
- Regular state exports as backups
- State locking with DynamoDB
```

---

## 📝 Exam Tips

1. **Monorepo** structure works well for small-medium teams
2. **CI/CD pipelines** automate validation, planning, and applying
3. **Terratest** or `terraform test` for infrastructure testing
4. **`terraform plan -out=plan.tfplan`** saves plan for later application
5. **Code review** — Always review plans before applying
6. **`prevent_destroy`** on critical production resources
7. **Environment isolation** — Separate state files per environment
8. **Automated validation** — `terraform fmt -check` in CI
9. **Approval gates** — Require approval for production applies
10. **Disaster recovery plan** — Backups, recovery procedures

---

## ✅ Chapter 14 Quiz

1. **What is the benefit of saving a plan with `terraform plan -out=tfplan`?**
   - a) It makes the plan run faster
   - b) Guarantees the exact same plan is applied later
   - c) It reduces cost
   - d) It encrypts the plan

2. **Which tool can you use for infrastructure testing in Go?**
   - a) Terratest
   - b) TerraTest
   - c) GoTest
   - d) TerraCheck

3. **True or False:** Production applies should typically require manual approval.

4. **What is a monorepo approach?**
   - a) Single repository for all Terraform code
   - b) Multiple repositories for different environments
   - c) No version control
   - d) Only using Terraform Cloud

5. **What should you do if state is corrupted?**
   - a) Delete state and recreate
   - b) Restore from backup
   - c) Reimport all resources
   - d) Start fresh

<details>
<summary>📌 Answers</summary>

1. **b** — Saved plan ensures the exact same plan is applied
2. **a** — Terratest is the Go testing framework for infrastructure
3. **True** — Production should require approval gates
4. **a** — Monorepo stores all Terraform code in a single repository
5. **b** — Restore from backup (state versioning)
</details>

---

> **📂 Real-World Examples:** Put these patterns into practice with the complete [Production-Ready Example]({{< relref "/examples/production-ready" >}}), explore [ECS Fargate]({{< relref "/examples/ecs-fargate" >}}) for containerized workloads, or see the [EKS Cluster]({{< relref "/examples/eks-cluster" >}}) for Kubernetes deployments.

*Continue to → <a href="{{< relref "15-exam-preparation" >}}">Chapter 15: Exam Preparation Guide</a>*

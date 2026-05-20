---
title: "Chapter 17: Real-World Scenario Questions"
weight: 17
bookFlatSection: false
bookToc: true
---

# Chapter 17: Real-World Scenario Questions

> **Test your Terraform knowledge with real-world troubleshooting scenarios. Each scenario includes a problem description, analysis, and step-by-step solution.**

---

## 🎯 Learning Objectives

- Analyze and resolve real-world Terraform failures (state corruption, drift, secrets leakage)
- Design multi-region, high-availability architectures with Terraform
- Implement secure secret management and rotation strategies
- Build and maintain CI/CD pipelines for infrastructure deployments
- Execute safe refactoring and migration strategies at scale
- Apply cost optimization and security incident response patterns

---

## 📋 Table of Contents

- [Scenario 1: State File Corruption](#171-state-file-corruption)
- [Scenario 2: Multi-Region Deployment](#172-multi-region-deployment)
- [Scenario 3: Secret Rotation Strategy](#173-secret-rotation-strategy)
- [Scenario 4: Drift Detection & Remediation](#174-drift-detection--remediation)
- [Scenario 5: Zero-Downtime Deployment](#175-zero-downtime-deployment)
- [Scenario 6: Module Refactoring at Scale](#176-module-refactoring-at-scale)
- [Scenario 7: Cost Optimization](#177-cost-optimization)
- [Scenario 8: Security Incident Response](#178-security-incident-response)
- [Scenario 9: CI/CD Pipeline Setup](#179-cicd-pipeline-setup)
- [Scenario 10: Migration from CloudFormation](#1710-migration-from-cloudformation)
- [Scenario 11: Multi-Team Collaboration](#1711-multi-team-collaboration)
- [Scenario 12: Handling Large Infrastructure Changes](#1712-handling-large-infrastructure-changes)

---

## 17.1 State File Corruption

### Scenario

> You run `terraform plan` and get the following error:
>
> ```
> Error: Error loading state: Error serialization failed:
> json: error calling MarshalJSON for type terraform.State:
> unexpected end of JSON input
> ```
>
> Your last known good state was 3 days ago. You have made multiple applies since then.

### Root Cause Analysis

The state file has become corrupted — likely due to:
- Concurrent `terraform apply` operations without state locking
- Manual editing of the state file
- Network interruption during state write
- Disk space or permissions issue

### Step-by-Step Solution

**Step 1: Create a backup of the current state**

```bash
# If local state
cp terraform.tfstate terraform.tfstate.corrupted.backup

# If remote state (S3)
aws s3 cp s3://my-bucket/path/to/state.tfstate ./state.corrupted.backup
```

**Step 2: Check if the backup is recoverable**

```bash
# Try to fix JSON
cat terraform.tfstate | python3 -m json.tool > /dev/null 2>&1

# If JSON is fixable, try parsing with jq
cat terraform.tfstate | jq '.' > fixed-state.json 2>/dev/null
```

**Step 3: Restore from the last known good state**

```bash
# If using S3 with versioning enabled
aws s3api list-object-versions \
  --bucket my-terraform-state-bucket \
  --prefix "path/to/terraform.tfstate"

# Get the last good version (before corruption)
aws s3api get-object \
  --bucket my-terraform-state-bucket \
  --key "path/to/terraform.tfstate" \
  --version-id "VERSION_ID" \
  terraform.tfstate.good
```

**Step 4: Verify with `terraform plan`**

```bash
terraform plan
```

If the plan shows unexpected changes, resources managed since the backup may need to be re-imported.

**Step 5: Re-import any missing resources**

```bash
# List resources managed outside Terraform since backup
terraform plan -out=plan.out
# Review and correct any unexpected changes

# Import any missing resources
terraform import aws_instance.web_new i-0abcd1234efgh5678
```

**Step 6: Prevent future corruption**

```bash
# Enable S3 versioning (already done above)
aws s3api put-bucket-versioning \
  --bucket my-terraform-state-bucket \
  --versioning-configuration Status=Enabled

# Add DynamoDB locking
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "path/to/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### Prevention Checklist

- [ ] Enable S3 bucket versioning on state bucket
- [ ] Use DynamoDB for state locking
- [ ] Never edit state files manually
- [ ] Use CI/CD pipeline instead of local applies
- [ ] Set up state backup automation

---

## 17.2 Multi-Region Deployment

### Scenario

> Your company needs to deploy infrastructure in **3 AWS regions (us-east-1, eu-west-1, ap-southeast-1)** for global high availability. You need to share common infrastructure (Route53, WAF) across regions while maintaining per-region resources (VPCs, compute, databases).

### Architecture Design

```
                        ┌─────────────────┐
                        │   Route53 (Global) │
                        │   (Route53 + WAF) │
                        └────────┬─────────┘
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  us-east-1      │  │  eu-west-1      │  │  ap-southeast-1 │
│                 │  │                 │  │                 │
│  VPC + ECS + RDS│  │  VPC + ECS + RDS│  │  VPC + ECS + RDS│
│  ALB + ASG      │  │  ALB + ASG      │  │  ALB + ASG      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Solution

**Step 1: Directory structure**

```
terraform/
├── global/
│   ├── route53/
│   │   ├── main.tf
│   │   └── backend.tf
│   └── waf/
│       ├── main.tf
│       └── backend.tf
├── regions/
│   ├── us-east-1/
│   │   ├── main.tf
│   │   ├── backend.tf
│   │   └── terraform.tfvars
│   ├── eu-west-1/
│   │   ├── main.tf
│   │   ├── backend.tf
│   │   └── terraform.tfvars
│   └── ap-southeast-1/
│       ├── main.tf
│       ├── backend.tf
│       └── terraform.tfvars
└── modules/
    ├── vpc/
    ├── ecs/
    └── rds/
```

**Step 2: Global infrastructure (route53 + WAF)**

```hcl
# global/route53/main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_route53_zone" "main" {
  name = "example.com"
}

resource "aws_route53_health_check" "regional" {
  for_each = toset(["us-east-1", "eu-west-1", "ap-southeast-1"])

  failure_threshold = 3
  fqdn              = "app-${each.key}.example.com"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
}

resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "app.example.com"
  type    = "A"

  failover_routing_policy {
    type = "PRIMARY"
  }

  set_identifier = "primary"
  alias {
    name                   = data.terraform_remote_state.us_east.outputs.alb_dns
    zone_id                = data.terraform_remote_state.us_east.outputs.alb_zone_id
    evaluate_target_health = true
  }
}

data "terraform_remote_state" "us_east" {
  backend = "s3"
  config = {
    bucket = "company-terraform-state"
    key    = "regions/us-east-1/terraform.tfstate"
    region = "us-east-1"
  }
}
```

**Step 3: Regional infrastructure (reusable module)**

```hcl
# regions/us-east-1/main.tf
provider "aws" {
  region = "us-east-1"
}

module "regional_infra" {
  source = "../../modules/regional-infra"

  region      = "us-east-1"
  environment = "prod"
  vpc_cidr    = "10.1.0.0/16"
  azs         = ["us-east-1a", "us-east-1b", "us-east-1c"]

  # DNS for health check
  app_domain = "app-us-east-1.example.com"
  zone_id    = data.terraform_remote_state.global_route53.outputs.zone_id
}

# Access global state
data "terraform_remote_state" "global_route53" {
  backend = "s3"
  config = {
    bucket = "company-terraform-state"
    key    = "global/route53/terraform.tfstate"
    region = "us-east-1"
  }
}
```

### Key Considerations

| Consideration | Solution |
|--------------|----------|
| **State isolation** | Separate state files per region |
| **Shared resources** | `terraform_remote_state` data source |
| **Provider configuration** | Provider aliases |
| **DNS routing** | Route53 latency/failover routing |
| **Data replication** | Cross-region replication for databases |
| **State file size** | Keep small with modular approach |

---

## 17.3 Secret Rotation Strategy

### Scenario

> Your organization requires automatic database password rotation every 90 days. Currently, passwords are hardcoded in Terraform variables stored in CI/CD secrets. You need a secure, auditable, and automated solution.

### Requirements

- Automatic rotation every 90 days
- Zero downtime during rotation
- Audit trail for compliance (SOC 2)
- Works across environments (dev/staging/prod)
- Emergency rotation capability

### Solution

**Step 1: Infrastructure design**

```hcl
# Use AWS Secrets Manager for secrets
resource "aws_secretsmanager_secret" "db" {
  name                    = "${var.environment}/db/password"
  description             = "Database password for ${var.environment}"
  rotation_enabled        = true
  rotation_lambda_arn     = aws_lambda_function.secret_rotator.arn
  rotation_rules {
    automatically_after_days = 90
  }

  tags = {
    Environment = var.environment
    SecretType  = "database"
  }
}

# Store initial random password
resource "random_password" "db" {
  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = "dbadmin"
    password = random_password.db.result
    engine   = "postgres"
    host     = aws_db_instance.main.address
    port     = 5432
    dbname   = "appdb"
  })
}
```

**Step 2: Lambda for automatic rotation**

```python
# rotation_lambda.py
import boto3
import json
import logging
import os
import pymysql
import secrets

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """Handle secret rotation steps"""
    arn = event['SecretId']
    token = event['ClientRequestToken']
    step = event['Step']
    
    service = SecretsManagerService(arn, token)
    
    if step == 'createSecret':
        service.create_secret()
    elif step == 'setSecret':
        service.set_secret()
    elif step == 'testSecret':
        service.test_secret()
    elif step == 'finishSecret':
        service.finish_secret()
    
    return {'Status': 'Success'}

class SecretsManagerService:
    def __init__(self, arn, token):
        self.client = boto3.client('secretsmanager')
        self.arn = arn
        self.token = token
    
    def create_secret(self):
        """Create the new password for the next rotation step"""
        new_password = secrets.generate_password(24)
        self.client.put_secret_value(
            SecretId=self.arn,
            ClientRequestToken=self.token,
            SecretString=json.dumps({
                'username': 'dbadmin',
                'password': new_password,
                'engine': 'postgres',
                'host': os.environ['DB_HOST'],
                'port': 5432,
                'dbname': 'appdb'
            }),
            VersionStages=['AWSPENDING']
        )
    
    def set_secret(self):
        """Apply the new password to the database"""
        pending = self._get_secret('AWSPENDING')
        connection = self._get_db_connection()
        
        with connection.cursor() as cursor:
            cursor.execute(
                f"ALTER USER {pending['username']} WITH PASSWORD '{pending['password']}';"
            )
        connection.commit()
        connection.close()
    
    def test_secret(self):
        """Test the new password works"""
        pending = self._get_secret('AWSPENDING')
        connection = self._get_db_connection(password=pending['password'])
        connection.close()
    
    def finish_secret(self):
        """Mark the new version as current"""
        self.client.update_secret_version_stage(
            SecretId=self.arn,
            VersionStage='AWSCURRENT',
            MoveToVersionId=self.token,
            RemoveFromVersionId='AWSPENDING'
        )
    
    def _get_secret(self, stage):
        response = self.client.get_secret_value(
            SecretId=self.arn,
            VersionStage=stage
        )
        return json.loads(response['SecretString'])
    
    def _get_db_connection(self, password=None):
        secret = self._get_secret('AWSCURRENT')
        return pymysql.connect(
            host=secret['host'],
            user=secret['username'],
            password=password or secret['password'],
            database=secret['dbname']
        )
```

**Step 3: Reference secrets in application**

```hcl
# App configuration
resource "aws_db_instance" "main" {
  # ... standard RDS config
  
  # Store the secret ARN for app consumption
  tags = {
    SecretArn = aws_secretsmanager_secret.db.arn
  }
}

# IAM policy for apps to read secrets
resource "aws_iam_policy" "read_secrets" {
  name = "${var.environment}-read-db-secret"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.db.arn
      }
    ]
  })
}
```

### Rotation Workflow

```
1. AWS Secrets Manager initiates rotation
2. createSecret → Generate new password in PENDING stage
3. setSecret    → Apply new password to database
4. testSecret   → Verify new password works
5. finishSecret → Mark PENDING as CURRENT, demote old
```

### Emergency Rotation

```bash
# Emergency manual rotation
aws secretsmanager rotate-secret \
  --secret-id prod/db/password \
  --rotation-lambda-arn arn:aws:lambda:...

# Force immediate rotation
aws secretsmanager rotate-secret \
  --secret-id prod/db/password \
  --rotate-immediately
```

---

## 17.4 Drift Detection & Remediation

### Scenario

> You're managing infrastructure with Terraform, but team members occasionally make changes through the AWS console for emergency fixes. These drift from the Terraform state, causing unexpected behavior in subsequent runs.

### Detection Strategy

**Option 1: Automated drift detection with CI/CD**

```yaml
# .github/workflows/drift-detection.yml
name: Drift Detection
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM
  workflow_dispatch:  # Manual trigger

jobs:
  detect-drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
      
      - name: Terraform Init
        run: terraform init
      
      - name: Terraform Plan
        run: terraform plan -out=plan.out
        continue-on-error: false
      
      - name: Check for Drift
        id: check-drift
        run: |
          PLAN_OUTPUT=$(terraform show -json plan.out)
          CHANGES=$(echo "$PLAN_OUTPUT" | jq '.resource_changes | length')
          if [ "$CHANGES" -gt 0 ]; then
            echo "DRIFT DETECTED!"
            echo "changed=$CHANGES" >> $GITHUB_OUTPUT
            echo "plan_output=$(echo "$PLAN_OUTPUT" | jq -c '.resource_changes[] | {address, action}')" >> $GITHUB_OUTPUT
          fi
      
      - name: Create GitHub Issue
        if: steps.check-drift.outputs.changed > 0
        uses: actions/github-script@v6
        with:
          script: |
            const plan = JSON.parse(process.env.PLAN_OUTPUT);
            let body = '## Drift Detected\n\n';
            body += `Found ${plan.changed} resources with changes:\n\n`;
            plan.resource_changes.forEach(change => {
              body += `- **${change.address}**: ${change.action}\n`;
            });
            body += '\nRun `terraform apply` to remediate.';
            
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Drift detected: ${new Date().toISOString().split('T')[0]}`,
              body: body,
              labels: ['drift', 'automated']
            });
```

**Option 2: Use `terraform plan` with notifications**

```bash
#!/bin/bash
# detect-drift.sh

echo "🔍 Running drift detection..."

terraform plan -detailed-exitcode -out=plan.out
EXIT_CODE=$?

case $EXIT_CODE in
  0)
    echo "✅ No drift detected."
    ;;
  1)
    echo "❌ Error during planning."
    exit 1
    ;;
  2)
    echo "⚠️  Drift detected! Here are the changes:"
    terraform show plan.out
    
    # Send notification
    PLAN_TEXT=$(terraform show -no-color plan.out)
    
    # Slack notification
    curl -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"Drift detected in $ENVIRONMENT environment\n\`\`\`\n$PLAN_TEXT\n\`\`\`\"}" \
      $SLACK_WEBHOOK_URL
    ;;
esac
```

### Remediation Strategy

When drift is detected, follow this process:

| Priority | Action | Method |
|----------|--------|--------|
| 🔴 Critical | Immediate remediation | Apply with caution, review diffs |
| 🟡 Normal | Schedule remediation | Create PR, review, merge, apply |
| 🟢 Low | Log for review | Track in issue tracker |

**Step 1: Assess the drift**

```bash
terraform plan -detailed-exitcode
```

**Step 2: Determine if the drift should be kept or reverted**

- **Keep the change**: Update Terraform configuration to match new state
- **Revert the change**: Apply Terraform to restore desired state

**Step 3: Remediate**

```bash
# If keeping the change
# 1. Update .tf files to match
# 2. terraform plan should show no changes
# 3. Commit and push

# If reverting the change
# 1. terraform apply (reverts to desired state)
# 2. Document the incident
# 3. Implement guardrails to prevent recurrence
```

### Preventive Measures

- [ ] **Disable console access** for critical environments
- [ ] **Use AWS Config rules** to detect non-Terraform changes
- [ ] **Implement change management** — all changes through CI/CD
- [ ] **Use service control policies (SCPs)** to block certain actions
- [ ] **Set up CloudTrail alerts** for console modifications
- [ ] **Tag resources** with `ManagedBy: Terraform` for identification

---

## 17.5 Zero-Downtime Deployment

### Scenario

> You need to update the AMI for all EC2 instances in an auto-scaling group. The application takes 2 minutes to warm up, and you must ensure zero downtime during the rolling update.

### Challenge

- Must maintain full capacity during deployment
- New instances need 2 minutes to warm up
- Rolling updates must be controlled and monitored
- Rollback must be fast if something goes wrong

### Solution: Blue-Green Deployment

**Step 1: Infrastructure setup**

```hcl
# Application version mapping
locals {
  app_versions = {
    blue = {
      ami_id          = data.aws_ami.current.id
      asg_name        = "${var.environment}-app-blue"
      alb_rule_priority = 10
    }
    green = {
      ami_id          = data.aws_ami.current.id
      asg_name        = "${var.environment}-app-green"
      alb_rule_priority = 20
    }
  }
}

# Target groups for each deployment
resource "aws_lb_target_group" "blue" {
  name     = "${var.environment}-app-blue-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 15  # Fast health checks
    path                = "/health"
    timeout             = 5
  }

  tags = {
    Environment = var.environment
    Deployment  = "blue"
  }
}

resource "aws_lb_target_group" "green" {
  name     = "${var.environment}-app-green-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 15
    path                = "/health"
    timeout             = 5
  }

  tags = {
    Environment = var.environment
    Deployment  = "green"
  }
}

# Auto-scaling groups
resource "aws_autoscaling_group" "blue" {
  name               = "${var.environment}-app-blue-asg"
  desired_capacity   = var.desired_capacity
  min_size           = var.desired_capacity
  max_size           = var.desired_capacity * 2
  vpc_zone_identifier = var.private_subnet_ids
  target_group_arns  = [aws_lb_target_group.blue.arn]

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.environment}-app-blue"
    propagate_at_launch = true
  }
  tag {
    key                 = "Deployment"
    value               = "blue"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_group" "green" {
  name               = "${var.environment}-app-green-asg"
  desired_capacity   = var.desired_capacity
  min_size           = var.desired_capacity
  max_size           = var.desired_capacity * 2
  vpc_zone_identifier = var.private_subnet_ids
  target_group_arns  = [aws_lb_target_group.green.arn]

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.environment}-app-green"
    propagate_at_launch = true
  }
  tag {
    key                 = "Deployment"
    value               = "green"
    propagate_at_launch = true
  }
}

# ALB Listener Rules
resource "aws_lb_listener_rule" "blue" {
  listener_arn = var.alb_listener_arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.blue.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

resource "aws_lb_listener_rule" "green" {
  listener_arn = var.alb_listener_arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.green.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}
```

**Step 2: Deployment script**

```bash
#!/bin/bash
# blue-green-deploy.sh

set -euo pipefail

ENVIRONMENT=${1:-dev}
DEPLOYMENT=${2:-green}  # or "blue"

echo "🚀 Starting $DEPLOYMENT deployment in $ENVIRONMENT"

# Step 1: Update launch template with new AMI
echo "📦 Updating launch template..."
terraform apply -auto-approve \
  -var="environment=$ENVIRONMENT" \
  -var="active_deployment=$DEPLOYMENT"

# Step 2: Wait for new instances to become healthy
echo "⏳ Waiting for new instances to become healthy..."
aws elbv2 describe-target-health \
  --target-group-arn $(terraform output -raw ${DEPLOYMENT}_target_group_arn) \
  --query 'TargetHealthDescriptions[?TargetHealth.State==`healthy`]' \
  --output text

sleep 120  # Warmup period

# Step 3: Switch traffic
echo "🔄 Switching traffic to $DEPLOYMENT..."
# Update listener rule to route all traffic to new deployment
terraform apply -auto-approve \
  -var="environment=$ENVIRONMENT" \
  -var="active_deployment=$DEPLOYMENT" \
  -var="switch_traffic=true"

# Step 4: Monitor
echo "📊 Monitoring deployment..."
aws elbv2 describe-target-health \
  --target-group-arn $(terraform output -raw ${DEPLOYMENT}_target_group_arn)

# Step 5: Scale down old deployment
echo "🧹 Scaling down old deployment..."
terraform apply -auto-approve \
  -var="environment=$ENVIRONMENT" \
  -var="active_deployment=$DEPLOYMENT" \
  -var="scale_down_old=true"

echo "✅ Deployment complete!"
```

**Step 3: Rollback procedure**

```bash
#!/bin/bash
# rollback.sh

echo "⚠️  Rolling back deployment..."

# Switch traffic back to previous deployment
terraform apply \
  -var="environment=prod" \
  -var="active_deployment=blue" \
  -var="switch_traffic=true"

# Scale down new deployment
terraform apply \
  -var="environment=prod" \
  -var="active_deployment=green" \
  -var="scale_down_green=true"

echo "✅ Rollback complete!"
```

---

## 17.6 Module Refactoring at Scale

### Scenario

> You have a monolithic Terraform configuration with 50+ resources. You need to refactor it into reusable modules without destroying and recreating any infrastructure.

### Current State

```
infrastructure/
├── main.tf          # 50+ resources in one file
├── variables.tf     # 30 variables
├── outputs.tf       # 20 outputs
└── terraform.tfvars # Environment config
```

### Target State

```
infrastructure/
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── database/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars
└── backend.tf
```

### Migration Strategy

**Step 1: Map current resources to modules**

```
Current File           → Module
─────────────────────────────────────
aws_vpc.main           → module.networking
aws_subnet.public      → module.networking
aws_subnet.private     → module.networking
aws_security_group.web → module.compute
aws_instance.web       → module.compute
aws_db_instance.main   → module.database
```

**Step 2: Create module structure**

```hcl
# modules/networking/main.tf
resource "aws_vpc" "this" {
  cidr_block = var.vpc_cidr
  # ... same config as original
}

resource "aws_subnet" "public" {
  count = length(var.public_subnets)
  # ... same config as original
}
```

**Step 3: Use `moved` blocks (Terraform v1.1+)**

```hcl
# main.tf — Refactored root module
module "networking" {
  source = "./modules/networking"
  vpc_cidr        = var.vpc_cidr
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
}

module "compute" {
  source = "./modules/compute"
  vpc_id         = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
}

# MOVED BLOCKS: Map old state path to new module path
moved {
  from = aws_vpc.main
  to   = module.networking.this
}

moved {
  from = aws_subnet.public
  to   = module.networking.public
}

moved {
  from = aws_instance.web
  to   = module.compute.web
}
```

**Step 4: Apply without changes**

```bash
# 1. Copy state to backup
terraform state pull > backup.tfstate

# 2. Refactor configuration (add modules + moved blocks)
# Keep original resource blocks temporarily

# 3. Verify with plan — should show "no changes"
terraform plan

# If plan shows changes, adjust module configuration
```

**Step 5: Remove old resource blocks**

```hcl
# Remove from main.tf:
# resource "aws_vpc" "main" { ... } ← Moved to module
# resource "aws_instance" "web" { ... } ← Moved to module

# Keep moved blocks in place
moved {
  from = aws_vpc.main
  to   = module.networking.this
}
```

### Rollback Strategy

If something goes wrong:

```bash
# Rollback state
terraform state push backup.tfstate

# Revert configuration changes in Git
git checkout -- main.tf
```

---

## 17.7 Cost Optimization

### Scenario

> Your AWS costs are growing rapidly. Resources are running 24/7 with no optimization. Your CTO wants to reduce infrastructure costs by 40% without impacting production workloads.

### Cost Analysis

| Resource Type | Monthly Cost | Optimization Potential |
|--------------|-------------|----------------------|
| EC2 (dev/test) | $5,000 | 🔴 70% (stop non-business hours) |
| RDS | $3,000 | 🟡 30% (right-size, reserved) |
| EBS Snapshots | $1,500 | 🔴 60% (remove old snapshots) |
| unused ALBs | $800 | 🔴 100% (delete unused) |
| NAT Gateways | $600 | 🟡 50% (share across AZs) |

### Solution

**Step 1: Resource optimization**

```hcl
# Right-size instances based on actual usage
locals {
  instance_sizing = {
    dev = {
      web = { type = "t3.small", count = 1 }
      db  = { type = "db.t3.small" }
    }
    staging = {
      web = { type = "t3.medium", count = 2 }
      db  = { type = "db.t3.medium" }
    }
    prod = {
      web = { type = "t5.large", count = 3 }
      db  = { type = "db.r5.large" }
    }
  }
}

# Use Spot Instances for non-critical workloads
resource "aws_ec2_fleet" "batch_jobs" {
  count = var.environment != "prod" ? 1 : 0

  launch_template_config {
    launch_template_specification {
      launch_template_id = aws_launch_template.batch.id
      version            = "$Latest"
    }
    overrides {
      instance_type = "t3.medium"
      max_price     = "0.02"  # 30% of on-demand
    }
  }

  target_capacity_specification {
    default_target_capacity_type = "spot"
    total_target_capacity        = 5
  }

  type = "instant"
}

# Schedule auto stop/start for non-prod
resource "aws_autoscaling_schedule" "night_stop" {
  count = var.environment != "prod" ? 1 : 0

  scheduled_action_name = "${var.environment}-night-stop"
  min_size              = 0
  max_size              = 0
  desired_capacity      = 0
  recurrence            = "0 19 * * MON-FRI"  # 7 PM weekdays
  autoscaling_group_name = aws_autoscaling_group.web.name
}

resource "aws_autoscaling_schedule" "morning_start" {
  count = var.environment != "prod" ? 1 : 0

  scheduled_action_name = "${var.environment}-morning-start"
  min_size              = var.asg_min_size
  max_size              = var.asg_max_size
  desired_capacity      = var.asg_desired_size
  recurrence            = "0 7 * * MON-FRI"  # 7 AM weekdays
  autoscaling_group_name = aws_autoscaling_group.web.name
}
```

**Step 2: Snapshot lifecycle management**

```hcl
# Automate snapshot cleanup
resource "aws_ebs_snapshot" "daily" {
  volume_id = aws_ebs_volume.data.id

  tags = {
    Name               = "daily-backup"
    Retention          = "7"
    ManagedBy          = "Terraform"
    CostOptimization   = "true"
  }
}

# Lifecycle rule to delete old snapshots
resource "aws_ebs_snapshot_copy" "weekly" {
  source_snapshot_id = aws_ebs_snapshot.daily.id
  source_region      = var.region
  description        = "Weekly backup"

  tags = {
    Name               = "weekly-backup"
    Retention          = "30"
    ManagedBy          = "Terraform"
    CostOptimization   = "true"
  }
}

# Lambda to cleanup old snapshots
resource "aws_lambda_function" "snapshot_cleanup" {
  filename = "lambda/snapshot-cleanup.zip"
  handler  = "index.handler"
  runtime  = "python3.9"

  environment {
    variables = {
      RETENTION_DAYS = "30"
    }
  }
}

resource "aws_cloudwatch_event_rule" "daily_cleanup" {
  schedule_expression = "rate(1 day)"
}

resource "aws_cloudwatch_event_target" "daily_cleanup" {
  rule = aws_cloudwatch_event_rule.daily_cleanup.name
  arn  = aws_lambda_function.snapshot_cleanup.arn
}
```

**Step 3: Tagging for cost tracking**

```hcl
# Enforce cost-tracking tags
locals {
  required_tags = {
    CostCenter        = var.cost_center
    Environment       = var.environment
    Owner             = var.owner
    ExpiresOn         = var.environment == "ephemeral" ? timestamp() : ""
    AutoStop          = var.environment != "prod" ? "true" : "false"
    OptimizationLevel = var.environment == "prod" ? "critical" : "aggressive"
  }
}

# Use provider default tags for consistency
provider "aws" {
  default_tags {
    tags = local.required_tags
  }
}
```

**Step 4: Cost monitoring dashboard**

```hcl
resource "aws_cloudwatch_dashboard" "cost" {
  dashboard_name = "${var.environment}-cost-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Billing", "EstimatedCharges", { stat = "Maximum" }]
          ]
          period = 86400
          region = "us-east-1"
          title  = "Daily Estimated Charges"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Usage", "ResourceCount", { stat = "Sum" }]
          ]
          period = 86400
          region = "us-east-1"
          title  = "Resource Count"
        }
      }
    ]
  })
}
```

### Results

| Optimization | Monthly Savings | Effort |
|-------------|----------------|--------|
| Stopping non-prod at night | $3,500 | Low |
| Right-sizing instances | $900 | Medium |
| Snapshot cleanup | $900 | Low |
| Delete unused resources | $800 | Low |
| Spot instances | $1,200 | Medium |
| Reserved instances (prod) | $1,000 | Medium |
| **Total** | **$8,300/mo** | |

---

## 17.8 Security Incident Response

### Scenario

> Your security team detected that an S3 bucket managed by Terraform was publicly accessible. The bucket contains sensitive customer data. You need to:
> 1. Immediately secure the bucket
> 2. Identify how the bucket became public
> 3. Implement preventive measures

### Immediate Response (First 15 Minutes)

```bash
# Step 1: Block all public access immediately
aws s3api put-public-access-block \
  --bucket compromised-bucket-prod \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Step 2: Remove public bucket policy
aws s3api delete-bucket-policy \
  --bucket compromised-bucket-prod

# Step 3: Revoke any public ACLs
aws s3api get-bucket-acl --bucket compromised-bucket-prod

# Step 4: Enable CloudTrail to investigate
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=compromised-bucket-prod \
  --start-time "2024-01-01T00:00:00Z"
```

### Forensic Analysis

**Step 1: Check Git history for security changes**

```bash
# Find who modified the bucket configuration
git log --all --oneline -S "acl" -- main.tf
git log --all --oneline -S "public_access" -- main.tf
git log --all --oneline -S "compromised-bucket" -- main.tf

# Show the exact change
git show <commit-hash>
```

**Step 2: Validate current Terraform configuration**

```bash
# Run terraform plan to check if the public state matches
terraform plan

# Check for security issues
terraform validate
checkov -d .
tfsec .
```

### Remediation

**Step 1: Update Terraform configuration**

```hcl
# Before — Insecure
resource "aws_s3_bucket" "data" {
  bucket = "compromised-bucket-prod"
  acl    = "public-read"  # ❌ Public ACL
}

# After — Secure
resource "aws_s3_bucket" "data" {
  bucket = "secure-bucket-prod"
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Use bucket policy with principle of least privilege
data "aws_iam_policy_document" "bucket_policy" {
  statement {
    sid    = "EnforceTLS"
    effect = "Effect"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions   = ["s3:*"]
    resources = ["${aws_s3_bucket.data.arn}/*"]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["true"]
    }
  }
}

# Enable encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Enable versioning for recovery
resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Block object public access at the bucket level
resource "aws_s3_bucket_ownership_controls" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}
```

**Step 3: Apply the fix**

```bash
# Plan and apply
terraform plan -out=fix.plan
terraform apply fix.plan
```

### Preventive Measures

**1. Add Sentinel/OPA policies (Terraform Cloud)**

```rego
# prevent-public-s3.rego
package terraform

# Deny S3 buckets with public ACLs
deny[msg] {
  resource := input.resource_changes[_]
  resource.type == "aws_s3_bucket"
  resource.change.after.acl == "public-read" or
  resource.change.after.acl == "public-read-write"
  msg := sprintf("S3 bucket %v has public ACL", [resource.address])
}

# Deny S3 buckets missing public access blocks
deny[msg] {
  resource := input.resource_changes[_]
  resource.type == "aws_s3_bucket"
  not input.resource_changes[_].type == "aws_s3_bucket_public_access_block"
  msg := sprintf("S3 bucket %v is missing public_access_block", [resource.address])
}
```

**2. Use pre-commit hooks**

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/terraform-docs/terraform-docs
    rev: v0.16.0
    hooks:
      - id: terraform-docs-go
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.77.0
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_tfsec
      - id: checkov
      - id: terraform_trivy
```

**3. Create incident response runbook**

```yaml
# incident-response-runbook.md
## Security Incident: S3 Bucket Publicly Accessible

### Triage (5 mins)
1. Verify the bucket is publicly accessible
2. Determine what data is exposed
3. Check CloudTrail for access logs

### Containment (10 mins)
1. Apply public access block to S3 bucket
2. Rotate any exposed credentials
3. Enable detailed logging

### Eradication (30 mins)
1. Update Terraform configuration with security controls
2. Apply Terraform to enforce desired state
3. Run security scanning (tfsec, checkov)

### Recovery (1 hour)
1. Verify bucket is no longer public
2. Restore any deleted/modified objects if needed
3. Document findings and lessons learned

### Prevention (ongoing)
1. Add Sentinel/OPA policies
2. Add pre-commit hooks with security scanning
3. Schedule regular drift detection
4. Implement separation of duties
```

---

## 17.9 CI/CD Pipeline Setup

### Scenario

> Your team of 5 DevOps engineers needs a complete CI/CD pipeline for Terraform deployments with the following requirements:
> - Automated `terraform plan` on pull requests
> - Manual approval for production deployments
> - State management with locking
> - Security scanning in the pipeline

### Pipeline Architecture

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Commit  │────▶│  PR Plan │────▶│   Apply   │────▶│  Deploy  │
│  Code    │     │  Review  │     │  Approve  │     │  Run     │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
                                              │
                                              ▼
                                       ┌──────────┐
                                       │  Verify   │
                                       │  Health   │
                                       └──────────┘
```

### Implementation

**1. GitHub Actions Pipeline**

```yaml
# .github/workflows/terraform.yml
name: 'Terraform CI/CD'

on:
  push:
    branches:
      - main
    paths:
      - 'terraform/**'
  pull_request:
    branches:
      - main
    paths:
      - 'terraform/**'

env:
  TF_VERSION: '1.6.0'
  TF_WORKING_DIR: './terraform'
  AWS_REGION: 'us-east-1'

permissions:
  id-token: write
  contents: read
  pull-requests: write

jobs:
  # ──────────────────────────────────────────
  # Validate Stage
  # ──────────────────────────────────────────
  validate:
    name: 'Validate'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Format Check
        run: terraform fmt -check -recursive
        working-directory: ${{ env.TF_WORKING_DIR }}

      - name: Terraform Init
        run: terraform init
        working-directory: ${{ env.TF_WORKING_DIR }}

      - name: Terraform Validate
        run: terraform validate
        working-directory: ${{ env.TF_WORKING_DIR }}

  # ──────────────────────────────────────────
  # Security Scan Stage
  # ──────────────────────────────────────────
  security:
    name: 'Security Scan'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run tfsec
        uses: aquasecurity/tfsec-action@v1.0.0
        with:
          working_directory: ${{ env.TF_WORKING_DIR }}

      - name: Run Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: ${{ env.TF_WORKING_DIR }}
          framework: terraform
          soft_fail: true

      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: ${{ env.TF_WORKING_DIR }}
          format: 'sarif'
          output: 'trivy-results.sarif'

  # ──────────────────────────────────────────
  # Plan Stage (on PR)
  # ──────────────────────────────────────────
  plan:
    name: 'Terraform Plan'
    needs: [validate, security]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    environment: ${{ github.base_ref == 'main' && 'production' || 'development' }}

    steps:
      - uses: actions/checkout@v3

      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Terraform Init
        run: terraform init
        working-directory: ${{ env.TF_WORKING_DIR }}

      - name: Terraform Plan
        id: plan
        run: |
          terraform plan -no-color -out=plan.out
        working-directory: ${{ env.TF_WORKING_DIR }}
        continue-on-error: true

      - name: Post Plan to PR
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            const output = `#### 📝 Terraform Plan 📝
            <details>
            <summary>Show Plan</summary>
            
            \`\`\`\n
            ${{ steps.plan.outputs.stdout }}
            \`\`\`
            
            </details>
            
            *Pusher: @${{ github.actor }}, Action: \`${{ github.event_name }}\`*`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

  # ──────────────────────────────────────────
  # Apply Stage (on main)
  # ──────────────────────────────────────────
  apply:
    name: 'Terraform Apply'
    needs: [validate, security]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production

    # Manual approval gate
    environment:
      name: production
      url: ${{ steps.deploy_url.outputs.url }}

    steps:
      - uses: actions/checkout@v3

      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Terraform Init
        run: terraform init
        working-directory: ${{ env.TF_WORKING_DIR }}

      - name: Terraform Apply
        id: apply
        run: |
          terraform apply -auto-approve -no-color
        working-directory: ${{ env.TF_WORKING_DIR }}

      - name: Deployment URL
        id: deploy_url
        run: |
          echo "url=$(terraform output -raw website_url)" >> $GITHUB_OUTPUT
        working-directory: ${{ env.TF_WORKING_DIR }}

      - name: Health Check
        run: |
          URL=$(terraform output -raw website_url)
          curl -f -s -o /dev/null -w "%{http_code}" "$URL/health"
```

**2. GitLab CI Pipeline**

```yaml
# .gitlab-ci.yml
image: hashicorp/terraform:1.6

variables:
  TF_ROOT: ${CI_PROJECT_DIR}/terraform
  TF_CACHE_KEY: ${CI_COMMIT_REF_SLUG}

cache:
  key: "${TF_CACHE_KEY}"
  paths:
    - ${TF_ROOT}/.terraform

stages:
  - validate
  - security
  - plan
  - deploy

before_script:
  - cd ${TF_ROOT}
  - terraform init

validate:
  stage: validate
  script:
    - terraform fmt -check
    - terraform validate

security:
  stage: security
  script:
    - apk add --no-cache python3 py3-pip
    - pip3 install checkov
    - checkov -d .

plan:
  stage: plan
  script:
    - terraform plan -out=plan.out
  artifacts:
    paths:
      - ${TF_ROOT}/plan.out
    expire_in: 7 days
  only:
    - merge_requests

deploy:
  stage: deploy
  script:
    - terraform apply plan.out
  when: manual
  only:
    - main
  environment:
    name: production
```

### Best Practices

| Practice | Implementation |
|----------|---------------|
| **Never store secrets in code** | Use CI/CD secrets, Vault, or AWS Secrets Manager |
| **Lock the state file** | DynamoDB for S3 backend |
| **Use IAM roles, not keys** | OIDC for GitHub Actions, Workload Identity for GitLab |
| **Plan before apply** | Always require plan review |
| **Approval gates** | Manual approval for production |
| **Rollback plan** | Have a rollback procedure ready |
| **Notifications** | Slack/Teams integration for deploy status |

---

## 17.10 Migration from CloudFormation

### Scenario

> Your company uses AWS CloudFormation for infrastructure management. You need to migrate to Terraform without downtime.

### Migration Strategy

**Phase 1: Assessment (Week 1)**

```bash
# 1. Inventory all CloudFormation stacks
aws cloudformation list-stacks --stack-status-filter UPDATE_COMPLETE CREATE_COMPLETE

# 2. Export templates
aws cloudformation get-template --stack-name my-stack > template.yaml

# 3. Map resources to Terraform equivalents
# Use tools like:
# - cf2tf (CloudFormation to Terraform converter)
# - terraformer (for importing existing resources)
```

**Phase 2: Parallel Run (Week 2-3)**

```hcl
# 1. Create Terraform configuration that matches existing infra
terraform {
  backend "s3" {
    bucket = "company-terraform-state"
    key    = "migration/terraform.tfstate"
  }
}

# 2. Import existing resources (DO NOT modify CloudFormation stack yet)
resource "aws_vpc" "main" {}
# terraform import aws_vpc.main vpc-12345

resource "aws_subnet" "public" {
  count = 3
}
// terraform import aws_subnet.public[0] subnet-abcde1
// terraform import aws_subnet.public[1] subnet-abcde2
// terraform import aws_subnet.public[2] subnet-abcde3
```

**Phase 3: Validation (Week 3)**

```bash
# 1. Verify Terraform state matches reality
terraform plan
# Should show no changes

# 2. Disable CloudFormation updates (prevent drift)
aws cloudformation set-stack-policy \
  --stack-name my-stack \
  --stack-policy-body '{
    "Statement": [{
      "Effect": "Deny",
      "Action": "Update:*",
      "Principal": "*",
      "Resource": "*"
    }]
  }'
```

**Phase 4: Cutover (Week 4)**

```bash
# 1. Final verification
terraform plan

# 2. Remove CloudFormation stack protection
aws cloudformation delete-stack --stack-name my-stack

# 3. Apply Terraform configuration (should be a no-op)
terraform apply
```

### Key Considerations

| Consideration | Strategy |
|--------------|----------|
| **Downtime** | Zero downtime — import before deleting CloudFormation |
| **State management** | New state file for Terraform |
| **Rollback** | Keep CloudFormation templates for 30 days post-migration |
| **Team training** | Train team on Terraform during migration window |
| **Testing** | Test migration in dev/staging first |

---

## 17.11 Multi-Team Collaboration

### Scenario

> Three teams need to manage infrastructure in the same AWS account:
> - **Platform team**: VPC, networking, IAM, security
> - **App team**: ECS, RDS, ALB for the application
> - **Data team**: S3, Glue, Athena for data pipelines

### Challenge

- Teams must not interfere with each other
- Platform team owns shared infrastructure
- App and Data teams need access to platform resources
- Changes must be reviewed and coordinated

### Solution

**1. State isolation per team**

```hcl
# platform/backend.tf
terraform {
  backend "s3" {
    bucket         = "company-terraform-state"
    key            = "platform/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}

# app/backend.tf (separate state)
terraform {
  backend "s3" {
    bucket         = "company-terraform-state"
    key            = "app/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}

# data/backend.tf (separate state)
terraform {
  backend "s3" {
    bucket         = "company-terraform-state"
    key            = "data/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}
```

**2. Platform team exposes outputs**

```hcl
# platform/outputs.tf
output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "Shared VPC ID"
}

output "public_subnet_ids" {
  value       = module.vpc.public_subnets
  description = "Public subnet IDs"
}

output "private_subnet_ids" {
  value       = module.vpc.private_subnets
  description = "Private subnet IDs"
}

output "security_group_ids" {
  value = {
    web       = aws_security_group.web.id
    app       = aws_security_group.app.id
    database  = aws_security_group.database.id
  }
  description = "Security group IDs for different tiers"
}
```

**3. App team uses remote state**

```hcl
# app/data.tf
data "terraform_remote_state" "platform" {
  backend = "s3"
  config = {
    bucket = "company-terraform-state"
    key    = "platform/terraform.tfstate"
    region = "us-east-1"
  }
}

# app/main.tf
resource "aws_ecs_service" "app" {
  network_configuration {
    subnets         = data.terraform_remote_state.platform.outputs.private_subnet_ids
    security_groups = [data.terraform_remote_state.platform.outputs.security_group_ids.app]
  }
}
```

**4. Resource tagging and ownership**

```hcl
locals {
  shared_tags = {
    Environment = var.environment
    Terraform   = "true"
  }

  team_tags = {
    "team:owner"       = "platform"
    "team:contact"     = "platform@company.com"
    "team:slack"       = "#platform-team"
    "app:cost-center"  = var.cost_center
  }
}

# Tag all resources with team ownership
resource "aws_vpc" "main" {
  tags = merge(local.shared_tags, local.team_tags, {
    Name = "${var.environment}-vpc"
  })
}
```

### Cross-Team S3 State Access

To allow App team to read Platform team's state:

```hcl
# platform/state-access.tf
resource "aws_s3_bucket_policy" "state_access" {
  bucket = "company-terraform-state"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::ACCOUNT_ID:role/AppTeamRole",
            "arn:aws:iam::ACCOUNT_ID:role/DataTeamRole"
          ]
        }
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::company-terraform-state",
          "arn:aws:s3:::company-terraform-state/platform/*"
        ]
      }
    ]
  })
}
```

---

## 17.12 Handling Large Infrastructure Changes

### Scenario

> You need to make a breaking change to a security group rule that's used by 100+ running EC2 instances. The change will remove an open SSH port (0.0.0.0/0) and replace it with a bastion host-only rule.

### Challenge

- 100+ instances reference the security group
- Change will affect SSH access
- Some SSH sessions might be interrupted
- Rollback must be quick if something breaks

### Strategy

**Phase 1: Preparation**

```hcl
# Step 1: Create a new security group first
resource "aws_security_group" "bastion_access" {
  name        = "bastion-access-sg"
  description = "New SG with bastion-only SSH access"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
    description     = "SSH from bastion only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Step 2: Create bastion host
resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t3.nano"
  subnet_id              = var.public_subnet_ids[0]
  vpc_security_group_ids = [aws_security_group.bastion.id]

  tags = {
    Name = "bastion-host"
    Role = "bastion"
  }
}

resource "aws_security_group" "bastion" {
  name        = "bastion-sg"
  description = "Bastion host security group"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["1.2.3.4/32"]  # Your office IP
    description = "SSH from office"
  }

  egress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "SSH to VPC instances"
  }
}
```

**Phase 2: Gradual Rollout**

```hcl
# Step 3: Create a migration variable
variable "migration_phase" {
  description = "Migration phase: 0=current, 1=add_bastion, 2=remove_public_ssh"
  type        = number
  default     = 0

  validation {
    condition     = contains([0, 1, 2], var.migration_phase)
    error_message = "Must be 0, 1, or 2."
  }
}

# Step 4: Conditional security group rules
resource "aws_security_group_rule" "ssh_public" {
  count = var.migration_phase < 2 ? 1 : 0

  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.web.id
  description       = "SSH public (legacy)"
}

resource "aws_security_group_rule" "ssh_bastion" {
  count = var.migration_phase > 0 ? 1 : 0

  type                     = "ingress"
  from_port                = 22
  to_port                  = 22
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.bastion.id
  security_group_id        = aws_security_group.web.id
  description              = "SSH from bastion"
}
```

**Phase 3: Migration Steps**

```bash
# Phase 0: Current state (public SSH)
terraform apply -var="migration_phase=0"

# Phase 1: Add bastion access (both rules active)
# Test: ssh -J bastion-host instance-ip
terraform apply -var="migration_phase=1"

# Wait 24 hours — monitor bastion usage
# Check if any automated systems rely on direct SSH

# Phase 2: Remove public SSH (only bastion remains)
terraform apply -var="migration_phase=2"

# Verify: direct SSH should fail, bastion SSH should work
```

### Rollback Plan

```bash
# Rollback to Phase 1 (restore public SSH)
terraform apply -var="migration_phase=1"

# Rollback to Phase 0 (full rollback)
terraform apply -var="migration_phase=0"
```

### Lessons Learned Checklist

- [ ] Always create new resources before removing old ones
- [ ] Use phased rollouts with `count` or `for_each` flag toggles
- [ ] Keep both old and new rules active during migration window
- [ ] Communicate changes to stakeholders in advance
- [ ] Have monitoring in place during the migration
- [ ] Document the rollback procedure before starting
- [ ] Run migration in non-prod environments first
- [ ] Schedule migration during maintenance windows

---

## 📚 Quick Reference: Scenario Response Template

Use this template for any infrastructure emergency:

```markdown
## Incident Response

### 1. Detection
- How was the issue discovered?
- What are the symptoms?
- What is the impact scope?

### 2. Assessment
- What resources are affected?
- What is the severity? (🔴/🟡/🟢)
- Is there an immediate workaround?

### 3. Containment
- Stop the bleeding (rollback, revert, block)
- Document current state
- Notify stakeholders

### 4. Resolution
- Root cause analysis
- Apply fix (via Terraform)
- Verify fix

### 5. Prevention
- What failed? (process, automation, human error)
- What guardrails are needed?
- Update runbooks and automation
```

---

## Key Takeaways

| Scenario | Core Lesson | Action Item |
|----------|-------------|-------------|
| **State Corruption** | Always enable S3 versioning + DynamoDB locking | Set up remote state with backups |
| **Multi-Region** | Isolate state per region; use `terraform_remote_state` for shared data | Design directory structure before starting |
| **Secret Rotation** | Automate rotation with Lambda + Secrets Manager | Never hardcode secrets in config |
| **Drift Detection** | Run scheduled `terraform plan` in CI/CD | Set up daily drift detection workflow |
| **Zero-Downtime** | Blue-green deployment with target groups | Prefer blue-green over in-place updates |
| **Module Refactoring** | Use `moved` blocks (v1.1+) for safe refactoring | Always `terraform plan` before refactoring |
| **Cost Optimization** | Stop non-prod resources; right-size instances | Implement auto-schedule for dev/staging |
| **Security Incident** | Block public access immediately; audit Git history | Add Sentinel/OPA policies to prevent recurrence |
| **CI/CD Pipeline** | Plan on PRs, apply with approval gates | Use OIDC for AWS access, never hardcode keys |
| **CloudFormation Migration** | Import before deleting CloudFormation stacks | Test migration in dev/staging first |
| **Multi-Team** | Isolate state per team; share via `terraform_remote_state` | Tag resources with team ownership |
| **Large Changes** | Use phased rollouts with migration flags | Always have a rollback plan |

---

## ✅ Chapter 17 Quiz

1. **What is the first step when you discover a corrupted state file?**
   - a) Run `terraform apply` to fix it
   - b) Restore from the last known good backup
   - c) Delete the state file and re-import everything
   - d) Run `terraform plan` and ignore errors

2. **Which Terraform feature enables safe refactoring of resources into modules?**
   - a) `terraform import`
   - b) `moved` blocks (v1.1+)
   - c) `lifecycle` rules
   - d) `terraform state rm`

3. **According to the multi-region deployment scenario, how should state be organized?**
   - a) One state file for all regions
   - b) Separate state files per region
   - c) One state file per resource type
   - d) State files are not needed for multi-region

4. **True or False:** When migrating from CloudFormation to Terraform, you should delete the CloudFormation stack before importing resources.

5. **What is the recommended approach for zero-downtime deployments?**
   - a) In-place updates with `ignore_changes`
   - b) Blue-green deployment with separate target groups
   - c) Delete and recreate all instances
   - d) Use `terraform taint` on all instances

6. **In the security incident response scenario, what should you do FIRST after discovering a publicly accessible S3 bucket?**
   - a) Audit Git history
   - b) Block all public access immediately
   - c) Run `terraform apply` to fix
   - d) Notify the team via email

7. **Which CI/CD pattern is recommended for production Terraform deployments?**
   - a) Auto-approve all changes
   - b) Plan on PR, manual approval for apply
   - c) Run apply directly from local machines
   - d) Skip planning for urgent fixes

8. **What is the purpose of phase variables (migration_phase = 0, 1, 2) in large infrastructure changes?**
   - a) To track which team member made the change
   - b) To allow gradual rollouts with rollback capability at each phase
   - c) To measure deployment speed
   - d) To bypass Terraform's dependency graph

<details>
<summary>📌 Answers</summary>

1. **b** — Restore from the last known good backup (S3 versioning enables this)
2. **b** — `moved` blocks (Terraform v1.1+) safely migrate resources without destroy/recreate
3. **b** — Separate state files per region for isolation
4. **False** — Import resources first, then delete the CloudFormation stack
5. **b** — Blue-green deployment with separate target groups for zero downtime
6. **b** — Block all public access immediately using `put-public-access-block`
7. **b** — Plan on pull requests, manual approval for production apply
8. **b** — Phase variables enable gradual rollouts where each phase can be rolled back independently
</details>

---

*Remember: In real-world scenarios, the quality of your solution matters more than speed. Take time to understand the problem before implementing changes.*


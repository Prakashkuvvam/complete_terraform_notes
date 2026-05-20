---
title: "Chapter 2: Terraform Core Concepts"
weight: 2
bookFlatSection: false
bookToc: true
---

# Chapter 2: Terraform Core Concepts

## 🎯 Learning Objectives

- Understand Terraform providers, resources, and state
- Master the Terraform workflow (init, plan, apply, destroy)
- Learn about resource dependencies and the graph
- Understand Terraform's lifecycle and how it manages resources
- Grasp the concept of idempotency in Terraform

---

## 2.1 Providers

**Providers** are plugins that Terraform uses to interact with APIs of cloud providers and other services.

### How Providers Work

```
Terraform Core → Provider Plugin → API → Cloud Provider
     (HCL)           (Go)       (REST)     (AWS/GCP/Azure)
```

### Important Provider Concepts

| Concept | Explanation |
|---------|-------------|
| **Source** | Location where provider is downloaded from (e.g., `hashicorp/aws`) |
| **Version** | Provider version constraint (e.g., `~> 5.0`) |
| **Configuration** | Provider-level settings (region, credentials, etc.) |
| **Resources** | What the provider can create/manage |
| **Data Sources** | What the provider can read/query |

### Provider Example

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  # Optionally use a profile
  # profile = "my-profile"

  # Optionally assume a role
  # assume_role {
  #   role_arn     = "arn:aws:iam::ACCOUNT_ID:role/MyRole"
  #   session_name = "TerraformSession"
  # }
}

provider "random" {
  # No configuration needed for random provider
}
```

### Provider Version Constraints (Exam Critical)

| Constraint | Meaning | Example |
|------------|---------|---------|
| `= 5.0` | Exact version | `version = "= 5.0.0"` |
| `~> 5.0` | >= 5.0 and < 6.0 (minor updates allowed) | `version = "~> 5.0"` |
| `>= 5.0` | Any version >= 5.0 | `version = ">= 5.0"` |
| `>= 5.0, < 5.10` | Range | `version = ">= 5.0, < 5.10"` |
| `~> 5.4.0` | >= 5.4.0 and < 5.5.0 (patch updates only) | `version = "~> 5.4.0"` |

> **Exam Tip:** The `~>` (pessimistic constraint) operator is frequently tested. Remember: `~> 5.0` means `>= 5.0, < 6.0` and `~> 5.4.0` means `>= 5.4.0, < 5.5.0`.

### Provider Aliases (Multi-Region Deployments)

```hcl
provider "aws" {
  region = "us-east-1"
}

provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

resource "aws_instance" "east" {
  # Uses default provider (us-east-1)
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

resource "aws_instance" "west" {
  # Uses the aliased provider (us-west-2)
  provider      = aws.west
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
```

---

## 2.2 Resources

**Resources** are the most important element in Terraform — they represent infrastructure objects like EC2 instances, S3 buckets, VPCs, etc.

### Resource Syntax

```hcl
resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }
}
```

| Part | Meaning | Example |
|------|---------|---------|
| `resource` | Keyword to declare a resource | `resource` |
| `"aws_instance"` | **Resource type** — what to create | `"aws_instance"`, `"aws_s3_bucket"` |
| `"web_server"` | **Local name** — reference this resource in config | Used for referencing |
| `{ ... }` | **Arguments** — configuration for the resource | AMI, instance type, tags |

### Referencing Resources

```hcl
# Reference attributes of another resource
resource "aws_eip" "my_eip" {
  instance = aws_instance.web_server.id
  domain   = "vpc"
}

# Full syntax: RESOURCE_TYPE.LOCAL_NAME.ATTRIBUTE
output "instance_id" {
  value = aws_instance.web_server.id
}
```

### Resource Attributes

Resources have three kinds of attributes:

| Type | Description | Example |
|------|-------------|---------|
| **Arguments** | You set these in config | `ami`, `instance_type` |
| **Attributes** | Returned by the provider, can be referenced | `id`, `arn`, `public_ip` |
| **Read-only** | Known only after creation | Known after apply |

---

## 2.3 Terraform State (`tfstate`)

**State** is Terraform's mapping between your configuration and the real-world infrastructure. It's stored in a file called `terraform.tfstate`.

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
      "name": "web_server",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "attributes": {
            "id": "i-0abcd1234efgh5678",
            "ami": "ami-0c55b159cbfafe1f0",
            "instance_type": "t2.micro",
            "public_ip": "54.123.45.67",
            "private_ip": "10.0.1.5",
            "tags": {
              "Name": "WebServer"
            }
          },
          "dependencies": ["aws_security_group.web_sg"]
        }
      ]
    }
  ]
}
```

### Why State Matters (Exam Critical)

1. **Mapping** — Maps config resources to real-world resources (using resource `id`)
2. **Performance** — Caches attribute values (no need to re-query API for every resource)
3. **Dependencies** — Tracks resource dependencies for correct ordering
4. **Drift Detection** — `terraform plan` compares state vs config vs real-world to detect drift

### State Commands

```bash
# List all resources in state
terraform state list

# Show attributes of a specific resource
terraform state show aws_instance.web_server

# Move a resource in state (used for refactoring)
terraform state mv aws_instance.web aws_instance.web_server

# Remove a resource from state (NOT from real world)
terraform state rm aws_instance.web_server

# Pull state to local file
terraform state pull > backup.tfstate

# Push state (use with caution!)
terraform state push backup.tfstate
```

---

## 2.4 The Terraform Workflow (Deep Dive)

### `terraform init`

```
┌─────────────────────────────────────────────────────────────────┐
│                        terraform init                            │
│                                                                   │
│  1. Backend Initialization                                        │
│     └── Configures where state is stored (local/S3/etc.)         │
│                                                                   │
│  2. Provider Installation                                         │
│     └── Downloads provider plugins to .terraform/providers/      │
│                                                                   │
│  3. Module Installation                                           │
│     └── Downloads modules from registry                          │
│                                                                   │
│  4. .terraform.lock.hcl creation                                  │
│     └── Locks provider versions for reproducibility              │
└─────────────────────────────────────────────────────────────────┘
```

### `terraform plan`

```
┌─────────────────────────────────────────────────────────────────┐
│                         terraform plan                            │
│                                                                   │
│  Reads: Config (.tf files) + State (.tfstate) + Real infra (API) │
│                                                                   │
│  1. Refresh state (optional: -refresh=false to skip)              │
│     └── Queries providers to get current real-world state        │
│                                                                   │
│  2. Compare desired (config) vs actual (state + real world)      │
│     └── Determines differences                                    │
│                                                                   │
│  3. Build execution plan                                          │
│     └── Shows what will be created, updated, or destroyed        │
│                                                                   │
│  Output: Plan file (can be saved with -out=plan.tfplan)          │
└─────────────────────────────────────────────────────────────────┘
```

### `terraform apply`

```
┌─────────────────────────────────────────────────────────────────┐
│                        terraform apply                            │
│                                                                   │
│  If no plan file: Creates a plan & asks for confirmation          │
│  If plan file provided: Applies plan without confirmation        │
│                                                                   │
│  1. Execute changes in dependency order                           │
│     └── Creates resources first, then depends                   │
│                                                                   │
│  2. Update state file                                             │
│     └── Records new resource IDs and attributes                  │
│                                                                   │
│  3. Show outputs                                                  │
│     └── Displays any defined output values                       │
└─────────────────────────────────────────────────────────────────┘
```

### Terraform Workflow + AWS Infrastructure (Visual Overview)

The diagram below shows the end-to-end flow — from developer commands to AWS resource provisioning to state management:

{{< mermaid >}}
graph TB
    subgraph "👨‍💻 Developer"
        A["terraform init"] --> B["terraform plan -out=plan.tfplan"]
        B --> C["review output"]
        C --> D["terraform apply plan.tfplan"]
    end

    subgraph "☁️ AWS Infrastructure"
        D --> E["API Gateway REST API"]
        D --> F["Lambda Function (Node.js)"]
        D --> G["DynamoDB Table"]
        E --> H["GET /items"]
        E --> I["POST /items"]
        E --> J["DELETE /items/{id}"]
        F --> K["CRUD Operations"]
        K --> G
    end

    subgraph "💾 State Management"
        D --> L["S3 Backend"]
        L --> M["DynamoDB Locking"]
        M --> N["terraform.tfstate"]
    end

    style A fill:#4a90d9,color:#fff
    style B fill:#4a90d9,color:#fff
    style D fill:#27ae60,color:#fff
    style H fill:#f39c12,color:#fff
    style I fill:#f39c12,color:#fff
    style J fill:#f39c12,color:#fff
{{< /mermaid >}}

### Terraform Lifecycle (Sequence Diagram)

The diagram below shows the detailed sequence of interactions between the developer, Terraform, state storage, AWS API, and infrastructure over the full lifecycle:

{{< mermaid >}}
sequenceDiagram
    participant Dev as 👨‍💻 Developer
    participant TF as Terraform
    participant State as State (S3/DynamoDB)
    participant AWS as AWS API
    participant Res as Infrastructure

    Dev->>TF: terraform init
    TF->>AWS: Initialize providers
    AWS-->>TF: Provider ready
    TF-->>Dev: Initialized

    Dev->>TF: terraform plan
    TF->>State: Read current state
    State-->>TF: Existing state
    TF->>AWS: Query resources
    AWS-->>TF: Current infra
    TF-->>Dev: Proposed changes

    Dev->>TF: terraform apply
    TF->>State: Lock state file
    State-->>TF: Lock acquired
    TF->>AWS: Create/Update resources
    AWS->>Res: Provision
    Res-->>AWS: Resource IDs
    AWS-->>TF: Success
    TF->>State: Write new state
    TF->>State: Release lock
    TF-->>Dev: Apply complete!

    Dev->>TF: terraform destroy
    TF->>State: Lock state
    TF->>AWS: Delete resources
    AWS-->>TF: Resources deleted
    TF->>State: Clear state
    TF-->>Dev: Destroy complete!
{{< /mermaid >}}

### `terraform destroy`

```bash
# Destroy everything managed by this configuration
terraform destroy

# Destroy specific resource
terraform destroy -target aws_instance.web_server

# Auto-approve (skip confirmation)
terraform destroy -auto-approve
```

---

## 2.5 Resource Dependencies

Terraform automatically builds a **dependency graph** from resource references.

### Implicit Dependencies

```hcl
resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Allow HTTP and SSH"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }
}

# Implicit dependency: aws_instance.web depends on aws_security_group.web_sg
resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.web_sg.id]
  #       ↑ Terraform sees this reference and adds an implicit dependency
}
```

### Explicit Dependencies (depends_on)

Use `depends_on` when there's a dependency that Terraform can't infer automatically.

```hcl
# Example: S3 bucket policy depends on a user
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
}

resource "aws_s3_bucket_policy" "data_policy" {
  bucket = aws_s3_bucket.data.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}

resource "aws_iam_user" "data_user" {
  name = "data-processor"
  # Terraform cannot automatically detect this dependency
}

# Explicit dependency — use sparingly!
resource "aws_iam_user_policy" "data_user_policy" {
  name   = "s3-access"
  user   = aws_iam_user.data_user.name
  policy = data.aws_iam_policy_document.s3_policy.json

  depends_on = [
    aws_s3_bucket.data,
    aws_s3_bucket_policy.data_policy
  ]
}
```

**Important:** Only use `depends_on` when you have to! Let Terraform infer dependencies automatically whenever possible.

---

## 2.6 Resource Lifecycle

The **lifecycle** meta-argument controls how Terraform creates, updates, and destroys resources.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  lifecycle {
    create_before_destroy = true
    prevent_destroy       = true
    ignore_changes        = [ami, tags]
  }
}
```

### Lifecycle Rules (Exam Critical)

| Rule | Description | Use Case |
|------|-------------|----------|
| `create_before_destroy` | Create new resource first, then destroy old | Zero-downtime deployments |
| `prevent_destroy` | Prevents accidental destruction of resource | Critical DBs, production resources |
| `ignore_changes` | Ignore specific attribute changes | AMI updates outside Terraform, auto-scaling tag changes |

### Lifecycle Scenarios

**Scenario 1: prevent_destroy**
```hcl
resource "aws_db_instance" "production" {
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.r6g.large"
  allocated_storage = 100

  lifecycle {
    prevent_destroy = true  # terraform destroy will FAIL for this resource
  }
}
```

**Scenario 2: create_before_destroy**
```hcl
resource "aws_launch_template" "web" {
  name          = "web-template"
  image_id      = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  lifecycle {
    create_before_destroy = true
    # New template created first, then old one destroyed
  }
}
```

**Scenario 3: ignore_changes**
```hcl
resource "aws_autoscaling_group" "web_asg" {
  name               = "web-asg"
  desired_capacity   = 2
  min_size           = 1
  max_size           = 10

  lifecycle {
    ignore_changes = [
      desired_capacity,  # ASG may auto-scale, don't reset
      tags,               # Tags may be added by auto-scaling
    ]
  }
}
```

---

## 2.7 Refresh-Only Plans

**Refresh-only** plans check for drift between your Terraform state and real-world infrastructure without suggesting any changes.

```bash
# See if state matches real infrastructure
terraform plan -refresh-only

# Update state to match real infrastructure
terraform apply -refresh-only
```

**When to use:**
- After manual changes to infrastructure
- When you've imported resources
- Before refactoring your Terraform configuration

---

## 2.8 Idempotency

**Idempotency** means running the same configuration multiple times produces the same result.

```
First run:  terraform apply → Creates resources
Second run: terraform apply → No changes (idempotent!)
Third run:  terraform apply → No changes (still idempotent!)
```

Terraform achieves idempotency through:
1. **Desired state** — You declare what you want
2. **State tracking** — Terraform knows what exists
3. **Diff comparison** — Config vs state vs real-world
4. **Incremental changes** — Only changes what's different

---

## 2.9 Lock File (.terraform.lock.hcl)

The **dependency lock file** is created by `terraform init` and should be committed to version control.

```hcl
# .terraform.lock.hcl
provider "registry.terraform.io/hashicorp/aws" {
  version     = "5.40.0"
  constraints = "~> 5.0"
  hashes = [
    "h1:Z1JkR5Z4HJAtxrLZSuxCWQjHuA+eG82rNh0UCoMdfs=",
    "h1:nO0d0R7jBCWAxjYJGqZ2R0aCx5+gw8e3g+nI0BMRpY=",
  ]
}
```

**Why it matters:**
- Ensures everyone uses the same provider version
- Prevents accidental upgrades
- Must be committed to Git
- Use `terraform init -upgrade` to update

---

## 2.10 Terraform Directory Structure

A typical Terraform project:

```
my-terraform-project/
├── main.tf              # Main configuration (resources)
├── variables.tf          # Input variables
├── outputs.tf           # Output values
├── terraform.tfvars     # Variable values (DO NOT commit secrets!)
├── terraform.tfvars.example  # Example variable values (commit this)
├── providers.tf         # Provider configurations
├── data.tf              # Data sources
├── locals.tf            # Local values
├── terraform.tfstate    # State file (DO NOT commit!)
├── terraform.tfstate.backup  # Backup state (DO NOT commit!)
├── .terraform/          # Provider binaries and modules (DO NOT commit!)
└── .terraform.lock.hcl  # Provider version lock (DO commit!)
```

---

## 📝 Exam Tips

1. **State is the source of truth** — Not your config files alone
2. **`terraform init` doesn't modify infrastructure** — It sets up the environment
3. **`terraform plan` is read-only** — It only shows what would happen
4. **Providers translate HCL to API calls** — They're the bridge between Terraform and cloud providers
5. **`depends_on` creates explicit dependencies** — Use it sparingly
6. **`create_before_destroy` is for zero-downtime** — New resource created before old one is destroyed
7. **`prevent_destroy` blocks destruction** — Prevents accidental deletion
8. **`ignore_changes` ignores specific attribute changes** — Useful for auto-scaling, external modifications
9. **Lock file ensures reproducibility across team** — Check it into version control
10. **Never edit state files manually** — Use `terraform state` commands instead

---

## ✅ Chapter 2 Quiz

1. **What Terraform command downloads provider plugins?**
   - a) `terraform plan`
   - b) `terraform apply`
   - c) `terraform init`
   - d) `terraform get`

2. **Which lifecycle rule prevents a resource from being destroyed?**
   - a) `create_before_destroy`
   - b) `prevent_destroy`
   - c) `ignore_changes`
   - d) `protect`

3. **What does the version constraint `~> 3.0` mean?**
   - a) Exactly 3.0
   - b) >= 3.0 and < 4.0
   - c) >= 3.0 and < 3.1
   - d) Any version 3.0 or higher

4. **True or False:** `terraform plan` can modify infrastructure.

5. **When should you use `depends_on`?**
   - a) For every resource
   - b) Only when Terraform can't infer the dependency
   - c) Never
   - d) For all resources in different providers

<details>
<summary>📌 Answers</summary>

1. **c** — `terraform init` downloads providers and modules
2. **b** — `prevent_destroy` prevents the resource from being destroyed
3. **b** — `~> 3.0` means >= 3.0 and < 4.0
4. **False** — `terraform plan` is read-only and never modifies infrastructure
5. **b** — Only use `depends_on` when Terraform can't automatically detect the dependency
</details>

---

*Continue to → <a href="{{< relref "03-hcl-configuration-language" >}}">Chapter 3: HCL Configuration Language</a>*

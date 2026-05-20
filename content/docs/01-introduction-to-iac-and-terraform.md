---
title: "Chapter 1: Introduction to Infrastructure as Code & Terraform"
weight: 1
bookFlatSection: false
bookToc: true
---

# Chapter 1: Introduction to Infrastructure as Code & Terraform

## 🎯 Learning Objectives

- Understand what Infrastructure as Code (IaC) is and why it matters
- Compare Terraform with other IaC tools (CloudFormation, Pulumi, Ansible)
- Learn Terraform's architecture and how it works
- Install Terraform and set up AWS credentials
- Write your first Terraform configuration
- Understand HCL vs JSON configuration formats

---

## 1.1 What is Infrastructure as Code?

**Infrastructure as Code (IaC)** is the practice of managing and provisioning infrastructure (servers, networks, databases, etc.) through machine-readable definition files, rather than manual processes or interactive configuration tools.

### The Problem IaC Solves

Before IaC, infrastructure was managed manually:
- Clicking through AWS Console to create resources
- SSH'ing into servers to install software
- Documenting setup steps in wikis (that quickly go out of date)
- Snowflake servers — each server is unique and irreproducible

### Benefits of IaC

| Benefit | Description |
|---------|-------------|
| **Reproducibility** | Spin up identical environments every time |
| **Version Control** | Infrastructure changes are tracked in Git |
| **Review & Collaboration** | Pull requests for infra changes (code review) |
| **Consistency** | No snowflake servers — every environment is identical |
| **Speed** | Provision infrastructure in minutes, not days |
| **Self-Documenting** | The code IS the documentation |
| **Disaster Recovery** | Rebuild entire infrastructure from scratch quickly |

### IaC Approaches

| Approach | Description | Examples |
|----------|-------------|----------|
| **Declarative (Functional)** | Define the *desired state*, tool figures out how to reach it | Terraform, CloudFormation, Pulumi |
| **Imperative (Procedural)** | Define the *steps* to reach the desired state | Ansible, Chef, Puppet |

**Terraform is declarative** — you describe what you want, and Terraform figures out how to make it happen.

---

## 1.2 Terraform vs Other Tools

| Feature | Terraform | AWS CloudFormation | Pulumi | Ansible |
|---------|-----------|-------------------|--------|---------|
| **Cloud** | Multi-cloud | AWS-only | Multi-cloud | Multi-cloud |
| **Language** | HCL (HashiCorp Config Language) | JSON/YAML | General-purpose (TS, Python, Go) | YAML |
| **State Management** | Built-in state tracking | Stack-based | State managed | Stateless (push/pull) |
| **Execution Model** | Declarative | Declarative | Declarative | Imperative |
| **Maturity** | Mature (10+ years) | Mature | Growing | Mature |
| **Community Providers** | 2000+ | AWS-only | Growing | Extensive |
| **Learning Curve** | Moderate | Moderate (JSON/YAML) | Steeper (needs programming) | Gentle |

### Why Terraform for AWS?

1. **Multi-cloud flexibility** — Even if you're AWS-only now, skills transfer to GCP/Azure
2. **HCL** — Designed specifically for infrastructure, human-readable
3. **Rich ecosystem** — 2000+ providers, huge community, modules, registry
4. **Plan/Apply workflow** — See changes before applying them
5. **State management** — Tracks what's deployed vs what's defined
6. **Battle-tested** — Used by Netflix, Uber, Slack, Coinbase, and thousands of enterprises

---

## 1.3 Terraform Architecture

```
                  ┌─────────────────────────────────────┐
                  │         Terraform Core               │
                  │  (HashiCorp, written in Go)          │
                  │                                      │
                  │  ┌───────────┐   ┌───────────────┐  │
                  │  │  Parser    │   │  Dependency     │  │
                  │  │  (HCL)    │   │  Graph Builder  │  │
                  │  └─────┬─────┘   └───────┬───────┘  │
                  │        │                  │          │
                  │  ┌─────▼──────────────────▼───────┐  │
                  │  │      Terraform State             │  │
                  │  │      (terraform.tfstate)         │  │
                  │  └──────────────────────────────────┘  │
                  │                    │                   │
                  └────────────────────┼───────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
    ┌─────▼──────┐            ┌───────▼───────┐           ┌───────▼───────┐
    │ AWS Provider │           │ GCP Provider   │          │ Azure Provider│
    │  (aws)       │           │  (google)      │          │  (azurerm)    │
    └──────┬───────┘           └───────┬───────┘           └───────┬───────┘
           │                           │                           │
    ┌──────▼──────┐            ┌───────▼───────┐           ┌───────▼───────┐
    │    AWS API   │           │    GCP API      │           │   Azure API    │
    └─────────────┘            └───────────────┘           └───────────────┘
```

### Key Components

| Component | Role |
|-----------|------|
| **Terraform Core** | Parses HCL, builds dependency graph, manages state |
| **Providers** | Plugins that understand API interactions with specific platforms (AWS, GCP, etc.) |
| **State** | Mapping between your config and actual deployed resources |
| **Configuration** | Your `.tf` files defining the desired infrastructure |

---

## 1.4 Terraform Workflow

The Terraform workflow consists of three core commands executed in sequence:

```
Write Config → terraform init → terraform plan → terraform apply → terraform destroy
```

### Basic Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                          Terraform Workflow                      │
│                                                                   │
│  1. INIT       Install providers and modules                     │
│     └── $ terraform init                                         │
│                                                                   │
│  2. PLAN       Preview what will be created/changed/destroyed    │
│     └── $ terraform plan                                         │
│                                                                   │
│  3. APPLY      Execute the changes (create/update/delete)        │
│     └── $ terraform apply                                        │
│                                                                   │
│  4. DESTROY    Tear down all managed resources                   │
│     └── $ terraform destroy                                      │
└─────────────────────────────────────────────────────────────────┘
```

### The Plan/Apply Loop (Exam Critical)

This is **the most important concept** for the exam:

1. **Write** your configuration in `.tf` files
2. **Run `terraform init`** — Initialize the working directory (download providers)
3. **Run `terraform plan`** — Creates an execution plan (does NOT apply it)
4. **Review the plan** — See what resources will be added/changed/destroyed
5. **Run `terraform apply`** — Apply the changes (Terraform asks for confirmation by default)

The plan shows:
- `+` Resources to be **created**
- `-` Resources to be **destroyed**
- `~` Resources to be **modified in-place**
- `+/-` Resources to be **replaced** (destroyed and recreated)

---

## 1.5 Installing Terraform

### Option 1: Package Manager (Recommended)

```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Linux (Ubuntu/Debian)
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Linux (Amazon Linux / RHEL / CentOS)
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
sudo yum -y install terraform

# Windows (Chocolatey)
choco install terraform
```

### Option 2: Manual Install

```bash
# Download the binary for your OS
wget https://releases.hashicorp.com/terraform/1.9.0/terraform_1.9.0_linux_amd64.zip

# Unzip
unzip terraform_1.9.0_linux_amd64.zip

# Move to PATH
sudo mv terraform /usr/local/bin/

# Verify
terraform --version
```

### Install Terraform with tfenv (Version Management)

```bash
# Install tfenv
git clone https://github.com/tfutils/tfenv.git ~/.tfenv
echo 'export PATH="$HOME/.tfenv/bin:$PATH"' >> ~/.bashrc

# Install and use specific version
tfenv install 1.9.0
tfenv use 1.9.0

# Switch versions easily
tfenv list
```

### Setting Up AWS Credentials

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
# AWS Access Key ID: [your access key]
# AWS Secret Access Key: [your secret key]
# Default region: us-east-1
# Default output format: json

# Verify
aws sts get-caller-identity
```

**Best Practice:** Never hardcode AWS credentials in Terraform files! Use environment variables or AWS CLI profiles.

```bash
# Option A: Environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"

# Option B: AWS profile
export AWS_PROFILE="my-dev-profile"
```

---

## 1.6 Your First Terraform Configuration

Let's create a simple configuration that deploys an S3 bucket.

### Step 1: Create the configuration file

```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-first-terraform-bucket-2024-unique-name"

  tags = {
    Name        = "MyBucket"
    Environment = "Learning"
  }
}
```

### Step 2: Initialize

```bash
$ terraform init

Initializing the backend...

Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.40.0...
- Installed hashicorp/aws v5.40.0 (signed by HashiCorp)

Terraform has been successfully initialized!
```

### Step 3: Plan

```bash
$ terraform plan

Terraform will perform the following actions:

  # aws_s3_bucket.my_bucket will be created
  + resource "aws_s3_bucket" "my_bucket" {
      + acceleration_status         = (known after apply)
      + acl                         = (known after apply)
      + arn                         = (known after apply)
      + bucket                      = "my-first-terraform-bucket-2024"
      + bucket_domain_name          = (known after apply)
      + bucket_regional_domain_name = (known after apply)
      + force_destroy               = false
      + id                          = (known after apply)
      + region                      = (known after apply)
      + tags                        = {
          + "Environment" = "Learning"
          + "Name"        = "MyBucket"
        }
      + tags_all                    = {
          + "Environment" = "Learning"
          + "Name"        = "MyBucket"
        }
      + website_domain              = (known after apply)
      + website_endpoint            = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

### Step 4: Apply

```bash
$ terraform apply

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_s3_bucket.my_bucket: Creating...
aws_s3_bucket.my_bucket: Creation complete after 2s [id=my-first-terraform-bucket-2024]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

### Step 5: Verify in AWS Console

Go to **S3** in AWS Console — you'll see your new bucket!

### Step 6: Destroy

```bash
$ terraform destroy

Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_s3_bucket.my_bucket: Destroying... [id=my-first-terraform-bucket-2024]
aws_s3_bucket.my_bucket: Destruction complete after 1s

Destroy complete! Resources: 1 destroyed.
```

---

## 1.7 HCL vs JSON Configuration

Terraform supports two syntaxes:

### HCL (HashiCorp Configuration Language) — **Preferred** `.tf`

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }
}
```

### JSON Syntax `.tf.json` — Machine-generated

```json
{
  "resource": {
    "aws_instance": {
      "web": {
        "ami": "ami-0c55b159cbfafe1f0",
        "instance_type": "t2.micro",
        "tags": {
          "Name": "WebServer"
        }
      }
    }
  }
}
```

**Always use HCL (.tf) for human-written configurations.** JSON is useful for:
- Machine-generated configurations
- Programmatic creation of Terraform configs
- Integration with other tools

---

## 1.8 Key Terraform Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `terraform init` | Initialize working directory, download providers | First time, after adding new providers |
| `terraform plan` | Show execution plan without applying | Before any apply |
| `terraform apply` | Apply changes to reach desired state | To deploy/update infrastructure |
| `terraform destroy` | Destroy all managed resources | To tear down infrastructure |
| `terraform fmt` | Format code according to HCL standards | Before committing |
| `terraform validate` | Validate configuration syntax | During development |
| `terraform state list` | List resources in state | Troubleshooting |
| `terraform output` | Show output values | Getting generated values |
| `terraform show` | Show current state or plan | Inspection |

---

## 1.9 Understanding `terraform init` Deep Dive

The `init` command is the **first command** to run after writing a new configuration. It:

1. **Creates the `.terraform` directory** (stores providers, modules)
2. **Downloads provider plugins** specified in `required_providers`
3. **Downloads modules** referenced in the configuration
4. **Initializes the backend** (local or remote state storage)
5. **Creates/updates `.terraform.lock.hcl`** — provider version lock file

```bash
# Basic init
terraform init

# Init with specific backend config
terraform init -backend-config="bucket=my-terraform-state"

# Upgrade providers and modules
terraform init -upgrade

# Re-initialize in a non-interactive way
terraform init -input=false

# Init only specific modules
terraform init -get=false
```

---

## 📝 Exam Tips

1. **Know the Terraform workflow:** init → plan → apply (in that order)
2. **Understand `terraform init`** — it downloads providers and modules, initializes backends
3. **Understand `terraform plan`** — read-only operation, does NOT modify infrastructure
4. **Know the difference between HCL (.tf) and JSON (.tf.json)** syntaxes
5. **Remember** `terraform fmt` formats code, `terraform validate` checks syntax
6. **Be aware that `terraform destroy`** is the reverse of `terraform apply`

---

## ✅ Chapter 1 Quiz

1. **What is the first command you should run after writing a Terraform configuration?**
   - a) `terraform apply`
   - b) `terraform plan`
   - c) `terraform init`
   - d) `terraform validate`

2. **Which Terraform command creates an execution plan but does NOT apply changes?**
   - a) `terraform plan`
   - b) `terraform apply`
   - c) `terraform show`
   - d) `terraform init`

3. **True or False:** Terraform uses an imperative approach to infrastructure management.

4. **Which file extension is used for HCL Terraform configurations?**
   - a) `.json`
   - b) `.yaml`
   - c) `.tf`
   - d) `.hcl`

5. **What does `terraform destroy` do?**
   - a) Destroys the local state file
   - b) Destroys all resources managed by the configuration
   - c) Destroys the Terraform binary
   - d) Only destroys resources marked for deletion

<details>
<summary>📌 Answers</summary>

1. **c** — `terraform init` must be run first to initialize the backend and download providers
2. **a** — `terraform plan` shows what changes will be made without applying them
3. **False** — Terraform uses a **declarative** approach (you define the desired state)
4. **c** — `.tf` files contain HCL syntax
5. **b** — `terraform destroy` destroys all resources managed by the configuration
</details>

---

## 📚 Additional Resources

- [Terraform Installation Guide](https://learn.hashicorp.com/tutorials/terraform/install-cli)
- [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [HCL Specification](https://github.com/hashicorp/hcl)

### Example Projects to Explore

Now that you understand the basics, explore these real-world examples:

- **🖥️ [Basic EC2]({{< relref "/examples/basic-ec2" >}})** — Simple EC2 instance with variables and outputs
- **🏗️ [VPC Module]({{< relref "/examples/vpc-module" >}})** — Reusable VPC with public/private subnets
- **📦 [Multi-Tier App]({{< relref "/examples/multi-tier-app" >}})** — VPC + ALB + ASG + RDS architecture
- **⚡ [Serverless API]({{< relref "/examples/serverless-api" >}})** — Lambda + API Gateway + DynamoDB (serverless pattern)
- **🐳 [ECS Fargate]({{< relref "/examples/ecs-fargate" >}})** — Containerized app on ECS with auto-scaling
- **☸️ [EKS Cluster]({{< relref "/examples/eks-cluster" >}})** — Managed Kubernetes cluster with node groups
- **🌐 [S3 + CloudFront Website]({{< relref "/examples/s3-cloudfront-website" >}})** — Static site hosting with CDN and WAF
- **🏭 [Production-Ready]({{< relref "/examples/production-ready" >}})** — Full production-grade infrastructure pattern

---

*Continue to → <a href="{{< relref "02-terraform-core-concepts" >}}">Chapter 2: Terraform Core Concepts</a>*

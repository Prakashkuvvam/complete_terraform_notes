---
title: "Chapter 7: Terraform Modules"
weight: 7
bookFlatSection: false
bookToc: true
---

# Chapter 7: Terraform Modules

## 🎯 Learning Objectives

- Understand what modules are and why they're important
- Create and use local modules
- Publish and consume modules from the Terraform Registry
- Design reusable modules with proper interfaces
- Implement module versioning and testing
- Understand module composition and nesting

---

## 7.1 What are Modules?

**Modules** are self-contained packages of Terraform configurations that are managed as a group. They're the primary way to package and reuse infrastructure code.

### Module Structure

```
modules/
└── ec2-instance/
    ├── main.tf           # Resources
    ├── variables.tf      # Input variables (interface)
    ├── outputs.tf        # Output values (return values)
    └── README.md         # Documentation (for published modules)
```

### Root Module vs Child Modules

- **Root module**: The current working directory with your `.tf` files
- **Child module**: A module called from within another module

```
project/
├── main.tf              # Root module
├── variables.tf
├── outputs.tf
└── modules/
    └── webserver/       # Child module (local)
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

---

## 7.2 Creating a Module

### Step 1: Define the Module Interface

```hcl
# modules/ec2-instance/variables.tf
variable "name" {
  description = "Name of the EC2 instance"
  type        = string
}

variable "ami" {
  description = "AMI ID"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "subnet_id" {
  description = "Subnet ID"
  type        = string
}

variable "security_group_ids" {
  description = "Security group IDs"
  type        = list(string)
  default     = []
}

variable "user_data" {
  description = "User data script"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}

variable "root_volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 20
}
```

### Step 2: Implement Module Resources

```hcl
# modules/ec2-instance/main.tf
resource "aws_instance" "this" {
  ami                    = var.ami
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.security_group_ids
  user_data              = var.user_data

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
  }

  tags = merge(var.tags, {
    Name = var.name
  })
}
```

### Step 3: Define Module Outputs

```hcl
# modules/ec2-instance/outputs.tf
output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.this.id
}

output "instance_arn" {
  description = "ARN of the EC2 instance"
  value       = aws_instance.this.arn
}

output "public_ip" {
  description = "Public IP address"
  value       = aws_instance.this.public_ip
}

output "private_ip" {
  description = "Private IP address"
  value       = aws_instance.this.private_ip
}

output "availability_zone" {
  description = "Availability Zone"
  value       = aws_instance.this.availability_zone
}
```

### Step 4: Document the Module

```markdown
# modules/ec2-instance/README.md
# EC2 Instance Module

## Usage
```hcl
module "web_server" {
  source = "./modules/ec2-instance"

  name       = "web-server"
  ami        = "ami-0c55b159cbfafe1f0"
  subnet_id  = "subnet-12345678"

  instance_type = "t2.micro"
  security_group_ids = ["sg-12345678"]
}
```

## Inputs
| Name | Description | Type | Default |
|------|-------------|------|---------|
| name | Instance name | `string` | n/a |
| ami | AMI ID | `string` | n/a |
| instance_type | Instance type | `string` | `"t2.micro"` |
| ... | ... | ... | ... |

## Outputs
| Name | Description |
|------|-------------|
| instance_id | EC2 instance ID |
| public_ip | Public IP address |
```
```

---

## 7.3 Using Local Modules

```hcl
# main.tf (root module)
module "web_server" {
  source = "./modules/ec2-instance"
  #      ↑ Path to module directory (relative or absolute)

  name       = "web-server"
  ami        = data.aws_ami.ubuntu.id
  subnet_id  = aws_subnet.public[0].id
  instance_type = "t2.micro"
  
  security_group_ids = [aws_security_group.web.id]
  
  tags = {
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

module "app_server" {
  source  = "./modules/ec2-instance"
  
  name       = "app-server"
  ami        = data.aws_ami.ubuntu.id
  subnet_id  = aws_subnet.private[0].id
  instance_type = "t3.small"
}

# Use module outputs
output "web_public_ip" {
  value = module.web_server.public_ip
}
```

---

## 7.4 Using Modules from the Terraform Registry

The **Terraform Registry** (registry.terraform.io) hosts thousands of pre-built modules.

```hcl
# VPC module from the registry
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  #       ↑ Namespace / Module Name / Provider
  version = "5.5.0"
  #      ↑ Version constraint (required for registry modules)

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}

# Security group module
module "web_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.1.0"

  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      description = "HTTP"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      description = "HTTPS"
      cidr_blocks = "0.0.0.0/0"
    }
  ]

  egress_rules = ["all-all"]
}
```

### Finding Registry Modules

```bash
# Search for modules in the registry
# Visit: https://registry.terraform.io/
# Or search from CLI:
terraform login  # Authenticate
terraform init    # Downloads modules from registry
```

### Module Source Formats (Exam Critical)

| Source | Syntax | Example |
|--------|--------|---------|
| Local path | Path string | `"./modules/vpc"` |
| Terraform Registry | `namespace/name/provider` | `"hashicorp/consul/aws"` |
| GitHub | GitHub URL | `"github.com/hashicorp/example"` |
| Git generic | Git URL | `"git::https://example.com/repo.git"` |
| HTTP | HTTP URL | `"https://example.com/module.zip"` |
| S3 | S3 bucket | `"s3::https://s3-eu-west-1.amazonaws.com/example"` |
| GCS | GCS bucket | `"gcs::https://www.googleapis.com/storage/v1/example"` |

---

## 7.5 Module Versioning

```hcl
# Version constraints for registry modules
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  
  # Version constraints
  version = "5.5.0"           # Exact version
  # version = "~> 5.0"        # >= 5.0, < 6.0
  # version = ">= 5.0, < 5.5" # Range
  # version = "~> 5.4.0"      # >= 5.4.0, < 5.5.0
}
```

### Module Version File

```hcl
# versions.tf inside module
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0, < 6.0"
    }
  }
}
```

---

## 7.6 Module Composition

### Module Within Module

```
modules/
├── vpc/              # VPC module
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── security/         # Security module (uses VPC module)
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
└── webserver/        # Web server module (uses VPC + Security modules)
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

```hcl
# modules/webserver/main.tf
module "vpc" {
  source = "../vpc"
  
  name   = var.name
  cidr   = var.vpc_cidr
  azs    = var.azs
}

module "security" {
  source = "../security"
  
  name   = var.name
  vpc_id = module.vpc.vpc_id
}

resource "aws_instance" "web" {
  ami                    = var.ami
  instance_type          = var.instance_type
  subnet_id              = module.vpc.public_subnet_ids[0]
  vpc_security_group_ids = [module.security.web_sg_id]
}
```

---

## 7.7 Module Best Practices

### 1. Keep Modules Focused

```hcl
# GOOD: One responsibility per module
module "vpc" {
  source = "./modules/vpc"
  # Only creates VPC-related resources
}

module "database" {
  source = "./modules/database"
  # Only creates database resources
}

# BAD: Module does everything
module "everything" {
  source = "./modules/everything"
  # Creates VPC, instances, databases, monitoring...
}
```

### 2. Design Clear Interfaces

```hcl
# GOOD: Minimal, clear interface
module "ec2_instance" {
  source  = "./modules/ec2-instance"
  name    = var.name
  ami     = var.ami
  subnet_id = var.subnet_id
  
  # Sensible defaults for optional parameters
  instance_type  = var.environment == "production" ? "t3.large" : "t2.micro"
  root_volume_size = 20
}

# BAD: Interface that exposes internal implementation
module "ec2_instance" {
  source = "./modules/ec2-instance"
  
  aws_inst_ami_123     = var.ami  # ❌ Internal naming
  instance_ebs_volumes = [        # ❌ Exposing internal structure
    { device = "/dev/xvda", size = 20 }
  ]
}
```

### 3. Provide Sensible Defaults

```hcl
# Module with good defaults
variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "monitoring" {
  type    = bool
  default = false
}

variable "backup_retention" {
  type    = number
  default = 7
}
```

### 4. Document Everything

```hcl
# Every variable needs a description
variable "instance_count" {
  description = "Number of EC2 instances to create"
  type        = number
  default     = 1
}

# Every output needs a description
output "instance_ids" {
  description = "IDs of the created EC2 instances"
  value       = aws_instance.this[*].id
}
```

### 5. Use `for_each` for Flexible Resource Creation

```hcl
# Allow users to pass multiple configurations
variable "additional_security_group_rules" {
  description = "Additional security group rules"
  type = list(object({
    type        = string
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))
  default = []
}

resource "aws_security_group_rule" "additional" {
  for_each = { for idx, rule in var.additional_security_group_rules : idx => rule }

  type              = each.value.type
  from_port         = each.value.from_port
  to_port           = each.value.to_port
  protocol          = each.value.protocol
  cidr_blocks       = each.value.cidr_blocks
  description       = each.value.description
  security_group_id = aws_security_group.this.id
}
```

---

## 7.8 Module Testing

### Basic Validation

```bash
# Validate module syntax
cd modules/ec2-instance
terraform init
terraform validate
```

### Using terraform test (Terraform 1.6+)

```hcl
# modules/ec2-instance/tests/basic.tftest.hcl
run "basic_test" {
  # Define module variables
  variables {
    name      = "test-instance"
    ami       = "ami-0c55b159cbfafe1f0"
    subnet_id = "subnet-12345678"
  }

  # Assert outputs
  assert {
    condition     = output.instance_id != ""
    error_message = "Instance ID should not be empty"
  }

  assert {
    condition     = can(regex("^i-", output.instance_id))
    error_message = "Instance ID should start with i-"
  }
}

run "development_test" {
  variables {
    name       = "dev-instance"
    ami        = "ami-0c55b159cbfafe1f0"
    subnet_id  = "subnet-12345678"
    instance_type = "t2.nano"  # Cheaper for dev
  }

  assert {
    condition     = output.instance_type == "t2.nano"
    error_message = "Instance type should be t2.nano for dev"
  }
}
```

```bash
# Run tests
cd modules/ec2-instance
terraform test
```

---

## 7.9 Module Publishing

### Publishing to Terraform Registry

```hcl
# terraform-aws-ec2-instance/main.tf
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }
}
```

### Module Repository Requirements

| Requirement | Details |
|-------------|---------|
| Repository name | `terraform-<PROVIDER>-<NAME>` (e.g., `terraform-aws-ec2-instance`) |
| `main.tf` | Main resources |
| `variables.tf` | Input variables with descriptions |
| `outputs.tf` | Output values with descriptions |
| `README.md` | Documentation and usage examples |
| Version tags | Semantic versioning (e.g., `v1.0.0`) |

### Versioning Convention

```bash
# Tag versions in Git
git tag v1.0.0
git push origin v1.0.0

git tag v1.1.0
git push origin v1.1.0

git tag v2.0.0  # Breaking changes
git push origin v2.0.0
```

---

## 7.10 Module Composition Patterns

### Pattern 1: Wrapper Module

```hcl
# modules/complete-infra/main.tf
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.0"

  name = "${var.environment}-vpc"
  cidr = var.vpc_cidr
  azs  = var.availability_zones

  public_subnets  = var.public_subnet_cidrs
  private_subnets = var.private_subnet_cidrs

  enable_nat_gateway = var.environment == "production"
}

module "ec2" {
  source = "../ec2-instance"

  name       = "${var.environment}-web"
  ami        = var.ami
  subnet_id  = module.vpc.public_subnets[0]
  instance_type = var.instance_type
}
```

### Pattern 2: Infrastructure Module

```hcl
# modules/web-app/main.tf
module "load_balancer" {
  source  = "terraform-aws-modules/alb/aws"
  version = "9.0.0"

  name = "${var.environment}-alb"
  vpc_id = var.vpc_id
  subnets = var.public_subnet_ids

  security_group_ingress_rules = {
    "http" = {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}

module "auto_scaling" {
  source = "../auto-scaling-group"

  name             = "${var.environment}-asg"
  vpc_id           = var.vpc_id
  subnet_ids       = var.private_subnet_ids
  target_group_arns = [module.load_balancer.target_group_arns[0]]
  instance_type    = var.instance_type
  min_size         = var.min_size
  max_size         = var.max_size
}
```

---

## 📝 Exam Tips

1. **Module source determines where to find the module** — Local path, registry, Git, etc.
2. **Registry modules require a version** constraint
3. **Modules have their own `terraform` and `provider` blocks** — Especially `required_providers`
4. **Module outputs can be referenced** as `module.MODULE_NAME.OUTPUT_NAME`
5. **Input variables define the module interface** — Document them well
6. **Outputs define what information the module returns**
7. **`for_each` in modules** (Terraform 0.13+) allows creating multiple module instances
8. **Version constraints** use the same syntax as providers
9. **Module composition** — modules can use other modules (nesting)
10. **Terraform Registry** — Use `namespace/name/provider` format
11. **README is essential** for published modules
12. **Semantic versioning** — Use tags like `v1.0.0`, `v1.1.0`, `v2.0.0`
13. **`terraform get`** downloads modules, `terraform init` does both
14. **`.terraform/modules/`** contains downloaded module code
15. **Module source can be Git, S3, GCS, HTTP, etc.**

---

## ✅ Chapter 7 Quiz

1. **Which module source format is used for the Terraform Registry?**
   - a) `namespace/name/provider`
   - b) `provider/name/namespace`
   - c) `hashicorp/consul`
   - d) `terraform-aws-vpc`

2. **How do you reference an output from a module named "vpc"?**
   - a) `vpc.output.vpc_id`
   - b) `module.vpc.vpc_id`
   - c) `output.vpc.vpc_id`
   - d) `vpc.module.vpc_id`

3. **True or False:** Modules can contain other modules.

4. **What is the purpose of module outputs?**
   - a) To display information in the console
   - b) To return values from a module for use in other parts of the config
   - c) To log module execution
   - d) To send data to CloudWatch

5. **Which command downloads modules referenced in configuration?**
   - a) `terraform get`
   - b) `terraform module`
   - c) `terraform download`
   - d) `terraform fetch`

<details>
<summary>📌 Answers</summary>

1. **a** — `namespace/name/provider` (e.g., `terraform-aws-modules/vpc/aws`)
2. **b** — `module.MODULE_NAME.OUTPUT_NAME`
3. **True** — Modules can compose other modules (module nesting)
4. **b** — Outputs return values from a module for use elsewhere
5. **a** — `terraform get` downloads modules (also done by `terraform init`)
</details>

---

> **📂 See Modules in Action:** Explore how modules are used in real-world projects like the [VPC Module]({{< relref "/examples/vpc-module" >}}), [ECS Fargate]({{< relref "/examples/ecs-fargate" >}}), [EKS Cluster]({{< relref "/examples/eks-cluster" >}}), and the [Production-Ready Example]({{< relref "/examples/production-ready" >}}).

*Continue to → <a href="{{< relref "08-workspaces-and-environments" >}}">Chapter 8: Workspaces & Environments</a>*

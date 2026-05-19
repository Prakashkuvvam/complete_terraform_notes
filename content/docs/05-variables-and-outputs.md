---
title: "Chapter 5: Variables, Outputs & Locals"
weight: 5
bookFlatSection: false
bookToc: true
---

# Chapter 5: Variables, Outputs & Locals

## 🎯 Learning Objectives

- Define and use input variables with proper type constraints
- Understand variable definition precedence
- Use output values to share information
- Create local values for cleaner configurations
- Implement variable validation and error handling
- Handle sensitive data correctly

---

## 5.1 Input Variables

**Input variables** make Terraform configurations parameterizable and reusable.

### Variable Declaration

```hcl
# variables.tf
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}
```

### Variable Attributes (Exam Critical)

| Attribute | Required | Description |
|-----------|----------|-------------|
| `type` | No (defaults to `any`) | Type constraint (string, number, bool, list, map, object, etc.) |
| `description` | No | Human-readable description |
| `default` | No | Default value if none provided (variable is optional if default is set) |
| `validation` | No | Custom validation rules |
| `sensitive` | No | Marks value as sensitive in logs/outputs (default: false) |
| `nullable` | No | Whether variable can be null (default: false) |

### Variable Definition Precedence (Exam Critical)

Variables can be set in multiple ways. The **order of precedence** (highest to lowest) is:

```
1. Command-line flag:   -var="key=value" or -var-file="custom.tfvars"
2. *.auto.tfvars files: terraform.auto.tfvars, *.auto.tfvars
3. terraform.tfvars file
4. Environment variables: TF_VAR_variable_name
5. Default value in variable declaration
```

### Setting Variable Values

```hcl
# method 1: terraform.tfvars (highest file priority)
instance_type = "t3.large"
environment   = "production"

# method 2: *.auto.tfvars (alphabetically sorted)
# dev.auto.tfvars
instance_type = "t2.micro"
environment   = "dev"

# method 3: Environment variables
# export TF_VAR_instance_type="t2.micro"
# export TF_VAR_environment="dev"

# method 4: Command line
# terraform plan -var="instance_type=t2.micro" -var="environment=dev"

# method 5: Custom var file
# terraform plan -var-file="production.tfvars"
```

### Variable Files Example

```hcl
# terraform.tfvars (committed to git with example values)
instance_type = "t2.micro"
environment   = "dev"
region        = "us-east-1"

# production.tfvars (NOT committed to git — contains real values)
instance_type = "t3.large"
environment   = "production"
region        = "eu-west-1"

# terraform.tfvars.example (committed to git — template for others)
instance_type = "CHANGE_ME"
environment   = "CHANGE_ME"
region        = "CHANGE_ME"
```

---

## 5.2 Variable Types (Advanced)

### Collection Types

```hcl
# List
variable "availability_zones" {
  type        = list(string)
  description = "List of AZs"
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Map
variable "instance_tags" {
  type        = map(string)
  description = "Tags for all instances"
  default     = {
    Owner       = "DevOps"
    ManagedBy   = "Terraform"
    Project     = "WebApp"
  }
}

# Set (unordered, unique)
variable "allowed_ports" {
  type        = set(number)
  description = "Set of allowed ports"
  default     = [80, 443, 22]
  # Duplicates are automatically removed
}
```

### Structural Types

```hcl
# Object (structured data with named fields)
variable "instance_config" {
  type = object({
    name         = string
    instance_type = string
    ami_id       = string
    root_volume  = optional(number, 20)  # optional with default
    environment  = optional(string)      # optional, no default → null
    subnets      = list(string)
    tags         = map(string)
  })
  description = "EC2 instance configuration"
}

# Tuple (sequence of different types)
variable "api_endpoint_config" {
  type = tuple([
    string,     # endpoint URL
    number,     # port
    bool,       # https enabled
    list(string) # allowed origins
  ])
  default = [
    "api.example.com",
    443,
    true,
    ["https://app.example.com"]
  ]
}
```

### Optional Attributes in Objects

```hcl
variable "database_config" {
  type = object({
    engine         = string
    engine_version = string
    instance_class = string
    storage        = optional(number, 100)        # optional with default 100
    multi_az       = optional(bool, false)         # optional with default false
    backup_retention = optional(number)             # optional, nullable
    kms_key_arn    = optional(string, null)         # optional, defaults to null
    tags           = optional(map(string), {})      # optional map
  })
}

# Usage — only required fields need to be provided
database_config = {
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.r6g.large"
  # storage, multi_az use defaults
}
```

---

## 5.3 Variable Validation

### Basic Validation

```hcl
variable "environment" {
  type        = string
  description = "Deployment environment"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "instance_count" {
  type        = number
  description = "Number of EC2 instances"
  
  validation {
    condition     = var.instance_count >= 1 && var.instance_count <= 100
    error_message = "Instance count must be between 1 and 100."
  }
}
```

### Advanced Validation Patterns

```hcl
# CIDR validation
variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block"
  
  validation {
    condition     = can(regex("^(10\\.|172\\.(1[6-9]|2[0-9]|3[01])\\.|192\\.168\\.)", var.vpc_cidr))
    error_message = "Must be a private IP range: 10.x.x.x, 172.16-31.x.x, or 192.168.x.x."
  }
  
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "Must be a valid CIDR block."
  }
}

# Regex validation
variable "domain_name" {
  type        = string
  description = "Domain name"
  
  validation {
    condition     = can(regex("^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$", var.domain_name))
    error_message = "Must be a valid domain name."
  }
}

# Map key validation
variable "allowed_services" {
  type = map(object({
    port     = number
    protocol = string
  }))
  
  validation {
    condition = alltrue([
      for k, v in var.allowed_services : v.port >= 1 && v.port <= 65535
    ])
    error_message = "All ports must be between 1 and 65535."
  }
}

# Length validation
variable "name_prefix" {
  type        = string
  description = "Resource name prefix"
  
  validation {
    condition     = length(var.name_prefix) >= 2 && length(var.name_prefix) <= 20
    error_message = "Name prefix must be between 2 and 20 characters."
  }
}
```

---

## 5.4 Sensitive Variables

```hcl
variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  # Password will be hidden in logs and CLI output
  
  validation {
    condition     = length(var.db_password) >= 16
    error_message = "Database password must be at least 16 characters."
  }
}

variable "api_keys" {
  description = "API keys for external services"
  type        = map(string)
  sensitive   = true
}

# Usage in resource
resource "aws_db_instance" "main" {
  engine         = "postgres"
  master_username = "admin"
  master_password = var.db_password  # Sensitive value
}

# Output sensitive values carefully
output "db_password" {
  value     = aws_db_instance.main.master_password
  sensitive = true
  # This output will be marked as sensitive and not displayed in plaintext
}
```

### Best Practices for Secrets

```hcl
# NEVER do this
variable "db_password" {
  default = "password123"  # ❌ Hardcoded secret!
}

# Instead, use:
# 1. Environment variables: TF_VAR_db_password
# 2. AWS Secrets Manager
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/db/password"
}

resource "aws_db_instance" "main" {
  master_password = data.aws_secretsmanager_secret_version.db_password.secret_string
}

# 3. HashiCorp Vault
# 4. Prompt during apply (terraform apply asks for variable)
```

---

## 5.5 Output Values

**Output values** display information about your infrastructure after `terraform apply`.

### Basic Outputs

```hcl
# outputs.tf
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.web.id
}

output "instance_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_instance.web.public_ip
}

output "instance_arn" {
  description = "ARN of the EC2 instance"
  value       = aws_instance.web.arn
}
```

### Output Commands

```bash
# Show all outputs
terraform output

# Show specific output
terraform output instance_public_ip

# Show output in JSON format
terraform output -json

# Show in raw format (no quotes)
terraform output -raw instance_public_ip

# Use output in shell scripts
INSTANCE_IP=$(terraform output -raw instance_public_ip)
```

### Output Types

```hcl
# Output from count resources
output "instance_ids" {
  description = "IDs of all EC2 instances"
  value       = aws_instance.web[*].id
}

# Output from for_each resources
output "instance_map" {
  description = "Map of instance names to IDs"
  value       = { for k, v in aws_instance.web : k => v.id }
}

# Output with description
output "vpc_info" {
  description = "VPC ID and CIDR block"
  value = {
    id         = aws_vpc.main.id
    cidr       = aws_vpc.main.cidr_block
    subnet_ids = aws_subnet.public[*].id
  }
}

# Sensitive output
output "db_password" {
  value     = random_password.db.result
  sensitive = true
  description = "Database master password"
  
  # Optional: set to false to disable sensitive behavior
  # depends_on = [aws_db_instance.main]
}
```

### Output Preconditions (Terraform 1.2+)

```hcl
output "instance_public_ip" {
  value = aws_instance.web.public_ip
  
  precondition {
    condition     = aws_instance.web.public_ip != ""
    error_message = "Instance must have a public IP assigned."
  }
}

output "lb_dns_name" {
  value = aws_lb.web.dns_name
  
  precondition {
    condition     = can(regex("^.*\\.elb\\.amazonaws\\.com$", aws_lb.web.dns_name))
    error_message = "Load balancer must have a valid DNS name."
  }
}
```

---

## 5.6 Local Values

**Local values** (or locals) assign names to expressions, making configurations DRY and more readable.

### Basic Locals

```hcl
# locals.tf
locals {
  # Simple value
  service_name = "web-app"
  
  # Computed value
  instance_type = var.environment == "production" ? "t3.large" : "t2.micro"
  
  # Combined string
  name_prefix = "${var.project}-${var.environment}"
  
  # Computed from resources
  vpc_id = var.create_vpc ? aws_vpc.main[0].id : data.aws_vpc.existing[0].id
}
```

### Advanced Locals

```hcl
locals {
  # Common tags for all resources
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
    CreatedAt   = timestamp()
  }
  
  # Security group rules from variable
  ingress_rules = [
    for rule in var.ingress_rules : {
      port        = rule.port
      protocol    = rule.protocol
      cidr_blocks = rule.cidr_blocks
      description = rule.description
    } if rule.enabled
  ]
  
  # Subnet CIDR calculations
  public_subnet_cidrs = [
    for i in range(var.az_count) : 
    cidrsubnet(var.vpc_cidr, 8, i)
  ]
  
  private_subnet_cidrs = [
    for i in range(var.az_count) : 
    cidrsubnet(var.vpc_cidr, 8, i + var.az_count)
  ]
  
  # Merged tags
  all_tags = merge(
    local.common_tags,
    var.additional_tags,
    { Name = "${local.name_prefix}-instance" }
  )
}
```

### Using Locals

```hcl
# Using computed tags
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = local.instance_type
  
  tags = local.all_tags
}

resource "aws_s3_bucket" "logs" {
  bucket = "${local.name_prefix}-logs"
  
  tags = local.all_tags
}

# Using computed subnet CIDRs
resource "aws_subnet" "public" {
  count = var.az_count
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = local.public_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = local.all_tags
}
```

---

## 5.7 Variable vs Locals — When to Use Which

| Scenario | Variable | Locals | Explanation |
|----------|----------|--------|-------------|
| User-provided value | ✅ | ❌ | Variables accept user input |
| Computed value | ❌ | ✅ | Locals can use expressions |
| Default value | ✅ | ❌ | Variables have default support |
| Used across modules | ✅ | ❌ | Variables passed as arguments |
| File scoped | ❌ | ✅ | Locals are module-scoped |
| Sensitive values | ✅ (sensitive) | ❌ | Variables support sensitive flag |
| Validation | ✅ | ❌ | Variables support validation blocks |
| Type constraints | ✅ | ❌ | Variables support type constraints |

### Practical Example: When to Use Each

```hcl
# Variables: Things the user should set
variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "instance_count" {
  type        = number
  default     = 2
  description = "Number of instances"
}

# Locals: Things computed from variables/resources
locals {
  name_prefix = "myapp-${var.environment}"
  #         ↑ Computed from variable
  
  tags = merge(
    var.common_tags,  # From variable (user input)
    { Name = local.name_prefix, Environment = var.environment }
    #  ↑ Locals can reference other locals and variables
  )
}
```

---

## 5.8 Complete Variable Patterns

### Pattern 1: Simple Reusable Module

```hcl
# variables.tf
variable "name" {
  type        = string
  description = "Resource name"
}

variable "environment" {
  type        = string
  description = "Environment"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Invalid environment."
  }
}

variable "instance_config" {
  type = object({
    instance_type = string
    ami_id        = optional(string)
    root_volume   = optional(number, 20)
    user_data     = optional(string)
  })
  description = "EC2 instance configuration"
}

# locals.tf
locals {
  name_prefix = "${var.name}-${var.environment}"
  common_tags = {
    Name        = local.name_prefix
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# outputs.tf
output "instance_id" {
  value = aws_instance.this.id
}

output "instance_public_ip" {
  value = aws_instance.this.public_ip
}
```

### Pattern 2: Multi-Environment Configuration

```hcl
# environments/prod/terraform.tfvars
environment      = "production"
instance_count   = 5
instance_type    = "t3.large"
enable_monitoring = true
vpc_cidr         = "10.0.0.0/16"

# environments/dev/terraform.tfvars
environment      = "dev"
instance_count   = 1
instance_type    = "t2.micro"
enable_monitoring = false
vpc_cidr         = "10.1.0.0/16"

# Deploy different environments
cd environments/prod && terraform apply
cd environments/dev && terraform apply
```

---

## 📝 Exam Tips

1. **Variable precedence:** `-var` flag > `*.auto.tfvars` > `terraform.tfvars` > `TF_VAR_` > default
2. **Variables are optional if they have a `default`** — Required if no default is set
3. **`sensitive = true`** hides values in logs and plan output
4. **Outputs display after apply** — Use `terraform output` to view them later
5. **Locals are not user-configurable** — They're computed values within a module
6. **`optional()`** makes object attributes optional (Terraform 1.3+)
7. **`validation` blocks** use `condition` and `error_message`
8. **`can()` function** checks if an expression would succeed
9. **Outputs with `precondition`** validate that conditions are met
10. **Never hardcode secrets** — Use env vars, secrets manager, or prompt

---

## ✅ Chapter 5 Quiz

1. **What is the highest precedence for setting a variable value?**
   - a) Default value
   - b) `terraform.tfvars`
   - c) `-var` command line flag
   - d) `TF_VAR_` environment variable

2. **Which attribute makes a variable's value hidden in logs?**
   - a) `hidden`
   - b) `private`
   - c) `sensitive`
   - d) `secret`

3. **How do you make an object field optional in Terraform 1.3+?**
   - a) `optional(type)`
   - b) `nullable(type)`
   - c) `default = null`
   - d) `optional(type, default)`

4. **True or False:** Local values can be set by users using `.tfvars` files.

5. **Which command shows output values after apply?**
   - a) `terraform show`
   - b) `terraform output`
   - c) `terraform plan`
   - d) `terraform state list`

<details>
<summary>📌 Answers</summary>

1. **c** — `-var` command line flag has the highest precedence
2. **c** — `sensitive = true` hides values in logs and output
3. **d** — `optional(type, default)` makes object fields optional
4. **False** — Locals are module-scoped computed values, not user-configurable
5. **b** — `terraform output` displays output values
</details>

---

*Continue to → <a href="{{< relref "06-state-management" >}}">Chapter 6: State Management</a>*

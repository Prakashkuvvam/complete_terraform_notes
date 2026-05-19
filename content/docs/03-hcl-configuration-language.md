---
title: "Chapter 3: HCL Configuration Language"
weight: 3
bookFlatSection: false
bookToc: true
---

# Chapter 3: HCL Configuration Language

## 🎯 Learning Objectives

- Master HCL syntax and structure
- Understand Terraform data types
- Use expressions and interpolation
- Work with collections and for expressions
- Understand type constraints and validation

---

## 3.1 HCL Syntax Basics

HCL (HashiCorp Configuration Language) is designed to be human-readable and machine-friendly.

### Comments

```hcl
# This is a single-line comment

// This is also a single-line comment

/* This is a
   multi-line comment */
```

### Basic Syntax Structure

```hcl
<BLOCK TYPE> "<LABEL 1>" "<LABEL 2>" {
  # Body with arguments
  <ARGUMENT NAME> = <VALUE>
  
  # Nested blocks
  <BLOCK TYPE> {
    <ARGUMENT NAME> = <VALUE>
  }
}
```

### Example

```hcl
# Block type: resource, Labels: "aws_instance" and "web"
resource "aws_instance" "web" {
  # Argument
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  # Nested block
  ebs_block_device {
    device_name = "/dev/xvda"
    volume_size = 20
  }
  
  # Map argument
  tags = {
    Name        = "Web Server"
    Environment = "Production"
  }
}
```

---

## 3.2 Data Types

### Primitive Types

| Type | Description | Examples |
|------|-------------|----------|
| `string` | Text value | `"hello"`, `"ami-12345"` |
| `number` | Numeric value | `42`, `3.14`, `-7` |
| `bool` | Boolean | `true`, `false` |

### Complex Types

| Type | Description | Example |
|------|-------------|---------|
| `list(TYPE)` | Ordered collection | `["us-east-1a", "us-east-1b"]` |
| `map(TYPE)` | Key-value pairs | `{Name = "Web", Env = "Prod"}` |
| `set(TYPE)` | Unordered unique collection | `["a", "b", "c"]` (no duplicates) |
| `object({...})` | Structured with named attributes | `{name = "John", age = 30}` |
| `tuple([...])` | Sequence with different types | `["hello", 42, true]` |

### Type Examples

```hcl
# Strings
variable "name" {
  type    = string
  default = "my-instance"
}

# Numbers
variable "instance_count" {
  type    = number
  default = 3
}

# Booleans
variable "enable_monitoring" {
  type    = bool
  default = true
}

# Lists
variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Maps
variable "instance_tags" {
  type = map(string)
  default = {
    Name        = "WebServer"
    Environment = "Development"
    Owner       = "DevOps"
  }
}

# Objects (structured data)
variable "instance_config" {
  type = object({
    instance_type = string
    ami_id        = string
    root_volume   = number
    environment   = string
  })
  default = {
    instance_type = "t2.micro"
    ami_id        = "ami-0c55b159cbfafe1f0"
    root_volume   = 20
    environment   = "dev"
  }
}

# Tuples (mixed types)
variable "mixed_data" {
  type    = tuple([string, number, bool])
  default = ["us-east-1", 3, true]
}

# Optional type with nullable
variable "optional_value" {
  type     = string
  default  = null
  nullable = true
}

# Any type
variable "flexible" {
  type = any
}
```

---

## 3.3 Expressions and Interpolation

### String Interpolation

```hcl
# Basic interpolation: ${ ... }
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type
  
  tags = {
    Name = "WebServer-${var.environment}"
    #                     ↑ Interpolation
  }
}

# String templates
output "message" {
  value = "Instance ${aws_instance.web.id} is running in ${var.region}"
}
```

### String Heredoc Syntax

```hcl
# Heredoc string (preserves formatting)
locals {
  user_data = <<-EOF
    #!/bin/bash
    echo "Hello from ${var.environment}"
    sudo yum install -y httpd
    sudo systemctl enable httpd
    sudo systemctl start httpd
  EOF
}

# JSON heredoc
locals {
  policy = <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::${local.bucket_name}/*"
    }
  ]
}
JSON
}
```

### Template Files

```hcl
# user_data.sh.tftpl (template file)
#!/bin/bash
echo "Instance ID: ${id}"
echo "Environment: ${environment}"
echo "Region: ${region}"

# In main.tf
resource "aws_instance" "web" {
  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    id          = aws_instance.web.id
    environment = var.environment
    region      = var.region
  })
}
```

---

## 3.4 Operators

### Arithmetic Operators

```hcl
locals {
  sum     = 5 + 3     # 8
  diff    = 10 - 3    # 7
  product = 4 * 2     # 8
  quot    = 10 / 3    # 3 (integer division)
  rem     = 10 % 3    # 1 (remainder)
  neg     = -5        # -5
}
```

### Comparison Operators

```hcl
locals {
  a = 5
  b = 10
  
  eq  = a == b     # false
  ne  = a != b     # true
  lt  = a < b      # true
  le  = a <= b     # true
  gt  = a > b      # false
  ge  = a >= b     # false
}
```

### Logical Operators

```hcl
variable "enable"  { default = true }
variable "verbose" { default = false }

locals {
  # Logical operators
  and_result = var.enable && var.verbose  # false
  or_result  = var.enable || var.verbose  # true
  not_result = !var.enable                # false
}
```

### Conditional Expressions

```hcl
# Syntax: condition ? true_value : false_value

variable "environment" {
  type    = string
  default = "production"
}

locals {
  instance_type = var.environment == "production" ? "t3.large" : "t2.micro"
  #                                 ↑ condition          ↑ true    ↑ false
  
  # Nested condition
  sizing = var.environment == "production" ? "large" : (
    var.environment == "staging" ? "medium" : "small"
  )
}

resource "aws_instance" "web" {
  instance_type = local.instance_type
}

# Conditional resource creation
resource "aws_instance" "monitoring" {
  count = var.enable_monitoring ? 1 : 0
  # Only creates if monitoring is enabled
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.nano"
}
```

---

## 3.5 For Expressions

`for` expressions transform complex data types.

### Basic For Expression

```hcl
locals {
  names    = ["Alice", "Bob", "Charlie"]
  # For list → list
  upper_names = [for name in local.names : upper(name)]
  # Result: ["ALICE", "BOB", "CHARLIE"]
  
  # For list → list with filtering
  short_names = [for name in local.names : upper(name) if length(name) < 5]
  # Result: ["ALICE", "BOB"]
  
  # For list → map
  name_map = { for name in local.names : name => length(name) }
  # Result: { "Alice" = 5, "Bob" = 3, "Charlie" = 7 }
}
```

### For Expression with Maps

```hcl
variable "tags" {
  default = {
    Name        = "WebServer"
    Environment = "Production"
    Owner       = "DevOps"
  }
}

locals {
  # Transform map values
  lower_tags = { for k, v in var.tags : k => lower(v) }
  # Result: { Name = "webserver", Environment = "production", Owner = "devops" }
  
  # Filter map
  production_tags = { for k, v in var.tags : k => v if k != "Environment" }
}
```

### Practical Example: Generating Security Group Rules

```hcl
variable "ingress_rules" {
  type = list(object({
    port        = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))
  default = [
    { port = 80,  protocol = "tcp", cidr_blocks = ["0.0.0.0/0"],      description = "HTTP" },
    { port = 443, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"],      description = "HTTPS" },
    { port = 22,  protocol = "tcp", cidr_blocks = ["10.0.0.0/8"],     description = "SSH" },
  ]
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Web server security group"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
      description = ingress.value.description
    }
  }
}
```

---

## 3.6 Splat Expressions

Splat expressions (`*`) extract attributes from lists of resources.

```hcl
# Without splat (getting IDs manually)
output "instance_ids_old" {
  value = [
    aws_instance.app[0].id,
    aws_instance.app[1].id,
    aws_instance.app[2].id,
  ]
}

# With splat expression
output "instance_ids" {
  value = aws_instance.app[*].id
  # Returns: ["i-123", "i-456", "i-789"]
}

# Using splat to get all ARNs
output "instance_arns" {
  value = aws_instance.app[*].arn
}

# The "legacy" splat (less strict) vs "any" splat
output "public_ips" {
  # The "any" attribute splat
  value = aws_instance.app[*].public_ip
  
  # Legacy splat (also works but less type-safe)
  # value = aws_instance.app.*.public_ip
}
```

---

## 3.7 Type Constraints and Validation

### Type Constraints

```hcl
# Simple types
variable "name" {
  type = string
}

variable "count" {
  type = number
}

# Optional arguments
variable "description" {
  type    = string
  default = "No description provided"
}

# Type with nullable
variable "optional_resource" {
  type     = string
  default  = null
  nullable = true
}
```

### Custom Validation Rules

```hcl
variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  
  validation {
    condition     = contains(["t2.micro", "t2.small", "t2.medium", "t3.micro", "t3.small"], var.instance_type)
    error_message = "Instance type must be one of: t2.micro, t2.small, t2.medium, t3.micro, t3.small."
  }
}

variable "environment" {
  type = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "vpc_cidr" {
  type = string
  
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
  
  validation {
    condition     = length(regexall("^(10\\.|172\\.(1[6-9]|2[0-9]|3[01])\\.|192\\.168\\.)", var.vpc_cidr)) > 0
    error_message = "VPC CIDR must be a private IP range (10.x.x.x, 172.16-31.x.x, or 192.168.x.x)."
  }
}

variable "instance_count" {
  type = number
  
  validation {
    condition     = var.instance_count >= 1 && var.instance_count <= 100
    error_message = "Instance count must be between 1 and 100."
  }
}
```

---

## 3.8 Built-in Functions

Terraform has hundreds of built-in functions. Here are the most important ones for the exam:

### Numeric Functions

```hcl
locals {
  max_val   = max(5, 12, 3)       # 12
  min_val   = min(5, 12, 3)       # 3
  ceil_val  = ceil(4.3)           # 5
  floor_val = floor(4.7)          # 4
  abs_val   = abs(-7)             # 7
}
```

### String Functions

```hcl
locals {
  upper       = upper("hello")           # "HELLO"
  lower       = lower("HELLO")           # "hello"
  title       = title("hello world")     # "Hello World"
  substr      = substr("hello", 0, 3)    # "hel"
  join_result = join("-", ["a", "b", "c"])  # "a-b-c"
  split_res   = split(",", "a,b,c")      # ["a", "b", "c"]
  trim_space  = trimspace("  hello  ")   # "hello"
  replace     = replace("hello world", "world", "terraform") # "hello terraform"
  format_res  = format("Hello %s, you are %d years old", "John", 30) # "Hello John, you are 30 years old"
}
```

### Collection Functions

```hcl
locals {
  list1       = ["a", "b", "c"]
  list2       = ["c", "d", "e"]
  
  length_val    = length(local.list1)            # 3
  concat_res    = concat(local.list1, local.list2)  # ["a", "b", "c", "c", "d", "e"]
  distinct_res  = distinct(concat(local.list1, local.list2))  # ["a", "b", "c", "d", "e"]
  contains_res  = contains(local.list1, "a")      # true
  element_res   = element(local.list1, 1)          # "b"
  index_res     = index(local.list1, "c")          # 2
  flatten_res   = flatten([["a"], ["b", "c"]])     # ["a", "b", "c"]
  lookup_res    = lookup({a = 1, b = 2}, "a", 0)    # 1
  keys_res      = keys({a = 1, b = 2})              # ["a", "b"]
  values_res    = values({a = 1, b = 2})            # [1, 2]
  merge_res     = merge({a = 1}, {b = 2})           # {a = 1, b = 2}
  reverse_res   = reverse(["a", "b", "c"])          # ["c", "b", "a"]
  slice_res     = slice(["a", "b", "c", "d"], 1, 3) # ["b", "c"]
  sort_res      = sort(["c", "a", "b"])             # ["a", "b", "c"]
  zipmap_res    = zipmap(["a", "b"], [1, 2])        # {a = 1, b = 2}
}
```

### CIDR/IP Functions

```hcl
locals {
  # CIDR subnetting
  cidrsubnet_res = cidrsubnet("10.0.0.0/16", 8, 0)  # "10.0.0.0/24"
  cidrsubnet_1   = cidrsubnet("10.0.0.0/16", 8, 1)  # "10.0.1.0/24"
  
  # CIDR host addresses
  cidrhost_res   = cidrhost("10.0.0.0/24", 10)       # "10.0.0.10"
  
  # CIDR network details
  cidrnetmask    = cidrnetmask("10.0.0.0/24")        # "255.255.255.0"
}
```

### Encoding Functions

```hcl
locals {
  # base64
  base64_encoded = base64encode("hello")  # "aGVsbG8="
  base64_decoded = base64decode("aGVsbG8=")  # "hello"
  
  # JSON
  json_encoded = jsonencode({a = 1, b = 2})  # '{"a":1,"b":2}'
  json_decoded = jsondecode("{\"a\":1}")     # {a = 1}
  
  # YAML
  yaml_encoded = yamlencode({a = 1, b = 2})
}
```

### File Functions

```hcl
# Read a file as string
locals {
  user_data = file("${path.module}/scripts/install.sh")
  # Returns the contents of the file
}

# Read a file and decode
locals {
  policy = file("${path.module}/policies/s3-policy.json")
  # To use as JSON
  json_policy = jsondecode(local.policy)
}

# Template file (with variables)
resource "aws_instance" "web" {
  user_data = templatefile("${path.module}/templates/user_data.sh.tftpl", {
    server_name  = var.server_name
    environment  = var.environment
    s3_bucket    = aws_s3_bucket.data.bucket
  })
}
```

### Timestamp Functions

```hcl
locals {
  current_time = timestamp()  # "2024-01-15T10:30:00Z" (UTC)
  time_format  = formatdate("YYYY-MM-DD hh:mm:ss", timestamp())
  
  time_offset = timeadd(timestamp(), "24h")  # 24 hours from now
}
```

---

## 3.9 Self-Object

In resource blocks with `count` or `for_each`, `self` refers to the current resource.

```hcl
resource "aws_instance" "web" {
  count = 3
  
  # self refers to the current instance (aws_instance.web[count.index])
  provisioner "local-exec" {
    command = "echo ${self.id} >> instance_ids.txt"
    #         ↑ self refers to the current resource instance
  }
}
```

---

## 3.10 Path References

```hcl
# Module paths
locals {
  module_path    = path.module     # Path to the current module
  root_path      = path.root       # Path to the root module
  current_cwd    = path.cwd         # Current working directory
}

# Common use cases
resource "aws_s3_bucket_object" "config" {
  bucket = "my-bucket"
  key    = "config.json"
  source = "${path.module}/files/config.json"
}
```

---

## 📝 Exam Tips

1. **String interpolation** uses `${ ... }` syntax
2. **Conditional expression** syntax: `condition ? true_val : false_val`
3. **For expressions** can transform lists and maps with optional filtering
4. **Splat expressions** (resource[*].attribute) simplify extracting attributes from lists
5. **Data types** — know the difference between `list`, `set`, `map`, `object`, `tuple`
6. **Validation** — `validation` blocks with `condition` and `error_message`
7. **`can()` function** — returns true if expression succeeds (useful for validation)
8. **`try()` function** — tries expressions, returns fallback if any fails
9. **Template files** — use `templatefile()` function with `.tftpl` files
10. **path.module** vs **path.root** — understand the difference (module vs root)

---

## ✅ Chapter 3 Quiz

1. **What is the correct syntax for a conditional expression in Terraform?**
   - a) `if condition then value else default`
   - b) `condition ? true_value : false_value`
   - c) `condition ? value : else`
   - d) `condition if true else false`

2. **Which splat expression correctly extracts IDs from a list of resources?**
   - a) `aws_instance.web[].id`
   - b) `aws_instance.web.*id`
   - c) `aws_instance.web[*].id`
   - d) `aws_instance.web[].id[*]`

3. **What does the expression `[for name in ["a", "b", "c"] : upper(name) if name != "b"]` return?**
   - a) `["A", "B", "C"]`
   - b) `["A", "C"]`
   - c) `["a", "c"]`
   - d) `["A", "B"]`

4. **Which function converts a string to lowercase?**
   - a) `lower()`
   - b) `downcase()`
   - c) `to_lower()`
   - d) `lc()`

5. **What does the expression `cidrsubnet("10.0.0.0/16", 8, 0)` return?**
   - a) `10.0.0.0/24`
   - b) `10.0.0.0/16`
   - c) `10.0.0.0/8`
   - d) `10.0.0.0`

<details>
<summary>📌 Answers</summary>

1. **b** — `condition ? true_value : false_value` is the correct conditional syntax
2. **c** — `aws_instance.web[*].id` is the "any" splat expression
3. **b** — Filters out "b" and uppercases: `["A", "C"]`
4. **a** — `lower()` converts strings to lowercase
5. **a** — `10.0.0.0/24` (subnets /16 into /24s, first subnet)
</details>

---

*Continue to → <a href="{{< relref "04-resources-and-data-sources" >}}">Chapter 4: Resources, Data Sources & Meta-Arguments</a>*

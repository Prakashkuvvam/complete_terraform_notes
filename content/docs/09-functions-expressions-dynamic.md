---
title: "Chapter 9: Functions, Expressions & Dynamic Blocks"
weight: 9
bookFlatSection: false
bookToc: true
---

# Chapter 9: Functions, Expressions & Dynamic Blocks

## 🎯 Learning Objectives

- Master Terraform's built-in functions
- Use conditional expressions effectively
- Implement for expressions and splat expressions
- Create dynamic blocks for flexible configurations
- Understand templatefile and string functions

---

## 9.1 Complete Function Reference by Category

### Numeric Functions

```hcl
locals {
  # Basic arithmetic
  max_val   = max(5, 12, 3, 8)        # 12
  min_val   = min(5, 12, 3, 8)        # 3
  
  # Rounding
  ceil_val  = ceil(4.3)                # 5
  floor_val = floor(4.7)               # 4
  
  # Absolute value
  abs_val   = abs(-7)                  # 7
  
  # Sign and modulo
  signum_neg = signum(-10)             # -1
  signum_pos = signum(10)              # 1
  signum_zero = signum(0)              # 0
  
  # Parse from string
  parseint_result = parseint("42", 10)  # 42
  parseint_hex    = parseint("FF", 16)  # 255
  
  # Format number
  formatnum_default = formatnum(1234567.89)       # "1234567.89"
  formatnum_compact = formatnum(1234567.89, "compact")  # "1.2M"
}
```

### String Functions

```hcl
locals {
  # Case conversion
  upper_case = upper("hello world")     # "HELLO WORLD"
  lower_case = lower("HELLO WORLD")     # "hello world"
  title_case = title("hello world")     # "Hello World"
  
  # Substring
  substr_first3 = substr("hello", 0, 3)  # "hel"
  substr_mid2   = substr("hello", 1, 3)  # "ell"
  
  # Join and split
  joined = join("-", ["a", "b", "c"])    # "a-b-c"
  split  = split(",", "a,b,c")           # ["a", "b", "c"]
  split_csv = split(",", "a,b,c,d,e")    # ["a", "b", "c", "d", "e"]
  
  # Trim
  trim_space = trimspace("  hello  ")    # "hello"
  trim_all   = trim("!hello!", "!")      # "hello"
  trim_prefix = trimprefix("hello_world", "hello_")  # "world"
  trim_suffix = trimsuffix("hello_world", "_world")  # "hello"
  
  # Replace
  replace_simple = replace("hello world", "world", "terraform")  # "hello terraform"
  replace_regex  = replace("hello 123 world", "/[0-9]+/", "###")  # "hello ### world"
  
  # Format
  fmt1 = format("Hello %s!", "World")                      # "Hello World!"
  fmt2 = format("Price: $%.2f", 19.99)                     # "Price: $19.99"
  fmt3 = format("IP: %d.%d.%d.%d", 10, 0, 1, 5)           # "IP: 10.0.1.5"
  
  # Format list
  fmt_list = formatlist("ec2-%s-%02d", ["web", "app"], [1, 2])
  # Result: ["ec2-web-01", "ec2-app-02"]
  
  # Regex
  regex_match = regex("([a-z]+)-([0-9]+)", "web-01")      # ["web", "01"]
  regex_all   = regexall("[a-z]+", "hello 123 world 456")  # ["hello", "world"]
  
  # String contains
  strcontains = strcontains("hello_world", "world")        # true
  
  # Repeat
  repeated = repeat("ab", 3)    # "ababab"
  
  # Reverse
  reversed = strrev("hello")    # "olleh"
  
  # Convert to string
  tostring_val = tostring(42)   # "42"
  
  # Text encoding
  base64enc = textencodebase64("hello", "UTF-8")  # base64 encoded "hello"
  base64dec = textdecodebase64("aGVsbG8=", "UTF-8")  # "hello"
}
```

### Collection Functions

```hcl
locals {
  list_a    = ["a", "b", "c"]
  list_b    = ["c", "d", "e"]
  num_list  = [1, 2, 3, 4, 5]
  
  # Length
  len_list = length(local.list_a)           # 3
  
  # Concatenation
  concat_res = concat(local.list_a, local.list_b)  # ["a", "b", "c", "c", "d", "e"]
  
  # Distinct (remove duplicates)
  distinct_res = distinct(local.concat_res)  # ["a", "b", "c", "d", "e"]
  
  # Contains check
  contains_a = contains(local.list_a, "a")   # true
  contains_z = contains(local.list_a, "z")   # false
  
  # Element access
  element_1  = element(local.list_a, 1)       # "b"
  element_5  = element(local.list_a, 5)       # "a" (wraps around!)
  # element_5 with wrap-around: index 5 → 5 % 3 = 2 → local.list_a[2] = "c"
  
  # Index of element
  index_of_b = index(local.list_a, "b")       # 1
  
  # Lookup in map
  my_map     = {a = 1, b = 2, c = 3}
  lookup_a   = lookup(local.my_map, "a", 0)    # 1
  lookup_d   = lookup(local.my_map, "d", 99)   # 99 (default)
  
  # Keys and values
  map_keys   = keys(local.my_map)              # ["a", "b", "c"]
  map_values = values(local.my_map)            # [1, 2, 3]
  
  # Merge maps
  map1 = {a = 1, b = 2}
  map2 = {c = 3, d = 4}
  merged = merge(local.map1, local.map2)       # {a = 1, b = 2, c = 3, d = 4}
  
  # Override merge (later values override earlier)
  map3 = {a = 10, b = 20}
  merged_override = merge(local.map1, local.map3)  # {a = 10, b = 20}
  
  # Flatten nested lists
  nested = [["a", "b"], ["c"], [], ["d", "e"]]
  flat   = flatten(local.nested)              # ["a", "b", "c", "d", "e"]
  
  # All true / any true
  all_true  = alltrue([true, true, false])    # false
  any_true  = anytrue([false, true, false])   # true
  
  # Sum
  sum_nums = sum(local.num_list)              # 15
  
  # Reverse list
  reversed = reverse(local.list_a)            # ["c", "b", "a"]
  
  # Slice
  sliced = slice(local.list_a, 0, 2)          # ["a", "b"]
  
  # Sort
  unsorted = ["c", "a", "b"]
  sorted   = sort(local.unsorted)             # ["a", "b", "c"]
  
  # Zipmap (combine two lists into a map)
  keys_list   = ["a", "b", "c"]
  values_list = [1, 2, 3]
  zipped = zipmap(local.keys_list, local.values_list)  # {a = 1, b = 2, c = 3}
  
  # Chunklist (split into chunks)
  chunks = chunklist([1, 2, 3, 4, 5, 6, 7], 3)  # [[1,2,3], [4,5,6], [7]]
  
  # Compact (remove empty/null)
  with_empty = ["a", "", "b", null, "c"]
  compacted  = compact(local.with_empty)     # ["a", "b", "c"]
  
  # Coalesce (first non-null)
  coalesce_res = coalesce(null, "", "hello")  # "hello"
  
  # Coalescelist (first non-empty list)
  coalescelist_res = coalescelist([], ["a"], ["b"])  # ["a"]
  
  # Matchkeys
  # (advanced: returns elements from list where corresponding element in key list matches values in search set)
}
```

### CIDR/IP Network Functions

```hcl
locals {
  # CIDR subnetting
  vpc_cidr = "10.0.0.0/16"
  
  # Create subnets: cidrsubnet(prefix, newbits, netnum)
  subnet_a = cidrsubnet(local.vpc_cidr, 8, 0)   # "10.0.0.0/24"
  subnet_b = cidrsubnet(local.vpc_cidr, 8, 1)   # "10.0.1.0/24"
  subnet_c = cidrsubnet(local.vpc_cidr, 8, 255)  # "10.0.255.0/24"
  
  # Multiple subnets with for expression
  subnets = [for i in range(4) : cidrsubnet("10.0.0.0/16", 8, i)]
  # ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  
  # CIDR host addresses
  host_10 = cidrhost("10.0.0.0/24", 10)   # "10.0.0.10"
  host_1  = cidrhost("10.0.0.0/24", 1)    # "10.0.0.1"
  
  # CIDR netmask
  netmask_24 = cidrnetmask("10.0.0.0/24")  # "255.255.255.0"
  netmask_16 = cidrnetmask("10.0.0.0/16")  # "255.255.0.0"
  
  # CIDR subnet ranges
  cidr_range = cidrsubnets("10.0.0.0/16", 4, 4, 8, 8)
  # Result: ["10.0.0.0/20", "10.0.16.0/20", "10.0.32.0/24", "10.0.33.0/24"]
  
  # CIDR contains check
  contains10_0 = cidrcontains("10.0.0.0/8", "10.0.1.5")     # true
  contains11   = cidrcontains("10.0.0.0/8", "11.0.0.1")     # false
}
```

### Encoding/Decoding Functions

```hcl
locals {
  # Base64
  b64enc  = base64encode("hello world")     # "aGVsbG8gd29ybGQ="
  b64dec  = base64decode("aGVsbG8gd29ybGQ=")  # "hello world"
  
  # Base64 Gzip
  b64gzip = base64gzip("hello world")       # Gzipped then base64 encoded
  
  # JSON
  json_obj = {
    name  = "John"
    age   = 30
    items = ["a", "b"]
  }
  
  json_encoded = jsonencode(local.json_obj)  # '{"age":30,"items":["a","b"],"name":"John"}'
  json_decoded = jsondecode(local.json_encoded)
  
  # YAML
  yaml_encoded = yamlencode({
    name = "John"
    age  = 30
  })
  # "age": 30
  # "name": "John"
  
  yaml_stream = yamlencode([
    { name = "John", age = 30 },
    { name = "Jane", age = 25 }
  ])
  
  yaml_decoded = yamldecode(local.yaml_encoded)
  
  # URL encoding
  url_enc = urlencode("hello world")        # "hello+world"
  url_dec = urldecode("hello+world")        # "hello world"
  
  # CSV decode
  csv_data = csvdecode("name,age\nJohn,30\nJane,25")
  # [{name = "John", age = "30"}, {name = "Jane", age = "25"}]
}
```

### Date and Time Functions

```hcl
locals {
  # Current timestamp (UTC)
  now = timestamp()    # "2024-01-15T10:30:00Z"
  
  # Format timestamp
  formatted = formatdate("YYYY-MM-DD hh:mm:ss", local.now)
  # "2024-01-15 10:30:00"
  
  # Date parts
  year    = formatdate("YYYY", local.now)     # "2024"
  month   = formatdate("MM", local.now)       # "01"
  day     = formatdate("DD", local.now)       # "15"
  hour    = formatdate("hh", local.now)       # "10"
  
  # Time arithmetic
  tomorrow    = timeadd(local.now, "24h")
  next_week   = timeadd(local.now, "168h")
  next_month  = timeadd(local.now, "720h")
  last_hour   = timeadd(local.now, "-1h")
  
  # Time comparison
  time1 = "2024-01-15T10:00:00Z"
  time2 = "2024-01-15T11:00:00Z"
  
  # Plantimestamp (epoch seconds)
  epoch = plantimestamp()  # 1705312200 (seconds since epoch)
}
```

### File and Filesystem Functions

```hcl
locals {
  # Read file content
  user_data_script = file("${path.module}/scripts/install.sh")
  
  # Read and decode JSON
  policy = file("${path.module}/policies/policy.json")
  policy_decoded = jsondecode(local.policy)
  
  # Read and decode YAML
  config_file = file("${path.module}/config/config.yaml")
  config = yamldecode(local.config_file)
  
  # Template file
  rendered_user_data = templatefile("${path.module}/templates/cloud-init.sh.tftpl", {
    hostname   = var.hostname
    s3_bucket  = aws_s3_bucket.data.bucket
    region     = var.region
  })
  
  # File existence check
  # fileexists("${path.module}/config.yml")
  
  # Template files
  tmpl = templatefile("${path.module}/templates/config.json.tftpl", {
    server_name = var.name
    port        = var.port
    debug       = var.debug
  })
}
```

### Hash and Crypto Functions

```hcl
locals {
  # MD5
  md5_hash = md5("hello")    # "5d41402abc4b2a76b9719d911017c592"
  
  # SHA1
  sha1_hash = sha1("hello")  # "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"
  
  # SHA256
  sha256_hash = sha256("hello")
  # "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
  
  # SHA512
  sha512_hash = sha512("hello")
  
  # HMAC (keyed-hash)
  hmac_hash = hmac("sha256", "message", "secret")
  
  # UUID
  uuid_result = uuid()        # Random UUID v4
  uuid_v5     = uuidv5("dns", "example.com")  # UUID v5 based on namespace + data
  
  # Base64 SHA
  b64sha256 = base64sha256("hello")
  b64sha512 = base64sha512("hello")
}
```

---

## 9.2 Advanced Conditional Patterns

### Multi-Condition Logic

```hcl
variable "environment" {}
variable "instance_count" {}

locals {
  # Complex conditional logic
  config = {
    # Production defaults
    prod = {
      instance_type  = "t3.large"
      min_size      = 3
      max_size      = 20
      multi_az      = true
      monitoring    = true
    }
    # Staging defaults
    staging = {
      instance_type = "t3.medium"
      min_size     = 1
      max_size     = 5
      multi_az     = false
      monitoring   = true
    }
    # Default for everything else
    default = {
      instance_type = "t2.micro"
      min_size     = 1
      max_size     = 3
      multi_az     = false
      monitoring   = false
    }
  }
  
  env_config = lookup(local.config, var.environment, local.config.default)
}

resource "aws_autoscaling_group" "app" {
  min_size         = local.env_config.min_size
  max_size         = local.env_config.max_size
  desired_capacity = local.env_config.min_size
}
```

### Null Checks and Defaults

```hcl
variable "optional_config" {
  type = object({
    instance_type = optional(string)
    volume_size   = optional(number)
    ami_id        = optional(string)
  })
  default = null  # Entire variable is optional
}

locals {
  # Handle null with defaults
  instance_type = try(var.optional_config.instance_type, "t2.micro")
  volume_size   = try(var.optional_config.volume_size, 20)
  ami_id        = try(var.optional_config.ami_id, data.aws_ami.default.id)
  
  # Alternative: coalesce
  instance_type2 = coalesce(
    try(var.optional_config.instance_type, null),
    "t2.micro"
  )
}
```

---

## 9.3 For Expressions - Advanced Patterns

### For expressions with collections

```hcl
locals {
  # List transformations
  numbers = [1, 2, 3, 4, 5]
  
  # Transform each element
  doubled = [for n in local.numbers : n * 2]  # [2, 4, 6, 8, 10]
  
  # Filter and transform
  even_doubled = [for n in local.numbers : n * 2 if n % 2 == 0]  # [4, 8]
  
  # Map transformations
  name_map = {
    alice = { age = 30, role = "admin" }
    bob   = { age = 25, role = "user" }
    carol = { age = 35, role = "admin" }
  }
  
  # Transform map values
  roles_only = { for k, v in local.name_map : k => v.role }
  # { alice = "admin", bob = "user", carol = "admin" }
  
  # Filter map by value
  admins = { for k, v in local.name_map : k => v if v.role == "admin" }
  # { alice = {...}, carol = {...} }
  
  # Transform values while keeping keys
  names_upper = { for k, v in local.name_map : k => merge(v, { name = upper(k) }) }
  
  # Nested for expressions
  matrix = [[1, 2], [3, 4], [5, 6]]
  flattened_sum = [for row in local.matrix : sum(row)]  # [3, 7, 11]
  
  # For expressions with element index
  indexed = [for i, v in ["a", "b", "c"] : "${i}: ${v}"]
  # ["0: a", "1: b", "2: c"]
}
```

### Practical Example: Security Group Rules from Config

```hcl
locals {
  # Complex security rules
  security_rules = [
    { type = "ingress", port = 80,   cidr = "0.0.0.0/0",         desc = "HTTP" },
    { type = "ingress", port = 443,  cidr = "0.0.0.0/0",         desc = "HTTPS" },
    { type = "ingress", port = 22,   cidr = "10.0.0.0/8",        desc = "SSH internal" },
    { type = "egress",  port = 0,    cidr = "0.0.0.0/0",         desc = "All outbound" },
  ]
  
  # Create dynamic security group rules
  ingress_rules = [for rule in local.security_rules : rule if rule.type == "ingress"]
  egress_rules  = [for rule in local.security_rules : rule if rule.type == "egress"]
}
```

---

## 9.4 Dynamic Blocks - Advanced Patterns

### Conditional Dynamic Blocks

```hcl
variable "create_eip" {
  type    = bool
  default = false
}

variable "ebs_volumes" {
  type = list(object({
    device_name = string
    size        = number
    type        = string
    encrypted   = bool
  }))
  default = []
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  # Conditional EBS block device
  dynamic "ebs_block_device" {
    for_each = var.ebs_volumes
    content {
      device_name = ebs_block_device.value.device_name
      volume_size = ebs_block_device.value.size
      volume_type = ebs_block_device.value.type
      encrypted   = ebs_block_device.value.encrypted
    }
  }
}

# Conditional resource creation with dynamic block on EIP
resource "aws_eip" "web" {
  count    = var.create_eip ? 1 : 0
  instance = aws_instance.web.id
  domain   = "vpc"
}
```

### Nested Dynamic Blocks

```hcl
variable "listener_rules" {
  type = list(object({
    port        = number
    protocol    = string
    actions     = list(object({
      type             = string
      target_group_arn = optional(string)
      redirect_config  = optional(object({
        status_code = string
        protocol    = optional(string)
        port        = optional(string)
        host        = optional(string)
        path        = optional(string)
        query       = optional(string)
      }))
    }))
  }))
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = var.listener_rules[0].port
  protocol          = var.listener_rules[0].protocol

  dynamic "default_action" {
    for_each = var.listener_rules[0].actions
    content {
      type = default_action.value.type
      
      dynamic "redirect" {
        for_each = default_action.value.redirect_config != null ? [default_action.value.redirect_config] : []
        content {
          status_code = redirect.value.status_code
          protocol    = try(redirect.value.protocol, null)
          port        = try(redirect.value.port, null)
          host        = try(redirect.value.host, null)
          path        = try(redirect.value.path, null)
          query       = try(redirect.value.query, null)
        }
      }
      
      dynamic "forward" {
        for_each = default_action.value.target_group_arn != null ? [1] : []
        content {
          target_group_arn = default_action.value.target_group_arn
        }
      }
    }
  }
}
```

---

## 9.5 try and can Functions

### try() — Graceful Error Handling

```hcl
locals {
  # try attempts each expression, returns first successful result
  result1 = try(local.nonexistent, "default_value")  # "default_value"
  
  # Can chain multiple expressions
  result2 = try(
    var.config.option_a,
    var.config.option_b,
    "ultimate_default"
  )
  
  # Common use: handling missing attributes
  instance_profile = try(
    aws_iam_instance_profile.this.arn,
    null
  )
}

# Using try for resource attribute access
output "instance_ip" {
  value = try(
    aws_eip.web[0].public_ip,           # Try EIP first
    aws_instance.web.public_ip,         # Fall back to instance IP
    "No IP assigned"                    # Ultimate fallback
  )
}
```

### can() — Test if Expression Succeeds

```hcl
locals {
  can_access = can(aws_instance.web.public_ip)  # true or false
}

variable "should_create_extra_disk" {
  type    = bool
  default = false
}

# Using can for validation
variable "vpc_id" {
  type = string
  
  validation {
    condition = can(regex("^vpc-", var.vpc_id))
    error_message = "VPC ID must start with 'vpc-'."
  }
}
```

---

## 9.6 Type Conversion Functions

```hcl
locals {
  # String conversions
  to_string  = tostring(42)              # "42"
  to_string2 = tostring(true)            # "true"
  
  # Number conversions
  to_number  = tonumber("42")             # 42
  to_number2 = tonumber("3.14")           # 3.14
  to_number3 = tonumber("not_a_number")   # null (doesn't error)
  
  # Boolean conversions
  to_bool_true  = tobool("true")          # true
  to_bool_false = tobool("false")         # false
  
  # List/list conversions
  list_any  = tolist(["a", "b", "c"])     # list(any)
  set_any   = toset(["a", "b", "b", "c"]) # ["a", "b", "c"] (duplicates removed)
  map_any   = tomap({a = 1, b = 2})       # map(any)
  
  # Set to list
  set_to_list = tolist(toset([3, 1, 2]))  # [1, 2, 3] (sorted)
}
```

---

## 9.7 Splat Expressions - The "Any" Splat

```hcl
resource "aws_instance" "web" {
  count = 3
  
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "web-${count.index}"
  }
}

locals {
  # The "any" splat (recommended) — resource[*].attribute
  instance_ids = aws_instance.web[*].id          # ["i-...", "i-...", "i-..."]
  public_ips   = aws_instance.web[*].public_ip    # ["54...", "55...", "56..."]
  private_ips  = aws_instance.web[*].private_ip   # ["10.0.1.5", ...]
  
  # Legacy splat (older syntax)
  legacy_ids = aws_instance.web.*.id  # Same result, less Type-safe
}

# Splat with single resource (wraps in list)
resource "aws_instance" "single" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

locals {
  # Single resource with splat always returns a list
  single_splat = aws_instance.single[*].id  # ["i-..."] (list with one element)
  
  # Without splat returns the value directly
  single_direct = aws_instance.single.id     # "i-..." (string)
}
```

---

## 9.8 Complete Practical Example

```hcl
# Complete example showing advanced functions and expressions

locals {
  # Environment configuration
  env_config = {
    dev  = { instance_type = "t2.nano",    count = 1, volume = 10 }
    stg  = { instance_type = "t2.medium",  count = 2, volume = 30 }
    prod = { instance_type = "t3.large",   count = 4, volume = 50 }
  }
  
  current_env = lookup(local.env_config, var.environment, local.env_config.dev)
  
  # CIDR calculations
  vpc_cidr = cidrsubnet("10.0.0.0/8", 8, var.az_index)
  
  public_subnets = [
    for i in range(var.az_count) :
    cidrsubnet(local.vpc_cidr, 4, i)
  ]
  
  private_subnets = [
    for i in range(var.az_count) :
    cidrsubnet(local.vpc_cidr, 4, i + var.az_count)
  ]
  
  # Tags
  common_tags = merge({
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Role        = "web-server"
  }, var.extra_tags)
  
  # Dynamic ingress rules from variable
  ingress_rules = [
    for port, config in var.ingress_ports : {
      port       = port
      protocol   = config.protocol
      cidr_blocks = config.cidr_blocks
      description = config.description
    }
  ]
  
  # # DNS records from list
  # dns_records = {
  #   for record in var.dns_records :
  #   trimprefix(record.name, ".") => record
  # }
  
  # File-based config
  user_data_script = try(
    file("${path.module}/userdata/${var.environment}.sh"),
    file("${path.module}/userdata/default.sh")
  )
}

resource "aws_instance" "web" {
  for_each = toset(["web-a", "web-b", "web-c"])
  
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = local.current_env.instance_type
  subnet_id     = element(aws_subnet.public[*].id, index(["web-a", "web-b", "web-c"], each.key))
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.environment}-${each.key}"
  })
}

output "instance_info" {
  value = {
    for k, v in aws_instance.web : k => {
      id         = v.id
      public_ip  = v.public_ip
      private_ip = v.private_ip
      az         = v.availability_zone
    }
  }
}
```

---

## 📝 Exam Tips

1. **`try()`** returns first successful expression, provides graceful fallback
2. **`can()`** returns true if expression succeeds, false otherwise
3. **`lookup(map, key, default)`** safely accesses map keys with default
4. **`cidrsubnet(prefix, bits, netnum)`** calculates subnet CIDR blocks
5. **`file(path)`** reads file contents (useful for user data, policies)
6. **`templatefile(path, vars)`** renders template files with variables
7. **For expressions** can transform, filter, and create collections
8. **Splat expressions** (`resource[*].attr`) extract attributes from lists
9. **`merge(map1, map2)`** combines maps (later values override)
10. **Dynamic blocks** create repeatable nested blocks

---

## ✅ Chapter 9 Quiz

1. **What does `lookup({a = 1, b = 2}, "c", 0)` return?**
   - a) 1
   - b) 2
   - c) 0
   - d) null

2. **Which function tests if an expression would succeed?**
   - a) `try()`
   - b) `can()`
   - c) `check()`
   - d) `validate()`

3. **What does the expression `[for s in ["a", "bb", "ccc"] : length(s)]` return?**
   - a) `["a", "bb", "ccc"]`
   - b) `[1, 2, 3]`
   - c) `["1", "2", "3"]`
   - d) `[3, 2, 1]`

4. **True or False:** `merge({a = 1}, {a = 2})` results in `{a = 1, a = 2}`.

5. **What does `cidrsubnet("10.0.0.0/16", 8, 0)` return?**
   - a) `"10.0.0.0/24"`
   - b) `"10.0.0.0/16"`
   - c) `"10.0.0.0/8"`
   - d) `"10.0.1.0/24"`

<details>
<summary>📌 Answers</summary>

1. **c** — `lookup` uses the default value (0) when the key doesn't exist
2. **b** — `can()` returns true/false if an expression succeeds
3. **b** — Returns the length of each string: `[1, 2, 3]`
4. **False** — `merge` overrides duplicate keys; result is `{a = 2}`
5. **a** — Creates a /24 subnet (adding 8 bits), first subnet
</details>

---

*Continue to → <a href="{{< relref "10-provisioners" >}}">Chapter 10: Provisioners & Side Effects</a>*

---
title: "Hands-On Labs"
weight: 20
chapter: true
---

# Hands-On Labs 🛠️

> **Practice makes perfect!** These labs take you from basic to advanced Terraform skills.

## Lab Progression

| Lab | Topic | Difficulty | Time |
|-----|-------|------------|------|
| 01 | Deploy an EC2 Instance | ⭐ Beginner | 15 min |
| 02 | VPC with Public/Private Subnets | ⭐ Beginner | 20 min |
| 03 | Reusable VPC Module | ⭐⭐ Intermediate | 25 min |
| 04 | Multi-Environment with Workspaces | ⭐⭐ Intermediate | 30 min |
| 05 | Remote State with S3 + DynamoDB | ⭐⭐⭐ Advanced | 20 min |
| 06 | Production 3-Tier Web Architecture | ⭐⭐⭐ Advanced | 45 min |
| 07 | Serverless REST API (Lambda + API Gateway + DynamoDB) | ⭐⭐⭐ Advanced | 30 min |
| 08 | ECS Fargate Container with Auto Scaling | ⭐⭐⭐ Advanced | 35 min |
| 09 | EKS Kubernetes Cluster | ⭐⭐⭐⭐ Expert | 40 min |
| 10 | S3 + CloudFront Static Website with WAF | ⭐⭐ Intermediate | 25 min |

---

## Lab 01: Deploy an EC2 Instance

### Prerequisites
- Terraform installed
- AWS CLI configured
- AWS credentials with EC2 permissions

### Objectives
- Write your first Terraform configuration
- Use data sources to find an AMI
- Create a security group and EC2 instance
- Understand outputs

### Steps

```hcl
# Step 1: Create main.tf
provider "aws" {
  region = "us-east-1"
}

# Step 2: Find the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Step 3: Create a security group
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow HTTP and SSH"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Step 4: Create the EC2 instance
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y httpd
    systemctl enable httpd
    systemctl start httpd
    echo "<h1>Hello from Terraform Lab 01</h1>" > /var/www/html/index.html
  EOF

  tags = {
    Name = "Terraform-Lab-01"
  }
}

# Step 5: Create outputs
output "instance_id" {
  value = aws_instance.web.id
}

output "public_ip" {
  value = aws_instance.web.public_ip
}
```

### Commands

```bash
# Initialize
terraform init

# Plan
terraform plan

# Apply (type 'yes' when prompted)
terraform apply

# Test: Open http://<public_ip> in browser

# Destroy when done
terraform destroy
```

### Validation
- Run `terraform state list` — should show resources
- Visit `http://<public_ip>` — should see "Hello from Terraform Lab 01"

---

## Lab 02: VPC with Public/Private Subnets

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "Lab-02-VPC" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "Lab-02-IGW" }
}

resource "aws_subnet" "public" {
  count = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "Lab-02-Public-${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "Lab-02-Private-${count.index + 1}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "Lab-02-Public-RT" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

### Challenges
1. Add a NAT Gateway for private subnets
2. Add a private route table with NAT Gateway
3. Deploy an EC2 instance in the private subnet

---

## Lab 03: Reusable VPC Module

### Module Structure
```
modules/
└── vpc/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── README.md
```

```hcl
# modules/vpc/variables.tf
variable "name" {
  description = "Name prefix for resources"
  type        = string
}

variable "cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "azs" {
  description = "Availability Zones"
  type        = list(string)
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
```

```hcl
# modules/vpc/main.tf
locals {
  az_count = length(var.azs)
}

resource "aws_vpc" "this" {
  cidr_block           = var.cidr
  enable_dns_hostnames = true
  tags = merge(var.tags, { Name = "${var.name}-vpc" })
}

resource "aws_subnet" "public" {
  count = local.az_count
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.cidr, 8, count.index)
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true
  tags = merge(var.tags, { Name = "${var.name}-public-${count.index + 1}" })
}

resource "aws_subnet" "private" {
  count = local.az_count
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.cidr, 8, count.index + local.az_count)
  availability_zone = var.azs[count.index]
  tags = merge(var.tags, { Name = "${var.name}-private-${count.index + 1}" })
}
```

```hcl
# modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}
```

---

## Lab 04: Multi-Environment with Workspaces

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-123456789012"
    key            = "workspace-lab/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# main.tf
locals {
  config = {
    default = { instance_type = "t2.micro", count = 1 }
    dev     = { instance_type = "t2.nano",   count = 1 }
    staging = { instance_type = "t2.small",  count = 2 }
    prod    = { instance_type = "t3.medium", count = 3 }
  }
  env_config = lookup(local.config, terraform.workspace, local.config.default)
}

resource "aws_instance" "web" {
  count = local.env_config.count
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = local.env_config.instance_type
  tags = {
    Name        = "webserver-${terraform.workspace}-${count.index + 1}"
    Environment = terraform.workspace
  }
}
```

### Commands

```bash
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod
terraform workspace select dev
terraform plan
terraform apply
```

---

## Lab 05: Remote State with S3 + DynamoDB

```hcl
# backend-infra/main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}

data "aws_caller_identity" "current" {}
```

---

## Lab 06: Production 3-Tier Web Architecture

Build a production-ready architecture:

```
                    ┌─────────────┐
                    │  Route 53   │
                    └──────┬──────┘
                    ┌──────▼──────┐
                    │  CloudFront  │
                    └──────┬──────┘
                    ┌──────▼──────┐
                    │    ALB       │
                    └──────┬──────┘
              ┌────────────┼────────────┐
        ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐
        │  ASG Web   │ │ ASG App│ │  ASG App  │
        └───────────┘ └────────┘ └──────────┘
                            │
                    ┌───────▼───────┐
                    │     RDS        │
                    └───────────────┘
```

### Key Components
- **Networking**: VPC with public/private subnets across 3 AZs
- **Web Tier**: Auto-scaling group with ALB in public subnets
- **App Tier**: Auto-scaling group in private subnets
- **Database**: RDS PostgreSQL in private subnets with Multi-AZ
- **Security**: Security groups with least privilege
- **Monitoring**: CloudWatch alarms and dashboards

> See [examples directory]({{< relref "/examples" >}}) for the full implementation.

---

## Lab 07: Serverless REST API (Lambda + API Gateway + DynamoDB)

### Prerequisites
- Terraform installed
- AWS CLI configured
- AWS credentials with Lambda, API Gateway, DynamoDB, IAM, and CloudWatch permissions

### Objectives
- Deploy a DynamoDB table with Global Secondary Index
- Create an IAM role and Lambda function (Node.js 20)
- Set up API Gateway REST API with CRUD endpoints
- Configure CloudWatch monitoring dashboard
- Test the full serverless stack

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  API Gateway  │────▶│   Lambda      │────▶│  DynamoDB    │
│  (REST API)   │     │  (Node.js)   │     │  (Items)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Steps

**Step 1: Create the main configuration**

Create `main.tf` with the serverless infrastructure. See the full example at [examples/serverless-api]({{< relref "/examples/serverless-api" >}}), or build it step by step:

```hcl
# providers.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Random suffix for unique names
resource "random_id" "suffix" {
  byte_length = 4
}
```

**Step 2: Create DynamoDB table**

```hcl
# dynamodb.tf
resource "aws_dynamodb_table" "items" {
  name         = "serverless-lab-items"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  server_side_encryption {
    enabled = true
  }

  tags = { Name = "serverless-lab-items" }
}
```

**Step 3: Create Lambda function**

Create the Lambda IAM role, zip up the inline Node.js code, and deploy the function:

```hcl
# lambda.tf
resource "aws_iam_role" "lambda" {
  name = "serverless-lab-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "serverless-lab-lambda-dynamodb"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:GetItem","dynamodb:PutItem","dynamodb:DeleteItem","dynamodb:Scan"]
        Resource = aws_dynamodb_table.items.arn
      },
      {
        Effect = "Allow"
        Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"]
        Resource = "*"
      }
    ]
  })
}

# Inline Lambda code (AWS SDK v2 is pre-installed in Lambda runtime)
data "archive_file" "lambda" {
  type        = "zip"
  output_path = "${path.module}/lambda.zip"
  source {
    content  = <<-EOF
const AWS = require('aws-sdk');
const crypto = require('crypto');
const docClient = new AWS.DynamoDB.DocumentClient({});
const TABLE_NAME = process.env.TABLE_NAME;
exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.path;
    if (method === 'GET' && path === '/items') {
      const result = await docClient.scan({ TableName: TABLE_NAME }).promise();
      return respond(200, result.Items);
    }
    if (method === 'GET' && path.startsWith('/items/')) {
      const id = path.split('/')[2];
      const result = await docClient.get({ TableName: TABLE_NAME, Key: { id } }).promise();
      if (!result.Item) return respond(404, { error: 'Not found' });
      return respond(200, result.Item);
    }
    if (method === 'POST' && path === '/items') {
      const body = JSON.parse(event.body);
      const item = { id: crypto.randomUUID(), ...body, created_at: new Date().toISOString() };
      await docClient.put({ TableName: TABLE_NAME, Item: item }).promise();
      return respond(201, item);
    }
    if (method === 'DELETE' && path.startsWith('/items/')) {
      const id = path.split('/')[2];
      await docClient.delete({ TableName: TABLE_NAME, Key: { id } }).promise();
      return respond(200, { message: 'Deleted' });
    }
    return respond(400, { error: 'Unsupported route' });
  } catch (err) {
    console.error(err);
    return respond(500, { error: 'Internal error' });
  }
};
function respond(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) };
}
EOF
    filename = "index.js"
  }
}

resource "aws_lambda_function" "api" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "serverless-lab-api"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      TABLE_NAME  = aws_dynamodb_table.items.name
      ENVIRONMENT = "lab"
    }
  }
  tags = { Name = "serverless-lab-api" }
}
```

**Step 4: Add API Gateway**

```hcl
# api-gateway.tf
resource "aws_api_gateway_rest_api" "api" {
  name = "serverless-lab-api"
  endpoint_configuration { types = ["REGIONAL"] }
}

resource "aws_api_gateway_resource" "items" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "items"
}

resource "aws_api_gateway_resource" "item" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.items.id
  path_part   = "{id}"
}

# Methods and integrations
locals {
  methods = {
    list_items   = { resource_id = aws_api_gateway_resource.items.id, http_method = "GET" }
    create_item  = { resource_id = aws_api_gateway_resource.items.id, http_method = "POST" }
    get_item     = { resource_id = aws_api_gateway_resource.item.id,  http_method = "GET" }
    delete_item  = { resource_id = aws_api_gateway_resource.item.id,  http_method = "DELETE" }
  }
}

resource "aws_api_gateway_method" "this" {
  for_each = local.methods
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = each.value.resource_id
  http_method   = each.value.http_method
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "this" {
  for_each = local.methods
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = each.value.resource_id
  http_method = each.value.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri  = aws_lambda_function.api.invoke_arn
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# Deploy the API
resource "aws_api_gateway_deployment" "api" {
  depends_on  = [aws_api_gateway_integration.this]
  rest_api_id = aws_api_gateway_rest_api.api.id
  triggers = {
    redeployment = sha1(jsonencode([aws_api_gateway_resource.items.id, aws_api_gateway_resource.item.id]))
  }
  lifecycle { create_before_destroy = true }
}

resource "aws_api_gateway_stage" "api" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = "dev"
}
```

### Commands

```bash
# Initialize
terraform init

# Plan
terraform plan

# Deploy everything
terraform apply

# Test the API (copy endpoint from output)
curl -X POST <api_endpoint> \
  -H "Content-Type: application/json" \
  -d '{"name":"lab-test","description":"Hello from Lab 07!"}'

# List items
curl <api_endpoint>

# Check CloudWatch Dashboard (from output)

# Destroy when done
terraform destroy
```

### Validation
- `terraform state list` shows all created resources
- `POST /items` returns a 201 with the created item
- `GET /items` returns the list of items
- CloudWatch dashboard is accessible via the output URL

### Challenges
1. Add a `PUT /items/{id}` method for updating items
2. Add a Global Secondary Index on `created_at` for sorting
3. Add API Gateway usage plan and API key for authentication
4. Add Lambda environment variables for stage-aware configuration

---

## Lab 08: ECS Fargate Container with Auto Scaling

### Prerequisites
- Terraform installed
- AWS CLI configured
- AWS credentials with ECS, EC2, VPC, ELB, and IAM permissions

### Objectives
- Deploy a VPC with public/private subnets and NAT Gateway
- Create an ECS Fargate cluster with Container Insights
- Deploy an NGINX container behind an Application Load Balancer
- Configure CPU-based auto scaling
- View centralized CloudWatch logs

### Architecture

```
┌──────────┐     ┌──────────┐     ┌─────────────────┐
│    ALB    │────▶│  ECS      │────▶│  Fargate Tasks   │
│ (Public)  │     │  Service  │     │  (Private Subnet)│
└──────────┘     └──────────┘     └─────────────────┘
                      │                      │
                      ▼                      ▼
              ┌──────────────┐     ┌─────────────────┐
              │  Auto Scaling │     │  CloudWatch Logs │
              │  (CPU-based)  │     │  (/ecs/fargate) │
              └──────────────┘     └─────────────────┘
```

### Steps

**Step 1: Create VPC networking**

```hcl
# networking.tf
data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "fargate-lab-vpc" }
}

resource "aws_subnet" "public" {
  count = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "fargate-lab-public-${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 2)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "fargate-lab-private-${count.index + 1}" }
}
```

Add an Internet Gateway, NAT Gateway, Elastic IP, and route tables for both public and private subnets.

**Step 2: Create the ECS cluster**

```hcl
# ecs.tf
resource "aws_ecs_cluster" "main" {
  name = "fargate-lab-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/fargate-lab"
  retention_in_days = 7
}
```

**Step 3: Create ALB and ECS service**

Create the Application Load Balancer, target group, listener, security groups, task definition, and ECS service. See [examples/ecs-fargate]({{< relref "/examples/ecs-fargate" >}}) for the complete configuration.

**Step 4: Add auto scaling**

```hcl
# autoscaling.tf
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = 4
  min_capacity       = 1
  resource_id        = "service/fargate-lab-cluster/fargate-lab-service"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "fargate-lab-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 75
  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = "fargate-lab-service"
  }
  alarm_actions = [aws_appautoscaling_policy.cpu_up.arn]
}
```

### Commands

```bash
# Initialize and deploy
terraform init
terraform apply

# Get the ALB URL
open http://$(terraform output -raw alb_dns_name)

# View container logs
aws logs tail /ecs/fargate-lab --follow

# Force a new deployment
aws ecs update-service --cluster fargate-lab-cluster \
  --service fargate-lab-service --force-new-deployment

# Simulate CPU load to trigger scaling
# (exec into a container and run: stress --cpu 1 --timeout 120)

# Destroy
terraform destroy
```

### Validation
- Visit the ALB DNS name in browser — shows NGINX welcome page
- `terraform state list` shows VPC, subnets, ALB, ECS cluster, service, task definition
- CloudWatch log group has streaming logs
- Auto scaling triggers when CPU exceeds 75%

### Challenges
1. Change the container image to your own custom Docker image
2. Add a second container to the task definition (sidecar pattern)
3. Implement blue-green deployment with separate target groups
4. Add an Application Auto Scaling scheduled action to scale down at night

---

## Lab 09: EKS Kubernetes Cluster

### Prerequisites
- Terraform installed
- AWS CLI configured (with EKS, EC2, IAM, KMS permissions)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- [aws-iam-authenticator](https://docs.aws.amazon.com/eks/latest/userguide/install-aws-iam-authenticator.html) or use `aws eks get-token` (built into AWS CLI v2)

### Objectives
- Deploy a VPC with EKS-required tagging
- Create an EKS cluster with KMS secrets encryption
- Deploy a managed node group (Spot instances for cost savings)
- Install EKS add-ons (VPC CNI, CoreDNS, kube-proxy, EBS CSI)
- Deploy a sample NGINX application via Kubernetes provider

### Architecture

```
┌─────────────────────────────┐
│     EKS Control Plane        │
│  (Multi-AZ, AWS-managed)    │
├─────────────────────────────┤
│   Managed Node Group (Spot)  │──▶ t3.medium × 2
│      private subnets         │──▶ t3.medium × 2
├─────────────────────────────┤
│   Add-ons:                   │
│   • VPC CNI (networking)    │
│   • CoreDNS (DNS)           │
│   • kube-proxy (services)   │
│   • EBS CSI (volumes)       │
├─────────────────────────────┤
│   Sample: nginx deployment   │
│   + ClusterIP service        │
└─────────────────────────────┘
```

### Steps

**Step 1: Create VPC with EKS tagging**

```hcl
# vpc.tf
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.0"

  name = "eks-lab-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_dns_hostnames = true

  # Required EKS tags for subnet discovery
  private_subnet_tags = {
    "kubernetes.io/cluster/eks-lab" = "shared"
    "kubernetes.io/role/internal-elb" = "1"
  }
  public_subnet_tags = {
    "kubernetes.io/cluster/eks-lab" = "shared"
    "kubernetes.io/role/elb" = "1"
  }
}
```

**Step 2: Create EKS cluster IAM role and KMS key**

```hcl
# iam.tf
resource "aws_iam_role" "eks_cluster" {
  name = "eks-lab-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# kms.tf — Encryption key for Kubernetes secrets
resource "aws_kms_key" "eks" {
  description             = "EKS Secrets Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}
```

**Step 3: Create the EKS cluster**

```hcl
# eks.tf
resource "aws_eks_cluster" "main" {
  name     = "eks-lab"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = module.vpc.private_subnets
    endpoint_public_access  = true
  }

  encryption_config {
    provider { key_arn = aws_kms_key.eks.arn }
    resources = ["secrets"]
  }

  enabled_cluster_log_types = ["api", "audit"]
}
```

**Step 4: Add node group and add-ons**

Create a node IAM role, managed node group (with Spot instances), and install EKS add-ons. See [examples/eks-cluster]({{< relref "/examples/eks-cluster" >}}) for the complete configuration.

### Commands

```bash
# Deploy the cluster (takes 10-15 minutes)
terraform init
terraform apply

# Configure kubectl
aws eks update-kubeconfig --name eks-lab --region us-east-1

# Verify cluster access
kubectl get nodes
kubectl cluster-info

# Deploy a test app
kubectl create deployment nginx --image=nginx --replicas=2
kubectl expose deployment nginx --port=80 --type=LoadBalancer
kubectl get svc -w

# Check logs
kubectl logs -l app=nginx

# Destroy (this will take a while)
terraform destroy
```

### Validation
- `kubectl get nodes` shows 2+ nodes in Ready state
- `kubectl get pods -A` shows system pods (CoreDNS, kube-proxy, VPC CNI)
- A sample nginx deployment runs successfully
- `terraform state list` shows all EKS resources
- EBS CSI driver is functional (create a PVC to test)

### Challenges
1. Create a Kubernetes Namespace, Deployment, and Service using `kubernetes_` provider resources
2. Install an Ingress Controller (NGINX or AWS LB Controller) via Helm
3. Add Cluster Autoscaler to automatically add/remove nodes
4. Set up Horizontal Pod Autoscaler based on CPU/memory

---

## Lab 10: S3 + CloudFront Static Website with WAF

### Prerequisites
- Terraform installed
- AWS CLI configured
- AWS credentials with S3, CloudFront, WAF, and IAM permissions

### Objectives
- Create a private S3 bucket with server-side encryption
- Configure CloudFront with Origin Access Control (OAC)
- Set up WAF with rate limiting and managed security rules
- Upload sample website content
- Test global content delivery via CloudFront

### Architecture

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  S3 Bucket │◀────│  CloudFront   │◀────│  Browser  │
│  (Origin)  │     │  (CDN + WAF) │     │  (Global) │
└──────────┘     └──────┬───────┘     └──────────┘
                        │
                        ▼
                ┌──────────────┐
                │  WAF Web ACL  │
                │  (Rate Limit  │
                │   + Security) │
                └──────────────┘
```

### Steps

**Step 1: Create the S3 bucket with security controls**

```hcl
# s3.tf
resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "site" {
  bucket = "static-site-lab-${random_id.suffix.hex}"
  tags = { Name = "static-site-lab" }
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Enable versioning
resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration { status = "Enabled" }
}
```

**Step 2: Upload sample website content**

```hcl
# content.tf
resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.site.bucket
  key          = "index.html"
  content_type = "text/html"
  content = <<-HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lab 10 - Static Site</title>
    <style>
        body { font-family: sans-serif; display: flex;
               justify-content: center; align-items: center;
               min-height: 100vh; margin: 0;
               background: linear-gradient(135deg, #667eea, #764ba2);
               color: white; text-align: center; }
        h1 { font-size: 3rem; }
        .badge { background: rgba(255,255,255,0.2); padding: 0.5rem 1.5rem;
                 border-radius: 50px; display: inline-block; margin-top: 1rem; }
    </style>
</head>
<body>
    <div>
        <h1>🚀 Lab 10 Complete!</h1>
        <p>Static site deployed with S3 + CloudFront</p>
        <div class="badge">✅ HTTPS • WAF Protected • Edge Cached</div>
    </div>
</body>
</html>
HTML
}

resource "aws_s3_object" "error_html" {
  bucket       = aws_s3_bucket.site.bucket
  key          = "error.html"
  content_type = "text/html"
  content = <<-HTML
<!DOCTYPE html>
<html><head><title>404</title>
<style>body{font-family:sans-serif;text-align:center;padding:50px}
h1{font-size:5rem;color:#e94560}</style></head>
<body><h1>404</h1><p>Page not found</p><a href="/">Go Home</a></body></html>
HTML
}
```

**Step 3: Create CloudFront OAC and distribution**

```hcl
# cloudfront.tf
resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "static-site-lab-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.site.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.site.id}"
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl  = 0
    default_ttl = 3600
    max_ttl    = 86400
    compress   = true
  }

  # S3 bucket policy (allows only CloudFront)
  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  custom_error_response {
    error_code         = 403
    response_code      = 404
    response_page_path = "/error.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/error.html"
  }
}
```

**Step 4: Add S3 bucket policy for CloudFront access**

Add a bucket policy that only allows CloudFront to read objects. See [examples/s3-cloudfront-website]({{< relref "/examples/s3-cloudfront-website" >}}) for the complete WAF configuration.

### Commands

```bash
# Initialize and deploy
terraform init
terraform apply

# Get the CloudFront URL
open https://$(terraform output -raw cloudfront_domain)

# Check HTTP headers (verify caching)
curl -I https://$(terraform output -raw cloudfront_domain)

# Upload updated content
aws s3 cp my-updated-index.html s3://$(terraform output -raw s3_bucket_name)/index.html

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"

# Destroy
terraform destroy
```

### Validation
- Visit the CloudFront URL — shows the sample website with styling
- `curl -I` shows `x-cache: Hit from cloudfront` after first request
- S3 bucket returns `403 Forbidden` when accessed directly (no public access)
- WAF is active (trigger by sending many rapid requests)
- `terraform state list` shows S3 bucket, CloudFront distribution, WAF ACL

### Challenges
1. Add a custom domain with Route53 and ACM SSL certificate
2. Configure S3 lifecycle rules to expire old object versions
3. Add WAF rate limiting and IP allow/block lists
4. Set up a CI/CD pipeline with S3 sync and CloudFront invalidation

---

> 🎉 **Congratulations!** You've completed all 10 labs. You're now ready to tackle real-world Terraform scenarios. Check the [Examples]({{< relref "/examples" >}}) section for more advanced patterns and the [Interview Questions]({{< relref "/docs/16-interview-questions" >}}) chapter for certification prep.
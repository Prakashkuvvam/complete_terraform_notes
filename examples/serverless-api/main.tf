# Serverless API Example
# Serverless REST API with Lambda + API Gateway + DynamoDB

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
  region = var.region
}

# Variables
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "serverless-api"
}

# Random suffix for globally unique names
resource "random_id" "suffix" {
  byte_length = 4
}

# ──────────────────────────────────────────────
# DynamoDB Table
# ──────────────────────────────────────────────

resource "aws_dynamodb_table" "items" {
  name         = "${var.project_name}-${var.environment}-items"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  global_secondary_index {
    name            = "CreatedAtIndex"
    hash_key        = "created_at"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = var.environment == "prod"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-items"
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────
# Lambda IAM Role
# ──────────────────────────────────────────────

resource "aws_iam_role" "lambda" {
  name = "${var.project_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-${var.environment}-lambda-dynamodb"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query",
        ]
        Resource = aws_dynamodb_table.items.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "*"
      }
    ]
  })
}

# ──────────────────────────────────────────────
# Lambda Function
# ──────────────────────────────────────────────

resource "aws_lambda_function" "api" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "${var.project_name}-${var.environment}-api"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.items.name
      ENVIRONMENT = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-api"
    Environment = var.environment
  }
}

# Lambda source code archive
data "archive_file" "lambda" {
  type        = "zip"
  output_path = "${path.module}/lambda.zip"

  source {
    content  = <<-EOF
// Using AWS SDK v2 (pre-installed in Lambda runtime)
const AWS = require('aws-sdk');
const crypto = require('crypto');

const docClient = new AWS.DynamoDB.DocumentClient({});
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.path;

    // GET /items - List all items
    if (method === 'GET' && path === '/items') {
      const result = await docClient.scan({ TableName: TABLE_NAME }).promise();
      return respond(200, result.Items);
    }

    // GET /items/{id} - Get single item
    if (method === 'GET' && path.startsWith('/items/')) {
      const id = path.split('/')[2];
      const result = await docClient.get({ TableName: TABLE_NAME, Key: { id } }).promise();
      if (!result.Item) return respond(404, { error: 'Item not found' });
      return respond(200, result.Item);
    }

    // POST /items - Create item
    if (method === 'POST' && path === '/items') {
      const body = JSON.parse(event.body);
      const item = {
        id: crypto.randomUUID(),
        ...body,
        created_at: new Date().toISOString(),
      };
      await docClient.put({ TableName: TABLE_NAME, Item: item }).promise();
      return respond(201, item);
    }

    // DELETE /items/{id} - Delete item
    if (method === 'DELETE' && path.startsWith('/items/')) {
      const id = path.split('/')[2];
      await docClient.delete({ TableName: TABLE_NAME, Key: { id } }).promise();
      return respond(200, { message: 'Deleted' });
    }

    return respond(400, { error: 'Unsupported route' });
  } catch (err) {
    console.error(err);
    return respond(500, { error: 'Internal server error' });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}
EOF
    filename = "index.js"
  }

  # Note: This uses AWS SDK v2 (aws-sdk) which is pre-installed in the Lambda
  # Node.js runtime. No additional dependencies need to be bundled.
  # For SDK v3, you would need to bundle dependencies with the zip.
}

# ──────────────────────────────────────────────
# API Gateway (REST API)
# ──────────────────────────────────────────────

resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}-${var.environment}-api"
  description = "Serverless REST API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Environment = var.environment
  }
}

# API Gateway Resources & Methods
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

# GET /items
resource "aws_api_gateway_method" "list_items" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.items.id
  http_method   = "GET"
  authorization = "NONE"
}

# POST /items
resource "aws_api_gateway_method" "create_item" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.items.id
  http_method   = "POST"
  authorization = "NONE"
}

# GET /items/{id}
resource "aws_api_gateway_method" "get_item" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.item.id
  http_method   = "GET"
  authorization = "NONE"
}

# DELETE /items/{id}
resource "aws_api_gateway_method" "delete_item" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.item.id
  http_method   = "DELETE"
  authorization = "NONE"
}

# Lambda Integration for each method
resource "aws_api_gateway_integration" "list_items" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.items.id
  http_method = aws_api_gateway_method.list_items.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

resource "aws_api_gateway_integration" "create_item" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.items.id
  http_method = aws_api_gateway_method.create_item.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

resource "aws_api_gateway_integration" "get_item" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.item.id
  http_method = aws_api_gateway_method.get_item.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

resource "aws_api_gateway_integration" "delete_item" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.item.id
  http_method = aws_api_gateway_method.delete_item.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# Deploy the API
resource "aws_api_gateway_deployment" "api" {
  depends_on = [
    aws_api_gateway_integration.list_items,
    aws_api_gateway_integration.create_item,
    aws_api_gateway_integration.get_item,
    aws_api_gateway_integration.delete_item,
  ]

  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.items.id,
      aws_api_gateway_resource.item.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "api" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = var.environment
}

# ──────────────────────────────────────────────
# CloudWatch Dashboard
# ──────────────────────────────────────────────

resource "aws_cloudwatch_dashboard" "api" {
  dashboard_name = "${var.project_name}-${var.environment}-api"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", { stat = "Sum" }],
            ["AWS/Lambda", "Errors",    { stat = "Sum" }],
            ["AWS/Lambda", "Duration",  { stat = "Average" }],
          ]
          period = 300
          stat   = "Average"
          region = var.region
          title  = "Lambda Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count",       { stat = "Sum" }],
            ["AWS/ApiGateway", "4XXError",    { stat = "Sum" }],
            ["AWS/ApiGateway", "5XXError",    { stat = "Sum" }],
            ["AWS/ApiGateway", "Latency",     { stat = "Average" }],
          ]
          period = 300
          region = var.region
          title  = "API Gateway Metrics"
        }
      }
    ]
  })
}

# ──────────────────────────────────────────────
# Outputs
# ──────────────────────────────────────────────

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = "${aws_api_gateway_stage.api.invoke_url}/items"
}

output "dynamodb_table" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.items.name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "dashboard_url" {
  description = "CloudWatch Dashboard URL"
  value       = "https://${var.region}.console.aws.amazon.com/cloudwatch/home?region=${var.region}#dashboards:name=${aws_cloudwatch_dashboard.api.dashboard_name}"
}

output "curl_test" {
  description = "Example curl commands to test the API"
  value = <<-EOT
    # Create an item
    curl -X POST ${aws_api_gateway_stage.api.invoke_url}/items \
      -H "Content-Type: application/json" \
      -d '{"name":"test-item","description":"My first item"}'

    # List all items
    curl ${aws_api_gateway_stage.api.invoke_url}/items

    # Get a single item (replace ID)
    curl ${aws_api_gateway_stage.api.invoke_url}/items/{id}

    # Delete an item (replace ID)
    curl -X DELETE ${aws_api_gateway_stage.api.invoke_url}/items/{id}
  EOT
}

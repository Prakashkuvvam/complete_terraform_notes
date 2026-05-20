---
title: "Serverless REST API"
weight: 30
---

# Serverless REST API Example ☁️

> **Deploy a fully serverless REST API using Lambda, API Gateway, and DynamoDB — with CloudWatch monitoring and dashboard.**

## Architecture

The diagram below shows the Terraform configuration files, their resource dependencies, and the outputs they produce:

{{< mermaid >}}
graph LR
    subgraph "Terraform Configuration Files"
        P["providers.tf<br/>AWS Provider"] --> R1["dynamodb.tf<br/>DynamoDB Table"]
        P --> R2["iam.tf<br/>IAM Role + Policy"]
        P --> R3["lambda.tf<br/>Lambda Function"]
        P --> R4["api-gateway.tf<br/>REST API"]
    end

    subgraph "Resource Dependencies"
        R2 -->|"role_arn"| R3
        R1 -->|"table_name"| R3
        R1 -->|"arn (for policy)"| R2
        R3 -->|"invoke_arn"| R4
        R3 -->|"function_name"| R5["Lambda Permission"]
        R4 --> R5
    end

    subgraph "Outputs"
        R4 --> O1["api_endpoint"]
        R3 --> O2["function_name"]
        R1 --> O3["dynamodb_table"]
    end

    style P fill:#e74c3c,color:#fff
    style R1 fill:#3498db,color:#fff
    style R2 fill:#9b59b6,color:#fff
    style R3 fill:#2ecc71,color:#fff
    style R4 fill:#f39c12,color:#fff
{{< /mermaid >}}

## Features

- **RESTful API** with CRUD operations (`GET`, `POST`, `DELETE`)
- **DynamoDB** with Global Secondary Index for querying by date
- **API Gateway** with regional endpoint and Lambda proxy integration
- **Lambda** with Node.js 20 runtime and AWS SDK v3
- **CloudWatch Dashboard** for monitoring API and Lambda metrics
- **Point-in-time recovery** enabled for production environments

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/items` | List all items |
| `GET` | `/items/{id}` | Get single item |
| `POST` | `/items` | Create a new item |
| `DELETE` | `/items/{id}` | Delete an item |

## Usage

```bash
# Initialize
terraform init

# Review the plan
terraform plan

# Deploy
terraform apply

# Test the API (copy the endpoint from outputs)
curl -X POST <api_endpoint> \
  -H "Content-Type: application/json" \
  -d '{"name":"test","description":"Hello from serverless!"}'

# List items
curl <api_endpoint>

# Clean up
terraform destroy
```

## Level

⭐⭐⭐⭐ Advanced — Serverless, Lambda, API Gateway

## Files

| File | Description |
|------|-------------|
| `main.tf` | Complete infrastructure definition |

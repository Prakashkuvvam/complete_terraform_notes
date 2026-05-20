---
title: "Serverless REST API"
weight: 30
---

# Serverless REST API Example ☁️

> **Deploy a fully serverless REST API using Lambda, API Gateway, and DynamoDB — with CloudWatch monitoring and dashboard.**

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  API Gateway  │────▶│   Lambda      │────▶│  DynamoDB    │
│  (REST API)   │     │  (Node.js)   │     │  (Items)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

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

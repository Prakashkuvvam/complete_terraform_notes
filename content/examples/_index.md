---
title: "Example Projects"
weight: 30
chapter: true
---

# Example Terraform Projects 💻

Complete, working Terraform configurations demonstrating different patterns and architectures.

## Available Examples

| Example | Description | Level |
|---------|-------------|-------|
| [Basic EC2](./basic-ec2/) | Simple EC2 instance with security group and user data | ⭐ Beginner |
| [VPC Module](./vpc-module/) | Reusable VPC using community Terraform Registry module | ⭐⭐ Intermediate |
| [Multi-Tier App](./multi-tier-app/) | 3-tier web application with ALB, ASG, and RDS | ⭐⭐⭐ Advanced |
| [Production Ready](./production-ready/) | Full production setup with remote state, CI/CD, all best practices | ⭐⭐⭐ Production |
| [Serverless API](./serverless-api/) | Serverless REST API with Lambda + API Gateway + DynamoDB | ⭐⭐⭐⭐ Advanced |
| [ECS Fargate](./ecs-fargate/) | Containerized app with ECS Fargate, ALB, and auto-scaling | ⭐⭐⭐⭐ Advanced |
| [EKS Cluster](./eks-cluster/) | Managed Kubernetes cluster with node groups and add-ons | ⭐⭐⭐⭐⭐ Expert |
| [S3 + CloudFront Website](./s3-cloudfront-website/) | Static website with S3, CloudFront CDN, WAF, and custom domain | ⭐⭐⭐ Intermediate |

## New Examples

> **Note:** Each example is a complete, runnable Terraform configuration. Clone the repo and try them out!

## Quick Start

```bash
# Pick an example
cd examples/basic-ec2

# Initialize
terraform init

# Preview changes
terraform plan

# Deploy
terraform apply

# Clean up when done
terraform destroy
```

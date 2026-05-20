---
title: "ECS Fargate Container"
weight: 40
---

# ECS Fargate Container Example 🐳

> **Deploy a containerized application on AWS ECS Fargate with Application Load Balancer, auto-scaling, and CloudWatch monitoring.**

## Architecture

```
┌──────────┐     ┌──────────┐     ┌─────────────────┐
│  ALB      │────▶│  ECS      │────▶│  Fargate Tasks   │
│  (Public) │     │  Service  │     │  (Private Subnet)│
└──────────┘     └──────────┘     └─────────────────┘
                      │                      │
                      ▼                      ▼
              ┌──────────────┐     ┌─────────────────┐
              │  Auto Scaling │     │  CloudWatch Logs │
              │  (CPU-based)  │     │  (/ecs/fargate) │
              └──────────────┘     └─────────────────┘
```

## Features

- **ECS Fargate** — Serverless container orchestration (no EC2 to manage)
- **Application Load Balancer** — Distributes traffic across containers
- **Auto Scaling** — CPU-based scaling with CloudWatch alarms
- **CloudWatch Logs** — Centralized container logging
- **NAT Gateway** — Private subnets with outbound internet access
- **Deployment Circuit Breaker** — Automatic rollback on failures

## Key Components

| Component | Configuration |
|-----------|--------------|
| Fargate CPU | 256 (.25 vCPU) |
| Fargate Memory | 512 MB |
| Container Image | nginx (configurable) |
| Min/Max Tasks | 1 / 10 |
| Scale Up | CPU > 75% for 2 min |
| Scale Down | CPU < 25% for 5 min |

## Usage

```bash
# Initialize
terraform init

# Deploy
terraform apply

# Access the app
open http://$(terraform output -raw alb_dns_name)

# Scale manually
terraform apply -var="app_count=5"

# View logs
aws logs tail /ecs/dev-fargate --follow

# Clean up
terraform destroy
```

## Level

⭐⭐⭐⭐ Advanced — Containers, ECS, ALB, Auto Scaling

## Files

| File | Description |
|------|-------------|
| `main.tf` | Complete infrastructure with VPC, ECS, ALB, auto-scaling |

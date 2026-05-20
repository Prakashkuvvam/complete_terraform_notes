---
title: "ECS Fargate Container"
weight: 40
---

# ECS Fargate Container Example 🐳

> **Deploy a containerized application on AWS ECS Fargate with Application Load Balancer, auto-scaling, and CloudWatch monitoring.**

## Architecture

The diagram below shows both the Terraform configuration structure and the AWS infrastructure it provisions:

{{< mermaid >}}
graph TB
    subgraph "📄 Terraform Config"
        A["main.tf"] --> B["VPC + Subnets"]
        A --> C["Security Groups"]
        A --> D["ALB + Target Group"]
        A --> E["ECS Cluster"]
        A --> F["Task Definition"]
        A --> G["ECS Service"]
        A --> H["Auto Scaling"]
    end

    subgraph "☁️ AWS Resources"
        B --> I["Public Subnets"]
        B --> J["Private Subnets"]
        I --> K["Internet Gateway"]
        I --> L["NAT Gateway"]
        J --> L
        D --> M["Application Load Balancer"]
        M --> N["Listener :80"]
        N --> O["Target Group"]
        C --> M
        C --> P["ECS Tasks"]
        G --> P
        E --> G
        F --> P
        H -->|"CPU > 75%"| G
        P --> Q["CloudWatch Logs"]
    end

    subgraph "📊 Outputs"
        M --> R["alb_dns_name"]
        E --> S["cluster_name"]
    end

    style A fill:#e74c3c,color:#fff
    style B fill:#3498db,color:#fff
    style C fill:#3498db,color:#fff
    style D fill:#3498db,color:#fff
    style E fill:#3498db,color:#fff
    style F fill:#3498db,color:#fff
    style G fill:#3498db,color:#fff
    style H fill:#3498db,color:#fff
    style M fill:#27ae60,color:#fff
    style P fill:#27ae60,color:#fff
    style Q fill:#f39c12,color:#fff
{{< /mermaid >}}

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

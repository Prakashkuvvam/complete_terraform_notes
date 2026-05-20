---
title: "EKS Kubernetes Cluster"
weight: 50
---

# EKS Kubernetes Cluster Example ☸️

> **Deploy a production-ready Amazon EKS cluster with managed node groups, secrets encryption, and Kubernetes resources.**

## Architecture

```
┌─────────────────────┐
│   EKS Cluster       │
│   (Control Plane)   │
├─────────────────────┤
│   Managed Node Grp  │──▶ EC2 (t3.medium)
│   (2-4 nodes)       │──▶ EC2 (t3.medium)
├─────────────────────┤
│   EBS CSI Driver    │──▶ Persistent Volumes
│   VPC CNI           │──▶ Pod Networking
│   CoreDNS           │──▶ DNS Discovery
└─────────────────────┘
```

## Features

- **Managed Kubernetes** — AWS handles control plane availability and scaling
- **Secrets Encryption** — KMS-backed encryption for Kubernetes secrets
- **Managed Node Groups** — Auto-scaling EC2 workers with health replacement
- **Spot Instances** — Cost-effective for non-production environments
- **Cluster Logging** — All control plane logs sent to CloudWatch
- **EBS CSI Driver** — Support for persistent volumes
- **VPC Endpoints** — S3 and DynamoDB endpoints included

## EKS Add-ons

| Add-on | Version | Purpose |
|--------|---------|---------|
| vpc-cni | v1.16.0 | Pod networking |
| coredns | v1.10.1 | DNS service discovery |
| kube-proxy | v1.28.1 | Service networking |
| aws-ebs-csi-driver | Latest | Persistent volumes |

## Usage

```bash
# Initialize
terraform init

# Deploy
terraform apply

# Configure kubectl
aws eks update-kubeconfig --name my-eks-cluster --region us-east-1

# Verify
kubectl get nodes
kubectl get pods -A
kubectl get svc -n applications

# Delete a test deployment
kubectl delete deployment nginx-demo -n applications

# Clean up
terraform destroy
```

## Level

⭐⭐⭐⭐⭐ Expert — Kubernetes, EKS, Advanced Networking

## Files

| File | Description |
|------|-------------|
| `main.tf` | Complete EKS cluster with VPC, node groups, add-ons, and sample K8s resources |

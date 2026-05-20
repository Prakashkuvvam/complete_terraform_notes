---
title: "S3 + CloudFront Static Website"
weight: 60
---

# S3 + CloudFront Static Website Example 🌐

> **Host a secure, globally-distributed static website using S3, CloudFront, WAF, and optional custom domain with HTTPS.**

## Architecture

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  S3 Bucket │◀────│  CloudFront   │◀────│  User     │
│  (Origin) │     │  (CDN + WAF) │     │  Browser  │
└──────────┘     └──────────────┘     └──────────┘
                      │
                      ▼
              ┌──────────────┐
              │  WAF Web ACL │
              │  (Rate Limit │
              │   + Security)│
              └──────────────┘
```

## Features

- **S3 Origin** — Private bucket with CloudFront-only access (OAC)
- **CloudFront CDN** — Global edge network with HTTPS enforcement
- **WAF** — Rate limiting, managed rules, and bot control
- **Custom Domain** — Optional Route53 + ACM SSL certificate
- **Versioning** — S3 versioning for rollback and CI/CD
- **Compression** — Automatic content compression at edge
- **Error Pages** — Custom 403/404 error responses

## Security Controls

| Control | Implementation |
|---------|---------------|
| Public Access | ✅ Blocked via PublicAccessBlock |
| Origin Access | ✅ CloudFront OAC (not OAI) |
| Encryption | ✅ AES256 server-side |
| WAF Rate Limit | ✅ 1000 req/min per IP |
| Managed Rules | ✅ AWS Common Rule Set |
| Bot Control | ✅ AWSManagedRulesBotControl |

## Usage

```bash
# Initialize
terraform init

# Deploy with CloudFront default domain
terraform apply

# Test
curl -I https://$(terraform output -raw cloudfront_domain)

# Deploy with custom domain
terraform apply \
  -var="domain_name=example.com" \
  -var="hosted_zone_id=Z1234567890"

# Deploy website content
aws s3 sync ./my-website/ s3://$(terraform output -raw s3_bucket_name)/ --delete

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"

# Clean up
terraform destroy
```

## Level

⭐⭐⭐ Intermediate — S3, CloudFront, WAF, Route53

## Files

| File | Description |
|------|-------------|
| `main.tf` | Complete static website with S3, CloudFront, WAF, optional domain/HTTPS |

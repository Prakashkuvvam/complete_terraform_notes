# S3 Static Website with CloudFront Example
# Secure static website hosting with S3, CloudFront, Route53, and WAF

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
  }
}

provider "aws" {
  region = var.region
}

# Variables
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"  # CloudFront requires us-east-1 for ACM certs
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "my-static-site"
}

variable "domain_name" {
  description = "Custom domain name (e.g., example.com)"
  type        = string
  default     = null
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID (required if domain_name is set)"
  type        = string
  default     = null
}

variable "price_class" {
  description = "CloudFront price class (PriceClass_100, PriceClass_200, PriceClass_All)"
  type        = string
  default     = "PriceClass_100"
}

# Random suffix for globally unique bucket name
resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  bucket_name = var.domain_name != null ? var.domain_name : "${var.project_name}-${random_id.suffix.hex}"
  full_domain = var.domain_name != null ? var.domain_name : "${aws_cloudfront_distribution.site.domain_name}"
}

# ──────────────────────────────────────────────
# S3 Bucket for Website
# ──────────────────────────────────────────────

resource "aws_s3_bucket" "site" {
  bucket = local.bucket_name

  tags = {
    Name        = "${var.project_name}-${var.environment}-site"
    Environment = var.environment
  }
}

# Block all public access (access only via CloudFront)
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning for CI/CD deployments
resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Lifecycle to expire old versions
resource "aws_s3_bucket_lifecycle_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
      newer_noncurrent_versions = 3
    }
  }
}

# Bucket policy to allow CloudFront access only
data "aws_iam_policy_document" "cloudfront_access" {
  statement {
    sid    = "AllowCloudFrontServicePrincipal"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "cloudfront_access" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.cloudfront_access.json
}

# ──────────────────────────────────────────────
# Sample Website Content
# ──────────────────────────────────────────────

resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.site.bucket
  key          = "index.html"
  content_type = "text/html"
  content      = <<-EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${var.project_name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; text-align: center;
        }
        .container { max-width: 600px; padding: 2rem; }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 0.5rem; }
        .badge {
            display: inline-block; margin-top: 2rem; padding: 0.5rem 1.5rem;
            background: rgba(255,255,255,0.2); border-radius: 50px;
            font-size: 0.9rem; backdrop-filter: blur(10px);
        }
        .env { margin-top: 1rem; font-size: 0.8rem; opacity: 0.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Site is Live!</h1>
        <p>Your static website is deployed with S3 + CloudFront.</p>
        <p>This site is served globally via CloudFront's edge network.</p>
        <div class="badge">✨ HTTPS • Edge Caching • WAF Protected ✨</div>
        <div class="env">Environment: ${var.environment} | Deployed with Terraform</div>
    </div>
</body>
</html>
EOF

  tags = {
    Environment = var.environment
  }
}

resource "aws_s3_object" "error_html" {
  bucket       = aws_s3_bucket.site.bucket
  key          = "error.html"
  content_type = "text/html"
  content      = <<-EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh; background: #1a1a2e; color: #eee; text-align: center;
        }
        h1 { font-size: 5rem; color: #e94560; }
        p { font-size: 1.2rem; margin: 1rem 0; }
        a { color: #0f3460; text-decoration: none; padding: 0.5rem 1.5rem;
            background: #e94560; color: white; border-radius: 5px; display: inline-block; margin-top: 1rem; }
    </style>
</head>
<body>
    <div>
        <h1>404</h1>
        <p>Page not found</p>
        <a href="/">Go Home</a>
    </div>
</body>
</html>
EOF

  tags = {
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────
# CloudFront Origin Access Control (OAC)
# ──────────────────────────────────────────────

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project_name}-${var.environment}-oac"
  description                       = "OAC for ${var.project_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ──────────────────────────────────────────────
# CloudFront Distribution
# ──────────────────────────────────────────────

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} - ${var.environment}"
  default_root_object = "index.html"
  price_class         = var.price_class
  aliases             = var.domain_name != null ? [var.domain_name] : []

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
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Custom error response for SPA routing
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

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.domain_name == null
    acm_certificate_arn            = var.domain_name != null ? aws_acm_certificate.site[0].arn : null
    ssl_support_method             = var.domain_name != null ? "sni-only" : null
    minimum_protocol_version       = var.domain_name != null ? "TLSv1.2_2021" : "TLSv1"
  }

  tags = {
    Environment = var.environment
    Name        = "${var.project_name}-cf-distribution"
  }
}

# ──────────────────────────────────────────────
# ACM Certificate (only if custom domain)
# ──────────────────────────────────────────────

resource "aws_acm_certificate" "site" {
  count = var.domain_name != null ? 1 : 0

  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Environment = var.environment
  }
}

# DNS validation records in Route53
resource "aws_route53_record" "cert_validation" {
  count = var.domain_name != null ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = tolist(aws_acm_certificate.site[0].domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.site[0].domain_validation_options)[0].resource_record_type
  records = [tolist(aws_acm_certificate.site[0].domain_validation_options)[0].resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "site" {
  count = var.domain_name != null ? 1 : 0

  certificate_arn         = aws_acm_certificate.site[0].arn
  validation_record_fqdns = [aws_route53_record.cert_validation[0].fqdn]
}

# ──────────────────────────────────────────────
# Route53 DNS (only if custom domain)
# ──────────────────────────────────────────────

resource "aws_route53_record" "site" {
  count = var.domain_name != null ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

# ──────────────────────────────────────────────
# WAF Web ACL (security)
# ──────────────────────────────────────────────

resource "aws_wafv2_web_acl" "site" {
  name        = "${var.project_name}-${var.environment}-waf"
  description = "WAF rules for ${var.project_name}"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Rate limiting
  rule {
    name     = "rate-limit"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 1000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # Block common attack patterns (AWS Managed Rules)
  rule {
    name     = "aws-managed-rules"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"

        # Exclude certain rules if needed
        rule_action_override {
          name = "SizeRestrictions_BODY"
          action_to_use {
            count {}
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "aws-managed-rules"
      sampled_requests_enabled   = true
    }
  }

  # Block bad bots
  rule {
    name     = "bad-bots"
    priority = 3

    action {
      block {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesBotControlRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "bad-bots"
      sampled_requests_enabled   = true
    }
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_wafv2_web_acl_association" "site" {
  resource_arn = aws_cloudfront_distribution.site.arn
  web_acl_arn  = aws_wafv2_web_acl.site.arn
}

# ──────────────────────────────────────────────
# Outputs
# ──────────────────────────────────────────────

output "website_url" {
  description = "Website URL"
  value       = var.domain_name != null ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.site.id
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.site.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.site.arn
}

output "deploy_commands" {
  description = "Commands to deploy website content"
  value = <<-EOT
    # Sync local files to S3
    aws s3 sync ./build/ s3://${aws_s3_bucket.site.id}/ --delete

    # Invalidate CloudFront cache
    aws cloudfront create-invalidation \
      --distribution-id ${aws_cloudfront_distribution.site.id} \
      --paths "/*"

    # Test the website
    curl -I ${var.domain_name != null ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"}
  EOT
}

output "cloudfront_url" {
  description = "CloudFront distribution URL"
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

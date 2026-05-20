# EKS Cluster Example
# Managed Kubernetes cluster with node groups, add-ons, and IAM

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
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

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "my-eks-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "node_instance_types" {
  description = "EC2 instance types for node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "desired_node_count" {
  description = "Desired number of nodes"
  type        = number
  default     = 2
}

# ──────────────────────────────────────────────
# Data Sources
# ──────────────────────────────────────────────

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

# ──────────────────────────────────────────────
# VPC for EKS
# ──────────────────────────────────────────────

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.0"

  name = "${var.cluster_name}-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  enable_vpn_gateway   = false
  enable_dns_hostnames = true

  # EKS requires private subnets to have public IP mapping disabled
  # and tags that allow Kubernetes to discover them
  private_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"            = "1"
  }

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# ──────────────────────────────────────────────
# EKS Cluster IAM Role
# ──────────────────────────────────────────────

resource "aws_iam_role" "eks_cluster" {
  name = "${var.cluster_name}-${var.environment}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

resource "aws_iam_role_policy_attachment" "eks_service_policy" {
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEKSServicePolicy"
  role       = aws_iam_role.eks_cluster.name
}

# ──────────────────────────────────────────────
# EKS Cluster
# ──────────────────────────────────────────────

resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  version  = var.kubernetes_version
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids              = module.vpc.private_subnets
    endpoint_private_access = var.environment == "prod"
    endpoint_public_access  = true
    public_access_cidrs     = var.environment == "prod" ? ["10.0.0.0/8"] : ["0.0.0.0/0"]
  }

  # Enable EKS managed add-ons
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks.arn
    }
    resources = ["secrets"]
  }

  tags = {
    Environment = var.environment
    Name        = var.cluster_name
  }
}

# KMS key for EKS secrets encryption
resource "aws_kms_key" "eks" {
  description             = "EKS Secrets Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  tags = {
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────
# EKS Node Group IAM Role
# ──────────────────────────────────────────────

resource "aws_iam_role" "eks_nodes" {
  name = "${var.cluster_name}-${var.environment}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_nodes.name
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_nodes.name
}

resource "aws_iam_role_policy_attachment" "eks_ecr" {
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_nodes.name
}

# SSM for node management
resource "aws_iam_role_policy_attachment" "eks_ssm" {
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = aws_iam_role.eks_nodes.name
}

# ──────────────────────────────────────────────
# EKS Managed Node Group
# ──────────────────────────────────────────────

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-${var.environment}-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = module.vpc.private_subnets

  ami_type       = "AL2_x86_64"
  instance_types = var.node_instance_types
  capacity_type  = var.environment == "prod" ? "ON_DEMAND" : "SPOT"

  scaling_config {
    desired_size = var.desired_node_count
    max_size     = var.desired_node_count * 2
    min_size     = 1
  }

  # Update configuration for rolling updates
  update_config {
    max_unavailable = 1
  }

  # Auto-repair for node health
  # (enabled by default in newer versions of the provider)

  tags = {
    Environment = var.environment
    Name        = "${var.cluster_name}-${var.environment}-nodes"
  }
}

# ──────────────────────────────────────────────
# EKS Add-ons
# ──────────────────────────────────────────────

resource "aws_eks_addon" "vpc_cni" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "vpc-cni"
  addon_version = "v1.16.0-eksbuild.1"
}

resource "aws_eks_addon" "coredns" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "coredns"
  addon_version = "v1.10.1-eksbuild.6"
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "kube-proxy"
  addon_version = "v1.28.1-eksbuild.2"
}

# Optional: EBS CSI Driver for persistent volumes
resource "aws_eks_addon" "ebs_csi" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "aws-ebs-csi-driver"
}

# ──────────────────────────────────────────────
# Cluster Security Group (additional rules)
# ──────────────────────────────────────────────

resource "aws_security_group_rule" "cluster_ingress_https" {
  description       = "Allow HTTPS from VPC"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
  cidr_blocks       = ["0.0.0.0/0"]
  type              = "ingress"
}

# ──────────────────────────────────────────────
# Kubernetes Provider (requires cluster to be up)
# ──────────────────────────────────────────────

provider "kubernetes" {
  host                   = aws_eks_cluster.main.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks", "get-token",
      "--cluster-name", aws_eks_cluster.main.name,
      "--region", var.region,
    ]
  }
}

# ──────────────────────────────────────────────
# Sample Kubernetes Resources
# ──────────────────────────────────────────────

resource "kubernetes_namespace" "applications" {
  metadata {
    name = "applications"
    labels = {
      environment = var.environment
    }
  }
}

resource "kubernetes_deployment" "nginx" {
  metadata {
    name      = "nginx-demo"
    namespace = kubernetes_namespace.applications.metadata[0].name
    labels = {
      app = "nginx"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "nginx"
      }
    }

    template {
      metadata {
        labels = {
          app = "nginx"
        }
      }

      spec {
        container {
          image = "nginx:latest"
          name  = "nginx"
          port {
            container_port = 80
          }
          resources {
            requests = {
              cpu    = "256m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "512m"
              memory = "512Mi"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "nginx" {
  metadata {
    name      = "nginx-service"
    namespace = kubernetes_namespace.applications.metadata[0].name
  }

  spec {
    selector = {
      app = "nginx"
    }

    port {
      port        = 80
      target_port = 80
      protocol    = "TCP"
    }

    type = "ClusterIP"
  }
}

# ──────────────────────────────────────────────
# Outputs
# ──────────────────────────────────────────────

output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_version" {
  description = "Kubernetes version"
  value       = aws_eks_cluster.main.version
}

output "cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "node_group_name" {
  description = "Node group name"
  value       = aws_eks_node_group.main.node_group_name
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value = <<-EOT
    # Update kubeconfig
    aws eks update-kubeconfig --name ${aws_eks_cluster.main.name} --region ${var.region}

    # Verify cluster access
    kubectl get nodes
    kubectl get pods -A
  EOT
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

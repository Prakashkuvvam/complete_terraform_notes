---
title: "Terraform Learning Path"
bookToC: false
---

# Terraform Learning Path 🚀

> **Your complete guide from zero to production-grade Terraform with AWS, designed to help you ace the Terraform Associate certification.**

## 📚 Curriculum Overview

This curriculum is structured into **15 comprehensive chapters** + **hands-on labs** + **example projects**. Each chapter builds on the previous, taking you from fundamentals to production-grade infrastructure-as-code.

### 🗺️ Learning Path

| Phase | Chapters | Goal | Duration |
|-------|----------|------|----------|
| **Foundation** | 1–4 | Understand IaC concepts, Terraform CLI, HCL syntax | Week 1 |
| **Core Skills** | 5–8 | Variables, state management, modules, workspaces | Week 2 |
| **Advanced** | 9–12 | Functions, provisioners, Cloud, import/refactor | Week 3 |
| **Production & Exam Prep** | 13–15 | Security, production patterns, exam practice | Week 4 |

---

## 📖 Chapter Index

| # | Chapter | Topics |
|---|---------|--------|
| 01 | [Introduction to IaC & Terraform]({{< relref "docs/01-introduction-to-iac-and-terraform" >}}) | What is IaC, Terraform vs other tools, installation, HCL vs JSON |
| 02 | [Terraform Core Concepts]({{< relref "docs/02-terraform-core-concepts" >}}) | Providers, tfstate, lifecycle, plan/apply/destroy |
| 03 | [HCL Configuration Language]({{< relref "docs/03-hcl-configuration-language" >}}) | Syntax, expressions, types, functions, interpolation |
| 04 | [Resources, Data Sources & Meta-Arguments]({{< relref "docs/04-resources-and-data-sources" >}}) | Resources, data sources, depends_on, count, for_each, lifecycle |
| 05 | [Variables, Outputs & Locals]({{< relref "docs/05-variables-and-outputs" >}}) | Input variables, output values, local values, validation, sensitive |
| 06 | [State Management]({{< relref "docs/06-state-management" >}}) | Local state, remote state (S3+DynamoDB), state locking, workspaces |
| 07 | [Terraform Modules]({{< relref "docs/07-terraform-modules" >}}) | Module structure, inputs/outputs, versioning, registry, private modules |
| 08 | [Workspaces & Environments]({{< relref "docs/08-workspaces-and-environments" >}}) | CLI workspaces, directory layouts, terragrunt alternatives |
| 09 | [Functions, Expressions & Dynamic Blocks]({{< relref "docs/09-functions-expressions-dynamic" >}}) | Built-in functions, conditionals, for expressions, splat, dynamic blocks |
| 10 | [Provisioners & Side Effects]({{< relref "docs/10-provisioners" >}}) | file, remote-exec, local-exec, when to avoid, alternatives |
| 11 | [Terraform Cloud & Enterprise]({{< relref "docs/11-terraform-cloud" >}}) | Remote execution, VCS integration, Sentinel, runs, workspaces |
| 12 | [Importing & Refactoring]({{< relref "docs/12-importing-refactoring" >}}) | terraform import, moved blocks, state mv/rm, refactoring modules |
| 13 | [Security & Compliance]({{< relref "docs/13-security-best-practices" >}}) | Sensitive data, secrets management, Sentinel policies, least privilege |
| 14 | [Production-Grade Terraform]({{< relref "docs/14-production-grade-terraform" >}}) | CI/CD, monorepo vs multi-repo, testing, code reviews, team workflows |
| 15 | [Exam Preparation Guide]({{< relref "docs/15-exam-preparation" >}}) | Exam structure, objectives, sample questions, study tips, cheat sheet |

## 🛠️ Hands-On Labs

| Lab | Description |
|-----|-------------|
| Lab 01 | Deploy an EC2 instance with security group |
| Lab 02 | Create a VPC with public/private subnets |
| Lab 03 | Build a reusable VPC module |
| Lab 04 | Multi-environment deployment with workspaces |
| Lab 05 | Remote state with S3 and DynamoDB |
| Lab 06 | Production-ready 3-tier web architecture |

[View all labs →]({{< relref "labs" >}})

## 📁 Example Projects

| Example | Description |
|---------|-------------|
| Basic EC2 | Simple EC2 instance with security group |
| VPC Module | Reusable VPC module with subnets |
| Multi-Tier App | 3-tier web app with ALB, ASG, RDS |
| Production Ready | Full production setup with remote state, CI/CD |

[View all examples →]({{< relref "examples" >}})

## 🎯 What You'll Achieve

By the end of this curriculum, you will be able to:

- ✅ Write **production-grade Terraform configurations** following industry best practices
- ✅ **Design reusable modules** with proper inputs, outputs, and versioning
- ✅ **Manage Terraform state** securely with remote backends and locking
- ✅ **Implement multi-environment deployments** (dev/staging/prod) with workspaces
- ✅ **Pass the Terraform Associate certification** exam with confidence
- ✅ **Integrate Terraform into CI/CD pipelines** for automated infrastructure delivery
- ✅ **Apply security best practices** including secrets management and policy as code

## 🚀 Getting Started

1. [Install Terraform](https://www.terraform.io/downloads)
2. Set up AWS CLI: `aws configure`
3. Start with **Chapter 1** and follow sequentially
4. Complete the **hands-on labs** after each section
5. Review the **exam preparation guide** in Chapter 15

> **Pro Tip:** Don't just read — code along! Run every example, break things, fix them, and experiment. Real learning comes from doing.

---

*Start your journey → [Chapter 1: Introduction to IaC & Terraform]({{< relref "docs/01-introduction-to-iac-and-terraform" >}})*

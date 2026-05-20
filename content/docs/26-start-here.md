---
title: "🚀 Start Here"
weight: -5
bookFlatSection: false
bookToc: true
---

# 🚀 Start Here: Your Terraform Learning Path

Welcome! Whether you're brand new to Terraform or brushing up for the certification, this guide will help you navigate the curriculum efficiently.

---

## 🎯 How to Use This Guide

### If you're completely new to Terraform
Follow the **4-week study plan** below. Start from Chapter 1 and work through sequentially.

### If you're reviewing for the exam
Go straight to the **Exam Prep** phase. Take a [practice test]({{< relref "18-exam-practice-test-1" >}}) first to identify weak areas, then focus on those chapters.

### If you just want a quick overview
Browse the curriculum on the [📊 Progress Dashboard]({{< relref "25-progress-dashboard" >}}) and jump to any chapter that interests you.

---

## 📋 Prerequisites

Before you begin, make sure you have the following set up:

```bash
# 1. Install Terraform
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Linux (Ubuntu/Debian)
# See Chapter 1 for full instructions

# 2. Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 3. Configure AWS credentials
aws configure

# 4. Verify everything works
terraform version
aws sts get-caller-identity
```

### Prerequisites Checklist

- [ ] **Terraform installed** (verify with `terraform version`)
- [ ] **AWS CLI installed** (verify with `aws --version`)
- [ ] **AWS credentials configured** (verify with `aws sts get-caller-identity`)
- [ ] **A code editor** (VS Code recommended with the HashiCorp Terraform extension)
- [ ] **Git installed** (for version control)

---

## 📅 4-Week Study Plan

### Week 1: Foundation

> Goal: Understand IaC concepts, Terraform basics, and write your first configuration.

| Day | Chapter | Topics | Time |
|-----|---------|--------|------|
| 1 | [Ch 1: Introduction to IaC & Terraform]({{< relref "01-introduction-to-iac-and-terraform" >}}) | What is IaC, Terraform vs other tools, HCL vs JSON | 1 hr |
| 2 | [Ch 2: Terraform Core Concepts]({{< relref "02-terraform-core-concepts" >}}) | Providers, resources, state basics, workflow | 1.5 hr |
| 3 | [Ch 3: HCL Configuration Language]({{< relref "03-hcl-configuration-language" >}}) | Syntax, data types, expressions | 1.5 hr |
| 4 | [Ch 4: Resources, Data Sources & Meta-Arguments]({{< relref "04-resources-and-data-sources" >}}) | count, for_each, lifecycle, depends_on | 1.5 hr |
| 5 | **Hands-on Lab** | Run the [Basic EC2 example]({{< relref "/examples/basic-ec2" >}}) | 1 hr |
| 6 | **Review & Quiz** | Review Week 1 concepts, take Chapter quizzes | 1 hr |
| 7 | **Rest / Catch-up** | Revisit any weak areas | — |

### Week 2: Core Skills

> Goal: Master variables, state management, and modules.

| Day | Chapter | Topics | Time |
|-----|---------|--------|------|
| 8 | [Ch 5: Variables, Outputs & Locals]({{< relref "05-variables-and-outputs" >}}) | Input variables, outputs, validation, locals | 1.5 hr |
| 9 | [Ch 6: State Management]({{< relref "06-state-management" >}}) | Remote state, backends, locking, isolation | 1.5 hr |
| 10 | [Ch 7: Terraform Modules]({{< relref "07-terraform-modules" >}}) | Module structure, registry, versioning | 1.5 hr |
| 11 | [Ch 8: Workspaces & Environments]({{< relref "08-workspaces-and-environments" >}}) | Multi-env strategies, workspace management | 1 hr |
| 12 | **Hands-on Lab** | Run the [VPC Module example]({{< relref "/examples/vpc-module" >}}), Then [Multi-Tier App]({{< relref "/examples/multi-tier-app" >}}) | 1.5 hr |
| 13 | **Review & Quiz** | Review Week 2 concepts | 1 hr |
| 14 | **Rest / Catch-up** | Revisit any weak areas | — |

### Week 3: Advanced

> Goal: Learn functions, dynamic blocks, provisioners, importing, and Terraform Cloud.

| Day | Chapter | Topics | Time |
|-----|---------|--------|------|
| 15 | [Ch 9: Functions, Expressions & Dynamic Blocks]({{< relref "09-functions-expressions-dynamic" >}}) | Built-in functions, for expressions | 1.5 hr |
| 16 | [Ch 10: Provisioners & Side Effects]({{< relref "10-provisioners" >}}) | local-exec, remote-exec, alternatives | 1 hr |
| 17 | [Ch 11: Terraform Cloud & Enterprise]({{< relref "11-terraform-cloud" >}}) | Remote execution, VCS workflow, Sentinel | 1.5 hr |
| 18 | [Ch 12: Importing & Refactoring]({{< relref "12-importing-refactoring" >}}) | Import, moved blocks, state migrations | 1 hr |
| 19 | **Hands-on Lab** | Run the [ECS Fargate example]({{< relref "/examples/ecs-fargate" >}}), Then [Serverless API]({{< relref "/examples/serverless-api" >}}) | 1.5 hr |
| 20 | **Review & Quiz** | Review Week 3 concepts | 1 hr |
| 21 | **Rest / Catch-up** | Revisit any weak areas | — |

### Week 4: Production & Exam Prep

> Goal: Learn security best practices, production workflows, and prepare for the certification.

| Day | Chapter | Topics | Time |
|-----|---------|--------|------|
| 22 | [Ch 13: Security & Compliance]({{< relref "13-security-best-practices" >}}) | Secrets management, IAM, Sentinel | 1 hr |
| 23 | [Ch 14: Production-Grade Terraform]({{< relref "14-production-grade-terraform" >}}) | CI/CD, testing, team workflows, disaster recovery | 1.5 hr |
| 24 | [Ch 15: Exam Preparation Guide]({{< relref "15-exam-preparation" >}}) | Study plan, cheat sheet, exam tips | 1 hr |
| 25 | **Practice Test 1** | Take [Practice Test 1]({{< relref "18-exam-practice-test-1" >}}) under timed conditions | 1 hr |
| 26 | **Review Weak Domains** | Based on test results, revisit weak chapters | 1.5 hr |
| 27 | **Practice Test 2** | Take [Practice Test 2]({{< relref "19-exam-practice-test-2" >}}) | 1 hr |
| 28 | **Final Review** | Review [Ch 16: Interview Questions]({{< relref "16-interview-questions" >}}) and [Ch 17: Real-World Scenarios]({{< relref "17-real-world-scenarios" >}}) | 1 hr |

---

## 🧠 Learning Tips

### For Each Chapter

1. **Read** the chapter content thoroughly
2. **Watch** for 📝 Exam Tips highlighted throughout
3. **Try** the chapter-end quiz to test understanding
4. **Check it off** on the 📊 [Progress Dashboard]({{< relref "25-progress-dashboard" >}})

### Retention Strategies

| Strategy | How | Why It Works |
|----------|-----|-------------|
| **Active Recall** | After reading a section, close the tab and summarize from memory | Strengthens neural pathways |
| **Spaced Repetition** | Review previous chapter's exam tips before starting a new chapter | Fights the forgetting curve |
| **Hands-on Practice** | Run the example projects after each week | Real context solidifies abstract concepts |
| **Teach Someone** | Explain a concept out loud as if teaching a colleague | Exposes gaps in understanding |

---

## 📊 Track Your Progress

1. Visit the **[📊 Progress Dashboard]({{< relref "25-progress-dashboard" >}})** to see your overall progress
2. Open any chapter — it's automatically marked as **read**
3. When you finish a chapter, check the **"Mark as completed"** box at the bottom
4. On practice tests, use the built-in **60-minute timer** and mark the test as completed when done

Your progress is saved in your browser (localStorage) — it persists across sessions!

---

## 🆘 Need Help?

| Resource | When to Use |
|----------|-------------|
| [Terraform Documentation](https://developer.hashicorp.com/terraform/docs) | For detailed reference on specific resources or providers |
| [Terraform Registry](https://registry.terraform.io/) | To find pre-built modules and provider documentation |
| [HashiCorp Discuss](https://discuss.hashicorp.com/) | For community support and troubleshooting |
| [Terraform GitHub Issues](https://github.com/hashicorp/terraform/issues) | For known bugs and feature requests |

---

> **Ready to start?** Head to **[Chapter 1: Introduction to IaC & Terraform]({{< relref "01-introduction-to-iac-and-terraform" >}})** 🚀

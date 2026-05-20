---
title: "Exam Practice Test 3"
weight: 20
bookFlatSection: true
---

# 📝 Terraform Associate — Practice Test 3

> **Instructions:** This test contains **57 multiple-choice questions** covering all 7 domains of the Terraform Associate exam. Choose the **best** answer for each question. Some questions include code snippets. Time yourself — aim for **60 minutes** for the full set. A passing score is **70% (40/57)**.

---
<div class="exam-controls">
  <div class="exam-timer" data-minutes="60" data-test-id="exam-test-3">
    <div class="timer-face">
      <span class="timer-minutes">60</span>
      <span class="timer-separator">:</span>
      <span class="timer-seconds">00</span>
    </div>
    <div class="timer-controls">
      <button class="timer-btn timer-start">▶ Start</button>
      <button class="timer-btn timer-pause">⏸ Pause</button>
      <button class="timer-btn timer-reset">↺ Reset</button>
    </div>
    <span class="timer-status">Time Remaining</span>
  </div>
  <div class="exam-progress-check">
    <input type="checkbox" class="test-complete-check" id="test-complete-3" data-test-id="exam-test-3">
    <label for="test-complete-3">✓ Mark test as completed</label>
  </div>
</div>

## Domain 1: Infrastructure as Code (7 Questions — Q1–Q7)

**Q1.** Which property distinguishes Immutable Infrastructure from Mutable Infrastructure?

A) Immutable infrastructure is cheaper to operate  
B) Immutable infrastructure is never modified after deployment — it is replaced  
C) Immutable infrastructure uses configuration management tools like Ansible  
D) Immutable infrastructure stores state in Git

---

**Q2.** A team wants to provision the same infrastructure in development, staging, and production environments. Each environment must be isolated but identical in configuration. What approach BEST satisfies these requirements?

A) Use `terraform workspace` and environment-specific variable files  
B) Copy the configuration into three separate directories  
C) Use a single Terraform configuration with hard-coded values  
D) Use `count` with a conditional to toggle resources on and off

---

**Q3.** Which of the following is NOT a benefit of treating infrastructure as code?

A) Self-documenting infrastructure through readable configuration files  
B) Automatic rollback of failed infrastructure changes  
C) Version-controlled infrastructure history  
D) Repeatable and consistent deployments

---

**Q4.** An organisation wants to provision infrastructure with Terraform but also needs to run post-deployment configuration steps (e.g., installing packages, joining a domain). Which approach aligns with IaC best practices?

A) Use a single Terraform configuration that includes shell commands via `local-exec`  
B) Use Terraform for infrastructure provisioning, then use a configuration management tool for post-deployment steps  
C) Create a shell script that runs `terraform apply` and then runs the configuration commands  
D) Use Terraform's `remote-exec` provisioner for all configuration inside the resource

---

**Q5.** A developer wrote the following Terraform configuration:
```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
```
What is the primary problem with this configuration?

A) The `ami` value should use a data source rather than a hard-coded value  
B) The `instance_type` should be `t3.micro`  
C) The resource is missing a `name` tag  
D) The configuration will fail because `aws_instance` is not a valid resource type

---

**Q6.** Which statement about declarative vs. imperative IaC is TRUE?

A) Declarative IaC defines the exact steps to reach the desired state  
B) Imperative IaC defines the desired end state, not the steps  
C) Terraform is declarative — you define the desired state, and Terraform figures out how to reach it  
D) Ansible is declarative only when used with Terraform

---

**Q7.** A team manages 20 microservices, each with its own Terraform configuration in a monorepo. They want to ensure that changes to one service do not affect others. Which strategy BEST addresses this concern?

A) Store all 20 microservices in a single Terraform configuration  
B) Run `terraform plan` and `terraform apply` independently for each service's directory  
C) Use `terraform import` to link all services into a shared state  
D) Use Terraform Cloud's speculative planning for all services at once

---

## Domain 2: Terraform Basics (10 Questions — Q8–Q17)

**Q8.** What is the function of `terraform validate`?

A) It checks whether the configuration is syntactically valid and internally consistent  
B) It runs a trial apply against the current infrastructure  
C) It downloads the required providers and modules  
D) It verifies that the cloud credentials are valid

---

**Q9.** A user runs `terraform init` for the first time in a project. Which of the following occurs?

A) Terraform downloads and installs the providers defined in the configuration  
B) Terraform creates the state file in the backend  
C) Terraform runs `terraform validate` automatically  
D) Terraform installs the Terraform CLI plugins

---

**Q10.** Which command outputs the available subcommands for `terraform`?

A) `terraform`  
B) `terraform --help`  
C) `terraform list`  
D) `terraform help all`

---

**Q11.** Given the following provider configuration:
```hcl
provider "aws" {
  region = "us-west-2"
}
```
What happens when a resource does not specify a `provider` argument?

A) Terraform uses the default provider configuration (the one without an alias)  
B) Terraform returns an error because each resource must specify a provider  
C) Terraform randomly picks one of the configured providers  
D) Terraform uses whichever provider was initialised last

---

**Q12.** A user is following along with a tutorial that uses `hashicorp/random` provider. What command must they run before using resources from this provider?

A) `terraform init`  
B) `terraform providers`  
C) `terraform get`  
D) `terraform import hashicorp/random`

---

**Q13.** Which file does Terraform use to record the dependency lock information for providers?

A) `.terraform.lock.hcl`  
B) `terraform.tfstate`  
C) `provider.tf`  
D) `versions.tf`

---

**Q14.** A user sees the following error when running `terraform init`:
```
Error: Failed to query available provider packages
```
What is the most likely cause?

A) The network is unable to reach the Terraform Registry  
B) The `terraform.tfvars` file contains invalid values  
C) The state file is locked by another process  
D) The `required_version` setting conflicts with the installed Terraform binary

---

**Q15.** Which command(s) will show the current Terraform and provider versions? (Choose two.)

A) `terraform version`  
B) `terraform --version`  
C) `terraform providers`  
D) `terraform validate`

---

**Q16.** Consider the following configuration:
```hcl
terraform {
  required_version = ">= 1.0, < 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```
A user has Terraform 1.7.3 installed. What happens when they run `terraform init`?

A) Terraform applies the configuration because 1.7.3 >= 1.0  
B) Terraform returns an error because 1.7.3 is not < 1.6  
C) Terraform ignores the `required_version` and proceeds  
D) Terraform automatically downgrades to 1.5.x

---

**Q17.** What is the default backend for Terraform when none is specified in the configuration?

A) `local`  
B) `s3`  
C) `remote`  
D) `inmem`

---

## Domain 3: Terraform Workflow (9 Questions — Q18–Q26)

**Q18.** What is the correct order of the core Terraform workflow commands?

A) `terraform init` → `terraform plan` → `terraform apply`  
B) `terraform plan` → `terraform init` → `terraform apply`  
C) `terraform apply` → `terraform init` → `terraform plan`  
D) `terraform init` → `terraform validate` → `terraform apply`

---

**Q19.** A user runs `terraform plan` and sees the following output:
```
Plan: 1 to add, 0 to change, 0 to destroy.
```
What does this indicate?

A) One resource will be created, none modified, none destroyed  
B) One resource will be modified, none created, none destroyed  
C) One resource will be destroyed and recreated  
D) One resource exists in state but not in the configuration

---

**Q20.** What is the purpose of the `-out=plan.tfplan` flag with `terraform plan`?

A) It saves the plan to a file that can be applied later with `terraform apply plan.tfplan`  
B) It exports the plan as a PDF for approval  
C) It saves the plan to a file that can be reviewed in a web browser  
D) It outputs the plan to stdout and saves a copy to a file

---

**Q21.** A user runs `terraform apply` without a saved plan file. What occurs?

A) Terraform automatically runs `terraform plan` and prompts for confirmation before applying  
B) Terraform applies the last saved plan from `.terraform/`  
C) Terraform returns an error because a plan file must be specified  
D) Terraform applies changes without any plan

---

**Q22.** Which command destroys resources managed by a Terraform configuration?

A) `terraform destroy`  
B) `terraform apply -destroy`  
C) Both A and B are correct  
D) `terraform delete`

---**Q23.** A user runs `terraform plan` and the output is truncated. Which flag ensures the full plan output is shown without truncation?

A) `-no-color`
B) `-input=false`
C) `-compact-warnings`
D) `-out=tfplan`

---

**Q24.** If a user runs `terraform plan` and sees:
```
No changes. Your infrastructure matches the configuration.
```
Which statement is TRUE?

A) The Terraform configuration is in sync with the real infrastructure  
B) The state file is empty  
C) Terraform was unable to reach the cloud provider  
D) The `terraform apply` command was run before the plan

---

**Q25.** What happens to orphaned resources when running `terraform apply`?

A) Terraform shows them as "destroy" in the plan  
B) Terraform leaves them in the state but no longer manages them  
C) Terraform unlinks them by default and shows a warning  
D) Terraform requires the `--destroy-orphans` flag to remove them

---

**Q26.** A user wants to format all Terraform files in a directory. Which command should they use?

A) `terraform fmt`  
B) `terraform fmt -recursive`  
C) `terraform validate`  
D) `terraform lint`

---

## Domain 4: Terraform Configuration (10 Questions — Q27–Q36)

**Q27.** Given the following configuration:
```hcl
resource "aws_s3_bucket" "data" {
  bucket = var.bucket_name
  force_destroy = true
}
```
What is `var.bucket_name` referring to?

A) An input variable defined in a `variables.tf` file  
B) A local value defined in the configuration  
C) An output value from a Terraform module  
D) An environment variable named `TF_VAR_bucket_name`

---

**Q28.** What is the purpose of the `sensitive = true` argument in a variable declaration?

A) It prevents the variable's value from being displayed in CLI output  
B) It encrypts the variable at rest  
C) It prevents the variable from being overridden in `terraform.tfvars`  
D) It marks the variable as write-only in the state file

---

**Q29.** Consider the following:
```hcl
locals {
  env = "production"
  name = "${local.env}-web-server"
}
```
What is the value of `local.name`?

A) `production-web-server`  
B) `${env}-web-server`  
C) `env-web-server`  
D) This will result in an error because `local.env` is not a valid reference

---

**Q30.** How does Terraform handle an undefined variable referenced in a configuration?

A) It prompts the user for a value  
B) It uses an empty string as default  
C) It returns an error during `terraform plan` or `terraform apply`  
D) It skips the resource that uses the variable

---

**Q31.** What does the `toset()` function do?

A) Converts a list to a set, removing duplicate elements  
B) Converts a string to a list of characters  
C) Converts a map to a set of key-value pairs  
D) Converts a number to a string

---

**Q32.** Given:
```hcl
output "instance_ip" {
  value = aws_instance.web.private_ip
  description = "The private IP of the web instance"
}
```
Where can `instance_ip` be accessed after `terraform apply`?

A) In the CLI output and in the state file  
B) Only within the same Terraform configuration  
C) Only in Terraform Cloud's web UI  
D) Only by running `terraform output` explicitly

---

**Q33.** What is the purpose of `terraform_data` (formerly `null_resource`)?

A) To run provisioners or execute side-effects that don't correspond to a real resource  
B) To store raw data in the state file  
C) To define data sources for testing  
D) To create placeholder outputs

---

**Q34.** Consider the following:
```hcl
resource "aws_security_group_rule" "ingress" {
  count = length(var.allowed_ports)
  type              = "ingress"
  from_port         = var.allowed_ports[count.index]
  to_port           = var.allowed_ports[count.index]
  protocol          = "tcp"
  security_group_id = aws_security_group.main.id
}
```
If `var.allowed_ports = [80, 443, 8080]`, how many `aws_security_group_rule` resources are created?

A) 3  
B) 1  
C) 0  
D) Terraform returns an error

---

**Q35.** Which function would you use to look up a value from a map and provide a default if the key does not exist?

A) `lookup()`  
B) `try()`  
C) `contains()`  
D) `element()`

---

**Q36.** Given:
```hcl
variable "regions" {
  type = list(string)
  default = ["us-east-1", "eu-west-1", "ap-southeast-1"]
}
```
Which expression returns a list of all regions except `us-east-1`?

A) `[for r in var.regions : r if r != "us-east-1"]`  
B) `slice(var.regions, 1, 3)`  
C) `concat(var.regions, ["us-east-1"])`  
D) `split(",", join(",", var.regions))`

---

## Domain 5: Terraform State (8 Questions — Q37–Q44)

**Q37.** Where does Terraform store resource attribute mappings by default?

A) In a file named `terraform.tfstate` in the current working directory  
B) In the Terraform Registry  
C) In a hidden `.terraform/state` directory  
D) In a cloud database managed by HashiCorp

---

**Q38.** What is the primary purpose of Terraform state?

A) To map real-world resources to configuration and track metadata  
B) To store the Terraform binary version  
C) To cache provider packages for offline use  
D) To generate documentation for the infrastructure

---

**Q39.** Which service can be used as a remote backend to store Terraform state with built-in versioning?

A) AWS S3 (with versioning enabled)  
B) AWS DynamoDB  
C) GitHub Releases  
D) Terraform Registry

---

**Q40.** A user needs to rename a resource from `aws_instance.web` to `aws_instance.app_server` without destroying and recreating the instance. What should they do?

A) Run `terraform state mv aws_instance.web aws_instance.app_server`  
B) Edit the state file manually  
C) Delete the resource from state and run `terraform import`  
D) Run `terraform taint aws_instance.web` and change the configuration

---

**Q41.** What is the risk of using `terraform state rm` to remove a resource from state?

A) The real infrastructure remains, but Terraform will no longer manage it  
B) The real infrastructure is deleted  
C) The state file becomes corrupt  
D) Terraform automatically re-imports the resource on the next run

---

**Q42.** A team uses an S3 backend for state with DynamoDB for locking. A developer's `terraform apply` is interrupted. On the next run, they get a state lock error. What command can safely release the lock?

A) `terraform force-unlock <LOCK_ID>`  
B) `terraform state unlock <LOCK_ID>`  
C) `terraform apply -lock=false`  
D) Both A and C are valid approaches depending on the situation

---

**Q43.** Which statement about Terraform state is FALSE?

A) State data can contain sensitive information  
B) State should never be shared across teams without a remote backend  
C) State can be stored in version control as a best practice  
D) Remote state backends can provide encryption at rest

---

**Q44.** A user wants to refresh the state file against real infrastructure without making any changes. Which command should they run?

A) `terraform apply -refresh-only`  
B) `terraform refresh`  
C) Both A and B are valid  
D) `terraform plan -refresh`

---

## Domain 6: Terraform Modules (7 Questions — Q45–Q51)

**Q45.** Which of the following is a valid Terraform module source using the Terraform Registry?

A) `hashicorp/consul/aws`  
B) `git::https://github.com/hashicorp/consul.git`  
C) `./modules/consul`  
D) All of the above are valid module sources

---

**Q46.** What is the purpose of the `source` argument in a module block?

A) It specifies where to find the module's configuration  
B) It defines the provider source for the module  
C) It sets the version of the module to use  
D) It declares the output location for module resources

---

**Q47.** Consider the following module block:
```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  name = "main"
  cidr = "10.0.0.0/16"
}
```
What is the `name` and `cidr` arguments referring to?

A) Input variables defined in the module  
B) Output values from the module  
C) Resource arguments within the module  
D) Provider configuration for the module

---

**Q48.** A team maintains a private module in a Git repository. Which source format should they use to reference a specific tag?

A) `git::https://github.com/org/terraform-module.git?ref=v1.0.0`  
B) `github.com/org/terraform-module/tree/v1.0.0`  
C) `git@github.com:org/terraform-module.git#v1.0.0`  
D) `https://github.com/org/terraform-module?version=v1.0.0`

---

**Q49.** What happens if a root module and a child module both define the same provider without `configuration_aliases`?

A) Terraform may prompt you to configure the provider for the child module  
B) Terraform automatically inherits the root provider configuration  
C) Terraform returns a "duplicate provider configuration" error  
D) The child module overrides the root module's provider

---

**Q50.** A user calls a module twice with different inputs:
```hcl
module "app_a" {
  source   = "./modules/app"
  env_name = "staging"
}

module "app_b" {
  source   = "./modules/app"
  env_name = "production"
}
```
What is the result?

A) Two independent copies of the module's resources are created with their respective environments  
B) The second declaration overwrites the first, leaving only one copy  
C) Terraform returns an error because a module cannot be called twice  
D) Both modules reference the same resources

---

**Q51.** Which of the following is a best practice for module design?

A) Modules should expose all internal resource attributes as outputs  
B) Modules should have a clear, single purpose and encapsulate related resources  
C) Modules should include provider blocks to ensure provider configuration  
D) Modules should use absolute paths for the `source` argument

---

## Domain 7: Terraform Cloud & Enterprise (6 Questions — Q52–Q57)

**Q52.** In Terraform Cloud, what is a "workspace" analogous to in an open-source Terraform workflow?

A) A separate Terraform state file and configuration directory  
B) A single Terraform provider configuration  
C) A Terraform Cloud organization  
D) A collection of Terraform modules

---

**Q53.** What is the purpose of Sentinel in Terraform Cloud?

A) Policy-as-code framework to enforce governance on Terraform operations  
B) Cost estimation and budgeting tool  
C) Secret storage and management service  
D) Drift detection and auto-remediation engine

---

**Q54.** A team wants to run `terraform plan` automatically when a pull request is opened against their repository. Which Terraform Cloud feature should they use?

A) VCS-driven workflow with speculative plans  
B) API-driven workflow  
C) CLI-driven workflow  
D) Sentinel policies

---

**Q55.** What is the difference between the "plan" and "apply" stages in Terraform Cloud's run lifecycle?

A) The plan stage calculates changes and waits for confirmation; the apply stage executes them  
B) The plan stage creates resources; the apply stage destroys them  
C) Both stages execute simultaneously  
D) The plan stage is skipped in the API-driven workflow

---

**Q56.** An organisation uses Terraform Cloud and wants to store sensitive variables (like API keys) without exposing them to users. How should they configure these variables?

A) Mark the variable as "sensitive" in the Terraform Cloud variable interface  
B) Store the API key in the Terraform configuration file  
C) Pass the API key as a command-line argument  
D) Store the API key in the remote backend configuration

---

**Q57.** Which of the following is a benefit of using Terraform Cloud's remote execution mode?

A) Terraform runs on HashiCorp's infrastructure, enabling collaboration and audit logging  
B) Terraform runs faster because it uses distributed compute  
C) Terraform Cloud replaces the need for cloud provider credentials  
D) Remote execution eliminates the need for state locking

---

## 📋 Answer Key

<details>
<summary>Click to reveal answers and explanations</summary>

| #  | Answer | Explanation |
|----|--------|-------------|
| 1  | **B** | Immutable infrastructure is replaced, never modified in place. This is a core IaC principle. |
| 2  | **A** | Terraform workspaces with environment-specific `.tfvars` files allow identical configs across isolated environments. |
| 3  | **B** | Terraform does not automatically roll back failed changes. You must manually address failed applies. |
| 4  | **B** | Best practice is to separate provisioning (Terraform) from configuration management (Ansible, Chef, etc.). |
| 5  | **A** | Hard-coding AMI IDs leads to drift and stale references. Use `data "aws_ami"` to look up the latest. |
| 6  | **C** | Terraform is declarative — you define the desired state and Terraform determines the steps needed. |
| 7  | **B** | Running `terraform plan/apply` independently for each service directory provides isolation. |
| 8  | **A** | `terraform validate` checks syntax and internal consistency without contacting providers. |
| 9  | **A** | `terraform init` downloads and installs the providers defined in the configuration. |
| 10 | **B** | `terraform --help` lists available subcommands. Running `terraform` alone shows a brief usage message. |
| 11 | **A** | Terraform uses the default provider configuration (without alias) for resources that don't specify one. |
| 12 | **A** | `terraform init` is required to install any new provider before it can be used. |
| 13 | **A** | `.terraform.lock.hcl` records the exact provider versions used for reproducible builds. |
| 14 | **A** | A network connectivity issue preventing access to the Terraform Registry is the most common cause. |
| 15 | **A, B** | Both `terraform version` and `terraform --version` display the Terraform version. `terraform providers` shows provider requirements. |
| 16 | **B** | Terraform checks the version constraint and returns an error since 1.7.3 does not meet `< 1.6`. |
| 17 | **A** | The default backend is `local`, which stores state in a local `terraform.tfstate` file. |
| 18 | **A** | The core workflow is `init` → `plan` → `apply`. |
| 19 | **A** | "1 to add" means one resource will be created, "0 to change" means none modified, "0 to destroy" means none deleted. |
| 20 | **A** | The `-out` flag saves the plan to a binary file that can be applied later. |
| 21 | **A** | Without a saved plan file, `terraform apply` runs a new plan and prompts for confirmation. |
| 22 | **C** | Both `terraform destroy` and `terraform apply -destroy` are valid ways to destroy managed resources. |
| 23 | **A** | The plan output can be truncated in some terminals. Using `-no-color` and piping output to a file can help view the full plan. For large plans, save with `-out` and use `terraform show` to see complete details. |

</details>

---
title: "Exam Practice Test 5"
weight: 22
bookFlatSection: true
---

# 📝 Terraform Associate — Practice Test 5

> **Instructions:** This test contains **57 multiple-choice questions** covering all 7 domains of the Terraform Associate exam. Choose the **best** answer for each question. Some questions include code snippets. Time yourself — aim for **60 minutes** for the full set. A passing score is **70% (40/57)**.

---
<div class="exam-controls">
  <div class="exam-timer" data-minutes="60" data-test-id="exam-test-5">
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
    <input type="checkbox" class="test-complete-check" id="test-complete-5" data-test-id="exam-test-5">
    <label for="test-complete-5">✓ Mark test as completed</label>
  </div>
</div>

## Domain 1: Infrastructure as Code (7 Questions — Q1–Q7)

**Q1.** Which principle ensures a Terraform configuration produces the same infrastructure every time it is applied, regardless of when or by whom it is run?

A) Idempotency  
B) Abstraction  
C) Parallelism  
D) Modularity

---

**Q2.** A company adopts IaC and wants to audit who made changes to infrastructure over time. Which practice is most important for this goal?

A) Storing all Terraform configurations in a version-controlled repository  
B) Running `terraform apply` with `-auto-approve`  
C) Using the local backend for state storage  
D) Manually recording all infrastructure changes in a spreadsheet

---

**Q3.** Which of the following BEST describes the principle of "Infrastructure as Code"?

A) Managing and provisioning infrastructure through machine-readable definition files  
B) Writing shell scripts to create cloud resources  
C) Using a web console to manually configure cloud services  
D) Creating virtual machines with a GUI-based tool

---

**Q4.** An operations team wants to ensure that development, staging, and production environments are identical. How does IaC help?

A) By defining infrastructure in code that can be applied consistently across environments  
B) By copying virtual machine images between environments  
C) By using a configuration management tool that runs weekly  
D) By manually verifying each environment after deployment

---

**Q5.** What is the role of a provider in Terraform?

A) A plugin that enables interaction with a specific cloud platform or service  
B) A module that creates resources  
C) A configuration file that defines variables  
D) A backend that stores state

---

**Q6.** A team wants to implement guardrails so that no one can accidentally create expensive infrastructure. Which IaC approach is BEST suited to this?

A) Using policy-as-code tools (e.g., Sentinel, OPA) to enforce rules before apply  
B) Training all team members on cost awareness  
C) Reviewing monthly billing reports  
D) Setting up budget alerts in the cloud provider

---

**Q7.** When you define a resource in Terraform, what does Terraform compare during `plan` to determine what to create, update, or delete?

A) The configuration against the current state file  
B) The configuration against the cloud provider's documentation  
C) The state file against the Terraform Registry  
D) The configuration against environment variables

---

## Domain 2: Terraform Basics (10 Questions — Q8–Q17)

**Q8.** A user runs `terraform init` and receives the following warning:
```
Warning: Incomplete lock file information for providers
```
What does this warning indicate?

A) The `.terraform.lock.hcl` file does not include checksums for all platforms  
B) The state file is locked  
C) The provider configuration is missing a required argument  
D) The provider plugin has not been downloaded

---

**Q9.** Which file extension is used for Terraform configuration files?

A) `.tf`  
B) `.hcl`  
C) `.tf.json`  
D) All of the above

---

**Q10.** A user wants to see the full dependency tree of providers and modules used in the configuration. Which command provides this?

A) `terraform providers`  
B) `terraform graph`  
C) `terraform init`  
D) `terraform plan`

---

**Q11.** What does `terraform get` do?

A) Downloads and updates modules referenced in the configuration  
B) Downloads provider plugins  
C) Retrieves the current state from the backend  
D) Installs the Terraform CLI

---

**Q12.** A user runs `terraform init` in a directory without any `.tf` files. What happens?

A) Terraform returns an error about no configuration files found  
B) Terraform creates an empty `.terraform/` directory  
C) Terraform asks the user to specify a configuration file  
D) Terraform automatically generates a default configuration

---

**Q13.** What is the purpose of the `TF_VAR_` environment variable prefix?

A) To set input variable values via environment variables  
B) To configure the Terraform backend  
C) To specify the Terraform binary path  
D) To set provider credentials

---

**Q14.** Which command generates a visual graph of Terraform resource dependencies?

A) `terraform graph`  
B) `terraform plan`  
C) `terraform show`  
D) `terraform visualize`

---

**Q15.** Consider:
```hcl
terraform {
  required_version = ">= 1.4, < 1.7"
}
```
A user has Terraform 1.8.2 installed. What happens when they run `terraform init`?

A) Terraform returns an error because 1.8.2 is not < 1.7  
B) Terraform proceeds normally because 1.8.2 >= 1.4  
C) Terraform ignores the constraint and proceeds  
D) Terraform downgrades to the latest 1.6.x version

---

**Q16.** When using a remote backend, what must be run before `terraform plan` to ensure the local `.terraform` directory is configured?

A) `terraform init`  
B) `terraform validate`  
C) `terraform refresh`  
D) `terraform workspace new`

---

**Q17.** Which command lists the workspaces in the current configuration?

A) `terraform workspace list`  
B) `terraform workspace show`  
C) `terraform workspace new`  
D) `terraform list -workspaces`

---

## Domain 3: Terraform Workflow (9 Questions — Q18–Q26)

**Q18.** A user runs `terraform plan -out=plan.tfplan` and then `terraform apply plan.tfplan`. What is the benefit of this two-step process?

A) It ensures the exact same plan is applied, preventing configuration drift between plan and apply  
B) It speeds up the apply process  
C) It creates a backup of the state file  
D) It reduces the number of API calls to the cloud provider

---

**Q19.** Which Terraform command would you use to view the resource details from a saved plan file?

A) `terraform show plan.tfplan`  
B) `terraform plan plan.tfplan`  
C) `terraform apply plan.tfplan -dry-run`  
D) `terraform state show plan.tfplan`

---

**Q20.** What does the `-auto-approve` flag do in `terraform apply`?

A) It skips the interactive approval prompt  
B) It automatically approves the plan after a manual review  
C) It approves the plan only if there are no destroy operations  
D) It validates the configuration before applying

---

**Q21.** A user runs `terraform apply` and gets the error:
```
Error: Error acquiring the state lock
```
What is the most likely cause?

A) Another user or process currently has a lock on the state  
B) The state file does not exist  
C) The configuration has syntax errors  
D) The cloud provider credentials are expired

---

**Q22.** What is the purpose of running `terraform fmt -check` in a CI pipeline?

A) To verify that all Terraform files are properly formatted without modifying them  
B) To automatically format all files  
C) To check for syntax errors  
D) To validate the configuration against best practices

---

**Q23.** A user wants to see a diff of changes in the plan output. Which format displays the plan as a unified diff?

A) By default, Terraform plan output is already in a diff-like format  
B) Use `terraform plan -diff`  
C) Use `terraform plan -out=plan.tfplan && terraform show plan.tfplan`  
D) Use `terraform plan --format=diff`

---

**Q24.** When using the `-target` flag with `terraform apply`, which statement is TRUE?

A) -target creates a dependency graph including only the targeted resource and its dependencies  
B) -target applies only the targeted resource, ignoring all dependencies  
C) -target prevents any destroy operations on untargeted resources  
D) -target is the recommended way to apply changes in production

---

**Q25.** Which command restores the local state from a remote backend?

A) `terraform state pull`  
B) `terraform state push`  
C) `terraform refresh`  
D) `terraform apply -refresh-only`

---

**Q26.** A user accidentally deletes the `terraform.tfstate` file locally but has a remote backend configured. What should they do?

A) Run `terraform init` to reinitialize, then `terraform state pull` to restore  
B) Recreate the state file manually  
C) Run `terraform import` for every resource  
D) Delete the `.terraform/` directory and start over

---

## Domain 4: Terraform Configuration (10 Questions — Q27–Q36)

**Q27.** Consider:
```hcl
resource "aws_instance" "example" {
  ami           = var.ami_id
  instance_type = var.instance_type
}
```
Which file can provide values for `var.ami_id` and `var.instance_type` without being explicitly passed on the command line?

A) `terraform.tfvars`  
B) `backend.tf`  
C) `outputs.tf`  
D) `versions.tf`

---

**Q28.** What does the `cidrsubnet()` function do?

A) Calculates a subnet CIDR within a given prefix  
B) Converts a CIDR to a subnet mask  
C) Validates whether a given IP is within a CIDR range  
D) Splits a CIDR range into IP addresses

---

**Q29.** Given:
```hcl
variable "tags" {
  type    = map(string)
  default = {
    Owner = "Platform"
  }
}
```
Which expression correctly adds a "CostCenter" tag to the existing tags?

A) `merge(var.tags, { CostCenter = "12345" })`  
B) `concat(var.tags, { CostCenter = "12345" })`  
C) `var.tags + { CostCenter = "12345" }`  
D) `lookup(var.tags, "CostCenter", "12345")`

---

**Q30.** Which of the following is a valid way to reference an element from a list variable `var.subnets` at index 0?

A) `var.subnets[0]`  
B) `element(var.subnets, 0)`  
C) Both A and B are valid  
D) `var.subnets.0`

---

**Q31.** Consider:
```hcl
locals {
  prefix = "prod"
  names  = [for i in range(3) : "${local.prefix}-app-${i}"]
}
```
What is the value of `local.names`?

A) `["prod-app-0", "prod-app-1", "prod-app-2"]`  
B) `["prod-app-1", "prod-app-2", "prod-app-3"]`  
C) `["prod-app"]`  
D) An error because `range(3)` returns [0, 1, 2]

---

**Q32.** What is the purpose of the `setproduct()` function?

A) Generates a list of all combinations of elements from multiple sets  
B) Finds the intersection of two sets  
C) Removes duplicates from a list  
D) Sorts a set of strings alphabetically

---

**Q33.** Given:
```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}
```
What is `data.aws_ami.ubuntu`?

A) A data source that fetches information about an AMI at plan time  
B) A managed resource that creates an AMI  
C) An output value  
D) A variable declaration

---

**Q34.** Which function can be used to safely access an index in a list and return a default if the index is out of bounds?

A) `element()`  
B) `try()`  
C) `can()`  
D) `coalesce()`

---

**Q35.** Consider:
```hcl
locals {
  enabled = true
}
resource "aws_instance" "web" {
  count = local.enabled ? 1 : 0
  ami   = "ami-12345"
}
```
If `local.enabled` is false, what happens when `terraform apply` is run?

A) No EC2 instance is created  
B) The EC2 instance is created with count index 0  
C) Terraform returns an error because count cannot be 0  
D) The EC2 instance is destroyed if it already exists

---

**Q36.** What does the `chomp()` function do?

A) Removes trailing newlines from a string  
B) Removes whitespace from both ends of a string  
C) Replaces all newlines with spaces  
D) Truncates a string to a specified length

---

## Domain 5: Terraform State (8 Questions — Q37–Q44)

**Q37.** A user runs `terraform state list` and sees the output:
```
aws_instance.web
aws_security_group.web_sg
```
What does this output represent?

A) The resources currently tracked in Terraform state  
B) The resources defined in the configuration files  
C) The resources available in the cloud provider  
D) The resources in a saved plan file

---

**Q38.** Which of the following is a valid reason to use a remote state backend?

A) To enable team collaboration and state sharing  
B) To eliminate the need for `terraform init`  
C) To make Terraform run faster  
D) To avoid needing cloud provider credentials

---

**Q39.** A user wants to remove a resource from Terraform management without destroying it. Which command should they use?

A) `terraform state rm <resource_address>`  
B) `terraform destroy -target=<resource_address>`  
C) `terraform state mv <resource_address>`  
D) `terraform apply -destroy`

---

**Q40.** When using an S3 backend for Terraform state, what additional service is commonly used to prevent concurrent modifications?

A) DynamoDB  
B) CloudWatch  
C) AWS Config  
D) CloudTrail

---

**Q41.** A user runs `terraform apply` and it fails halfway through. What is the state of the infrastructure?

A) Some resources were created, and the state reflects what was created  
B) All changes were rolled back automatically  
C) No resources were created  
D) The state file was reset to its previous state

---

**Q42.** What is the effect of the `-refresh=false` flag on `terraform plan`?

A) Terraform skips querying the cloud provider and uses the current state as-is  
B) Terraform performs a full refresh of all resources  
C) Terraform refreshes only the state file, not the resources  
D) Terraform skips the plan entirely

---

**Q43.** What does `terraform state push` do?

A) Overwrites the remote state with the local state  
B) Downloads the remote state to the local file  
C) Pushes the configuration to the cloud provider  
D) Creates a backup of the state file

---

**Q44.** Which of the following is NOT stored in Terraform state?

A) The Terraform binary version used to create the resource  
B) Resource attributes and metadata  
C) Provider version information  
D) Resource dependencies

---

## Domain 6: Terraform Modules (7 Questions — Q45–Q51)

**Q45.** A team maintains a module at `git::https://github.com/team/module.git?ref=v2.0.0`. What does the `?ref=v2.0.0` specify?

A) The Git tag or branch to checkout  
B) The Terraform version to use  
C) The module output format  
D) The provider version within the module

---

**Q46.** A user calls a module with the following:
```hcl
module "networking" {
  source   = "./modules/networking"
  vpc_cidr = "10.0.0.0/16"
}
```
Where should the `vpc_cidr` input variable be defined?

A) In the module's `variables.tf` file  
B) In the root module's `variables.tf` file  
C) In the module's `outputs.tf` file  
D) In the root module's `terraform.tfvars` file

---

**Q47.** When a module is called multiple times with different sources, how does Terraform handle provider initialisation?

A) Each module call initialises its own set of providers  
B) All modules share the root module's providers  
C) Providers are only initialised for the first module call  
D) Modules cannot use different sources in the same configuration

---

**Q48.** Which of the following is a best practice for publishing modules to a private registry?

A) Use semantic versioning and include a `README.md` with usage examples  
B) Omit versioning and let users reference the latest commit  
C) Include cloud provider credentials in the module  
D) Hard-code resource configurations for simplicity

---

**Q49.** A module declares:
```hcl
variable "create_bucket" {
  type    = bool
  default = true
}
```
How can the root module conditionally create the S3 bucket?

A) Use `count = var.create_bucket ? 1 : 0` on resources inside the module  
B) The root module cannot control conditional creation inside a module  
C) Use `for_each = var.create_bucket` on the module block  
D) Wrap the module call in an `if` statement

---

**Q50.** What is the purpose of the `module` block's `depends_on` argument?

A) To explicitly declare dependencies between module calls  
B) To set the order of resources within a module  
C) To define dependencies between providers  
D) To ensure modules are downloaded before init

---

**Q51.** Which statement about module versioning is TRUE?

A) Modules sourced from the Terraform Registry can specify a `version` constraint  
B) Git-sourced modules can use `?ref=` for version control, but Registry modules cannot  
C) Local modules support semantic versioning natively  
D) Version constraints on modules are optional and have no effect

---

## Domain 7: Terraform Cloud & Enterprise (6 Questions — Q52–Q57)

**Q52.** In Terraform Cloud, what is a "run"?

A) An execution of `terraform plan` and/or `terraform apply` for a workspace  
B) A single `terraform init` command  
C) A user login session  
D) A scheduled backup of state files

---

**Q53.** What happens when a Terraform Cloud run is discarded before applying?

A) The plan is cancelled and no changes are made  
B) The plan is applied automatically after a timeout  
C) The state file is rolled back  
D) The plan is saved for later use

---

**Q54.** What is a "speculative plan" in Terraform Cloud?

A) A plan triggered by a pull request that is not intended to be applied  
B) A plan that runs across multiple cloud providers  
C) A plan that only destroys resources  
D) A plan that runs on a schedule

---

**Q55.** How does Terraform Cloud handle execution mode for workspaces?

A) Workspaces can be configured for local, remote, or agent execution  
B) All workspaces use the same execution mode globally  
C) Execution mode is determined by the Terraform version  
D) Remote execution is the only mode supported

---

**Q56.** An organisation wants to enforce that all AWS S3 buckets must have versioning enabled. Which tool in Terraform Cloud/Enterprise can enforce this?

A) Sentinel policies  
B) Team management  
C) Workspace variables  
D) Cost estimation

---

**Q57.** Which Terraform Cloud feature allows users to store variable sets that can be shared across multiple workspaces?

A) Variable sets  
B) Shared variables  
C) Environment variables  
D) Global variables

---

## 📋 Answer Key

<details>
<summary>Click to reveal answers and explanations</summary>

| #  | Answer | Explanation |
|----|--------|-------------|
| 1  | **A** | Idempotency means applying the same configuration repeatedly produces the same result. |
| 2  | **A** | Version control provides a complete audit trail of who changed what and when. |
| 3  | **A** | IaC means managing infrastructure through machine-readable definition files (code). |
| 4  | **A** | IaC allows consistent, repeatable deployments across environments using the same code. |
| 5  | **A** | Providers are plugins that allow Terraform to interact with cloud platforms via their APIs. |
| 6  | **A** | Policy-as-code (Sentinel, OPA) enforces rules before resources are created, preventing cost overruns. |
| 7  | **A** | Terraform compares the configuration against the current state to determine changes needed. |
| 8  | **A** | The warning means the lock file lacks checksums for all platforms, which may cause issues in CI/CD. |
| 9  | **D** | Terraform accepts `.tf` (HCL) and `.tf.json` (JSON) as configuration file extensions. |
| 10 | **A** | `terraform providers` shows the dependency tree of all required providers. |
| 11 | **A** | `terraform get` downloads and updates modules referenced in the configuration. |
| 12 | **A** | Terraform returns an error if no `.tf` or `.tf.json` files are found in the directory. |
| 13 | **A** | The `TF_VAR_<name>` prefix sets the value of input variable `<name>` via environment variable. |
| 14 | **A** | `terraform graph` generates a DOT-formatted dependency graph. |
| 15 | **A** | The version constraint `< 1.7` prevents 1.8.2 from satisfying the requirement. |
| 16 | **A** | `terraform init` must be run before `plan` to configure the backend and download providers. |
| 17 | **A** | `terraform workspace list` shows all workspaces for the current configuration. |
| 18 | **A** | Saving a plan file ensures the exact same plan is applied, preventing configuration drift. |
| 19 | **A** | `terraform show plan.tfplan` displays the contents of a saved plan file. |
| 20 | **A** | `-auto-approve` skips the interactive confirmation prompt during apply. |
| 21 | **A** | The error indicates another process holds the state lock — common in team environments. |
| 22 | **A** | `terraform fmt -check` verifies formatting and exits with non-zero if files need formatting. |
| 23 | **A** | Terraform plan output is already in a diff-like format showing changes. |
| 24 | **A** | `-target` applies the targeted resource and its dependencies (use with caution). |
| 25 | **A** | `terraform state pull` downloads the remote state to local stdout. |
| 26 | **A** | After `terraform init`, `terraform state pull` restores the local state from the remote backend. |
| 27 | **A** | `terraform.tfvars` is automatically loaded to provide variable values. |
| 28 | **A** | `cidrsubnet()` calculates a subnet CIDR within a given prefix (e.g., `cidrsubnet("10.0.0.0/16", 8, 0)`). |
| 29 | **A** | `merge()` combines maps, adding or overwriting keys. |
| 30 | **C** | Both index syntax (`var.subnets[0]`) and `element()` function are valid ways to access list elements. |
| 31 | **A** | The `for` expression iterates over `range(3)` = [0, 1, 2], producing the three strings. |
| 32 | **A** | `setproduct()` generates all combinations of elements from multiple sets (Cartesian product). |
| 33 | **A** | Data sources fetch information from providers (read-only) at plan time. |
| 34 | **B** | `try()` attempts an expression and returns a default if it fails (e.g., out-of-bounds index). |
| 35 | **A** | `count = 0` means no instances are created. |
| 36 | **A** | `chomp()` removes trailing newline characters from a string. |
| 37 | **A** | `terraform state list` shows all resources tracked in the current state. |
| 38 | **A** | Remote backends enable team collaboration, state sharing, and locking. |
| 39 | **A** | `terraform state rm` removes a resource from state without destroying real infrastructure. |
| 40 | **A** | DynamoDB is used alongside S3 to provide state locking for concurrent access prevention. |
| 41 | **A** | Terraform saves state incrementally — created resources are recorded even if the apply fails later. |
| 42 | **A** | `-refresh=false` skips querying provider APIs and uses the current state values as-is. |
| 43 | **A** | `terraform state push` overwrites the remote state with local state (use with extreme caution). |
| 44 | **A** | The Terraform binary version is not stored in state. Provider version may be stored. |
| 45 | **A** | The `?ref=<tag>` query parameter specifies the Git tag, branch, or commit to checkout. |
| 46 | **A** | Module input variables must be declared in the module itself (typically `variables.tf`). |
| 47 | **B** | Child modules inherit provider configurations from the root module by default. |
| 48 | **A** | Semver and documentation are best practices for published modules (public or private). |
| 49 | **A** | Conditional creation inside modules uses `count` on resources: `count = var.create_bucket ? 1 : 0`. |
| 50 | **A** | `depends_on` in a module block explicitly declares inter-module dependencies. |
| 51 | **A** | Registry modules can specify `version` constraints; Git modules use `?ref=` for the same purpose. |
| 52 | **A** | A run is a complete plan + apply (or plan-only) lifecycle for a workspace. |
| 53 | **A** | Discarding a run cancels the plan with no changes applied. |
| 54 | **A** | Speculative plans show the impact of a PR without being applied — used in VCS-driven workflow. |
| 55 | **A** | Each workspace can be configured for local, remote (Terraform Cloud), or agent execution. |
| 56 | **A** | Sentinel is the policy-as-code framework in Terraform Cloud/Enterprise for governance. |
| 57 | **A** | Variable sets are reusable groups of variables that can be assigned to multiple workspaces. |

</details>

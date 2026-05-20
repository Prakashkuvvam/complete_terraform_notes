---
title: "Exam Practice Test 4"
weight: 21
bookFlatSection: true
---

# 📝 Terraform Associate — Practice Test 4

> **Instructions:** This test contains **57 multiple-choice questions** covering all 7 domains of the Terraform Associate exam. Choose the **best** answer for each question. Some questions include code snippets. Time yourself — aim for **60 minutes** for the full set. A passing score is **70% (40/57)**.

---
<div class="exam-controls">
  <div class="exam-timer" data-minutes="60" data-test-id="exam-test-4">
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
    <input type="checkbox" class="test-complete-check" id="test-complete-4" data-test-id="exam-test-4">
    <label for="test-complete-4">✓ Mark test as completed</label>
  </div>
</div>

## Domain 1: Infrastructure as Code (7 Questions — Q1–Q7)

**Q1.** Which of the following is an example of IaC provisioning rather than configuration management?

A) Installing a web server package on an EC2 instance  
B) Creating an EC2 instance using Terraform  
C) Patching the operating system of an existing server  
D) Deploying an application binary to a server

---

**Q2.** A team stores their Terraform configurations in Git and uses pull requests for all changes. What IaC principle is this primarily supporting?

A) Idempotency  
B) Version control and peer review  
C) Immutable infrastructure  
D) Secret management

---

**Q3.** Which statement BEST describes idempotency in the context of IaC?

A) Running the same configuration multiple times produces the same result  
B) The infrastructure is destroyed and recreated each time  
C) Configuration files are stored in a central repository  
D) The same configuration can be applied to any cloud provider

---

**Q4.** An organisation has a compliance requirement that all infrastructure changes must go through a change approval process. How does IaC help meet this requirement?

A) IaC automatically approves all changes  
B) IaC enables change review through pull requests and plan outputs  
C) IaC bypasses manual review because it is automated  
D) IaC stores all change history in the state file

---

**Q5.** When would a team choose Terraform over AWS CloudFormation?

A) When they want a cloud-agnostic IaC tool that works across AWS, Azure, and GCP  
B) When they only use AWS services  
C) When they need native AWS integration with no additional tooling  
D) When they want to use YAML-based configuration files

---

**Q6.** A company wants to enforce tagging standards across all cloud resources. Which IaC practice BEST enables this?

A) Using `default_tags` in the AWS provider configuration  
B) Writing a post-deployment script to add tags  
C) Manually tagging resources after creation  
D) Using AWS Config rules to detect untagged resources

---

**Q7.** Which scenario describes a configuration drift in IaC-managed infrastructure?

A) Someone manually modifies a resource through the cloud console, causing it to differ from the Terraform configuration  
B) Terraform successfully applies changes to a resource  
C) A developer updates the Terraform configuration in a pull request  
D) Terraform state is refreshed to match real infrastructure

---

## Domain 2: Terraform Basics (10 Questions — Q8–Q17)

**Q8.** When you run `terraform init` in a directory containing HCL files, what is created?

A) A `.terraform/` directory with provider plugins and module code  
B) A `terraform.tfstate` file  
C) A `plan.tfplan` file  
D) A `terraform.tfvars` file

---

**Q9.** A user runs `terraform version` and sees:
```
Terraform v1.5.3
```
What additional information can this command show?

A) The versions of all configured providers  
B) The platform and architecture details  
C) The latest available Terraform version  
D) The version of Terraform Cloud being used

---

**Q10.** Which of the following is true about the `terraform.tfstate` file?

A) It is a JSON file containing the current state of managed infrastructure  
B) It is a binary file that cannot be read by humans  
C) It is automatically added to `.gitignore` by `terraform init`  
D) It contains only the resource names, not their attributes

---

**Q11.** A user accidentally runs `terraform apply` in the wrong directory. What is the first thing they should check to understand what was created?

A) `terraform.tfstate`  
B) `terraform show`  
C) `terraform output`  
D) `terraform providers`

---

**Q12.** What command should be run after cloning a repository containing Terraform configurations?

A) `terraform init`  
B) `terraform plan`  
C) `terraform apply`  
D) `terraform validate`

---

**Q13.** A developer wants to see all available providers and their versions in the current configuration. Which command should they use?

A) `terraform providers`  
B) `terraform version`  
C) `terraform init`  
D) `terraform provider list`

---

**Q14.** Which Terraform command has a `-short` flag that shows a simplified version of the output?

A) `terraform version`  
B) `terraform plan`  
C) `terraform validate`  
D) `terraform output`

---

**Q15.** Given the following:
```hcl
terraform {
  required_version = "~> 1.5"
}
```
Which Terraform versions satisfy this constraint?

A) 1.5.0, 1.5.1, 1.5.9, but not 1.6.0  
B) Any version 1.5 or higher  
C) Only 1.5.0 exactly  
D) 1.5.0 through 1.9.9

---

**Q16.** A user runs `terraform init` and gets the following output:
```
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 4.0"...
```
What does `~> 4.0` mean?

A) Any 4.x version (4.0, 4.1, 4.2, etc.) but not 5.0  
B) Only version 4.0 exactly  
C) Any version 4.0 or higher  
D) Any version between 4.0 and 4.5

---

**Q17.** Which directory is created by `terraform init` and contains provider plugins?

A) `.terraform/providers/`  
B) `terraform/providers/`  
C) `.terraform/plugins/`  
D) `provider/`

---

## Domain 3: Terraform Workflow (9 Questions — Q18–Q26)

**Q18.** After `terraform apply` completes successfully, which file is updated?

A) `terraform.tfstate`  
B) `.terraform.lock.hcl`  
C) `plan.tfplan`  
D) `terraform.tfvars`

---

**Q19.** Which Terraform command outputs the current state in a human-readable format?

A) `terraform show`  
B) `terraform state list`  
C) `terraform plan`  
D) `terraform output`

---

**Q20.** A user runs `terraform plan` and sees the following:
```
Plan: 0 to add, 1 to change, 0 to destroy.
```
Which scenario BEST explains this output?

A) A resource attribute has changed in the configuration  
B) A new resource was added to the configuration  
C) A resource was removed from the configuration  
D) The state file is empty

---

**Q21.** What is the purpose of running `terraform plan` before `terraform apply`?

A) To preview the changes that Terraform will make without executing them  
B) To run syntax validation on the configuration files  
C) To download and install provider plugins  
D) To refresh the state file by querying real infrastructure

---

**Q22.** A user wants to see what resources are currently tracked in the Terraform state. Which command should they use?

A) `terraform state list`  
B) `terraform state show`  
C) `terraform plan`  
D) `terraform output`

---

**Q23.** What happens when a user rejects the confirmation prompt during `terraform apply`?

A) No changes are made to the infrastructure  
B) Partial changes are applied and rolled back  
C) The plan is saved to apply later  
D) The state file is still updated

---

**Q24.** Which flag can you add to `terraform plan` to have it exit with a non-zero exit code if there are changes?

A) `-detailed-exitcode`  
B) `-out=tfplan`  
C) `-no-color`  
D) `-input=false`

---

**Q25.** A user wants to destroy only a specific resource without affecting others. What should they do?

A) Remove the resource from the configuration and run `terraform apply`  
B) Run `terraform destroy -target=resource_type.resource_name`  
C) Run `terraform state rm` on the resource  
D) Comment out the resource in the configuration and run `terraform apply`

---

**Q26.** After running `terraform apply`, what command shows the output values?

A) `terraform output`  
B) `terraform show`  
C) `terraform state list`  
D) `terraform plan`

---

## Domain 4: Terraform Configuration (10 Questions — Q27–Q36)

**Q27.** Consider the following:
```hcl
variable "instance_count" {
  type    = number
  default = 2
}
```
If the user does not provide a value for `instance_count`, what value will be used?

A) 2  
B) 0  
C) null  
D) Terraform will prompt for a value

---

**Q28.** What is the purpose of a `terraform.tfvars` file?

A) To provide values for input variables  
B) To define the Terraform backend configuration  
C) To specify provider configurations  
D) To list output values

---

**Q29.** Given the following:
```hcl
locals {
  envs = {
    dev     = "dev"
    staging = "stg"
    prod    = "prd"
  }
  env_prefix = lookup(local.envs, "staging", "unknown")
}
```
What is the value of `local.env_prefix`?

A) `stg`  
B) `staging`  
C) `dev`  
D) `unknown`

---

**Q30.** Which function converts a value to a string representation?

A) `tostring()`  
B) `str()`  
C) `format()`  
D) `string()`

---

**Q31.** Consider:
```hcl
output "public_ip" {
  value = aws_instance.web.public_ip
}
```
What happens if `aws_instance.web` does not have a `public_ip` attribute (e.g., it's in a private subnet)?

A) Terraform assigns a value of `null` to the output  
B) Terraform returns an error  
C) The output is skipped automatically  
D) Terraform assigns an empty string

---

**Q32.** Which operator checks if a value is null?

A) `coalesce()`  
B) `can()`  
C) `try()`  
D) `isnull()`

---

**Q33.** Given:
```hcl
resource "aws_iam_policy" "policy" {
  name   = "custom-policy-${count.index}"
  policy = data.aws_iam_policy_document.example.json
  count  = 3
}
```
How many IAM policies are created?

A) 3  
B) 1  
C) 0  
D) Depends on the number of policy documents

---

**Q34.** What is the difference between `for_each` and `count`?

A) `for_each` works with sets and maps; `count` works with numbers  
B) `count` works with sets and maps; `for_each` works with numbers  
C) `for_each` creates resources in sequence; `count` creates them in parallel  
D) There is no difference — they are interchangeable

---

**Q35.** Consider:
```hcl
resource "aws_s3_bucket" "logs" {
  bucket = "app-logs-${var.environment}"
  tags = {
    Name        = "App Logs"
    Environment = var.environment
  }
}
```
What happens if `var.environment` is `null`?

A) Terraform returns an error because a string interpolation cannot use null  
B) The bucket name becomes `app-logs-null`  
C) Terraform skips the tag  
D) The resource is not created

---

**Q36.** Which of the following is valid syntax for a `for` expression?

A) `[for k, v in var.map : k => v]`  
B) `[for k, v in var.map : "${k}=${v}"]`  
C) `for k, v in var.map : k => v`  
D) `{for k, v in var.map : k}`

---

## Domain 5: Terraform State (8 Questions — Q37–Q44)

**Q37.** A user wants to see the attributes of a specific resource in the state. Which command should they run?

A) `terraform state show <resource_address>`  
B) `terraform state list <resource_address>`  
C) `terraform show <resource_address>`  
D) `terraform output <resource_address>`

---

**Q38.** What is the primary risk of storing Terraform state in version control (e.g., Git)?

A) Sensitive data may be exposed  
B) State files cannot be read by Git  
C) State files are too large for Git to handle  
D) Git does not support JSON files

---

**Q39.** When using an S3 backend for state, what is the purpose of the `key` argument?

A) It specifies the path to the state file within the S3 bucket  
B) It encrypts the state file  
C) It sets the AWS access key for the backend  
D) It defines the DynamoDB table for locking

---

**Q40.** A user needs to share output values from one Terraform configuration with another. Which approach is the most secure?

A) Use `terraform_remote_state` data source with an encrypted backend  
B) Hard-code the output values in the second configuration  
C) Store outputs in a shared text file  
D) Use environment variables to pass values

---

**Q41.** What does `terraform state pull` do?

A) Downloads the current state from the remote backend to local stdout  
B) Forces Terraform to refresh the state  
C) Pushes local state to the remote backend  
D) Lists all resources in the state

---

**Q42.** A user wants to replace a resource without destroying and recreating it in the same operation. Which command marks a resource for recreation?

A) `terraform taint`  
B) `terraform state rm`  
C) `terraform destroy -target`  
D) `terraform apply -replace`

---

**Q43.** What condition would cause Terraform to show "0 to add, 0 to change, 0 to destroy" in a plan?

A) The configuration matches the current state, and the state matches real infrastructure  
B) The state file is empty  
C) The cloud provider credentials are invalid  
D) The configuration has syntax errors

---

**Q44.** A user moves a resource from one state file to another using `terraform state mv`. Which statement is TRUE?

A) The resource is now managed by the destination state file  
B) The resource is destroyed and recreated  
C) The source state file keeps the resource  
D) Both state files now manage the same resource

---

## Domain 6: Terraform Modules (7 Questions — Q45–Q51)

**Q45.** What is the recommended way to version a Terraform module in a private Git repository?

A) Use Git tags to mark versions  
B) Use the `version` argument inside the module block  
C) Use a `versions.tf` file in the module  
D) Use Terraform Cloud's module registry

---

**Q46.** A module declares the following variable:
```hcl
variable "instance_type" {
  type = string
}
```
Is it possible to set a default value for this variable?

A) Yes, by adding `default = "t2.micro"` to the variable block  
B) No, modules cannot have default values  
C) Yes, but only if the module is from the Terraform Registry  
D) No, variables must be provided when the module is called

---

**Q47.** What output does a module provide to the root module?

A) Only the values explicitly declared in `output` blocks  
B) All resource attributes within the module  
C) Only the resource IDs  
D) Nothing — modules do not return values to the root module

---

**Q48.** A module is placed in the `./modules/networking` directory. What is the correct `source` argument in the root configuration?

A) `"./modules/networking"`  
B) `"modules/networking"`  
C) `"./networking"`  
D) `"terraform-modules/networking"`

---

**Q49.** When a module uses `count` or `for_each`, how do you reference a specific instance of the module's outputs?

A) `module.vpc[0].output_name`  
B) `module.vpc.output_name[0]`  
C) `module.vpc.0.output_name`  
D) `module["vpc"][0].output_name`

---

**Q50.** Which statement about module dependencies is TRUE?

A) Terraform automatically determines module dependencies by analysing references  
B) Modules always run in parallel  
C) You must declare dependencies explicitly with `depends_on`  
D) Module dependencies are random

---

**Q51.** A user wants to publish an internal module that can be used by multiple teams. What is the recommended approach?

A) Create a dedicated module repository with semantic versioning  
B) Store the module in a shared network drive  
C) Copy the module files into each team's project  
D) Publish the module to the public Terraform Registry

---

## Domain 7: Terraform Cloud & Enterprise (6 Questions — Q52–Q57)

**Q52.** In Terraform Cloud, what is the purpose of an "organization"?

A) A container for workspaces, teams, and settings  
B) A single Terraform configuration  
C) A cloud provider account  
D) A backend configuration for state storage

---

**Q53.** How does Terraform Cloud handle state file access for teams?

A) Each workspace has its own isolated state, with role-based access control  
B) All workspaces share a single state file  
C) State is stored locally on each team member's machine  
D) State is stored in a shared Git repository

---

**Q54.** What is the purpose of cost estimation in Terraform Cloud?

A) To estimate the monthly cost of the infrastructure described in the plan  
B) To calculate the cost of running Terraform Cloud  
C) To estimate the time required for deployment  
D) To compare costs across multiple cloud providers

---

**Q55.** A team wants to integrate Terraform Cloud with their CI/CD pipeline using API calls. Which workflow should they use?

A) API-driven workflow  
B) VCS-driven workflow  
C) CLI-driven workflow  
D) Agent-driven workflow

---

**Q56.** What is a benefit of using Terraform Cloud agents for execution?

A) Agents run Terraform in the team's own network, allowing access to private resources  
B) Agents automatically fix configuration drift  
C) Agents eliminate the need for state backends  
D) Agents run Terraform faster than the default execution environment

---

**Q57.** In Terraform Cloud, how can a workspace be configured to require manual approval before applying?

A) Set the "Apply Method" to "Manual apply" in workspace settings  
B) Use Sentinel policies to require approval  
C) Disable the "Auto Apply" setting in the VCS integration  
D) Both A and C are valid approaches

---

## 📋 Answer Key

<details>
<summary>Click to reveal answers and explanations</summary>

| #  | Answer | Explanation |
|----|--------|-------------|
| 1  | **B** | Provisioning creates infrastructure (EC2 instances, VPCs, etc.), while configuration management handles software setup on existing servers. |
| 2  | **B** | Using PRs for all changes ensures version control, audit trail, and peer review — a core IaC practice. |
| 3  | **A** | Idempotency means that running the same configuration repeatedly results in the same infrastructure state. |
| 4  | **B** | IaC enables peer review via pull requests, and `terraform plan` outputs provide a clear summary of proposed changes for approval. |
| 5  | **A** | Terraform is cloud-agnostic (AWS, Azure, GCP, etc.), whereas CloudFormation is AWS-specific. |
| 6  | **A** | Provider-level `default_tags` automatically apply tags to all resources created by that provider. |
| 7  | **A** | Configuration drift occurs when real-world infrastructure deviates from the IaC configuration — typically through manual changes. |
| 8  | **A** | `terraform init` creates the `.terraform/` directory and downloads provider plugins and module code. |
| 9  | **A** | `terraform version` with the `-json` flag or running `terraform providers` shows provider versions. |
| 10 | **A** | `terraform.tfstate` is a JSON file containing all resource attributes and metadata for managed infrastructure. |
| 11 | **B** | `terraform show` displays the current state in a human-readable format, showing what was created. |
| 12 | **A** | `terraform init` is always the first command after cloning — it initialises the working directory and downloads providers. |
| 13 | **A** | `terraform providers` lists all required providers and their version constraints. |
| 14 | **A** | `terraform version -short` shows only the version number without platform details. |
| 15 | **A** | The `~>` (pessimistic constraint) with `~> 1.5` allows 1.5.x but not 1.6.0 or higher. |
| 16 | **A** | `~> 4.0` allows versions 4.0 through 4.x (latest 4.x), but not 5.0. |
| 17 | **A** | Provider plugins are stored in `.terraform/providers/` by default. |
| 18 | **A** | `terraform apply` updates `terraform.tfstate` with the new state after applying changes. |
| 19 | **A** | `terraform show` displays the state file in a human-readable format. |
| 20 | **A** | "1 to change" indicates an existing resource's attribute has been modified in the configuration. |
| 21 | **A** | `terraform plan` creates a preview of changes without applying them. |
| 22 | **A** | `terraform state list` lists all resources tracked in the state file. |
| 23 | **A** | If the user rejects the confirmation prompt, no changes are applied to the infrastructure. |
| 24 | **A** | `-detailed-exitcode` returns exit code 2 if there are changes, 0 if no changes, and 1 for errors. |
| 25 | **B** | `terraform destroy -target` destroys only the specified resource. Note that `-target` should be used carefully. |
| 26 | **A** | `terraform output` displays all output values from the configuration. |
| 27 | **A** | The `default = 2` means Terraform uses 2 when no value is explicitly provided. |
| 28 | **A** | `terraform.tfvars` provides values for input variables. It is automatically loaded by Terraform. |
| 29 | **A** | `lookup()` retrieves the value for key "staging" from the map, which is "stg". |
| 30 | **A** | `tostring()` converts any value to its string representation. |
| 31 | **A** | Terraform assigns `null` to outputs for attributes that don't exist. A warning may be shown. |
| 32 | **A** | `coalesce()` returns the first non-null value from a list of arguments. `can()` and `try()` are error-handling functions. |
| 33 | **A** | `count = 3` creates 3 resources, each with the name `custom-policy-0`, `custom-policy-1`, `custom-policy-2`. |
| 34 | **A** | `for_each` iterates over sets/maps; `count` iterates over a numeric index. |
| 35 | **A** | Terraform returns an error when interpolating `null` into a string. |
| 36 | **B** | The valid syntax transforms a map into a list of strings. Option A uses `=>` incorrectly in a list for. |
| 37 | **A** | `terraform state show <address>` displays the full attributes of a specific resource in the state. |
| 38 | **A** | State files can contain sensitive data like passwords, IP addresses, and resource metadata. |
| 39 | **A** | The `key` argument defines the S3 object path for the state file within the bucket. |
| 40 | **A** | Using `terraform_remote_state` with an encrypted remote backend is the most secure way to share outputs. |
| 41 | **A** | `terraform state pull` downloads the current state from the remote backend and outputs it to stdout. |
| 42 | **D** | `terraform apply -replace=<address>` is the modern way to force resource replacement (replaces `terraform taint`). |
| 43 | **A** | A plan showing "0 to add, 0 to change, 0 to destroy" means the configuration, state, and real infrastructure are in sync. |
| 44 | **A** | `terraform state mv` moves a resource from one state address to another — the new state file manages it. |
| 45 | **A** | Git tags are the standard way to version modules stored in Git repositories. Reference them with `?ref=<tag>`. |
| 46 | **A** | Variables in modules can have default values, just like in root modules. |
| 47 | **A** | Only values explicitly declared in `output` blocks are accessible to the root module. |
| 48 | **A** | The `source` uses a relative path: `"./modules/networking"`. |
| 49 | **A** | With `count` or `for_each` on a module, access instances as `module.vpc[0].output_name`. |
| 50 | **A** | Terraform analyses references to determine module dependencies automatically. |
| 51 | **A** | A dedicated module repository with semantic versioning is the recommended internal module approach. |
| 52 | **A** | An organization is the top-level container for workspaces, teams, and settings in Terraform Cloud. |
| 53 | **A** | Each workspace in Terraform Cloud has its own isolated state with RBAC controls. |
| 54 | **A** | Cost estimation in Terraform Cloud estimates the monthly infrastructure cost based on the plan. |
| 55 | **A** | The API-driven workflow uses Terraform Cloud's API to trigger runs from external CI/CD pipelines. |
| 56 | **A** | Terraform Cloud agents run in the customer's network, enabling access to private resources. |
| 57 | **D** | Both setting "Manual apply" in workspace settings or disabling "Auto Apply" in VCS settings require manual approval. |

</details>

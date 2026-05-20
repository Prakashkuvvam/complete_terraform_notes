---
title: "Exam Practice Test 6"
weight: 23
bookFlatSection: true
---

# 📝 Terraform Associate — Practice Test 6

> **Instructions:** This test contains **57 multiple-choice questions** covering all 7 domains of the Terraform Associate exam. Choose the **best** answer for each question. Some questions include code snippets. Time yourself — aim for **60 minutes** for the full set. A passing score is **70% (40/57)**.

---
<div class="exam-controls">
  <div class="exam-timer" data-minutes="60" data-test-id="exam-test-6">
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
    <input type="checkbox" class="test-complete-check" id="test-complete-6" data-test-id="exam-test-6">
    <label for="test-complete-6">✓ Mark test as completed</label>
  </div>
</div>

## Domain 1: Infrastructure as Code (7 Questions — Q1–Q7)

**Q1.** A team uses Terraform to manage all cloud resources. An engineer notices that running `terraform apply` twice in a row produces the same result with "No changes" on the second run. What IaC principle does this demonstrate?

A) Idempotency  
B) Automation  
C) Modularity  
D) Scalability

---

**Q2.** Which of the following is a key benefit of IaC compared to manual infrastructure management?

A) Reduced risk of human error through automated and consistent deployments  
B) Lower cloud provider costs  
C) Faster network connectivity  
D) Increased cloud storage capacity

---

**Q3.** An organization migrates from manual infrastructure management to IaC. What change management process should they adopt?

A) All infrastructure changes must go through code review and version control  
B) Engineers can make manual changes to infrastructure as long as they notify the team  
C) Changes are made directly to the cloud console, then exported to Terraform  
D) Infrastructure changes require approval from a manager, but no code review

---

**Q4.** What is the difference between "provisioning" and "orchestration" in IaC?

A) Provisioning creates infrastructure; orchestration coordinates multiple provisioning steps  
B) Provisioning installs software; orchestration creates compute resources  
C) Provisioning and orchestration are the same thing  
D) Provisioning manages containers; orchestration manages virtual machines

---

**Q5.** A company needs to manage resources across AWS, Azure, and GCP with a single tool. Which tool is BEST suited for this requirement?

A) Terraform  
B) AWS CloudFormation  
C) Azure Resource Manager  
D) Google Cloud Deployment Manager

---

**Q6.** Which statement BEST describes the relationship between Terraform and a cloud provider?

A) Terraform uses provider plugins to interact with cloud provider APIs  
B) Terraform is a cloud provider itself  
C) Terraform only works with AWS  
D) Cloud providers must be configured directly in the Terraform binary

---

**Q7.** A team writes a Terraform configuration that creates a VPC, subnets, and EC2 instances. After running `terraform apply`, they realize a subnet CIDR overlaps with another. What is the best way to prevent this in the future?

A) Add validation rules in the Terraform configuration to catch CIDR overlap  
B) Create subnets manually in the cloud console  
C) Document CIDR ranges in a shared spreadsheet  
D) Use a different cloud provider

---

## Domain 2: Terraform Basics (10 Questions — Q8–Q17)

**Q8.** A directory contains `main.tf`, `variables.tf`, and `outputs.tf`. What does Terraform do when `terraform apply` is run in this directory?

A) It loads all `.tf` files in the directory as a single configuration  
B) It loads only `main.tf`  
C) It loads files in alphabetical order  
D) It prompts the user to specify which file to load

---

**Q9.** A user encounters the error:
```
Error: No configuration files
```
What is the most likely cause?

A) The current directory contains no `.tf` or `.tf.json` files  
B) The `terraform.tfvars` file is missing  
C) The state file is empty  
D) The backend is not configured

---

**Q10.** What is the primary purpose of the `.terraform/` directory?

A) To store provider plugins, module code, and backend configuration  
B) To store the Terraform binary  
C) To store log files  
D) To store backup copies of the state file

---

**Q11.** A user wants to see the dependency graph of resources. Which command should they use and how can they view the output?

A) `terraform graph` and pipe to a DOT viewer (e.g., Graphviz)  
B) `terraform plan -graph`  
C) `terraform show -graph`  
D) `terraform visualize`

---

**Q12.** What does the `-upgrade` flag do when used with `terraform init`?

A) Upgrades provider versions to the latest within the version constraint  
B) Upgrades the Terraform binary to the latest version  
C) Upgrades the configuration files to the latest syntax  
D) Upgrades the state file format

---

**Q13.** A user runs `terraform version` and sees:
```
Terraform v1.5.7
on linux_amd64
+ provider registry.terraform.io/hashicorp/aws v5.14.0
```
What can be concluded from this output?

A) The AWS provider v5.14.0 is installed and configured  
B) The Terraform version is out of date  
C) The state file is stored locally  
D) There are no modules in the configuration

---

**Q14.** Which of the following is a valid way to set a Terraform input variable named `instance_type` from the command line?

A) `terraform apply -var="instance_type=t3.large"`  
B) `terraform apply -var instance_type=t3.large`  
C) Both A and B are valid  
D) `terraform apply -var-instance_type=t3.large`

---

**Q15.** A user clones a repository and runs `terraform init`. The command fails with:
```
Error: Unsupported Terraform Core version
```
What is the likely cause?

A) The installed Terraform version does not satisfy the `required_version` constraint  
B) The repository contains no Terraform configuration  
C) The backend is not accessible  
D) The provider plugin is corrupted

---

**Q16.** What is the function of `terraform login`?

A) To authenticate with Terraform Cloud or Terraform Enterprise  
B) To log in to the cloud provider  
C) To create a user account for the Terraform Registry  
D) To generate an API key for AWS

---

**Q17.** A user runs `terraform init` and sees:
```
Terraform has been successfully initialized!
```
What has been set up in the project directory?

A) The `.terraform/` directory, providers, modules, and backend configured  
B) The state file has been created  
C) The infrastructure has been deployed  
D) The configuration has been validated

---

## Domain 3: Terraform Workflow (9 Questions — Q18–Q26)

**Q18.** A user has a saved plan file `prod.tfplan` from 3 hours ago. Can they still apply it?

A) Yes, but only if the configuration hasn't changed  
B) No, plan files expire and cannot be applied after a timeout  
C) Yes, plan files can be applied at any time  
D) No, plan files must be recreated after `terraform init`

---

**Q19.** What is the purpose of `terraform apply -auto-approve` in CI/CD pipelines?

A) To allow non-interactive deployments without human approval  
B) To skip the `terraform plan` step  
C) To deploy changes faster by skipping state locking  
D) To automatically fix syntax errors

---

**Q20.** A user runs `terraform plan` and sees:
```
Plan: 0 to add, 2 to change, 1 to destroy.
```
Which scenario could cause this output?

A) A resource was removed from config (destroy), two resources have modified attributes (change)  
B) Two resources were added (add), one was removed (destroy)  
C) One resource is being recreated (destroy+add), two are unchanged  
D) Two resources have been manually deleted from the cloud console

---

**Q21.** Which command shows the Terraform plan summary without making any API calls to refresh state?

A) `terraform plan -refresh=false`  
B) `terraform plan -no-refresh`  
C) `terraform plan -plan-only`  
D) `terraform validate`

---

**Q22.** A user wants to see a list of resources to be destroyed before running `terraform destroy`. What should they do first?

A) Run `terraform plan -destroy`  
B) Run `terraform destroy -dry-run`  
C) Run `terraform state list`  
D) Run `terraform output`

---

**Q23.** What is the `TF_LOG` environment variable used for?

A) To set the logging verbosity level for debugging Terraform  
B) To specify a log file path  
C) To enable audit logging for state changes  
D) To configure Terraform Cloud logging

---

**Q24.** A user runs `terraform apply` but the command is interrupted by a network failure. What should they do?

A) Run `terraform apply` again — Terraform handles partial state gracefully  
B) Restore the state file from a backup  
C) Delete all resources and start over  
D) Reinstall Terraform

---

**Q25.** Which Terraform command can be used to upload a new state file to a remote backend?

A) `terraform state push`  
B) `terraform state pull`  
C) `terraform apply -state=file.json`  
D) `terraform init -state=file.json`

---

**Q26.** A user runs `terraform plan -destroy` to see what would be destroyed. They do NOT follow up with `terraform destroy`. What happens to the infrastructure?

A) Nothing — the infrastructure remains unchanged  
B) All resources are destroyed  
C) Only the resources shown in the plan are destroyed  
D) The state file is deleted

---

## Domain 4: Terraform Configuration (10 Questions — Q27–Q36)

**Q27.** Consider:
```hcl
resource "aws_s3_bucket" "example" {
  bucket = "my-app-bucket-${random_id.suffix.hex}"
}

resource "random_id" "suffix" {
  byte_length = 4
}
```
What is the purpose of using `random_id` in this configuration?

A) To generate a unique bucket name to avoid conflicts  
B) To encrypt the bucket name  
C) To create a random value for access control  
D) To randomize the bucket's region

---

**Q28.** What is the difference between `var.foo` and `local.foo`?

A) `var.foo` references an input variable; `local.foo` references a local value  
B) `var.foo` references a local value; `local.foo` references an input variable  
C) They are interchangeable  
D) `var.foo` is for outputs; `local.foo` is for variables

---

**Q29.** Given:
```hcl
resource "aws_subnet" "main" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}
```
How does Terraform determine the order of creation for `aws_subnet.main` and `aws_vpc.main`?

A) Terraform analyses the reference `aws_vpc.main.id` and creates the VPC first  
B) Resources are created in alphabetical order  
C) Resources are created in the order they appear in the file  
D) Terraform creates all resources in parallel

---

**Q30.** What does the `try()` function return when all expressions fail?

A) An error  
B) `null`  
C) `false`  
D) An empty string

---

**Q31.** Consider:
```hcl
output "bucket_arn" {
  value     = aws_s3_bucket.data.arn
  sensitive = true
}
```
What happens when a user runs `terraform output`?

A) `bucket_arn` is shown as `<sensitive>` in the output  
B) `bucket_arn` is not shown at all  
C) `bucket_arn` is shown with the full ARN value  
D) Terraform returns an error because output is sensitive

---

**Q32.** Which function combines a base path with a relative path?

A) `pathexpand()`  
B) `abspath()`  
C) `dirname()`  
D) `fileexists()`

---

**Q33.** Given:
```hcl
variable "subnet_cidrs" {
  type = list(object({
    name = string
    cidr = string
  }))
}
```
Which is a valid value for this variable?

A) `[{ name = "public", cidr = "10.0.1.0/24" }, { name = "private", cidr = "10.0.2.0/24" }]`  
B) `{ "public" = "10.0.1.0/24", "private" = "10.0.2.0/24" }`  
C) `["10.0.1.0/24", "10.0.2.0/24"]`  
D) `("public", "10.0.1.0/24")`

---

**Q34.** What is the purpose of the `format()` function in Terraform?

A) To produce formatted strings using sprintf-style syntax  
B) To format Terraform configuration files  
C) To format the plan output  
D) To convert date/time values to strings

---

**Q35.** Consider:
```hcl
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "example" {
  count             = 2
  availability_zone = data.aws_availability_zones.available.names[count.index]
  cidr_block        = "10.0.${count.index}.0/24"
  vpc_id            = aws_vpc.main.id
}
```
What does `data.aws_availability_zones.available.names` return?

A) A list of available AZ names (e.g., ["us-east-1a", "us-east-1b", ...])  
B) A count of available AZs  
C) A map of AZ IDs to names  
D) The name of the default availability zone

---

**Q36.** What is the difference between `file()` and `filebase64()` functions?

A) `file()` reads a file as text; `filebase64()` reads and base64-encodes it  
B) `file()` reads a file as binary; `filebase64()` reads it as text  
C) `file()` reads Terraform files only; `filebase64()` reads any file  
D) There is no difference — they are aliases

---

## Domain 5: Terraform State (8 Questions — Q37–Q44)

**Q37.** A user notices the state file shows sensitive information in plaintext. What is the recommended practice to protect this data?

A) Enable encryption on the remote backend (e.g., S3 server-side encryption)  
B) Store the state file in a public repository  
C) Delete the state file after each deployment  
D) Use a local backend to store state offline

---

**Q38.** What happens to a resource in the state if it is removed from the configuration and `terraform apply` is run?

A) Terraform destroys the resource  
B) Terraform leaves the resource running but removes it from state  
C) Terraform shows a warning and keeps the resource  
D) The resource becomes orphaned and unmanaged

---

**Q39.** A user wants to see the complete JSON representation of the state. Which command outputs this?

A) `terraform state pull`  
B) `terraform show -json`  
C) `terraform state list -json`  
D) Both A and B provide JSON state output

---

**Q40.** Which Terraform command can fix a state file that is out of sync with real infrastructure?

A) `terraform apply -refresh-only`  
B) `terraform state sync`  
C) `terraform refresh`  
D) Both A and C

---

**Q41.** A user accidentally runs `terraform state rm aws_instance.web`. What must they do to bring it back under Terraform management?

A) Run `terraform import aws_instance.web <instance_id>`  
B) Recreate the resource with `terraform apply`  
C) Run `terraform state add aws_instance.web <instance_id>`  
D) Edit the state file to add the resource back

---

**Q42.** When using Terraform workspaces with a remote backend, how is state stored?

A) Each workspace has its own state file in the backend  
B) All workspaces share the same state file  
C) Workspaces are only supported with the local backend  
D) State is stored locally regardless of the backend configuration

---

**Q43.** A user runs `terraform apply` and receives:
```
Error: Cannot delete resource because it has dependents
```
What does this mean?

A) A resource cannot be removed because another resource depends on it  
B) The cloud provider denied the delete request  
C) The state file has a dependency cycle  
D) Terraform is waiting for a dependent resource to be created first

---

**Q44.** What is the format of a Terraform state file?

A) JSON  
B) HCL  
C) YAML  
D) Binary protobuf

---

## Domain 6: Terraform Modules (7 Questions — Q45–Q51)

**Q45.** A team creates a module that produces several output values. How does another configuration consume these outputs?

A) By referencing them via `module.<module_name>.<output_name>`  
B) By copying the output values manually  
C) By storing outputs in a shared JSON file  
D) By importing them with `terraform import`

---

**Q46.** A module is sourced from the Terraform Registry. The module's `variables.tf` declares:
```hcl
variable "environment" {
  description = "Environment name"
  type        = string
}
```
What happens if the root module calls this module without providing `environment`?

A) Terraform returns an error because no default value is specified  
B) Terraform uses an empty string as the default  
C) Terraform prompts the user for a value  
D) Terraform ignores the variable

---

**Q47.** A root module calls a child module that creates an S3 bucket. The root module needs the bucket ARN. How should the child module expose this value?

A) Declare an `output` block in the child module  
B) Write the ARN to a file  
C) Use `terraform output` in the child module  
D) Store the ARN in an environment variable

---

**Q48.** What is the recommended directory structure for a module?

A) Root module files (e.g., `main.tf`, `variables.tf`, `outputs.tf`)  
B) A single `main.tf` file containing everything  
C) Nested sub-modules for each resource type  
D) A flat directory with all files prefixed by module name

---

**Q49.** When a module uses `terraform_remote_state` to read outputs from another configuration, what is this pattern called?

A) Root module composition  
B) Cross-configuration data sharing  
C) Module inheritance  
D) Remote state chaining

---

**Q50.** A user calls a module and wants to pass all tags from a variable:
```hcl
variable "tags" {
  type = map(string)
}
```
How should they pass the tags to the module's `tags` input?

A) `tags = var.tags`  
B) `tags = { var.tags }`  
C) `tags = var.tags.*`  
D) `tags = each(var.tags)`

---

**Q51.** A module contains a `versions.tf` file with provider requirements. What happens when a root module uses this module?

A) Terraform merges the module's provider requirements with the root module's  
B) The module's provider requirements override the root module's  
C) The module's `versions.tf` is ignored  
D) Terraform returns a warning about duplicate provider configurations

---

## Domain 7: Terraform Cloud & Enterprise (6 Questions — Q52–Q57)

**Q52.** In Terraform Cloud, what does the "Run Tasks" feature allow you to do?

A) Integrate third-party services (e.g., security scanners) into the run lifecycle  
B) Schedule automated runs  
C) Run Terraform commands in parallel  
D) Execute shell commands on provisioned resources

---

**Q53.** A team wants to use Terraform Cloud but has resources in a private subnet that Terraform Cloud cannot reach. Which execution mode should they use?

A) Agent execution  
B) Remote execution  
C) Local execution  
D) Hybrid execution

---

**Q54.** What is the purpose of the "Override" option for variables in Terraform Cloud?

A) It allows variable sets to override workspace variables with the same key  
B) It overrides the Terraform version requirement  
C) It overrides the backend configuration  
D) It overrides the cloud provider credentials

---

**Q55.** How does Terraform Cloud's "VCS-driven workflow" integrate with version control?

A) It automatically creates runs when pull requests or commits are made to the connected branch  
B) It requires manual triggers for every run  
C) It only works with GitHub repositories  
D) It creates a separate workspace for every commit

---

**Q56.** What is a "Terraform Cloud agent" used for?

A) To run Terraform operations in a network that Terraform Cloud cannot directly access  
B) To automatically fix configuration drift  
C) To create Terraform configurations from cloud resources  
D) To monitor resource usage and costs

---

**Q57.** In Terraform Cloud, what is the difference between "terraform plan" and "speculative plan"?

A) A speculative plan is triggered by a PR and is not intended to be applied  
B) A speculative plan runs faster than a normal plan  
C) A speculative plan only applies to a subset of resources  
D) There is no difference — they are the same

---

## 📋 Answer Key

<details>
<summary>Click to reveal answers and explanations</summary>

| #  | Answer | Explanation |
|----|--------|-------------|
| 1  | **A** | Idempotency means running the same configuration multiple times produces the same state. |
| 2  | **A** | IaC reduces human error by automating deployments consistently. |
| 3  | **A** | All IaC changes should go through code review and version control. |
| 4  | **A** | Provisioning creates infrastructure; orchestration coordinates multiple tasks/steps. |
| 5  | **A** | Terraform is cloud-agnostic and works with AWS, Azure, GCP, and many others. |
| 6  | **A** | Provider plugins act as bridges between Terraform and cloud provider APIs. |
| 7  | **A** | Variable validation in Terraform configuration catches CIDR overlap before apply. |
| 8  | **A** | Terraform loads all `.tf` and `.tf.json` files in the directory as a single configuration. |
| 9  | **A** | The error means there are no `.tf` or `.tf.json` files in the current directory. |
| 10 | **A** | `.terraform/` stores providers, modules, backend config, and other working data. |
| 11 | **A** | `terraform graph` outputs DOT format that can be rendered by Graphviz. |
| 12 | **A** | `terraform init -upgrade` updates providers to the latest within version constraints. |
| 13 | **A** | The output confirms Terraform v1.5.7 and AWS provider v5.14.0 are installed. |
| 14 | **C** | Both `-var="key=val"` and `-var key=val` syntax are valid. |
| 15 | **A** | The `required_version` constraint in the configuration conflicts with the installed binary. |
| 16 | **A** | `terraform login` authenticates with Terraform Cloud or Terraform Enterprise. |
| 17 | **A** | Successful init means `.terraform/`, providers, modules, and backend are configured. |
| 18 | **A** | Plan files are valid only if the configuration hasn't changed since creation. |
| 19 | **A** | `-auto-approve` enables non-interactive apply for automated CI/CD pipelines. |
| 20 | **A** | "1 to destroy" = resource removed from config; "2 to change" = modified attributes. |
| 21 | **A** | `-refresh=false` skips querying the cloud provider for current resource states. |
| 22 | **A** | `terraform plan -destroy` shows destruction plan without executing it. |
| 23 | **A** | `TF_LOG=DEBUG` (or INFO, WARN, ERROR) sets the logging verbosity level. |
| 24 | **A** | Running `terraform apply` again is safe — Terraform handles partial state gracefully. |
| 25 | **A** | `terraform state push` overwrites remote state with a local state file (use cautiously). |
| 26 | **A** | A plan only shows what would change — no infrastructure is modified without apply. |
| 27 | **A** | `random_id` generates a unique suffix, preventing S3 bucket name conflicts. |
| 28 | **A** | `var.*` references input variables; `local.*` references local computed values. |
| 29 | **A** | Terraform builds a dependency graph from references and creates resources in order. |
| 30 | **A** | `try()` returns an error only if ALL expressions in the call fail. |
| 31 | **A** | Sensitive outputs are displayed as `<sensitive>` in CLI output by default. |
| 32 | **A** | `pathexpand()` expands `~` to the home directory path. `dirname()` returns directory of a path. |
| 33 | **A** | The type is a list of objects with `name` (string) and `cidr` (string) attributes. |
| 34 | **A** | `format()` uses sprintf-style formatting (e.g., `format("Hello, %s!", "World")`). |
| 35 | **A** | The data source returns a list of AZ names in the current region. |
| 36 | **A** | `file()` reads text content; `filebase64()` reads and base64-encodes it (e.g., for user_data). |
| 37 | **A** | Enable encryption on the backend (e.g., S3 SSE-S3 or SSE-KMS) to protect state at rest. |
| 38 | **A** | Terraform destroys resources that are in state but no longer in the configuration. |
| 39 | **D** | Both `terraform state pull` and `terraform show -json` output JSON state. |
| 40 | **D** | Both `terraform apply -refresh-only` and `terraform refresh` update state. `refresh` is older. |
| 41 | **A** | `terraform import` re-imports the existing resource into the state file. |
| 42 | **A** | Each workspace gets its own state file in the backend (e.g., `env:/prod/terraform.tfstate`). |
| 43 | **A** | Terraform prevents deletion of resources that have active dependents. |
| 44 | **A** | Terraform state files are in JSON format. |
| 45 | **A** | Module outputs are accessible via `module.<name>.<output_name>`. |
| 46 | **A** | Without a `default` value, a variable is required and must be provided. |
| 47 | **A** | `output` blocks in the child module expose values to the root module. |
| 48 | **A** | A module typically has `main.tf`, `variables.tf`, `outputs.tf`, and optionally `versions.tf`. |
| 49 | **B** | Using `terraform_remote_state` to read outputs across configurations is cross-config data sharing. |
| 50 | **A** | `tags = var.tags` passes the entire map value to the module's input variable. |
| 51 | **A** | Terraform merges provider requirements from all modules with the root module's requirements. |
| 52 | **A** | Run Tasks integrate third-party services (e.g., Checkov, Aqua) into the Terraform Cloud run flow. |
| 53 | **A** | Agent execution runs Terraform in the customer's network, allowing access to private resources. |
| 54 | **A** | Variable set overrides allow set values to take precedence over workspace-level values. |
| 55 | **A** | VCS-driven workflow watches the connected branch/PR and triggers runs automatically. |
| 56 | **A** | Agents run Terraform in the customer's own environment to reach private network resources. |
| 57 | **A** | Speculative plans are PR-triggered plans that show changes but aren't applied. |

</details>

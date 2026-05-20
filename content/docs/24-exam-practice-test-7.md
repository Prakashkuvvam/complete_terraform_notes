---
title: "Exam Practice Test 7"
weight: 24
bookFlatSection: true
---

# 📝 Terraform Associate — Practice Test 7

> **Instructions:** This test contains **57 multiple-choice questions** covering all 7 domains of the Terraform Associate exam. Choose the **best** answer for each question. Some questions include code snippets. Time yourself — aim for **60 minutes** for the full set. A passing score is **70% (40/57)**.

---
<div class="exam-controls">
  <div class="exam-timer" data-minutes="60" data-test-id="exam-test-7">
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
    <input type="checkbox" class="test-complete-check" id="test-complete-7" data-test-id="exam-test-7">
    <label for="test-complete-7">✓ Mark test as completed</label>
  </div>
</div>

## Domain 1: Infrastructure as Code (7 Questions — Q1–Q7)

**Q1.** A company stores its Terraform configurations in a Git repository. A developer modifies the configuration, but does not run `terraform apply`. What is the status of the infrastructure compared to the code?

A) The code has drifted from the real infrastructure  
B) The infrastructure is in sync with the code  
C) The configuration is invalid until `terraform init` is run  
D) The state file is automatically updated

---

**Q2.** Which IaC tool uses a pull-based model where managed nodes check in with a central server?

A) Chef  
B) Terraform  
C) Pulumi  
D) CloudFormation

---

**Q3.** An organisation uses Terraform to provision a VPC, subnets, and EC2 instances. They later need to install a web server on the instances. What is the BEST approach?

A) Use Terraform for provisioning and Ansible for configuration management  
B) Install the web server using Terraform's `remote-exec` provisioner  
C) Manually SSH into each instance and install the web server  
D) Create a custom AMI with the web server pre-installed

---

**Q4.** What does "desired state" mean in the context of declarative IaC?

A) The target configuration you want your infrastructure to have  
B) The current state of the infrastructure  
C) The steps required to modify infrastructure  
D) The output values of the configuration

---

**Q5.** A team wants to share Terraform modules across multiple projects. Which approach is BEST?

A) Publish modules to a private module registry  
B) Copy module files into each project  
C) Store modules in a shared network drive  
D) Define all resources in a single configuration file

---

**Q6.** What is a potential downside of using IaC?

A) Initial setup and learning curve can be significant  
B) Infrastructure becomes less reliable  
C) Deployments take longer  
D) Configuration files cannot be version-controlled

---

**Q7.** A company has 10 AWS accounts, each requiring similar but slightly different infrastructure. What Terraform feature is BEST suited for this?

A) Workspaces with account-specific variable files  
B) Copying the same configuration 10 times  
C) Using `count` with a hard-coded list of account IDs  
D) Manual provisioning for each account

---

## Domain 2: Terraform Basics (10 Questions — Q8–Q17)

**Q8.** A user runs `terraform init` with the following config:
```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}
```
After successful initialization, where is the backend configuration stored?

A) In a `.terraform/terraform.tfstate` file (not the actual state)  
B) In the `main.tf` file  
C) In the Terraform Registry  
D) In the cloud provider's metadata

---

**Q9.** What is the purpose of `terraform workspace`?

A) To manage multiple isolated state files for the same configuration  
B) To create separate directories for different environments  
C) To manage different cloud provider credentials  
D) To run Terraform in a sandboxed environment

---

**Q10.** A user wants to check if a `terraform.tf` file has valid HCL syntax. Which command should they use?

A) `terraform validate`  
B) `terraform fmt -check`  
C) `terraform plan`  
D) `terraform parse`

---

**Q11.** What is the purpose of the `-chdir` flag in Terraform commands?

A) To run the command in a different working directory  
B) To change the backend configuration  
C) To switch to a different Terraform version  
D) To change the format of command output

---

**Q12.** A user has multiple `.tf` files in a directory. How does Terraform process them?

A) It concatenates all `.tf` files in alphabetical order as a single configuration  
B) It processes only `main.tf`  
C) It processes each file independently  
D) It requires all resources to be in a single file

---

**Q13.** Which command would you use to create a new Terraform workspace named "staging"?

A) `terraform workspace new staging`  
B) `terraform workspace create staging`  
C) `terraform workspace add staging`  
D) `terraform new workspace staging`

---

**Q14.** A user runs `terraform validate` and gets:
```
Success! The configuration is valid.
```
What does this confirm?

A) The configuration syntax is correct and internally consistent  
B) The cloud provider credentials are valid  
C) The state file is consistent with real infrastructure  
D) The Terraform version is compatible with the configuration

---

**Q15.** What is the purpose of `terraform force-unlock`?

A) To manually release a stuck state lock  
B) To force a workspace to unlock  
C) To unlock a cloud provider account  
D) To override a Sentinel policy

---

**Q16.** A user wants to see only the output values from a Terraform configuration without any additional messages. Which command should they use?

A) `terraform output -raw`  
B) `terraform output -json`  
C) Both A and B provide cleaner output  
D) `terraform show -no-color`

---

**Q17.** What does the `terraform providers mirror` command do?

A) Downloads copies of provider plugins for use in air-gapped environments  
B) Creates a backup of provider configurations  
C) Syncs providers with the Terraform Registry  
D) Lists all mirrored providers

---

## Domain 3: Terraform Workflow (9 Questions — Q18–Q26)

**Q18.** A user runs `terraform plan -destroy -out=destroy.tfplan`. What type of plan file is created?

A) A destruction plan that can be applied with `terraform apply destroy.tfplan`  
B) A read-only plan for review  
C) A backup plan for disaster recovery  
D) A plan that only targets resources with `prevent_destroy`

---

**Q19.** In the Terraform workflow, what is the function of `terraform init` relative to providers?

A) It downloads and installs provider plugins specified in the configuration  
B) It configures the provider credentials  
C) It creates provider-managed resources  
D) It removes unused provider plugins

---

**Q20.** A team wants to ensure that `terraform plan` runs automatically in CI for every pull request. What type of check does this serve?

A) Prevention of misconfigured infrastructure before it reaches production  
B) Automatic deployment to production  
C) Replacement of code review  
D) Security audit of cloud resources

---

**Q21.** A user runs `terraform plan` and sees:
```
──────────────────────────────────────────────────────────
Note: Objects have changed outside of Terraform
──────────────────────────────────────────────────────────
```
What does this message indicate?

A) Resources were modified outside Terraform and Terraform detected the drift  
B) The configuration was changed after the last apply  
C) The state file is corrupted  
D) New resources were added to the configuration

---

**Q22.** What is the purpose of `terraform apply -compact-warnings`?

A) To display warning messages in a condensed format  
B) To suppress all warning messages  
C) To convert warnings to errors  
D) To format plan output with less whitespace

---

**Q23.** A user wants to create a plan that targets only specific resources. Which flag should they use?

A) `-target`  
B) `-focus`  
C) `-only`  
D) `-select`

---

**Q24.** After running `terraform apply`, where can a user find the list of all output values?

A) `terraform output`  
B) `terraform show`  
C) `terraform state list`  
D) `terraform plan`

---

**Q25.** A user runs `terraform plan` and gets a non-zero exit code. What does this indicate?

A) An error occurred, or there are changes (depending on flags)  
B) The configuration is invalid  
C) The plan was successfully created  
D) Terraform is still running

---

**Q26.** What is the recommended way to handle `terraform apply` in production?

A) Always review the plan output before confirming the apply  
B) Always use `-auto-approve` for speed  
C) Apply directly without planning  
D) Only run apply during business hours

---

## Domain 4: Terraform Configuration (10 Questions — Q27–Q36)

**Q27.** Consider:
```hcl
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.main.id
}
```
What type of reference is `aws_subnet.main.id`?

A) A resource attribute reference  
B) A data source reference  
C) A variable reference  
D) A local value reference

---

**Q28.** Which function would you use to decode a JSON string into a Terraform value?

A) `jsondecode()`  
B) `jsonencode()`  
C) `parsejson()`  
D) `from_json()`

---

**Q29.** Given:
```hcl
locals {
  team = "platform"
  tags = {
    Team        = local.team
    Environment = var.env
    ManagedBy   = "Terraform"
  }
}
```
How does Terraform resolve `local.team` inside the `tags` map?

A) At plan time, using the local value defined above  
B) At apply time, after resources are created  
C) It cannot be resolved because locals cannot reference other locals  
D) At destroy time, when the resources are removed

---

**Q30.** Consider:
```hcl
variable "enabled" {
  type    = bool
  default = true
}

resource "aws_instance" "app" {
  count = var.enabled ? 1 : 0
  ami   = "ami-12345"
}
```
If `var.enabled` is set to `false`, what is the value of `aws_instance.app.id`?

A) It would cause an error when referenced  
B) `null`  
C) `0`  
D) `false`

---

**Q31.** What is the purpose of the `dynamic` block in Terraform?

A) To dynamically generate nested configuration blocks based on a collection  
B) To create resources dynamically at runtime  
C) To import existing resources  
D) To define dynamic provider credentials

---

**Q32.** Given:
```hcl
resource "aws_iam_role" "role" {
  name = "app-role"
}
```
The user later adds `assume_role_policy` to the configuration and runs `terraform apply`. What happens?

A) Terraform updates the existing role with the new policy  
B) Terraform destroys and recreates the role  
C) Terraform returns an error because the role exists  
D) Terraform creates a second IAM role

---

**Q33.** What does the `timestamp()` function return?

A) The current date and time in UTC as a string  
B) The time when the Terraform configuration was first created  
C) The timestamp of the last state modification  
D) A Unix timestamp as a number

---

**Q34.** Consider:
```hcl
resource "aws_security_group" "web" {
  name_prefix = "web-${var.environment}"
  vpc_id      = var.vpc_id
}
```
What is the effect of `name_prefix` instead of `name`?

A) Terraform generates a unique name by appending a random suffix to "web-{env}-"  
B) The security group name is exactly "web-{env}"  
C) The security group name is prefixed with "web-"  
D) `name_prefix` is not a valid argument

---

**Q35.** A user needs to conditionally assign a value: if a variable is null, use a default. Which function is best for this?

A) `coalesce()`  
B) `if()`  
C) `try()`  
D) `default()`

---

**Q36.** Given:
```hcl
resource "aws_s3_bucket" "log" {
  bucket = "app-log-bucket"
}

resource "aws_s3_bucket_versioning" "log" {
  bucket = aws_s3_bucket.log.id
  versioning_configuration {
    status = "Enabled"
  }
}
```
What type of Terraform construct is `aws_s3_bucket_versioning` relative to `aws_s3_bucket`?

A) A separate resource that manages a sub-feature of the S3 bucket  
B) A data source that reads the bucket's versioning status  
C) A module that enables versioning  
D) An inline configuration block

---

## Domain 5: Terraform State (8 Questions — Q37–Q44)

**Q37.** A user runs `terraform plan` and notices the plan shows "0 to add, 2 to change, 0 to destroy". The user is confident no changes were made to the configuration. What is the most likely cause?

A) Infrastructure drift — resources were modified outside of Terraform  
B) The state file is corrupted  
C) The Terraform version was upgraded  
D) A provider was updated to a new version

---

**Q38.** When using an S3 backend, what is the format of the state file in the S3 bucket?

A) JSON format (the same as the local state file)  
B) Binary encrypted format  
C) HCL format  
D) Base64-encoded JSON

---

**Q39.** A user runs `terraform state pull > backup.tfstate`. What have they just done?

A) Made a local backup of the remote state  
B) Overwritten the remote state with a local file  
C) Imported resources from a backup  
D) Converted the state to HCL format

---

**Q40.** What does the `serial` field in a Terraform state file represent?

A) A monotonically increasing integer incremented with each state change  
B) The version of the Terraform binary  
C) The timestamp of the last state modification  
D) The number of resources in the state

---

**Q41.** A user has a resource that is failing and wants Terraform to destroy and recreate it. Which approach is correct?

A) Run `terraform apply -replace=<resource_address>`  
B) Delete the resource from the configuration and run `terraform apply`  
C) Run `terraform destroy -target=<resource_address>` and then `terraform apply`  
D) All of the above are valid approaches

---

**Q42.** What is the purpose of `terraform_remote_state` data source?

A) To read the latest state snapshot from a remote backend  
B) To push state to a remote backend  
C) To migrate state between backends  
D) To lock the remote state for editing

---

**Q43.** A user creates a Terraform configuration, runs `terraform apply`, and then removes a resource from the configuration. What does `terraform plan` show on the next run?

A) The resource marked for destruction  
B) The resource marked for creation  
C) No changes  
D) An error about the missing resource

---

**Q44.** A user needs to rename a resource from `aws_s3_bucket.old` to `aws_s3_bucket.new`. What is the safest approach?

A) Run `terraform state mv aws_s3_bucket.old aws_s3_bucket.new`, then update the config  
B) Delete and recreate the bucket  
C) Remove the resource from state and re-import it  
D) Edit the state file manually to change the resource name

---

## Domain 6: Terraform Modules (7 Questions — Q45–Q51)

**Q45.** A user creates a local module at `./modules/database`. Which `source` syntax is correct?

A) `"./modules/database"`  
B) `"/modules/database"`  
C) `"local://modules/database"`  
D) `"modules/database"`

---

**Q46.** A module's `outputs.tf` file contains:
```hcl
output "vpc_id" {
  value = aws_vpc.main.id
}
```
The root module calls this module as `module "network"`. How does the root module access `vpc_id`?

A) `module.network.vpc_id`  
B) `module.network.outputs.vpc_id`  
C) `output.vpc_id`  
D) `data.module.network.vpc_id`

---

**Q47.** A module is sourced from the Terraform Registry. The root configuration specifies `version = "~> 3.0"`. Where is the version defined?

A) In the `module` block of the root configuration  
B) In the module's `versions.tf` file  
C) In the root module's `required_providers` block  
D) In the Terraform Cloud workspace settings

---

**Q48.** A team has 10 Terraform configurations that all use a common set of networking modules. What is the best way to manage module updates across all configurations?

A) Store modules in a central repository and reference by Git tag  
B) Copy the latest module files into each configuration  
C) Pin to specific versions in each configuration  
D) Both A and C represent good practices

---

**Q49.** A module creates an AWS Lambda function. The root module needs to invoke this function. What should the module expose?

A) An output with the function name or ARN  
B) The invocation command in a README  
C) The Lambda source code  
D) An output with the IAM role

---

**Q50.** When using `count` or `for_each` on a module, how do you access a specific instance's output?

A) `module.example[0].output_name`  
B) `module.example.output_name[0]`  
C) `module[0].example.output_name`  
D) `for_each.module.example.output_name`

---

**Q51.** A module contains a data source that reads current AWS account information. When does this data source get evaluated?

A) During `terraform plan` and `terraform apply`  
B) Only during `terraform init`  
C) Only during `terraform apply`  
D) Only during `terraform destroy`

---

## Domain 7: Terraform Cloud & Enterprise (6 Questions — Q52–Q57)

**Q52.** In Terraform Cloud, what does the "Run" timeline show?

A) The complete history of plan and apply operations for a workspace  
B) A real-time feed of cloud provider events  
C) The status of cloud resource health checks  
D) The current usage of Terraform Cloud API quotas

---

**Q53.** What is the purpose of "Team Management" in Terraform Cloud?

A) To define permissions and access levels for groups of users  
B) To manage cloud provider teams  
C) To create teams for CI/CD pipelines  
D) To manage Terraform configuration teams

---

**Q54.** A workspace in Terraform Cloud is configured with "Auto Apply" enabled. What happens after a plan completes successfully?

A) The plan is automatically applied without manual intervention  
B) The plan waits for a manual confirmation  
C) The plan is saved but not applied  
D) The plan is discarded

---

**Q55.** How does Terraform Cloud's "Private Network Connectivity" feature work?

A) Through Terraform Cloud agents that run in the customer's network  
B) Through a VPN connection from Terraform Cloud to the customer VPC  
C) Through SSH tunneling  
D) Through public internet access

---

**Q56.** In Terraform Cloud, what is a "Variable Set"?

A) A reusable group of variables that can be assigned to multiple workspaces  
B) A set of environment variables for the Terraform CLI  
C) A collection of all variables in a workspace  
D) A set of default values for all configurations

---

**Q57.** An organisation has 50 workspaces in Terraform Cloud. They want to apply the same policy to all workspaces (e.g., "all S3 buckets must be encrypted"). What is the most efficient way to achieve this?

A) Create a Sentinel policy and apply it to all workspaces via policy sets  
B) Add the policy to each workspace individually  
C) Create a Terraform module that enforces encryption  
D) Use AWS Config rules instead of Terraform Cloud

---

## 📋 Answer Key

<details>
<summary>Click to reveal answers and explanations</summary>

| #  | Answer | Explanation |
|----|--------|-------------|
| 1  | **A** | If code is modified but not applied, the real infrastructure drifts from what the code describes. |
| 2  | **A** | Chef uses a pull-based model (client-server), while Terraform is push-based (CLI-driven). |
| 3  | **A** | Best practice: Terraform for provisioning infrastructure, configuration management tools for software setup. |
| 4  | **A** | Desired state is the target configuration you declare in IaC — Terraform works to achieve it. |
| 5  | **A** | A private module registry (e.g., Terraform Cloud's private registry) is the best way to share modules. |
| 6  | **A** | IaC has an initial learning curve and setup cost, though it pays off in the long run. |
| 7  | **A** | Workspaces with environment-specific variable files allow managing similar configs across accounts. |
| 8  | **A** | After init, the backend configuration is stored in `.terraform/terraform.tfstate` (a data file, not the state itself). |
| 9  | **A** | Workspaces manage multiple isolated state files for the same configuration. |
| 10 | **A** | `terraform validate` checks HCL syntax and internal consistency. |
| 11 | **A** | `-chdir=<dir>` runs the Terraform command as if it were executed from `<dir>`. |
| 12 | **A** | Terraform loads all `.tf` files in a directory as a single combined configuration. |
| 13 | **A** | `terraform workspace new staging` creates and switches to a new workspace named "staging". |
| 14 | **A** | `terraform validate` confirms syntax correctness and internal consistency — it does not check credentials. |
| 15 | **A** | `terraform force-unlock` manually releases a stuck state lock (use with extreme caution). |
| 16 | **C** | Both `-raw` and `-json` provide cleaner output for specific use cases. |
| 17 | **A** | `terraform providers mirror` downloads provider plugins for air-gapped/offline environments. |
| 18 | **A** | A destroy plan can be applied with `terraform apply destroy.tfplan`. |
| 19 | **A** | `terraform init` downloads and installs provider plugins from the Terraform Registry. |
| 20 | **A** | CI plan checks catch configuration errors before they reach production. |
| 21 | **A** | The note indicates Terraform detected resources modified outside of Terraform (drift). |
| 22 | **A** | `-compact-warnings` condenses warning messages to reduce output noise. |
| 23 | **A** | `-target=resource_type.name` limits the plan/apply to specific resources. |
| 24 | **A** | `terraform output` displays all output values from the configuration. |
| 25 | **A** | With `-detailed-exitcode`, exit code 2 means changes; exit code 1 means error. |
| 26 | **A** | Always review the plan before applying in production — never use `-auto-approve` blindly. |
| 27 | **A** | `aws_subnet.main.id` is a resource attribute reference, reading the `id` attribute of the subnet resource. |
| 28 | **A** | `jsondecode()` parses a JSON string into a Terraform value. |
| 29 | **A** | Local values are resolved at plan time and can reference other local values. |
| 30 | **A** | Referencing a resource created with `count = 0` causes an error because it doesn't exist. |
| 31 | **A** | `dynamic` blocks generate nested configuration blocks from collections (e.g., list of ingress rules). |
| 32 | **A** | Adding an argument to an existing resource causes an in-place update (change). |
| 33 | **A** | `timestamp()` returns the current UTC timestamp as a string (e.g., "2024-01-01T00:00:00Z"). |
| 34 | **A** | `name_prefix` appends a random suffix to the prefix string to create a unique name. |
| 35 | **A** | `coalesce()` returns the first non-null value from its arguments. |
| 36 | **A** | `aws_s3_bucket_versioning` is a separate resource that manages a feature of the bucket. |
| 37 | **A** | Drift (manual changes outside Terraform) causes Terraform to detect changes in the plan. |
| 38 | **A** | S3 stores state as JSON — the same format as local state, just in a remote location. |
| 39 | **A** | `terraform state pull` downloads the remote state to stdout, so redirecting to a file creates a backup. |
| 40 | **A** | The `serial` is a number that increments with each state modification for consistency checking. |
| 41 | **D** | All three approaches work: `-replace`, deleting from config+apply, or destroy-target+apply. |
| 42 | **A** | `terraform_remote_state` reads the latest state snapshot from a configured remote backend. |
| 43 | **A** | Resources removed from the configuration are marked for destruction in the plan. |
| 44 | **A** | `terraform state mv` followed by config update is the safest rename approach. |
| 45 | **A** | Local module paths use relative syntax: `"./modules/database"`. |
| 46 | **A** | Module outputs are accessed as `module.<name>.<output_name>`. |
| 47 | **A** | The `version` argument is set in the root configuration's `module` block. |
| 48 | **D** | Central repo with Git tags (A) AND pinning to specific versions per config (C) are both good practices. |
| 49 | **A** | The module should output the function name or ARN so the root module can invoke it. |
| 50 | **A** | `module.example[0].output_name` accesses the output of the first instance. |
| 51 | **A** | Data sources are evaluated during both `plan` and `apply` operations. |
| 52 | **A** | The Run timeline shows the full history of plan/apply operations for workspace auditing. |
| 53 | **A** | Team Management defines RBAC permissions for groups of users in Terraform Cloud. |
| 54 | **A** | "Auto Apply" automatically applies the plan after successful completion. |
| 55 | **A** | Private network connectivity is achieved through Terraform Cloud agents running in the customer's network. |
| 56 | **A** | Variable sets are reusable groups of variables that can be assigned to multiple workspaces. |
| 57 | **A** | Sentinel policy sets can be applied to multiple workspaces at once for consistent governance. |

</details>

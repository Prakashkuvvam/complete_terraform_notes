---
title: "Exam Practice Test 1"
weight: 18
bookFlatSection: false
bookToc: true
---

# Exam Practice Test 1

> **Simulate the real Terraform Associate certification exam with 57 questions across all 7 domains. Time yourself — you have 60 minutes. Aim for 70% or higher.**

---

## 📋 Exam Instructions

| Detail | Value |
|--------|-------|
| **Questions** | 57 |
| **Time Limit** | 60 minutes |
| **Passing Score** | ~70% (40/57 correct) |
| **Format** | Multiple choice (single answer & select two) |
| **Domains** | 7 domains (weighted per real exam) |

---

## 1. Infrastructure as Code (Q1–Q7)

**Q1.** Which of the following BEST describes Infrastructure as Code?

- A) Using a graphical user interface to manage cloud resources
- B) Managing and provisioning infrastructure through machine-readable definition files
- C) Writing shell scripts to automate server configuration
- D) Using configuration management tools to deploy applications

---

**Q2.** What is a primary advantage of declarative over imperative IaC?

- A) Declarative tools are always faster than imperative
- B) Declarative tools define the desired end state, while imperative defines step-by-step instructions
- C) Declarative tools support only one cloud provider
- D) Declarative tools require less memory to run

---

**Q3.** Which of the following is an example of an imperative IaC approach?

- A) Defining `resource "aws_instance" "web" { ami = "ami-123" }` in a `.tf` file
- B) Writing a bash script that runs `aws ec2 run-instances` followed by `aws ec2 create-tags`
- C) Using Terraform to `apply` a configuration
- D) Using CloudFormation to deploy a stack

---

**Q4.** A company wants to ensure that infrastructure changes are reviewed, version-controlled, and reproducible. Which practice BEST supports this goal?

- A) Using the cloud provider web console for all changes
- B) Storing Terraform configuration files in a Git repository with pull request reviews
- C) Running `terraform apply` directly on production servers
- D) Sharing state files via email among team members

---

**Q5.** Which of the following is a key benefit of using IaC for disaster recovery?

- A) IaC automatically backs up all data daily
- B) IaC allows infrastructure to be recreated in a new region by re-applying the same configuration
- C) IaC reduces cloud costs by 50%
- D) IaC eliminates the need for backups entirely

---

**Q6.** An organization uses Terraform to manage infrastructure across AWS, Azure, and GCP. This is an example of which IaC benefit?

- A) Vendor lock-in
- B) Multi-cloud management with consistent workflows
- C) Reduced security requirements
- D) Automatic cost optimization

---

**Q7.** Which statement BEST describes the relationship between idempotency and IaC?

- A) Idempotent IaC produces different results each time it runs
- B) Idempotent IaC produces the same result regardless of how many times the configuration is applied
- C) Idempotency means IaC can only be run once
- D) Idempotency is not relevant to IaC

---

## 2. Terraform Basics (Q8–Q17)

**Q8.** Which command downloads the required provider plugins for a Terraform configuration?

- A) `terraform plan`
- B) `terraform init`
- C) `terraform get`
- D) `terraform download`

---

**Q9.** What is the purpose of the `required_providers` block in a Terraform configuration?

- A) It specifies which cloud providers are available in the current region
- B) It declares the source and version constraints for the providers the configuration needs
- C) It lists all providers that Terraform should ignore
- D) It defines which provider configurations are mandatory for all workspaces

---

**Q10.** What does the `required_version` setting in the `terraform` block do?

- A) It specifies the minimum version of Terraform required to apply the configuration
- B) It sets the version of the providers to download
- C) It defines which Terraform binary should be installed on the system
- D) It determines the API version used by the cloud provider

---

**Q11.** A user runs `terraform plan` and receives an error that the provider plugin is missing. What should the user do FIRST?

- A) Run `terraform apply` to trigger automatic download
- B) Run `terraform init` to download the required providers
- C) Manually download the plugin from the Terraform Registry
- D) Run `terraform validate` to fix the missing plugin

---

**Q12.** What does the `~>` version constraint `~> 3.0` mean?

- A) Any version 3.0 or higher
- B) Any version in the 3.x range, but less than 4.0
- C) Exactly version 3.0
- D) Any version less than 3.0

---

**Q13.** Which of the following Terraform resources is managed by a provider?

- A) `terraform` block
- B) `aws_instance`
- C) `variable`
- D) `output`

---

**Q14.** A team needs Terraform to support both AWS and Azure resources in the same configuration. How should they configure this?

- A) Use two separate Terraform configurations in different directories
- B) Define both `hashicorp/aws` and `hashicorp/azurerm` in the `required_providers` block and configure them separately
- C) Terraform does not support multi-provider configurations
- D) Use the `provider` meta-argument with `count` to switch between providers

---

**Q15.** What happens if a provider specified in `required_providers` does not have a version constraint?

- A) Terraform uses the latest available version
- B) Terraform throws an error and refuses to initialize
- C) Terraform uses a default version 1.0
- D) Terraform prompts the user to select a version

---

**Q16.** Which directory is created by `terraform init` to store provider plugins and module files?

- A) `.terraform/`
- B) `terraform.d/`
- C) `plugins/`
- D) `.cache/`

---

**Q17.** A developer wants to ensure all team members use the same provider versions across different machines. What is the BEST approach?

- A) Ask all team members to manually install the same provider version
- B) Commit the `.terraform.lock.hcl` file to version control
- C) Pin the Terraform binary version only
- D) Use `terraform providers lock` on each machine separately

---

## 3. Terraform Workflow (Q18–Q26)

**Q18.** What is the CORRECT order of commands in the standard Terraform workflow?

- A) `apply` → `plan` → `init`
- B) `init` → `plan` → `apply`
- C) `plan` → `init` → `apply`
- D) `validate` → `init` → `apply`

---

**Q19.** Which command validates the syntax and internal consistency of Terraform configuration files without accessing any remote services?

- A) `terraform plan`
- B) `terraform validate`
- C) `terraform fmt`
- D) `terraform check`

---

**Q20.** What does the `terraform plan -out=plan.tfplan` command do?

- A) Creates a readable plan file and saves it for later execution
- B) Applies the plan immediately
- C) Outputs the current state file to the specified file
- D) Creates a backup of the current infrastructure

---

**Q21.** When `terraform apply` is run without saving a plan file first, what happens?

- A) Terraform creates a new plan and immediately applies it without confirmation
- B) Terraform creates a new plan, shows it to the user, and asks for confirmation before applying
- C) Terraform reuses the most recent plan from the cache
- D) Terraform fails with an error asking for a plan file

---

**Q22.** Which command would you use to format all `.tf` files in a directory according to the Terraform style conventions?

- A) `terraform format`
- B) `terraform fmt`
- C) `terraform lint`
- D) `terraform style`

---

**Q23.** A CI/CD pipeline runs `terraform plan` but the output is too verbose. The team wants to check if the plan contains any changes without seeing full details. Which flag should be used?

- A) `-compact`
- B) `-detailed-exitcode`
- C) `-summary`
- D) `-changes-only`

---

**Q24.** What is the purpose of `terraform destroy`?

- A) To delete the Terraform state file
- B) To destroy all resources managed by the current Terraform configuration
- C) To remove Terraform from the system
- D) To delete the `.terraform` directory

---

**Q25.** Which command would you run to rebuild infrastructure that was destroyed, using the same configuration?

- A) `terraform rebuild`
- B) `terraform apply` (after the destroy is complete)
- C) `terraform restore`
- D) `terraform recover`

---

**Q26.** A developer runs `terraform destroy -auto-approve` on a production workspace by mistake. What is the primary danger of using `-auto-approve` with `destroy`?

- A) It skips the planning phase entirely, so the user never sees what will be destroyed
- B) It automatically approves the destruction plan without requiring interactive confirmation, removing the safety net of reviewing what will be destroyed
- C) It destroys resources faster, increasing the chance of errors
- D) It only works if the user has already run `terraform plan`

---

## 4. Terraform Configuration (Q27–Q36)

**Q27.** What is the variable precedence order from HIGHEST to LOWEST?

- A) default → `TF_VAR_` → `terraform.tfvars` → `*.auto.tfvars` → `-var`
- B) `-var` → `*.auto.tfvars` → `terraform.tfvars` → `TF_VAR_` → default
- C) `terraform.tfvars` → `-var` → `TF_VAR_` → `*.auto.tfvars` → default
- D) `TF_VAR_` → `-var` → default → `terraform.tfvars` → `*.auto.tfvars`

---

**Q28.** What is the difference between a `local` value and a `variable` in Terraform?

- A) Locals can be set from outside the configuration; variables are internal
- B) Locals are computed within the configuration and cannot be overridden externally; variables accept input from outside the configuration
- C) Locals are only available in modules; variables are only available in root configurations
- D) There is no difference — they are interchangeable

---

**Q29.** Given the following expression, what is the result of `local.names`?

```hcl
locals {
  prefix = "app"
  names  = [for i in range(3) : "${local.prefix}-${i + 1}"]
}
```

- A) `["app-0", "app-1", "app-2"]`
- B) `["app-1", "app-2", "app-3"]`
- C) `["app-1", "app-2"]`
- D) `["prefix-1", "prefix-2", "prefix-3"]`

---

**Q30.** Which function would you use to safely read a value from a map with a fallback default if the key does not exist?

- A) `lookup()`
- B) `search()`
- C) `find()`
- D) `get()`

---

**Q31.** What does the `sensitive` parameter do when applied to an output value?

- A) Encrypts the output value in the state file
- B) Prevents the value from being displayed in CLI output after `terraform apply`
- C) Removes the value from the state file entirely
- D) Requires a password to view the output

---

**Q32.** Which expression evaluates to `true` if the string `var.environment` starts with "prod"?

- A) `startswith(var.environment, "prod")`
- B) `can(regex("^prod", var.environment))`
- C) `var.environment ~ "^prod"`
- D) `match(var.environment, "prod")`

---

**Q33.** What is the purpose of the `try()` function in Terraform?

- A) To catch and suppress all errors in a configuration
- B) To evaluate expressions in order and return the result of the first one that does not produce an error
- C) To attempt to connect to a remote API
- D) To retry a failed operation a specified number of times

---

**Q34.** Which argument creates resources from a set of unique string keys, ensuring stable addresses?

- A) `count`
- B) `for_each`
- C) `dynamic`
- D) `each`

---

**Q35.** What is a key limitation of the backend configuration block?

- A) It can only be configured for AWS S3
- B) It cannot use interpolations or variable references
- C) It requires a separate `backend.tf` file
- D) It cannot be used with Terraform Cloud

---

**Q36.** Given the following, which is the correct way to reference an element from a list variable?

```hcl
variable "subnets" {
  type    = list(string)
  default = ["subnet-a", "subnet-b", "subnet-c"]
}
```

- A) `subnets.0`
- B) `var.subnets[0]`
- C) `var.subnets.0`
- D) `subnets(0)`

---

## 5. Terraform State (Q37–Q44)

**Q37.** What is the primary purpose of the Terraform state file?

- A) To store the source code of the Terraform configuration
- B) To map real-world resources to your configuration and track metadata
- C) To serve as a backup of cloud resources
- D) To store credentials for cloud providers

---

**Q38.** Which of the following is a risk of using local state files in a team environment?

- A) Local state files are always slower than remote state
- B) Team members may overwrite each other's changes if sharing via Git
- C) Local state files cannot store resource metadata
- D) Local state files do not support sensitive values

---

**Q39.** When using an S3 backend for remote state, which additional AWS service provides state locking to prevent concurrent modifications?

- A) Amazon RDS
- B) Amazon DynamoDB
- C) Amazon SQS
- D) Amazon ElastiCache

---

**Q40.** What does `terraform state list` do?

- A) Lists all `.tf` files in the current directory
- B) Lists all resources tracked in the current state file
- C) Lists all available Terraform providers
- D) Lists all workspaces in the current configuration

---

**Q41.** A resource was accidentally deleted from the Terraform state file but still exists in the cloud. How can it be re-added to state without recreating it?

- A) `terraform apply` will automatically detect and re-add it
- B) `terraform import <resource_type>.<name> <resource_id>`
- C) `terraform state add <resource_type>.<name>`
- D) Manually edit the state JSON file

---

**Q42.** What happens to the state file when a resource is removed from the Terraform configuration and `terraform apply` is run?

- A) Terraform prompts the user to confirm removal of the resource from both the cloud and state
- B) Terraform destroys the resource in the cloud and removes it from the state file
- C) The resource remains in the state file but is ignored in future plans
- D) Terraform only removes the resource from the state file but keeps it running in the cloud

---

**Q43.** Which command safely moves a resource from one state address to another without destroying and recreating it?

- A) `terraform state mv`
- B) `terraform state cp`
- C) `terraform state rename`
- D) `terraform state transfer`

---

**Q44.** What is the purpose of `terraform state rm`?

- A) To permanently delete a resource from the cloud provider
- B) To remove a resource from Terraform management without destroying it
- C) To delete the entire state file
- D) To remove stale data from the state cache

---

## 6. Terraform Modules (Q45–Q51)

**Q45.** What is a Terraform module?

- A) A standalone executable that manages Terraform state
- B) A self-contained collection of `.tf` files that manages a group of related resources
- C) A built-in Terraform function for modular arithmetic
- D) A plugin that extends Terraform with new resource types

---

**Q46.** Which source format is used to reference a module from the public Terraform Registry?

- A) `source = "github.com/namespace/name"`
- B) `source = "./modules/name"`
- C) `source = "terraform-aws-modules/vpc/aws"`
- D) `source = "https://registry.terraform.io/modules/name"`

---

**Q47.** When a child module is referenced, which of the following can the root module access from that child module?

- A) Resources defined inside the child module directly
- B) Only values explicitly declared as `output` in the child module
- C) All local values within the child module
- D) Variables declared in the child module

---

**Q48.** What is the purpose of module versioning?

- A) To allow multiple versions of Terraform to run simultaneously
- B) To enable reproducible infrastructure by pinning to a specific module version
- C) To track changes to the Terraform binary
- D) To organize commits in the Git repository

---

**Q49.** Which of the following is TRUE about module inputs (variables)?

- A) Module variables are optional by default
- B) Module variables without defaults MUST be set by the calling module
- C) Module variables can only be strings
- D) Module variables are automatically passed to all nested child modules

---

**Q50.** What is a key benefit of using the `terraform-aws-modules` community modules from the Terraform Registry?

- A) They eliminate the need to write any Terraform configuration
- B) They provide battle-tested, reusable implementations for common infrastructure patterns
- C) They are officially maintained by HashiCorp with 99.99% uptime guarantee
- D) They automatically optimize cloud costs

---

**Q51.** Which `count` or `for_each` approach is more stable when resources need to be removed from the middle of a list?

- A) `count` — because it uses numeric indices that are easy to reorder
- B) `for_each` — because it uses unique string keys that are not affected by reordering
- C) Both are equally stable
- D) Neither — you must manually update the state file

---

## 7. Terraform Cloud & Enterprise (Q52–Q57)

**Q52.** What is a Terraform Cloud workspace?

- A) A physical server running Terraform operations
- B) A collection of Terraform state, variables, and run history for a specific set of infrastructure
- C) A Kubernetes namespace for running Terraform pods
- D) A cloud IDE for writing Terraform configurations

---

**Q53.** When a VCS-driven workflow is configured in Terraform Cloud, what happens automatically when a pull request is created?

- A) Terraform Cloud immediately applies the plan to production
- B) Terraform Cloud creates a speculative plan and posts the result as a comment on the PR
- C) Terraform Cloud locks the workspace until the PR is merged
- D) Terraform Cloud sends an email notification but takes no action

---

**Q54.** What is the Sentinel policy-as-code framework used for in Terraform Cloud?

- A) To monitor infrastructure for security threats
- B) To enforce compliance and governance policies on Terraform runs
- C) To send notifications when resources are created
- D) To automatically fix security vulnerabilities

---

**Q55.** Which execution mode runs Terraform operations on Terraform Cloud's infrastructure rather than locally?

- A) Local execution
- B) Remote execution
- C) Agent execution
- D) Cloud execution

---

**Q56.** A team wants to use Terraform Cloud but needs to store a sensitive API key. How should they handle this?

- A) Store the API key directly in the Terraform configuration file
- B) Use Terraform Cloud's variable sets with the "sensitive" option enabled
- C) Hardcode the API key in a `.tfvars` file committed to Git
- D) Terraform Cloud does not support sensitive variables

---

**Q57.** Which feature of Terraform Cloud allows sharing common variables (like AWS credentials) across multiple workspaces?

- A) Variable hierarchies
- B) Variable sets
- C) Environment templates
- D) Provider configurations

---

## ✅ Answer Key

<details>
<summary>📌 Click to reveal all answers with explanations</summary>

### Domain 1: Infrastructure as Code (Q1–Q7)

| # | Answer | Explanation |
|---|--------|-------------|
| 1 | **B** | IaC manages infrastructure through machine-readable definition files, not manual processes |
| 2 | **B** | Declarative IaC defines the desired end state; imperative defines the step-by-step instructions |
| 3 | **B** | A bash script with sequential CLI commands is imperative — it defines the steps, not the desired state |
| 4 | **B** | Storing config in Git with PR reviews ensures version control, review process, and reproducibility |
| 5 | **B** | IaC enables rapid recreation of infrastructure in another region by re-applying the same configuration |
| 6 | **B** | Terraform provides consistent workflows across AWS, Azure, and GCP for multi-cloud management |
| 7 | **B** | Idempotent IaC produces the same result regardless of how many times it's applied |

### Domain 2: Terraform Basics (Q8–Q17)

| # | Answer | Explanation |
|---|--------|-------------|
| 8 | **B** | `terraform init` downloads provider plugins and initializes the working directory |
| 9 | **B** | `required_providers` declares source and version constraints for the providers needed |
| 10 | **A** | `required_version` sets the minimum Terraform version needed to apply the configuration; helps enforce version consistency across the team |
| 11 | **B** | `terraform init` must be run first to download missing provider plugins |
| 12 | **B** | `~> 3.0` means ≥ 3.0 and < 4.0 (allows minor/patch updates, but not major) |
| 13 | **B** | `aws_instance` is a resource managed by the AWS provider |
| 14 | **B** | Multiple providers can be declared in `required_providers` and configured separately |
| 15 | **A** | Without a version constraint, Terraform downloads the latest available version |
| 16 | **A** | Provider plugins and modules are stored in the `.terraform/` directory |
| 17 | **B** | Committing `.terraform.lock.hcl` ensures all team members use the same provider versions |

### Domain 3: Terraform Workflow (Q18–Q26)

| # | Answer | Explanation |
|---|--------|-------------|
| 18 | **B** | The standard workflow is `init` (initialize) → `plan` (preview) → `apply` (execute) |
| 19 | **B** | `terraform validate` checks syntax and internal consistency without accessing remote services |
| 20 | **A** | `-out=plan.tfplan` saves the plan to a file for later execution with `terraform apply plan.tfplan` |
| 21 | **B** | Without a saved plan file, Terraform generates a new plan and requires user confirmation |
| 22 | **B** | `terraform fmt` formats `.tf` files according to the standard style conventions |
| 23 | **B** | `-detailed-exitcode` returns exit code 2 if there are changes, 0 if no changes |
| 24 | **B** | `terraform destroy` destroys all resources managed by the current configuration |
| 25 | **B** | After a destroy, `terraform apply` recreates the infrastructure from the same configuration |
| 26 | **B** | `-auto-approve` skips the interactive confirmation; combined with `destroy`, this removes the safety review, making accidental destruction much more likely |

### Domain 4: Terraform Configuration (Q27–Q36)

| # | Answer | Explanation |
|---|--------|-------------|
| 27 | **B** | Precedence: `-var` > `*.auto.tfvars` > `terraform.tfvars` > `TF_VAR_` > default |
| 28 | **B** | Locals are computed internally; variables accept external input |
| 29 | **B** | `range(3)` is `[0,1,2]`, so `i+1` gives `[1,2,3]`, resulting in `["app-1", "app-2", "app-3"]` |
| 30 | **A** | `lookup(map, key, default)` safely reads a map value with a fallback default |
| 31 | **B** | `sensitive = true` prevents the value from being displayed in CLI output |
| 32 | **B** | `can(regex(...))` returns true if the regex matches; `startswith` does not exist in Terraform |
| 33 | **B** | `try()` evaluates expressions in order and returns the first one that does not error |
| 34 | **B** | `for_each` creates resources with stable string keys from a map or set |
| 35 | **B** | Backend configuration blocks do not support variable references or interpolation |
| 36 | **B** | List elements are accessed with bracket notation: `var.subnets[0]` |

### Domain 5: Terraform State (Q37–Q44)

| # | Answer | Explanation |
|---|--------|-------------|
| 37 | **B** | The state file maps real-world resources to configuration and tracks metadata like IDs and attributes |
| 38 | **B** | Local state files shared via Git are prone to conflicts and overwrites |
| 39 | **B** | DynamoDB provides state locking for S3-backed remote state |
| 40 | **B** | `terraform state list` shows all resources tracked in the current state |
| 41 | **B** | `terraform import` re-adds an existing cloud resource to the Terraform state |
| 42 | **B** | Terraform destroys resources removed from configuration and updates the state file |
| 43 | **A** | `terraform state mv` moves resources between addresses without destroying them |
| 44 | **B** | `terraform state rm` removes a resource from Terraform management but keeps it running in the cloud |

### Domain 6: Terraform Modules (Q45–Q51)

| # | Answer | Explanation |
|---|--------|-------------|
| 45 | **B** | A module is a self-contained collection of `.tf` files managing a group of related resources |
| 46 | **C** | Registry modules use the format `namespace/name/provider` (e.g., `terraform-aws-modules/vpc/aws`) |
| 47 | **B** | Only `output` values declared in the child module are accessible from the root module |
| 48 | **B** | Module versioning pins specific versions for reproducibility |
| 49 | **B** | Variables without defaults are required and must be set by the calling module |
| 50 | **B** | Community modules provide battle-tested, reusable implementations for common patterns |
| 51 | **B** | `for_each` uses stable string keys, so removing one item does not shift others |

### Domain 7: Terraform Cloud & Enterprise (Q52–Q57)

| # | Answer | Explanation |
|---|--------|-------------|
| 52 | **B** | A workspace is a collection of state, variables, and run history for specific infrastructure |
| 53 | **B** | Terraform Cloud creates a speculative plan and posts results as a PR comment |
| 54 | **B** | Sentinel enforces compliance and governance policies on Terraform runs |
| 55 | **B** | Remote execution runs Terraform operations on Terraform Cloud's infrastructure |
| 56 | **B** | Sensitive variables should be stored in variable sets with the "sensitive" option enabled |
| 57 | **B** | Variable sets allow sharing common variables across multiple workspaces |

---

### Score Calculation

| Correct Answers | Result |
|----------------|--------|
| 40–57 | ✅ **Pass** — Ready for the exam! |
| 30–39 | 🔶 **Almost there** — Review weak domains |
| 0–29 | 🔴 **Needs more study** — Revisit chapters 1–14 |

Use your results to identify weak domains. Focus your study on domains where you scored below 70%.

</details>

---

> **Pro tip:** After completing this test, check your score per domain. If you scored below 70% in any domain, review the corresponding chapters in this guide before attempting the next practice test.

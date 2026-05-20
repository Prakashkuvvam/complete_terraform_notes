---
title: "Exam Practice Test 2"
weight: 19
bookFlatSection: false
bookToc: true
---

# Exam Practice Test 2

> **Another full-length simulation of the Terraform Associate certification exam. 57 new questions — including code-based questions. Time yourself: 60 minutes.**

---

## 📋 Exam Instructions

| Detail | Value |
|--------|-------|
| **Questions** | 57 |
| **Time Limit** | 60 minutes |
| **Passing Score** | ~70% (40/57 correct) |
| **Format** | Multiple choice (single answer & select two) |

---
<div class="exam-controls">
  <div class="exam-timer" data-minutes="60" data-test-id="exam-test-2">
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
    <input type="checkbox" class="test-complete-check" id="test-complete-2" data-test-id="exam-test-2">
    <label for="test-complete-2">✓ Mark test as completed</label>
  </div>
</div>

## 1. Infrastructure as Code (Q1–Q7)

**Q1.** How does Infrastructure as Code differ from configuration management tools like Ansible or Puppet?

- A) IaC provisions infrastructure resources; configuration management configures software on existing servers
- B) IaC is only for cloud infrastructure; configuration management is only for on-premises
- C) IaC is imperative; configuration management is declarative
- D) There is no difference — they are the same concept

---

**Q2.** Which principle of IaC ensures that infrastructure can be versioned, reviewed, and rolled back like application code?

- A) Automation
- B) Version control
- C) Imperative scripting
- D) Manual approval gates

---

**Q3.** An organization requires that all infrastructure changes go through a peer review process before deployment. How does IaC BEST support this requirement?

- A) IaC eliminates the need for review
- B) IaC configurations can be stored in Git, allowing pull requests and code reviews before applying
- C) IaC automatically validates all changes before deployment
- D) IaC requires two administrators to approve each resource creation

---

**Q4.** What is a key characteristic of immutable infrastructure?

- A) Servers are updated in-place with patches and configuration changes
- B) Servers are never modified after deployment; they are replaced with new instances for any change
- C) Infrastructure cannot be changed once deployed
- D) All infrastructure components share the same configuration

---

**Q5.** Which of the following scenarios BEST illustrates the documentation benefit of IaC?

- A) Running `terraform plan` shows exactly what infrastructure changes will be made before they happen
- B) Configuration files are automatically commented by Terraform
- C) IaC generates PDF reports of infrastructure topology
- D) IaC sends email notifications for every change

---

**Q6.** A company uses Terraform to manage AWS resources and Ansible to configure the software on EC2 instances. This is an example of:

- A) Vendor lock-in
- B) Complementary IaC tools — Terraform for provisioning, Ansible for configuration management
- C) Redundant tooling that should be consolidated
- D) Conflict of responsibility

---

**Q7.** What is the primary risk of not using IaC for infrastructure management?

- A) Infrastructure documentation becomes outdated or nonexistent, leading to "snowflake" servers
- B) Cloud costs automatically increase
- C) Network security is impossible to configure
- D) Operating systems cannot be patched

---

## 2. Terraform Basics (Q8–Q17)

**Q8.** Which Terraform command outputs the current version of the Terraform binary installed on the system?

- A) `terraform --version`
- B) `terraform version`
- C) `terraform check version`
- D) `terraform info`

---

**Q9.** What is the purpose of a provider alias in Terraform?

- A) To create a nickname for a provider
- B) To configure the same provider multiple times for different regions or accounts within the same configuration
- C) To rename a provider plugin
- D) To disable a specific provider

---

**Q10.** Given the following configuration, what is the correct way to reference the us-west-2 provider?

```hcl
provider "aws" {
  region = "us-east-1"
}

provider "aws" {
  alias  = "west"
  region = "us-west-2"
}
```

- A) `provider = aws.west`
- B) `provider = aws-west`
- C) `provider = aws["west"]`
- D) `providers = { aws = aws.west }`

---

**Q11.** Which command generates a visual representation of the Terraform dependency graph in DOT format?

- A) `terraform graph`
- B) `terraform visualize`
- C) `terraform dot`
- D) `terraform dependencies`

---

**Q12.** What does the `terraform providers` command do?

- A) Lists all available providers on the Terraform Registry
- B) Shows the provider requirements and versions for the current configuration
- C) Installs all configured providers
- D) Updates all providers to the latest versions

---

**Q13.** When specifying `source = "hashicorp/aws"` in `required_providers`, what does "hashicorp" refer to?

- A) The cloud provider region
- B) The namespace of the provider on the Terraform Registry (the publisher)
- C) The version of the provider
- D) The type of provider plugin

---

**Q14.** A team uses Terraform with an S3 backend. The backend configuration cannot use variables. How can the team manage different state file keys for each developer?

- A) Use environment variables in the backend config
- B) Use partial backend configuration with `-backend-config` flags during `terraform init`
- C) Edit the state file directly after each apply
- D) Use a different Terraform binary for each developer

---

**Q15.** Which of the following is NOT a valid backend type for Terraform?

- A) `s3`
- B) `consul`
- C) `mysql`
- D) `azurerm`

---

**Q16.** What happens when `terraform init` is run in a directory that already has a `.terraform` directory with all required plugins?

- A) Terraform re-downloads all plugins from scratch
- B) Terraform uses the cached plugins and re-validates the lock file
- C) Terraform skips initialization entirely
- D) Terraform shows an error that the directory is already initialized

---

**Q17.** How does Terraform discover provider plugins on a system?

- A) From the `.terraform/plugins` directory, then the local filesystem, then the Terraform Registry
- B) Only from the Terraform Registry
- C) From environment variables pointing to the plugin binaries
- D) By scanning the system PATH

---

## 3. Terraform Workflow (Q18–Q26)

**Q18.** A developer wants to see the attributes of a specific resource in the state file. Which command should they use?

- A) `terraform state list`
- B) `terraform state show <resource_address>`
- C) `terraform show <resource_address>`
- D) `terraform inspect <resource_address>`

---

**Q19.** What is the purpose of the `terraform console` command?

- A) To open a web-based interface for Terraform
- B) To provide an interactive shell for testing Terraform expressions and functions
- C) To display the Terraform log in real time
- D) To connect to the cloud provider console

---

**Q20.** A team uses the `-target` flag during apply to deploy only specific resources. What is a risk of this practice?

- A) `-target` only works with `terraform plan`, not `apply`
- B) Using `-target` can create partial dependencies and hidden drift since untargeted resources may not be updated
- C) `-target` applies changes in reverse order
- D) `-target` deletes all untargeted resources

---

**Q21.** Which flag is used with `terraform apply` to replace a specific resource even if no configuration changes exist?

- A) `-replace`
- B) `-force-recreate`
- C) `-recreate`
- D) `-taint`

---

**Q22.** What does `terraform output` display?

- A) The entire state file contents
- B) Only the output values defined in the configuration
- C) The Terraform binary version
- D) The list of all resources in the configuration

---

**Q23.** A developer runs `terraform validate` and receives no errors. What does this guarantee?

- A) The configuration will apply successfully
- B) The configuration is syntactically valid and internally consistent
- C) All cloud resources exist
- D) The state file is not corrupted

---

**Q24.** Which command enables verbose logging for troubleshooting Terraform operations?

- A) `terraform --verbose`
- B) Setting the `TF_LOG` environment variable
- C) `terraform log --level=debug`
- D) `terraform trace`

---

**Q25.** A user wants to see a human-readable summary of a plan file without applying it. Which command should they use?

- A) `terraform plan -read`
- B) `terraform show plan.tfplan`
- C) `terraform summary plan.tfplan`
- D) `terraform display plan.tfplan`

---

**Q26.** What does the `-lock-timeout` flag do when used with `terraform apply`?

- A) Sets how long Terraform will wait to acquire a state lock before failing
- B) Sets how long the state lock remains active
- C) Locks the terminal session for a specified duration
- D) Delays the apply operation by the specified time

---

## 4. Terraform Configuration (Q27–Q36)

**Q27.** What is the result of the following Terraform expression?

```hcl
merge({ a = 1, b = 2 }, { b = 3, c = 4 })
```

- A) `{ a = 1, b = 2, c = 4 }`
- B) `{ a = 1, b = 3, c = 4 }`
- C) `{ a = 1, b = 2, b = 3, c = 4 }`
- D) Error — duplicate keys are not allowed

---

**Q28.** Given the following code, what does `local.result` evaluate to?

```hcl
variable "items" {
  type    = list(string)
  default = ["a", "bb", "ccc", "dddd"]
}

locals {
  result = [for s in var.items : upper(s) if length(s) > 2]
}
```

- A) `["A", "BB", "CCC", "DDDD"]`
- B) `["CCC", "DDDD"]`
- C) `["ccc", "dddd"]`
- D) `["a", "bb"]`

---

**Q29.** What does the `flatten()` function do?

- A) Removes whitespace from strings
- B) Takes a list of lists and returns a single flat list
- C) Sorts a list in alphabetical order
- D) Removes duplicate entries from a list

---

**Q30.** Given the following, what is the valid way to declare a variable that accepts either a string or null?

```hcl
variable "endpoint" {
  type    = string
  default = null
}
```

- A) This is the correct way — the variable accepts a string and can be null by default
- B) The `type` must be `any` to accept null
- C) The `nullable` argument must be explicitly set to `true`
- D) Strings cannot have a default of null in Terraform

---

**Q31.** What does the `element()` function return when given `element(["a", "b", "c"], 5)`?

- A) An error — index out of range
- B) `"b"` — it wraps around using modulo: index 5 % 3 = 2, so element at index 2 is "c" — wait, 5 % 3 = 2, so "c" — let me redo: 5 % 3 = 2, element at index 2 is "c"
- C) `"a"` — it returns the first element for any out-of-range index
- D) `null`

---

**Q32.** What is the purpose of the `cidrsubnet()` function?

- A) To calculate the IP address of a subnet
- B) To calculate a subnet CIDR prefix within a given CIDR block
- C) To validate whether a given string is a valid CIDR
- D) To determine the netmask of a CIDR block

---

**Q33.** Given the following code, which option correctly defines the type of variable that accepts a key-value pair with string keys and list of numbers as values?

- A) `type = map(list(number))`
- B) `type = map(list(string))`
- C) `type = object(list(number))`
- D) `type = list(map(number))`

---

**Q34.** What does the `try()` function return in the following expression if `var.tags` is `null`?

```hcl
local.name = try(var.tags["Name"], "default-name")
```

- A) An error because `null` cannot be indexed
- B) `"default-name"`
- C) `null`
- D) An empty string

---

**Q35.** What is the purpose of a `validation` block within a variable declaration?

```hcl
variable "instance_type" {
  type = string
  validation {
    condition     = contains(["t2.micro", "t2.small", "t2.medium"], var.instance_type)
    error_message = "Instance type must be one of: t2.micro, t2.small, t2.medium."
  }
}
```

- A) To validate the variable value at plan time and provide a custom error if invalid
- B) To validate the variable at apply time against the cloud provider API
- C) To restrict the variable to only the listed values in the cloud console
- D) To automatically correct invalid values to the nearest valid option

---

**Q36.** What does the `coalesce()` function do?

- A) Combines two lists into a single list
- B) Returns the first non-null value from a list of arguments
- C) Converts a value to a string
- D) Calculates the sum of a list of numbers

---

## 5. Terraform State (Q37–Q44)

**Q37.** A user wants to retrieve the current state file from a remote backend to a local file without modifying the remote state. Which command should they use?

- A) `terraform state pull > local.tfstate`
- B) `terraform state push local.tfstate`
- C) `terraform state get > local.tfstate`
- D) `terraform state fetch > local.tfstate`

---

**Q38.** Which of the following BEST describes what happens when `terraform refresh` is run?

- A) It updates the state file to match real-world infrastructure without making configuration changes
- B) It re-downloads all provider plugins
- C) It destroys and recreates all resources to ensure they match the configuration
- D) It updates the Terraform binary to the latest version

---

**Q39.** What is the purpose of the `terraform_remote_state` data source?

- A) To store the current configuration in a remote backend
- B) To read the output values from another Terraform state file stored in a remote backend
- C) To push the local state to a remote location
- D) To copy state files between different backends

---

**Q40.** When using a remote backend with state encryption enabled, where is the encryption key typically managed?

- A) In the Terraform configuration file
- B) By the backend service (e.g., S3 SSE or KMS)
- C) In the state file itself
- D) In the provider configuration block

---

**Q41.** A team member leaves the company. Their local Terraform state files need to be migrated to a shared S3 backend. What is the correct approach?

- A) Manually copy the local `terraform.tfstate` to the S3 bucket
- B) Update the `backend` block to point to S3 and run `terraform init` — Terraform will prompt to migrate the state
- C) Delete the local state and run `terraform apply` to recreate everything from scratch
- D) Email the state file to the team lead

---

**Q42.** True or False: The `terraform state` command can modify the state file directly even if the backend is configured.

- A) True — `terraform state` subcommands work with any configured backend
- B) False — remote backends do not support state manipulation commands

---

**Q43.** What is the primary reason Terraform stores resource attributes in the state file rather than querying the provider each time?

- A) To reduce API calls to the cloud provider, improving performance
- B) The API does not return all attributes needed
- C) To make the state file human-readable
- D) To enable offline planning

---

**Q44.** A developer wants to give another team read-only access to the Terraform state outputs. What is the recommended approach?

- A) Share the AWS console login for the S3 bucket
- B) Use a `terraform_remote_state` data source with appropriate IAM permissions
- C) Copy the state file to a public S3 bucket
- D) Email the state file contents weekly

---

## 6. Terraform Modules (Q45–Q51)

**Q45.** Which of the following is NOT a valid module source?

- A) `source = "./modules/vpc"`
- B) `source = "terraform-aws-modules/vpc/aws"`
- C) `source = "git::https://github.com/org/repo.git"`
- D) `source = "docker://terraform-modules/vpc"`

---

**Q46.** When a module is called with `for_each`, what does `each.key` reference inside the module?

- A) The key from the calling module's `for_each` map
- B) The index of the current iteration
- C) The module's resource name
- D) The provider alias

---

**Q47.** What is the correct way to pass a provider configuration to a child module?

```hcl
# Root module
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

module "vpc" {
  source  = "./modules/vpc"
  # How to pass the west provider?
}
```

- A) `provider = aws.west`
- B) `providers = { aws = aws.west }`
- C) `provider_alias = "aws.west"`
- D) `aws_provider = "west"`

---

**Q48.** A module stored locally at `./modules/networking` can be referenced from a different Git repository. True or False?

- A) True — modules can be sourced from any reachable path
- B) False — local paths must be within the same repository or accessible filesystem

---

**Q49.** What happens when a module has both `count` and `for_each` set?

- A) Both are applied — resources are created for both the count and for_each values
- B) Terraform returns an error — `count` and `for_each` are mutually exclusive
- C) `for_each` takes precedence and `count` is ignored
- D) `count` takes precedence and `for_each` is ignored

---

**Q50.** A team publishes a module to the private module registry. How do other team members reference it?

- A) `source = "./modules/internal"`
- B) `source = "app.terraform.io/namespace/name/provider"`
- C) `source = "git::https://github.com/team/internal-module.git"`
- D) Only the registry source format is valid

---

**Q51.** What is the purpose of the `depends_on` meta-argument within a module block?

- A) It creates a dependency within the module's internal resources
- B) It ensures the entire module is created or destroyed after the specified resources
- C) It forces all resources in the module to use the specified provider
- D) It controls the order of output evaluation

---

## 7. Terraform Cloud & Enterprise (Q52–Q57)

**Q52.** What is the difference between Terraform Cloud Free and Team tiers regarding run history?

- A) Free tier has a limited number of runs per month; Team tier is unlimited
- B) Free tier saves run history locally; Team tier saves to the cloud
- C) Free tier does not support state storage
- D) There is no difference in run history

---

**Q53.** True or False: Terraform Cloud can send notifications to Slack when runs complete.

- A) True — Terraform Cloud supports Slack, email, and webhook notifications
- B) False — notifications are only available in Terraform Enterprise

---

**Q54.** What is a run trigger in Terraform Cloud?

- A) A feature that automatically starts a run in one workspace when another workspace completes a successful apply
- B) A feature that triggers runs based on a cron schedule
- C) A button that manually starts a new run
- D) A webhook that triggers external CI/CD pipelines

---

**Q55.** Which Terraform Cloud feature provides cost estimation for planned infrastructure changes?

- A) Sentinel policies
- B) Cost estimation (available with the Team tier and above)
- C) Run tasks
- D) Private module registry

---

**Q56.** How does Terraform Cloud handle team permissions for workspaces?

- A) All team members have full access to all workspaces
- B) Permissions can be configured per workspace with roles like "read", "plan", "write", and "admin"
- C) Permissions are set globally for the entire organization
- D) Terraform Cloud does not support team permissions

---

**Q57.** What is the purpose of the Terraform Cloud agent?

- A) To monitor infrastructure for security threats
- B) To allow Terraform Cloud to run operations on private networks that cannot be reached directly from Terraform Cloud
- C) To act as a chat bot for Terraform operations
- D) To automatically apply all Terraform runs without review

---

## ✅ Answer Key

<details>
<summary>📌 Click to reveal all answers with explanations</summary>

### Domain 1: Infrastructure as Code (Q1–Q7)

| # | Answer | Explanation |
|---|--------|-------------|
| 1 | **A** | IaC provisions infrastructure (VPCs, instances, databases); config mgmt configures OS and applications |
| 2 | **B** | Version control enables storing infrastructure configurations alongside application code with history and rollback |
| 3 | **B** | Git-based IaC enables pull request workflows where changes are reviewed before `terraform apply` |
| 4 | **B** | Immutable infrastructure replaces servers entirely for changes rather than modifying them in place |
| 5 | **A** | `terraform plan` serves as documentation of what will change — it communicates intent before execution |
| 6 | **B** | Terraform for provisioning and Ansible for config mgmt are complementary tools used together |
| 7 | **A** | Without IaC, manual changes create undocumented "snowflake" servers that are hard to reproduce |

### Domain 2: Terraform Basics (Q8–Q17)

| # | Answer | Explanation |
|---|--------|-------------|
| 8 | **A** | `terraform --version` (or `terraform version`) outputs the binary version |
| 9 | **B** | Provider aliases allow configuring the same provider multiple times (e.g., different regions, different accounts) |
| 10 | **D** | When passing aliased providers to modules, use `providers = { aws = aws.west }` syntax |
| 11 | **A** | `terraform graph` outputs DOT format that can be visualized with Graphviz |
| 12 | **B** | `terraform providers` shows the required providers, their sources, and version constraints |
| 13 | **B** | "hashicorp" is the namespace on the Terraform Registry, indicating the publisher of the provider |
| 14 | **B** | Partial backend configuration with `-backend-config` flags allows dynamic state keys per developer during `init` |
| 15 | **C** | `mysql` is not a valid Terraform backend type. Valid backends include s3, consul, azurerm, gcs, etcd, etc. |
| 16 | **B** | Terraform uses the cache and re-validates against the lock file; it only re-downloads if checksums differ |
| 17 | **A** | Terraform checks the `.terraform/plugins` directory first, then local filesystem, then the Registry |

### Domain 3: Terraform Workflow (Q18–Q26)

| # | Answer | Explanation |
|---|--------|-------------|
| 18 | **B** | `terraform state show <address>` displays all attributes of a specific resource from the state |
| 19 | **B** | `terraform console` opens an interactive shell for testing expressions and functions |
| 20 | **B** | `-target` skips untargeted resources, potentially missing updates to dependencies or related resources |
| 21 | **A** | `terraform apply -replace=<address>` forces recreation of a resource (replaces the old `taint` workflow) |
| 22 | **B** | `terraform output` prints only the declared output values from the configuration |
| 23 | **B** | `terraform validate` checks syntax and internal consistency but does not verify cloud resource existence |
| 24 | **B** | Setting `TF_LOG=DEBUG` (or INFO, WARN, ERROR, TRACE) enables verbose logging |
| 25 | **B** | `terraform show plan.tfplan` displays the saved plan in human-readable format without applying |
| 26 | **A** | `-lock-timeout=5m` tells Terraform to wait up to 5 minutes for a state lock before failing |

### Domain 4: Terraform Configuration (Q27–Q36)

| # | Answer | Explanation |
|---|--------|-------------|
| 27 | **B** | `merge()` combines maps; later keys override earlier ones, so `b` becomes 3 and `c` is added: `{a=1, b=3, c=4}` |
| 28 | **B** | The `if` filter keeps only strings with length > 2 ("ccc" and "dddd"), then `upper()` capitalizes them |
| 29 | **B** | `flatten()` takes `[[1,2],[3,[4]]]` and returns `[1,2,3,4]` (one level of flattening) |
| 30 | **A** | Since Terraform 0.15+, variables with `default = null` are nullable by default |
| 31 | **B** | `element()` wraps around using modulo — 5 % 3 = 2, so it returns `"c"` (the third element) |
| 32 | **B** | `cidrsubnet(prefix, newbits, netnum)` calculates a subnet CIDR within a given VPC CIDR prefix |
| 33 | **A** | `map(list(number))` accepts a map where each key maps to a list of numbers |
| 34 | **B** | `try()` catches the error from indexing `null` and returns the fallback value `"default-name"` |
| 35 | **A** | `validation` blocks check conditions at plan time and provide custom error messages for invalid values |
| 36 | **B** | `coalesce(val1, val2, ...)` returns the first non-null value from the argument list |

### Domain 5: Terraform State (Q37–Q44)

| # | Answer | Explanation |
|---|--------|-------------|
| 37 | **A** | `terraform state pull` downloads the current remote state to stdout, which can be redirected to a file |
| 38 | **A** | `terraform refresh` updates the state file to match real-world resources (deprecated in favor of `-refresh-only`) |
| 39 | **B** | `terraform_remote_state` reads outputs from another workspace's state file stored in a remote backend |
| 40 | **B** | State encryption is handled by the backend service (e.g., S3 SSE-S3, SSE-KMS, or SSE-C) |
| 41 | **B** | Changing the backend config and running `terraform init` triggers an interactive state migration prompt |
| 42 | **A** | `terraform state` subcommands work with any configured backend, not just local state |
| 43 | **A** | Storing attributes in state reduces API calls and allows Terraform to plan without querying every resource |
| 44 | **B** | `terraform_remote_state` with proper IAM policies provides read-only access to state outputs |

### Domain 6: Terraform Modules (Q45–Q51)

| # | Answer | Explanation |
|---|--------|-------------|
| 45 | **D** | Docker is not a valid module source. Valid sources: local paths, registry, GitHub, Git, S3, GCS, HTTP |
| 46 | **A** | When a module is created with `for_each`, `each.key` inside refers to the key from the calling module |
| 47 | **B** | The `providers` argument with `{ aws = aws.west }` syntax passes aliased providers to child modules |
| 48 | **B** | Local path sources (`./modules/networking`) must exist in the local filesystem accessible at init time |
| 49 | **B** | `count` and `for_each` are mutually exclusive — Terraform returns an error if both are set |
| 50 | **B** | Private module registry uses the `app.terraform.io/namespace/name/provider` format |
| 51 | **B** | `depends_on` in a module block ensures all resources in the module depend on the specified resource |

### Domain 7: Terraform Cloud & Enterprise (Q52–Q57)

| # | Answer | Explanation |
|---|--------|-------------|
| 52 | **A** | Free tier has a limited monthly run quota; Team tier provides unlimited runs |
| 53 | **A** | Terraform Cloud supports Slack, email, and webhook notifications for run events |
| 54 | **A** | Run triggers automatically start runs in downstream workspaces when upstream workspaces apply successfully |
| 55 | **B** | Cost estimation is available in Team tier and above, estimating monthly costs of planned changes |
| 56 | **B** | Workspace permissions support granular roles: read, plan, write, admin, and custom roles |
| 57 | **B** | Terraform Cloud agents run Terraform operations on private networks that TFC cannot reach directly |

---

### Score Calculation

| Correct Answers | Result |
|----------------|--------|
| 40–57 | ✅ **Pass** |
| 30–39 | 🔶 **Almost there** |
| 0–29 | 🔴 **Needs more study** |

</details>

---
title: "Mermaid Diagram Preview"
weight: 99
hidden: true
---

# Mermaid Diagram Preview 🎨

> **Temporary page** — View the rendered diagrams below, then let me know which ones you'd like added to the actual content pages.

---

## 1. Terraform Workflow + AWS Infrastructure (Combined Flowchart)

Shows how `terraform apply` triggers resource creation in AWS:

{{< mermaid >}}
graph TB
    subgraph "👨‍💻 Developer"
        A["terraform init"] --> B["terraform plan -out=plan.tfplan"]
        B --> C["review output"]
        C --> D["terraform apply plan.tfplan"]
    end

    subgraph "☁️ AWS Infrastructure"
        D --> E["API Gateway REST API"]
        D --> F["Lambda Function (Node.js)"]
        D --> G["DynamoDB Table"]
        E --> H["GET /items"]
        E --> I["POST /items"]
        E --> J["DELETE /items/{id}"]
        F --> K["CRUD Operations"]
        K --> G
    end

    subgraph "💾 State Management"
        D --> L["S3 Backend"]
        L --> M["DynamoDB Locking"]
        M --> N["terraform.tfstate"]
    end

    style A fill:#4a90d9,color:#fff
    style B fill:#4a90d9,color:#fff
    style D fill:#27ae60,color:#fff
    style H fill:#f39c12,color:#fff
    style I fill:#f39c12,color:#fff
    style J fill:#f39c12,color:#fff
{{< /mermaid >}}

---

## 2. Terraform Lifecycle (Sequence Diagram)

Shows the order of operations over time — from `init` to `apply` to `destroy`:

{{< mermaid >}}
sequenceDiagram
    participant Dev as 👨‍💻 Developer
    participant TF as Terraform
    participant State as State (S3/DynamoDB)
    participant AWS as AWS API
    participant Res as Infrastructure

    Dev->>TF: terraform init
    TF->>AWS: Initialize providers
    AWS-->>TF: Provider ready
    TF-->>Dev: Initialized

    Dev->>TF: terraform plan
    TF->>State: Read current state
    State-->>TF: Existing state
    TF->>AWS: Query resources
    AWS-->>TF: Current infra
    TF-->>Dev: Proposed changes

    Dev->>TF: terraform apply
    TF->>State: Lock state file
    State-->>TF: Lock acquired
    TF->>AWS: Create/Update resources
    AWS->>Res: Provision
    Res-->>AWS: Resource IDs
    AWS-->>TF: Success
    TF->>State: Write new state
    TF->>State: Release lock
    TF-->>Dev: Apply complete!

    Dev->>TF: terraform destroy
    TF->>State: Lock state
    TF->>AWS: Delete resources
    AWS-->>TF: Resources deleted
    TF->>State: Clear state
    TF-->>Dev: Destroy complete!
{{< /mermaid >}}

---

## 3. Terraform State Transitions (State Diagram)

{{< mermaid >}}
stateDiagram-v2
    [*] --> Initialized: terraform init
    Initialized --> Planned: terraform plan
    Planned --> Applying: terraform apply
    Applying --> Locked: Acquire DynamoDB lock
    Locked --> Creating: Execute create/update
    Creating --> WritingState: Resources provisioned
    WritingState --> Unlocked: Write to S3 + release lock
    Unlocked --> Planned: terraform plan (modify)
    Unlocked --> Destroying: terraform destroy
    Destroying --> CleaningState: Resources deleted
    CleaningState --> [*]: State cleared
    Unlocked --> [*]: (idle)

    note right of Locked: Prevents concurrent<br/>state modifications
    note right of Creating: resources = create,<br/>update, or delete
{{< /mermaid >}}

---

## 4. AWS Resource Dependency Graph (Flowchart)

Shows how Terraform resources depend on each other — from the Serverless API example:

{{< mermaid >}}
graph LR
    subgraph "Terraform Configuration Files"
        P["providers.tf<br/>AWS Provider"] --> R1["dynamodb.tf<br/>DynamoDB Table"]
        P --> R2["iam.tf<br/>IAM Role + Policy"]
        P --> R3["lambda.tf<br/>Lambda Function"]
        P --> R4["api-gateway.tf<br/>REST API"]
    end

    subgraph "Resource Dependencies"
        R2 -->|"role_arn"| R3
        R1 -->|"table_name"| R3
        R1 -->|"arn (for policy)"| R2
        R3 -->|"invoke_arn"| R4
        R3 -->|"function_name"| R5["Lambda Permission"]
        R4 --> R5
    end

    subgraph "Outputs"
        R4 --> O1["api_endpoint"]
        R3 --> O2["function_name"]
        R1 --> O3["dynamodb_table"]
    end

    style P fill:#e74c3c,color:#fff
    style R1 fill:#3498db,color:#fff
    style R2 fill:#9b59b6,color:#fff
    style R3 fill:#2ecc71,color:#fff
    style R4 fill:#f39c12,color:#fff
{{< /mermaid >}}

---

## 5. ECS Fargate Architecture (with Terraform Flow)

Full architecture showing both the Terraform configuration structure and the AWS infrastructure:

{{< mermaid >}}
graph TB
    subgraph "📄 Terraform Config"
        A["main.tf"] --> B["VPC + Subnets"]
        A --> C["Security Groups"]
        A --> D["ALB + Target Group"]
        A --> E["ECS Cluster"]
        A --> F["Task Definition"]
        A --> G["ECS Service"]
        A --> H["Auto Scaling"]
    end

    subgraph "☁️ AWS Resources"
        B --> I["Public Subnets"]
        B --> J["Private Subnets"]
        I --> K["Internet Gateway"]
        I --> L["NAT Gateway"]
        J --> L
        D --> M["Application Load Balancer"]
        M --> N["Listener :80"]
        N --> O["Target Group"]
        C --> M
        C --> P["ECS Tasks"]
        G --> P
        E --> G
        F --> P
        H -->|"CPU > 75%"| G
        P --> Q["CloudWatch Logs"]
    end

    subgraph "📊 Outputs"
        M --> R["alb_dns_name"]
        E --> S["cluster_name"]
    end

    style A fill:#e74c3c,color:#fff
    style B fill:#3498db,color:#fff
    style C fill:#3498db,color:#fff
    style D fill:#3498db,color:#fff
    style E fill:#3498db,color:#fff
    style F fill:#3498db,color:#fff
    style G fill:#3498db,color:#fff
    style H fill:#3498db,color:#fff
    style M fill:#27ae60,color:#fff
    style P fill:#27ae60,color:#fff
    style Q fill:#f39c12,color:#fff
{{< /mermaid >}}

---

> **Note:** These use the `{{</* mermaid */>}}` shortcode built into your theme. Mermaid is loaded automatically on first use and rendered as interactive SVGs.

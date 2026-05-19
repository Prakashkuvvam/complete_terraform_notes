---
title: "Chapter 10: Provisioners & Side Effects"
weight: 10
bookFlatSection: false
bookToc: true
---

# Chapter 10: Provisioners & Side Effects

## 🎯 Learning Objectives

- Understand when and why to use provisioners
- Differentiate between local-exec, remote-exec, and file provisioners
- Learn why provisioners are a "last resort"
- Explore alternatives like user_data and cloud-init
- Implement proper null_resource patterns

---

## 10.1 What Are Provisioners?

**Provisioners** are used to execute scripts or commands on local or remote machines as part of resource creation or destruction.

### Provisioner Types

| Provisioner | Runs on | Use Case |
|-------------|---------|----------|
| `file` | Local | Upload files to remote machine |
| `remote-exec` | Remote (SSH/WinRM) | Run scripts on remote instance |
| `local-exec` | Local machine | Run scripts on your own machine |

### Warning: Provisioners Are a Last Resort (Exam Critical)

```
⚠️ HashiCorp says: "Provisioners should be used as a last resort"
```

**Why?**
1. They're not declarative — They're procedural scripts
2. They don't appear in the plan output
3. Error handling is limited
4. They break the idempotency model
5. Most use cases have better alternatives

---

## 10.2 When to Use (and NOT Use) Provisioners

### ✅ When Provisioners Are Acceptable

- Running cleanup scripts on destruction
- Temporary workarounds for provider limitations
- Bootstrap configurations in testing environments
- Copying configuration files when no API is available

### ✅ Better Alternatives (Exam Critical)

| Task | Better Alternative |
|------|-------------------|
| Installing software | EC2 user_data, cloud-init, AMI baking (Packer) |
| Configuration management | Ansible, Chef, Puppet (post-deployment) |
| Copying files to instances | User data scripts, AMI templates |
| Running database migrations | CI/CD pipeline, application startup |
| Registering with services | Service discovery (Consul, Cloud Map) |

---

## 10.3 Provisioner Syntax

```hcl
# General provisioner syntax
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  provisioner "local-exec" {
    command = "echo ${self.id} > /tmp/instance_id.txt"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install -y httpd",
      "sudo systemctl start httpd"
    ]
  }

  provisioner "file" {
    source      = "config/app.conf"
    destination = "/etc/app/app.conf"
  }
}
```

---

## 10.4 Local-Exec Provisioner

Runs commands on the machine running Terraform.

```hcl
# Basic local-exec
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  provisioner "local-exec" {
    command = "echo ${self.id} >> instance_ids.txt"
  }
}

# Local-exec with working directory
resource "aws_instance" "web" {
  # ...
  provisioner "local-exec" {
    command     = "terraform apply -auto-approve"
    working_dir = "${path.module}/submodule"
    environment = {
      TF_VAR_instance_id = self.id
      ENVIRONMENT        = var.environment
    }
  }
}

# Local-exec on destroy (runs during destruction)
resource "aws_eip" "web" {
  domain = "vpc"
  
  provisioner "local-exec" {
    when    = destroy
    command = "echo 'Elastic IP ${self.id} will be released' >> cleanup.log"
  }
}
```

### Common local-exec Use Cases

```hcl
# Update local inventory file
resource "aws_instance" "web" {
  # ...
  provisioner "local-exec" {
    command = "echo '${self.public_ip} web-server' >> /etc/hosts"
  }
}

# Trigger external system (e.g., API call)
resource "aws_instance" "web" {
  # ...
  provisioner "local-exec" {
    command = <<EOT
      curl -X POST https://my-cmdb.example.com/api/instances \
        -H "Content-Type: application/json" \
        -d '{"id": "${self.id}", "ip": "${self.public_ip}"}'
    EOT
  }
}

# Run Ansible playbook (NOTE: This couples Terraform to Ansible)
resource "aws_instance" "web" {
  # ...
  provisioner "local-exec" {
    command = <<EOT
      ansible-playbook -i '${self.public_ip},' \
        -u ec2-user \
        --private-key ${var.ssh_key_path} \
        playbooks/configure-web.yml
    EOT
  }
}
```

---

## 10.5 Remote-Exec Provisioner

Runs commands on the remote machine via SSH or WinRM.

```hcl
# Remote-exec with SSH connection
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  key_name      = aws_key_pair.deployer.key_name

  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file(var.private_key_path)
    host        = self.public_ip
  }

  provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install -y httpd git",
      "sudo systemctl enable httpd",
      "sudo systemctl start httpd",
      "echo 'Hello from Terraform' | sudo tee /var/www/html/index.html"
    ]
  }
}

# Remote-exec with script file
resource "aws_instance" "web" {
  # ...
  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file(var.private_key_path)
    host        = self.public_ip
  }

  provisioner "remote-exec" {
    script = "${path.module}/scripts/configure_server.sh"
  }

  # Multiple scripts
  provisioner "remote-exec" {
    scripts = [
      "${path.module}/scripts/install_deps.sh",
      "${path.module}/scripts/configure_app.sh",
      "${path.module}/scripts/start_service.sh"
    ]
  }
}
```

---

## 10.6 File Provisioner

Copies files or directories to the remote machine.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file(var.private_key_path)
    host        = self.public_ip
  }

  # Copy a single file
  provisioner "file" {
    source      = "${path.module}/config/app.conf"
    destination = "/home/ec2-user/app.conf"
  }

  # Copy an entire directory
  provisioner "file" {
    source      = "${path.module}/webapp/"
    destination = "/var/www/html/"
  }

  # Copy content from a template
  provisioner "file" {
    content = templatefile("${path.module}/templates/app.conf.tftpl", {
      server_name = var.server_name
      port        = var.app_port
    })
    destination = "/etc/app/app.conf"
  }
}
```

---

## 10.7 Connection Block Configuration

```hcl
# SSH connection (Linux)
resource "aws_instance" "web" {
  # ...
  
  connection {
    type        = "ssh"
    user        = "ec2-user"          # or "ubuntu", "admin"
    private_key = file("~/.ssh/id_rsa")
    host        = self.public_ip
    port        = 22
    timeout     = "5m"
    agent       = true                # Use SSH agent
  }

  provisioner "remote-exec" {
    inline = ["echo 'Connected!'"]
  }
}

# WinRM connection (Windows)
resource "aws_instance" "windows" {
  ami           = "ami-0c55b159cbfafe1f0"  # Windows AMI
  instance_type = "t2.large"

  connection {
    type     = "winrm"
    user     = "Administrator"
    password = rsadecrypt(aws_instance.windows.password_data, file("private_key.pem"))
    host     = self.public_ip
    port     = 5986
    https    = true
    timeout  = "10m"
  }
}
```

### Connection Timeouts

```hcl
connection {
  type        = "ssh"
  user        = "ec2-user"
  private_key = file(var.private_key_path)
  host        = self.public_ip
  
  # Retry configuration
  timeout     = "10m"      # Total timeout for connection
  retries     = 10         # Number of retry attempts
  # Wait for SSH to be available (important for newly created instances)
}
```

---

## 10.8 Destroy-Time Provisioners

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  # Runs during creation
  provisioner "local-exec" {
    command = "echo 'Instance created: ${self.id}'"
  }

  # Runs during destruction
  provisioner "local-exec" {
    when    = destroy                       # ← Runs on destroy
    command = "echo 'Instance destroyed: ${self.id}' >> destroy.log"
  }
}

# Destroy-time remote-exec
resource "aws_instance" "web" {
  # ...
  
  provisioner "remote-exec" {
    when = destroy
    
    inline = [
      "sudo systemctl stop myservice",
      "sudo rm -rf /var/log/myservice",
      "echo 'Cleanup complete'"
    ]
    
    on_failure = continue  # Continue even if provisioner fails
  }

  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file(var.private_key_path)
    host        = self.public_ip
  }
}
```

### Destroy Provisioner Pattern: Deregister from Load Balancer

```hcl
resource "aws_instance" "web" {
  # ...
  
  provisioner "local-exec" {
    when = destroy
    command = <<EOT
      aws elbv2 deregister-targets \
        --target-group-arn ${self.tags_all["target_group_arn"]} \
        --targets Id=${self.id}
    EOT
  }
}
```

---

## 10.9 Null Resource as Provisioner Trigger

The `null_resource` is a resource with no actual infrastructure — it's just a trigger for provisioners.

```hcl
# Simple null_resource provisioner
resource "null_resource" "run_script" {
  provisioner "local-exec" {
    command = "echo 'Running independent script'"
  }
}

# Null resource with triggers
resource "null_resource" "deploy" {
  triggers = {
    # Re-run when instance ID or config hash changes
    instance_id = aws_instance.web.id
    config_hash = filesha256("${path.module}/config/app.conf")
  }

  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = "ec2-user"
      private_key = file(var.private_key_path)
      host        = aws_instance.web.public_ip
    }

    inline = [
      "sudo systemctl reload nginx",
      "echo 'Deployment triggered: ${timestamp()}'"
    ]
  }
}

# Null resource with count (conditional provisioner)
resource "null_resource" "conditional_deploy" {
  count = var.run_deploy ? 1 : 0

  triggers = {
    build_id = var.build_id
  }

  provisioner "local-exec" {
    command = "echo 'Deploying build ${var.build_id}'"
  }
}
```

---

## 10.10 Provisioner Failure Behavior

```hcl
# On failure: fail (default) — Terraform marks the resource as tainted
resource "aws_instance" "web" {
  # ...
  
  provisioner "remote-exec" {
    inline = [
      "some_command_that_might_fail"
    ]
    
    on_failure = fail  # Default behavior
    # Resource marked as tainted, will be recreated on next apply
  }
}

# On failure: continue — Terraform continues despite failure
resource "aws_instance" "web" {
  # ...
  
  provisioner "remote-exec" {
    inline = [
      "optional_config_script.sh"
    ]
    
    on_failure = continue  # Continue even if this provisioner fails
  }
}
```

### Tainted Resources

```bash
# If a provisioner fails, the resource is marked as tainted
# Next terraform apply will destroy and recreate it

# Manually taint a resource (deprecated in Terraform 1.5+)
terraform taint aws_instance.web

# Untaint a resource
terraform untaint aws_instance.web

# Using -replace flag (Terraform 1.5+)
terraform apply -replace="aws_instance.web"
```

---

## 10.11 Best Alternatives (Exam Critical)

### 1. EC2 User Data

```hcl
# ✅ BETTER: Use user_data instead of remote-exec
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  # This runs at boot time — no provisioners needed!
  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y httpd
    systemctl enable httpd
    systemctl start httpd
    echo "Hello from user_data" > /var/www/html/index.html
  EOF
}
```

### 2. Cloud-Init

```hcl
# ✅ BETTER: Use cloud-init for complex configuration
data "template_file" "cloud_init" {
  template = file("${path.module}/cloud-init.yml")

  vars = {
    hostname = var.server_name
    app_version = var.app_version
    s3_bucket = aws_s3_bucket.config.bucket
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  user_data     = data.template_file.cloud_init.rendered
  # user_data_base64 = base64encode(data.template_file.cloud_init.rendered)
}

# cloud-init.yml
#cloud-config
package_update: true
packages:
  - nginx
  - git
  - python3
write_files:
  - path: /etc/nginx/nginx.conf
    content: |
      server {
        listen 80;
        server_name ${hostname};
        root /var/www/html;
      }
runcmd:
  - systemctl enable nginx
  - systemctl start nginx
```

### 3. Pre-Baked AMIs with Packer

```hcl
# ✅ BEST: Pre-bake AMIs with Packer
# Packer builds AMI with all software pre-installed
# Terraform just references the AMI

data "aws_ami" "app" {
  owners      = ["self"]
  most_recent = true
  
  filter {
    name   = "name"
    values = ["myapp-${var.app_version}-*"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.app.id    # Pre-baked AMI
  instance_type = "t2.micro"
  # No provisioners needed — everything is in the AMI!
}
```

### 4. Configuration Management Tools

```hcl
# ✅ Install software at deploy time via CI/CD or config management
# Ansible, Chef, Puppet, etc.
# 
# CI/CD pipeline:
# 1. Terraform creates infrastructure
# 2. Ansible configures instances
# 3. Application deploys

# Terraform can output inventory for Ansible
output "ansible_inventory" {
  value = {
    all = {
      hosts = {
        for k, v in aws_instance.web : k => {
          ansible_host = v.public_ip
          ansible_user = "ec2-user"
        }
      }
    }
  }
}
```

---

## 10.12 Provisioner Best Practices

### DO:
- Use provisioners as a last resort
- Set `on_failure = continue` for non-critical operations
- Handle destroy-time cleanup with `when = destroy`
- Use `null_resource` for decoupled provisioning
- Document why provisioners are necessary

### DON'T:
- Use provisioners for package installation (use user_data/AMI)
- Rely on provisioners for critical configuration
- Use provisioners when API calls can do the job
- Forget that provisioners don't appear in `terraform plan`

---

## 📝 Exam Tips

1. **Provisioners are a last resort** — Always look for alternatives first
2. **Three types**: `file`, `local-exec`, `remote-exec`
3. **`connection` block** configures SSH/WinRM for remote provisioners
4. **`self` object** refers to the current resource in provisioners
5. **`when = destroy`** runs provisioner on resource destruction
6. **`on_failure = continue`** — Continue even if provisioner fails
7. **`null_resource`** is a trigger for provisioners without real infrastructure
8. **User data** is preferred over remote-exec for EC2 instance configuration
9. **Cloud-init** provides advanced configuration on first boot
10. **Pre-baked AMIs** (Packer) eliminate the need for most provisioners
11. **Tainted resources** — Create if provisioner fails with `on_failure = fail`
12. **`-replace` flag** (Terraform 1.5+) replaces specific resources

---

## ✅ Chapter 10 Quiz

1. **What is the recommended approach for configuring software on EC2 instances?**
   - a) remote-exec provisioner
   - b) EC2 User Data / Cloud-Init
   - c) file provisioner
   - d) local-exec provisioner

2. **Which provisioner runs commands on the local machine running Terraform?**
   - a) `remote-exec`
   - b) `local-exec`
   - c) `file`
   - d) `script`

3. **True or False:** Provisioners always appear in `terraform plan` output.

4. **What does `on_failure = continue` do?**
   - a) Retries the provisioner
   - b) Continues even if the provisioner fails
   - c) Skips the provisioner entirely
   - d) Marks the resource as tainted

5. **What is `null_resource` used for?**
   - a) Creating null infrastructure
   - b) Triggering provisioners without creating real resources
   - c) Deleting resources
   - d) Running zero-cost infrastructure

<details>
<summary>📌 Answers</summary>

1. **b** — EC2 User Data and Cloud-Init are the preferred approaches
2. **b** — `local-exec` runs on the machine running Terraform
3. **False** — Provisioners don't appear in `terraform plan` output
4. **b** — `on_failure = continue` continues even if the provisioner fails
5. **b** — `null_resource` triggers provisioners without creating real resources
</details>

---

*Continue to → <a href="{{< relref "11-terraform-cloud" >}}">Chapter 11: Terraform Cloud & Enterprise</a>*

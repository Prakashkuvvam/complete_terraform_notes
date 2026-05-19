---
title: "#!/bin/bash"
type: docs
---

#!/bin/bash
# User data script for multi-tier web example
echo "Starting web server for ${environment} environment..."
yum update -y
yum install -y httpd
systemctl enable httpd
systemctl start httpd
echo "<h1>${environment} Web Server</h1>" > /var/www/html/index.html
echo "<p>Host: $(hostname)</p>" >> /var/www/html/index.html
echo "<p>Environment: ${environment}</p>" >> /var/www/html/index.html

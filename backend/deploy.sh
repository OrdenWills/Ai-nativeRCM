#!/bin/bash

# ST ANDY School Website Deployment Script
# Run this on your Digital Ocean droplet

echo "🚀 Starting ST ANDY School Website deployment..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Python 3, pip, and other dependencies
sudo apt install -y python3 python3-pip python3-venv nginx git

# Create application directory
sudo mkdir -p /var/www/Rcm
sudo chown $USER:$USER /var/www/Rcm

# Navigate to app directory
cd /var/www/Rcm

# Clone or copy your application files here
# git clone your-repo-url .
# OR upload files via SCP/SFTP

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file (you'll need to add your actual values)
# cp .env.example .env

echo "📝 Please edit /var/www/Rcm/.env with your actual values:"
echo "   - ZEPTOMAIL_API_KEY"
echo "   - SECRET_KEY"
echo "   - Other configuration"

# Create systemd service file
sudo tee /etc/systemd/system/Rcm.service > /dev/null <<EOF
[Unit]
Description=ST ANDY School Website
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/Rcm
Environment=PATH=/var/www/Rcm/venv/bin
ExecStart=/var/www/Rcm/venv/bin/python app.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/Rcm > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static {
        alias /var/www/Rcm/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/Rcm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start and enable services
sudo systemctl daemon-reload
sudo systemctl enable Rcm
sudo systemctl start Rcm
sudo systemctl restart nginx

echo "✅ Deployment complete!"
echo "🌐 Your website should be accessible at your droplet's IP address"
echo "📋 Next steps:"
echo "   1. Configure your domain DNS to point to this droplet"
echo "   2. Set up SSL certificate with Let's Encrypt"
echo "   3. Update .env file with production values"

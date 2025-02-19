#!/bin/bash

# Exit on error
set -e

# Update system
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install required software
echo "Installing required packages..."
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Create project directory
echo "Setting up project directory..."
cd /home/katmand1
mkdir -p mern-ecommerce
cd mern-ecommerce

# Clone the repository
echo "Cloning the repository..."
git clone https://github.com/samayantaghimire/mern-ecommerce-2024.git .

# Backend setup
echo "Setting up backend..."
cd server
cp .env.example .env

# Update backend .env with production values
cat > .env << EOL
NODE_ENV=production
PORT=5001
CLIENT_URL=https://katmandushop.com
MONGO_URI=mongodb+srv://samayantarajghimire:Momlopme1@cluster0.v1pzu.mongodb.net/mern-ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=Krew8JDTezk83Qup9lQyxG1QFCoel11owvl9nDReRBA=
ALLOWED_ORIGINS=https://katmandushop.com
UPSTASH_REDIS_REST_URL=https://certain-polecat-11092.upstash.io
UPSTASH_REDIS_REST_TOKEN=AStUAAIjcDE5NmIwMTg3MWQzYzY0MDc4OTNiZjEyYzEyMmY4MTdjOXAxMA
KHALTI_SECRET_KEY=94f4063a7842413ab586a30030ac5a64
CLOUDINARY_CLOUD_NAME=djm3vrupr
CLOUDINARY_API_KEY=449793278643861
CLOUDINARY_API_SECRET=ZLPMSy6jDqdr6skHWJEhPnSxzBE
PAYPAL_CLIENT_ID=ARj9Ed0-4TMfjkVBa0YrHciiNghy71LY0azaW1Grlf5wPS8d0OXok7aGkoyY4NyhZeItzq2KTAeW9-kS
PAYPAL_CLIENT_SECRET=EGII8HWKmmTP3r9-EhQOCwsjskz88boa3ISbiHLpuhsnc_T__hEQtiBmteHvE8mcexQqdS2nGCdhq8kL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=samayantarajghimire@gmail.com
SMTP_PASS=qzjt wapl gcda artr
ADMIN_EMAIL=samayantarajghimire@gmail.com
EOL

echo "Installing backend dependencies..."
npm install

echo "Starting backend with PM2..."
pm2 start server.js --name backend
pm2 save
pm2 startup

# Frontend setup
echo "Setting up frontend..."
cd ../client

# Update frontend .env
cat > .env << EOL
VITE_API_URL=https://katmandushop.com/api
VITE_KHALTI_PUBLIC_KEY=e2faf641a66144538e23501363941254
PAYPAL_CLIENT_ID=ARj9Ed0-4TMfjkVBa0YrHciiNghy71LY0azaW1Grlf5wPS8d0OXok7aGkoyY4NyhZeItzq2KTAeW9-kS
EOL

echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

# Nginx configuration
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/katmandushop.com << EOL
server {
    listen 80;
    server_name katmandushop.com www.katmandushop.com;

    location / {
        root /home/katmand1/mern-ecommerce/client/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable the site
echo "Enabling Nginx site..."
sudo ln -s /etc/nginx/sites-available/katmandushop.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

# Install SSL certificate
echo "Installing SSL certificate..."
sudo certbot --nginx -d katmandushop.com -d www.katmandushop.com --non-interactive --agree-tos --email samayantarajghimire@gmail.com

# Ensure services start on boot
echo "Enabling services on boot..."
sudo systemctl enable nginx

echo "Deployment completed successfully!"
echo "Your site should now be accessible at https://katmandushop.com"

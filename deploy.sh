#!/bin/bash

# Exit on error
set -e

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install required software
echo "Installing required packages..."
apt install -y curl nginx certbot python3-certbot-nginx

# Install Node.js 18.x
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 globally
echo "Installing PM2..."
npm install -g pm2

# Backend setup
echo "Setting up backend..."
cd /var/www/mern-ecommerce/server

# Update backend .env with production values
cat > .env << EOL
NODE_ENV=production
PORT=5001
CLIENT_URL=http://135.181.38.44
MONGO_URI=mongodb+srv://samayantarajghimire:Momlopme1@cluster0.v1pzu.mongodb.net/mern-ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=Krew8JDTezk83Qup9lQyxG1QFCoel11owvl9nDReRBA=
ALLOWED_ORIGINS=http://135.181.38.44
UPSTASH_REDIS_REST_URL=https://certain-polecat-11092.upstash.io
UPSTASH_REDIS_REST_TOKEN=AStUAAIjcDE5NmIwMTg3MWQzYzY0MDc4OTNiZjEyYzEyMmY4MTdjOXAxMA
KHALTI_SECRET_KEY=live_secret_key_a5462cdf7c8744f1bbea6c60474815ab
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
npm install nodemailer
npm install
NODE_ENV=production npm install

echo "Starting backend with PM2..."
pm2 delete backend || true
NODE_ENV=production pm2 start server.js --name backend --time
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Frontend setup
echo "Setting up frontend..."
cd ../client

# Update frontend .env
cat > .env << EOL
VITE_API_URL=http://135.181.38.44
VITE_KHALTI_PUBLIC_KEY=live_public_key_176de457b9164a1fa89e10ba32344c63
PAYPAL_CLIENT_ID=ARj9Ed0-4TMfjkVBa0YrHciiNghy71LY0azaW1Grlf5wPS8d0OXok7aGkoyY4NyhZeItzq2KTAeW9-kS
EOL

echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

# Nginx configuration
echo "Configuring Nginx..."
tee /etc/nginx/sites-available/mern-ecommerce << 'EOL'
server {
    listen 80;
    server_name 135.181.38.44;
    
    client_max_body_size 50M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Error logs
    access_log /var/log/nginx/mern-ecommerce-access.log;
    error_log /var/log/nginx/mern-ecommerce-error.log;

    location / {
        root /var/www/mern-ecommerce/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache control
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /api {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://127.0.0.1:5001;
        proxy_redirect off;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer sizes
        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
        proxy_busy_buffers_size 32k;

        # Handle CORS preflight
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'http://135.181.38.44';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT, PATCH';
            add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";
}
EOL

# Enable the site
echo "Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/mern-ecommerce /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Start Nginx
echo "Starting Nginx..."
systemctl restart nginx

# Set up auto-renewal for SSL (for future use)
echo "Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Final permission adjustments
echo "Setting final permissions..."
chown -R www-data:www-data /var/www/mern-ecommerce
chmod -R 755 /var/www/mern-ecommerce

# Update server.js to trust proxy
echo "Updating server.js with trust proxy configuration..."
sed -i '1i app.set("trust proxy", 1);' /var/www/mern-ecommerce/server/server.js

echo "Deployment completed successfully!"
echo "Your site should now be accessible at http://135.181.38.44"

# Test the deployment
echo "Testing deployment..."
curl -sSf http://135.181.38.44 > /dev/null && echo "Website is accessible!" || echo "Website is not accessible"
curl -sSf http://135.181.38.44/api/health > /dev/null && echo "API is accessible!" || echo "API is not accessible"

echo "Note: Once DNS for katmandushop.com is properly configured, run the following to set up SSL:"
echo "certbot --nginx -d katmandushop.com -d www.katmandushop.com"

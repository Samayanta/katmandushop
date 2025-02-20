# Deployment Plan for KatmanduShop MERN Stack Application

## 1. Initial VPS Setup & Security

1. Connect to VPS as katmand1 user:
```bash
ssh katmand1@135.181.38.44
```

2. Set up proper directory permissions:
```bash
sudo mkdir -p /var/www/mern-ecommerce
sudo chown katmand1:katmand1 /var/www/mern-ecommerce
```

## 2. Project Transfer & Configuration

1. Transfer project files using rsync (excluding sensitive files)
2. Set up environment files securely
3. Configure Nginx with the domain name

## 3. System & Dependencies Setup

1. Update system packages
2. Install required software:
   - Node.js & npm
   - Nginx
   - PM2
   - Certbot for SSL

## 4. Application Deployment

### Backend Deployment
1. Install dependencies
2. Set up PM2 process
3. Configure environment variables
4. Start and monitor the application

### Frontend Deployment
1. Install dependencies
2. Build the React application
3. Configure environment variables
4. Set up Nginx to serve the static files

## 5. SSL & Domain Configuration

1. Set up SSL using Let's Encrypt:
```bash
sudo certbot --nginx -d katmandushop.com
```

2. Configure Nginx with SSL and proper security headers

## 6. Final Steps & Verification

1. Test all endpoints
2. Verify SSL setup
3. Check application security
4. Set up monitoring
5. Configure automatic SSL renewal

## Modified Deployment Scripts

We'll need to update the existing scripts:

1. deploy.sh - Update to use katmand1 user and add SSL configuration
2. transfer.sh - Modify to use secure file transfer
3. nginx.conf - Update with domain name and SSL configuration

## Security Considerations

1. Use non-root user (katmand1) for deployment
2. Implement proper SSL/TLS
3. Set up secure headers in Nginx
4. Configure proper file permissions
5. Implement rate limiting
6. Set up monitoring and logging

## Backup Plan

1. Create backup of current deployment (if exists)
2. Document rollback procedures
3. Set up automated backups

Would you like me to proceed with creating the updated deployment scripts with these improvements?
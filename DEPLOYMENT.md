# MERN E-commerce Production Deployment Guide

## Prerequisites

- Node.js ≥ 18.x
- MongoDB Atlas account
- Redis server
- Nginx
- PM2
- SSL certificate (Let's Encrypt)
- Domain name and DNS configuration
- Cloudinary account

## Environment Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd mern-ecommerce-2024
```

2. **Install Global Dependencies**
```bash
npm install -g pm2
```

3. **Configure Environment Variables**

Create production .env files using the provided templates:

For Backend (`server/.env`):
```
NODE_ENV=production
PORT=5001
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-secure-jwt-secret>
ALLOWED_ORIGINS=https://your-domain.com
REDIS_URL=redis://localhost:6379
SENTRY_DSN=<your-sentry-dsn>
```

For Frontend (`client/.env`):
```
VITE_API_URL=https://api.your-domain.com
```

## Database Setup

1. **MongoDB Atlas Configuration**
- Create a new cluster
- Set up network access (whitelist production IP)
- Create database user
- Enable backups and monitoring
- Set up database indexes:
```javascript
// Run these commands in MongoDB Atlas
db.products.createIndex({ name: 1, description: 1 })
db.orders.createIndex({ userId: 1, status: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

2. **Redis Setup**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
```

Edit `/etc/redis/redis.conf`:
```
maxmemory 512mb
maxmemory-policy allkeys-lru
```

## SSL Certificate Setup

1. **Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain SSL Certificate**
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Nginx Configuration

1. **Copy Nginx Configuration**
```bash
sudo cp server/nginx/nginx.conf /etc/nginx/nginx.conf
```

2. **Update Domain Names**
Replace `your-domain.com` with your actual domain in the Nginx configuration.

3. **Test and Restart Nginx**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Application Deployment

1. **Backend Deployment**
```bash
cd server
npm ci --production
pm2 start ecosystem.config.js --env production
pm2 save
```

2. **Frontend Deployment**
```bash
cd client
npm ci
npm run build
```

3. **Cloudinary Setup**
- Create Cloudinary account
- Configure environment variables:
  ```
  CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=your-api-key
  CLOUDINARY_API_SECRET=your-api-secret
  ```
- Set up upload presets if needed
- Configure delivery URLs and transformations

## Monitoring Setup

1. **PM2 Monitoring**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

2. **Enable PM2 monitoring dashboard**
```bash
pm2 plus
```

3. **Configure Sentry**
- Add your application to Sentry
- Configure error alerts
- Set up performance monitoring

4. **MongoDB Atlas Monitoring**
- Enable performance alerts
- Set up custom metrics
- Configure backup notifications

## Security Measures

1. **Firewall Configuration**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

2. **Regular Security Updates**
```bash
sudo apt update
sudo apt upgrade
```

3. **Implement Rate Limiting**
Already configured in Nginx and Express.

## Backup Strategy

1. **Database Backups**
- Enable MongoDB Atlas automated backups
- Configure backup retention policy
- Test backup restoration process

2. **Application Backups**
```bash
# Create backup script
mkdir -p /var/backups/mern-ecommerce
tar -czf /var/backups/mern-ecommerce/backup-$(date +%Y%m%d).tar.gz /var/www/mern-ecommerce
```

## Zero-Downtime Deployment

1. **Using PM2 Cluster Mode**
Already configured in ecosystem.config.js

2. **Rolling Updates**
```bash
pm2 reload ecosystem.config.js --env production
```

## Health Checks

1. **Monitor Application Health**
```bash
# Check application status
pm2 status

# Monitor logs
pm2 logs

# Monitor metrics
pm2 monit
```

2. **Database Health**
- Monitor MongoDB Atlas metrics
- Check Redis memory usage
- Monitor connection pooling

## Performance Optimization

1. **Enable Compression**
Already configured in Express and Nginx

2. **Cache Configuration**
- Redis caching for API responses
- Browser caching through Nginx
- Cloudinary automatic CDN caching

## Troubleshooting

1. **Check Logs**
```bash
# Application logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
journalctl -u nginx
journalctl -u redis
```

2. **Common Issues**
- Connection timeouts: Check firewall and security groups
- 502 Bad Gateway: Check if Node.js application is running
- Redis connection issues: Verify Redis service status

## Maintenance

1. **Regular Tasks**
- Monitor disk space
- Rotate logs
- Update SSL certificates
- Check security advisories
- Review performance metrics

2. **Update Dependencies**
```bash
npm audit
npm update
```

## Support and Documentation

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)

For additional support, contact the development team.

# Deploying MERN E-commerce to Render

## Prerequisites

1. A Render account (https://render.com)
2. MongoDB Atlas cluster
3. Upstash Redis instance
4. Cloudinary account
5. Khalti account (for payments)
6. Sentry account (for monitoring)

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository contains these files:
- `Dockerfile`
- `.dockerignore`
- `render.yaml`
- `docker-compose.yml`

### 2. Create Required Services

Before deploying to Render, set up:

1. **MongoDB Atlas:**
   - Create a new cluster
   - Set up database user
   - Whitelist all IP addresses (0.0.0.0/0) for Render's dynamic IPs
   - Get connection string

2. **Upstash Redis:**
   - Create a new database
   - Get REST URL and token

3. **Cloudinary:**
   - Create account
   - Get cloud name, API key, and secret

4. **Sentry:**
   - Create new project
   - Get DSN

5. **Khalti:**
   - Set up merchant account
   - Get API keys

### 3. Deploy to Render

1. **Connect Your Repository:**
   - Log in to Render
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository

2. **Configure the Service:**
   - Select "Docker" as environment
   - Choose the branch to deploy
   - Set service name: "mern-ecommerce"
   - Select region closest to your users
   - Choose instance type (at least Standard plan recommended)

3. **Set Environment Variables:**
   Set these in Render dashboard:
   ```
   NODE_ENV=production
   PORT=5001
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_secret
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   KHALTI_SECRET_KEY=your_khalti_secret
   KHALTI_PUBLIC_KEY=your_khalti_public_key
   SENTRY_DSN=your_sentry_dsn
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically:
     - Build the Docker image
     - Start the container
     - Route traffic to your app

### 4. Verify Deployment

1. **Check Health Endpoint:**
   - Visit `https://your-app-url.onrender.com/api/health`
   - Should return 200 OK

2. **Monitor Logs:**
   - Check Render dashboard logs for any issues
   - Verify Sentry is receiving events

3. **Test Functionality:**
   - Test user registration/login
   - Test product listings
   - Test cart functionality
   - Test payment processing
   - Test admin features

### 5. Production Optimizations

1. **Performance:**
   - Enable auto-scaling in render.yaml
   - Configure proper cache headers
   - Optimize database queries

2. **Monitoring:**
   - Set up Render alerts
   - Configure Sentry alerts
   - Set up uptime monitoring

3. **Security:**
   - Ensure all environment variables are set
   - Verify CORS settings
   - Check rate limiting configuration

### 6. Maintenance

1. **Regular Tasks:**
   - Monitor resource usage
   - Check error rates
   - Review performance metrics
   - Update dependencies

2. **Backup Strategy:**
   - Enable MongoDB Atlas backups
   - Regular data exports
   - Document recovery procedures

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Dockerfile syntax
   - Verify dependencies are available
   - Check for missing environment variables

2. **Runtime Errors:**
   - Check application logs
   - Verify environment variables
   - Check MongoDB connection
   - Verify Redis connection

3. **Performance Issues:**
   - Monitor resource usage
   - Check database indexes
   - Verify caching configuration
   - Review application metrics

### Getting Help

1. **Resources:**
   - Render Documentation: https://render.com/docs
   - MongoDB Atlas Docs: https://docs.atlas.mongodb.com
   - Upstash Redis Docs: https://docs.upstash.com

2. **Support:**
   - Render Support: https://render.com/docs/support
   - GitHub Issues: Check project repository
   - Stack Overflow: Tag with relevant technologies

## Post-Deployment

1. **Monitor Application:**
   - Set up Render metrics dashboard
   - Configure Sentry alerts
   - Monitor error rates and performance

2. **Scale as Needed:**
   - Adjust instance size
   - Configure auto-scaling
   - Optimize resource usage

3. **Regular Updates:**
   - Keep dependencies updated
   - Apply security patches
   - Monitor resource usage
   - Review and optimize costs

# Railway Deployment Instructions

## Pre-deployment Setup

1. Create a new project in Railway
2. Connect your GitHub repository to Railway
3. Set up the following environment variables in Railway:

### Required Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5001
CLIENT_URL=https://katmandushop.netlify.app

# MongoDB Configuration
MONGO_URI=mongodb+srv://samayantarajghimire:Momlopme1@cluster0.v1pzu.mongodb.net/mern-ecommerce?retryWrites=true&w=majority&appName=Cluster0

# Security
JWT_SECRET=<your-secure-jwt-secret>
ALLOWED_ORIGINS=https://katmandushop.netlify.app/

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://certain-polecat-11092.upstash.io
UPSTASH_REDIS_REST_TOKEN=AStUAAIjcDE5NmIwMTg3MWQzYzY0MDc4OTNiZjEyYzEyMmY4MTdjOXAxMA

# Payment Gateway
KHALTI_SECRET_KEY=69ed8109689f46a4b0fa823381aaff7c
KHALTI_PUBLIC_KEY=69ed8109689f46a4b0fa823381aaff7c

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=djm3vrupr
CLOUDINARY_API_KEY=449793278643861
CLOUDINARY_API_SECRET=ZLPMSy6jDqdr6skHWJEhPnSxzBE

# Optional
SENTRY_DSN=<your-sentry-dsn>
```

## Deployment Steps

1. Push your code to GitHub
2. Go to Railway dashboard
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Configure environment variables as listed above
7. Railway will automatically deploy your application

## Post-deployment

1. Once deployed, Railway will provide you with a deployment URL
2. Update your frontend's API endpoint to point to this URL
3. Update the ALLOWED_ORIGINS in Railway env vars with your frontend URL
4. Update CLIENT_URL with your frontend application URL

## Monitoring

- Use the Railway dashboard to monitor your application
- Check logs for any deployment or runtime issues
- Monitor application metrics through Railway's dashboard

## Troubleshooting

Common issues and solutions:

1. **Port Issues**: Railway will automatically assign a PORT. Make sure your application uses `process.env.PORT`
2. **MongoDB Connection**: Ensure your MongoDB URI is correct and the IP is whitelisted
3. **CORS Errors**: Verify ALLOWED_ORIGINS includes your frontend URL
4. **Redis Connection**: Confirm Upstash Redis credentials are correct

## Important Notes

- The application uses Upstash Redis for caching. Make sure to create an Upstash account and configure Redis
- Cloudinary is used for image storage. Ensure Cloudinary credentials are properly configured
- SSL/TLS is handled by Railway automatically
- Environment variables must be set before deployment

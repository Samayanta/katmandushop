# Deployment Guide for Render and Netlify

## Backend Deployment (Render)

1. Create a new Web Service on Render
   - Connect your GitHub repository
   - Choose the server directory as the root directory
   - Set Build Command: `npm ci --production`
   - Set Start Command: `node server.js`

2. Configure Environment Variables on Render:
   ```
   NODE_ENV=production
   PORT=5001
   CLIENT_URL=https://katmandushop.netlify.app
   MONGO_URI=mongodb+srv://samayantarajghimire:Momlopme1@cluster0.v1pzu.mongodb.net/mern-ecommerce?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=myprivatekey
   ALLOWED_ORIGINS=https://katmandushop.netlify.app
   UPSTASH_REDIS_REST_URL=https://certain-polecat-11092.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AStUAAIjcDE5NmIwMTg3MWQzYzY0MDc4OTNiZjEyYzEyMmY4MTdjOXAxMA
   KHALTI_SECRET_KEY=69ed8109689f46a4b0fa823381aaff7c
   CLOUDINARY_CLOUD_NAME=djm3vrupr
   CLOUDINARY_API_KEY=449793278643861
   CLOUDINARY_API_SECRET=ZLPMSy6jDqdr6skHWJEhPnSxzBE
   ```

## Frontend Deployment (Netlify)

1. Create a new site on Netlify
   - Connect your GitHub repository
   - Set build settings:
     - Base directory: client
     - Build command: `npm run build`
     - Publish directory: dist

2. Configure Environment Variables on Netlify:
   ```
   VITE_API_URL=https://katmandushop-1.onrender.com
   VITE_KHALTI_PUBLIC_KEY=69ed8109689f46a4b0fa823381aaff7c
   ```

3. Configure Build Settings:
   - The netlify.toml file in the client directory already contains the necessary redirect rules for the SPA.

## Post-Deployment Checks

1. **Backend Health Check**
   - Visit `https://katmandushop-1.onrender.com/api/health`
   - Should return a 200 OK response

2. **Frontend Connectivity**
   - Open `https://katmandushop.netlify.app`
   - Verify connection to the backend
   - Test authentication flow
   - Check image uploads via Cloudinary
   - Verify payment integration with Khalti

3. **Database and Cache**
   - Verify MongoDB Atlas connection
   - Check Redis cache functionality
   - Test data persistence

## Troubleshooting

1. **CORS Issues**
   - Verify ALLOWED_ORIGINS in backend env includes the Netlify domain
   - Check browser console for CORS errors

2. **Build Failures**
   - Check build logs on respective platforms
   - Verify environment variables are set correctly
   - Ensure all dependencies are properly installed

3. **API Connection Issues**
   - Confirm API URL is correct in frontend env
   - Check backend logs for request errors
   - Verify network connectivity

## Maintenance

1. **Regular Tasks**
   - Monitor application logs on Render
   - Check Netlify deploy notifications
   - Monitor MongoDB Atlas metrics
   - Review Redis cache performance

2. **Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Update SSL certificates if needed
   - Review and optimize resource usage

## Scaling

1. **Render**
   - Monitor usage and upgrade plan if needed
   - Configure auto-scaling if available
   - Optimize database queries

2. **Netlify**
   - Enable CDN caching
   - Optimize asset delivery
   - Monitor bandwidth usage

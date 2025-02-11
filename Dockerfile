# Build stage for frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies and install
COPY server/package*.json ./
RUN npm ci

# Copy backend source
COPY server/ ./

# Copy built frontend files to public directory
COPY --from=frontend-build /app/client/dist ./public

# Create .env file for frontend
RUN echo "VITE_API_URL=$VITE_API_URL" > /app/public/.env

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Expose port
EXPOSE 5001

# Start the server
CMD ["npm", "run", "prod"]

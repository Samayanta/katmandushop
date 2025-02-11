# Use Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN cd server && npm ci
RUN cd client && npm ci

# Copy source code
COPY server/ ./server/
COPY client/ ./client/

# Copy start script
COPY start.sh .
RUN chmod +x start.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Expose ports
EXPOSE 5001
EXPOSE 5173

# Start both servers
CMD ["./start.sh"]

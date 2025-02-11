#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm ci --production

# Set production environment
export NODE_ENV=production

# Start the application
node server.js

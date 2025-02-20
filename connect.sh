#!/bin/bash

# Exit on error
set -e

# VPS details
VPS_IP="135.181.38.44"
VPS_USER="root"
VPS_PASS="qNVUCKF4CWxpdhuJXfHJ"

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "sshpass is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install sshpass
    else
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

echo "Setting up remote directory..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p /var/www/mern-ecommerce"

# First, transfer the project files directly
echo "Transferring project files to VPS..."
sshpass -p "$VPS_PASS" rsync -avz --progress -e "ssh -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.env' \
    ./client ./server $VPS_USER@$VPS_IP:/var/www/mern-ecommerce/

# Then transfer the deployment script
echo "Transferring deployment script..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no deploy.sh $VPS_USER@$VPS_IP:/var/www/mern-ecommerce/deploy.sh

# Make the script executable and run it
echo "Running deployment script..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd /var/www/mern-ecommerce && chmod +x deploy.sh && ./deploy.sh"

echo "Deployment process initiated on VPS. Check the logs for progress."

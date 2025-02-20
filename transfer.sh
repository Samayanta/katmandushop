#!/bin/bash

# Exit on error
set -e

# VPS details
VPS_IP="135.181.38.44"
VPS_USER="root"
VPS_PASS="qNVUCKF4CWxpdhuJXfHJ"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Ensure target directory exists with correct permissions
echo "Setting up project directory on VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'ENDSSH'
    mkdir -p /var/www/mern-ecommerce
    chown -R $USER:$USER /var/www/mern-ecommerce
    chmod -R 755 /var/www/mern-ecommerce
ENDSSH

echo "Current directory: $SCRIPT_DIR"
echo "Contents of current directory:"
ls -la "$SCRIPT_DIR"

# Transfer project files directly from the script directory
echo "Transferring project files to VPS..."
sshpass -p "$VPS_PASS" rsync -avz --progress -e "ssh -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.env' \
    "$SCRIPT_DIR/client" "$SCRIPT_DIR/server" $VPS_USER@$VPS_IP:/var/www/mern-ecommerce/

# Set proper permissions on the remote server
echo "Setting proper permissions..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'ENDSSH'
    find /var/www/mern-ecommerce -type d -exec chmod 755 {} \;
    find /var/www/mern-ecommerce -type f -exec chmod 644 {} \;
    chown -R $USER:$USER /var/www/mern-ecommerce
ENDSSH

echo "File transfer completed successfully!"

#!/bin/bash

# Set VPS details
VPS_IP="135.181.38.44"
VPS_USER="katmand1"
VPS_PASS="qNVUCKF4CWxpdhuJXfHJ"

# Transfer deploy.sh to VPS
echo "Transferring deployment script to VPS..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no deploy.sh $VPS_USER@$VPS_IP:~/deploy.sh

# Make deploy.sh executable and run it
echo "Executing deployment script on VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "chmod +x ~/deploy.sh && sudo ~/deploy.sh"

echo "Deployment process initiated on VPS"

#!/bin/sh

# Store process IDs
pid_file="/tmp/pids"
touch $pid_file

# Function to cleanup processes
cleanup() {
    echo "Cleaning up processes..."
    if [ -f $pid_file ]; then
        kill $(cat $pid_file) 2>/dev/null
        rm $pid_file
    fi
    exit 0
}

# Trap signals
trap cleanup SIGTERM SIGINT

# Create necessary directories
mkdir -p /app/server/public

# Set environment variables for both services
export NODE_ENV=production
export PORT=5001
export VITE_API_URL=http://localhost:5001

# Start the backend server
cd /app/server
node server.js & 
echo $! >> $pid_file

# Start the frontend with Vite dev server
cd /app/client
npm run dev -- --host 0.0.0.0 &
echo $! >> $pid_file

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?

#!/usr/bin/env bash
# Exit on error
set -o errexit

npm ci
npm run build  # If you have a build script

# For potential database migrations or other setup
# npm run db:migrate

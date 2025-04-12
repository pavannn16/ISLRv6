#!/bin/bash

# Exit on error
set -e

echo -e "\033[1;34m===== Building ISLRv6 for Production (Simple Version) =====\033[0m"

# Get the current IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo -e "\033[1;36mYour IP address: ${IP_ADDRESS}\033[0m"

# Check if SSL certificates exist
if [ ! -f "ssl/server.crt" ] || [ ! -f "ssl/server.key" ]; then
    echo -e "\033[1;33mSSL certificates not found. Generating them now...\033[0m"
    ./generate_ssl_certs.sh
fi

# Update frontend configuration
echo -e "\033[0;32mUpdating frontend configuration to use HTTPS...\033[0m"
./update_frontend_config.sh

# Build the frontend for production with a simpler approach
echo -e "\033[0;32mBuilding frontend for production (this may take a few minutes)...\033[0m"
echo -e "\033[0;33mUsing simplified build process to avoid potential issues...\033[0m"

# Set production environment
export NODE_ENV=production

# Clean any previous build
echo -e "\033[0;32mCleaning previous build...\033[0m"
rm -rf .next

# Run the build with basic settings
echo -e "\033[0;32mRunning Next.js build...\033[0m"
npx next build

echo -e "\033[1;32m===== Production build completed successfully =====\033[0m"
echo -e "\033[1;36mTo start the production server, run: ./start_production.sh\033[0m"

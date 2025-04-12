#!/bin/bash

# Exit on error
set -e

echo -e "\033[1;34m===== Building ISLRv6 for Production =====\033[0m"

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

# Build the frontend for production
echo -e "\033[0;32mBuilding frontend for production (this may take a few minutes)...\033[0m"
NODE_ENV=production npm run build:production

echo -e "\033[1;32m===== Production build completed successfully =====\033[0m"
echo -e "\033[1;36mTo start the production server, run: ./start_production.sh\033[0m"

#!/bin/bash

# Exit on error
set -e

echo -e "\033[1;34m===== Starting ISLRv6 Frontend in Production Mode with HTTPS =====\033[0m"

# Get the current IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo -e "\033[1;36mYour IP address: ${IP_ADDRESS}\033[0m"

# Change to the project directory
cd /home/pavan/MLProjects/ISLRv6

# Check if SSL certificates exist
if [ ! -f "ssl/server.crt" ] || [ ! -f "ssl/server.key" ]; then
    echo -e "\033[1;31mSSL certificates not found. Please run generate_ssl_certs.sh first.\033[0m"
    exit 1
fi

# Check if the production build exists
if [ ! -d ".next" ]; then
    echo -e "\033[1;33mProduction build not found. Building the application...\033[0m"
    npm run build:production
    echo -e "\033[0;32mProduction build completed successfully.\033[0m"
else
    echo -e "\033[0;32mProduction build found.\033[0m"

    # Ask if user wants to rebuild
    echo -e "\033[1;33mDo you want to rebuild the application for optimal performance? (y/n)\033[0m"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "\033[0;32mRebuilding the application...\033[0m"
        npm run build:production
        echo -e "\033[0;32mProduction build completed successfully.\033[0m"
    fi
fi

# Set environment variable for production mode
export PRODUCTION_BUILD=true
echo -e "\033[0;32mSet PRODUCTION_BUILD=true for HTTPS support\033[0m"

# Start the Next.js server in production mode with HTTPS
echo -e "\033[0;32mStarting Next.js server with HTTPS...\033[0m"
echo -e "\033[1;32m===== Frontend will be available at =====\033[0m"
echo -e "\033[1;36mLocal:   https://localhost:3000\033[0m"
echo -e "\033[1;36mNetwork: https://${IP_ADDRESS}:3000\033[0m"
echo -e "\033[1;33mNote: Using self-signed certificates. Browsers will show a security warning.\033[0m"
echo -e "\033[1;33mNote: Press Ctrl+C to stop the server\033[0m"

# Start the server with HTTPS
npm run start-https

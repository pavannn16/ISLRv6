#!/bin/bash

# Exit on error
set -e

echo -e "\033[1;34m===== Starting ISLRv6 Frontend in Development Mode =====\033[0m"

# Get the current IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo -e "\033[1;36mYour IP address: ${IP_ADDRESS}\033[0m"

# Change to the project directory
cd /home/pavan/MLProjects/ISLRv6

# Set environment variable for development mode
export PRODUCTION_BUILD=false

# Ask if user wants to use production build or development server
echo -e "\033[1;33mDo you want to use the production build (faster startup, no on-demand compilation) or development server (hot reloading)? (p/d)\033[0m"
read -r response

if [[ "$response" =~ ^([pP])$ ]]; then
    # Use production build
    echo -e "\033[0;32mStarting Next.js with production build...\033[0m"
    echo -e "\033[1;32m===== Frontend will be available at =====\033[0m"
    echo -e "\033[1;36mLocal:   http://localhost:3000\033[0m"
    echo -e "\033[1;36mNetwork: http://${IP_ADDRESS}:3000\033[0m"
    echo -e "\033[1;33mNote: Press Ctrl+C to stop the server\033[0m"

    # Make sure we have a build
    if [ ! -d ".next" ]; then
        echo -e "\033[1;33mNo build found. Building the project first...\033[0m"
        npm run build
    fi

    # Start the server using the production build
    npm start -- -H 0.0.0.0
else
    # Use development server
    echo -e "\033[0;32mStarting Next.js development server...\033[0m"
    echo -e "\033[1;32m===== Frontend will be available at =====\033[0m"
    echo -e "\033[1;36mLocal:   http://localhost:3000\033[0m"
    echo -e "\033[1;36mNetwork: http://${IP_ADDRESS}:3000\033[0m"
    echo -e "\033[1;33mNote: Press Ctrl+C to stop the server\033[0m"
    echo -e "\033[1;33mNote: Pages will be compiled on demand\033[0m"

    # Start the development server
    npm run dev -- -H 0.0.0.0
fi

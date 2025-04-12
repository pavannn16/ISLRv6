#!/bin/bash

# Exit on error
set -e

echo -e "\033[1;34m===== Setting up ISLRv6 for Development Mode =====\033[0m"

# Get the current IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo -e "\033[1;36mYour IP address: ${IP_ADDRESS}\033[0m"

# Update .env.local to use HTTP instead of HTTPS
echo -e "\033[0;32mUpdating .env.local to use HTTP...\033[0m"
sed -i "s|https://$IP_ADDRESS:5000|http://$IP_ADDRESS:5000|g" .env.local
echo -e "\033[0;32mUpdated .env.local to use HTTP API URL\033[0m"

# Update .env.local to include PRODUCTION_BUILD
if grep -q "PRODUCTION_BUILD" .env.local; then
    # Update existing value
    sed -i "s/PRODUCTION_BUILD=.*/PRODUCTION_BUILD=false/g" .env.local
else
    # Add new value
    echo "PRODUCTION_BUILD=false" >> .env.local
fi
echo -e "\033[0;32mSet PRODUCTION_BUILD=false in .env.local\033[0m"

echo -e "\033[1;32m===== Development Environment Ready =====\033[0m"
echo -e "\033[1;36mTo start the backend: python jetson/jet_back.py\033[0m"
echo -e "\033[1;36mTo start the frontend: npm start -- -H 0.0.0.0\033[0m"
echo -e "\033[1;33mNote: Run each command in a separate terminal\033[0m"

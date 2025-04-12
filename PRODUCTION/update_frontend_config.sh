#!/bin/bash

# Exit on error
set -e

# Get the current IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo "Updating frontend configuration to use HTTPS..."
echo "Detected IP address: $IP_ADDRESS"

# Create a backup of the current .env.local file
cp .env.local .env.local.backup

# Update the .env.local file to use HTTPS
sed -i "s|http://$IP_ADDRESS:5000|https://$IP_ADDRESS:5000|g" .env.local

echo "Frontend configuration updated to use HTTPS."
echo "A backup of the original configuration has been saved as .env.local.backup"

#!/bin/bash

# Exit on error
set -e

echo -e "\033[1;34m===== Starting ISLRv6 Backend with Gunicorn WSGI server and HTTPS =====\033[0m"

# Get the current IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo -e "\033[1;36mYour IP address: ${IP_ADDRESS}\033[0m"

# Activate the virtual environment
echo -e "\033[0;32mActivating Python virtual environment...\033[0m"
source /home/pavan/MLProjects/PythonVenv/SigneaseENV/bin/activate

# Create logs directory if it doesn't exist
mkdir -p /home/pavan/MLProjects/ISLRv6/logs
echo -e "\033[0;32mEnsured logs directory exists.\033[0m"

# Set environment variable for production mode
export PRODUCTION_BUILD=true
echo -e "\033[0;32mSet PRODUCTION_BUILD=true for HTTPS support\033[0m"

# Start Gunicorn with the configuration file
echo -e "\033[0;32mStarting Gunicorn server...\033[0m"
cd /home/pavan/MLProjects/ISLRv6
gunicorn --config gunicorn_config.py jetson.jet_back:app

# Note: Press Ctrl+C to stop the server
echo -e "\033[1;33mNote: Press Ctrl+C to stop the server\033[0m"

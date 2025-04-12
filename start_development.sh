#!/bin/bash

# Exit on error
set -e

echo -e "\033[1;34m===== ISLRv6 Development Mode =====\033[0m"

# Get the current IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo -e "\033[1;36mYour IP address: ${IP_ADDRESS}\033[0m"

# Function to check if a port is in use
is_port_in_use() {
    netstat -tuln | grep -q ":$1 "
    return $?
}

# Check if ports are already in use
if is_port_in_use 5000; then
    echo -e "\033[1;31mPort 5000 is already in use. Backend may already be running.\033[0m"
    echo -e "\033[1;33mDo you want to kill the process using port 5000? (y/n)\033[0m"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "\033[0;32mKilling process on port 5000...\033[0m"
        # Try different methods to kill the process
        pkill gunicorn 2>/dev/null || true
        fuser -k 5000/tcp 2>/dev/null || true
        kill $(lsof -t -i:5000) 2>/dev/null || true
        sleep 2
        if is_port_in_use 5000; then
            echo -e "\033[1;31mFailed to kill the process. Please try manually:\033[0m"
            echo -e "\033[1;33msudo fuser -k 5000/tcp\033[0m"
            exit 1
        else
            echo -e "\033[0;32mProcess killed successfully.\033[0m"
        fi
    else
        echo -e "\033[1;33mExiting without killing the process.\033[0m"
        exit 1
    fi
fi

if is_port_in_use 3000; then
    echo -e "\033[1;31mPort 3000 is already in use. Frontend may already be running.\033[0m"
    echo -e "\033[1;33mDo you want to kill the process using port 3000? (y/n)\033[0m"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "\033[0;32mKilling process on port 3000...\033[0m"
        # Try different methods to kill the process
        fuser -k 3000/tcp 2>/dev/null || true
        kill $(lsof -t -i:3000) 2>/dev/null || true
        sleep 2
        if is_port_in_use 3000; then
            echo -e "\033[1;31mFailed to kill the process. Please try manually:\033[0m"
            echo -e "\033[1;33msudo fuser -k 3000/tcp\033[0m"
            exit 1
        else
            echo -e "\033[0;32mProcess killed successfully.\033[0m"
        fi
    else
        echo -e "\033[1;33mExiting without killing the process.\033[0m"
        exit 1
    fi
fi

# Set environment variable for development mode
export PRODUCTION_BUILD=false

# Update .env.local to use HTTP instead of HTTPS
echo -e "\033[0;32mUpdating .env.local to use HTTP...\033[0m"
sed -i "s|https://$IP_ADDRESS:5000|http://$IP_ADDRESS:5000|g" .env.local
echo -e "\033[0;32mUpdated .env.local to use HTTP API URL\033[0m"

# Ask if user wants to build the project first
echo -e "\033[1;33mDo you want to build the project before running? (y/n)\033[0m"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "\033[0;32mBuilding the project...\033[0m"
    npm run build
    echo -e "\033[0;32mBuild completed.\033[0m"
fi

# Start the backend in the background
echo -e "\033[1;32m===== Starting Backend in Development Mode =====\033[0m"
./start_development_server.sh &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 3

# Check if backend started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "\033[1;31mBackend failed to start. Check logs for errors.\033[0m"
    exit 1
fi

echo -e "\033[1;32m===== Backend started successfully =====\033[0m"
echo -e "\033[1;36mBackend API available at: http://${IP_ADDRESS}:5000\033[0m"

# Start the frontend
echo -e "\033[1;32m===== Starting Frontend in Development Mode =====\033[0m"
./start_development_frontend.sh

# Note: When the frontend is stopped with Ctrl+C, this script will also stop
# and the backend will continue running in the background.
# To stop the backend, run: pkill gunicorn

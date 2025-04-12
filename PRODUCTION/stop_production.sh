#!/bin/bash

# Exit on error
set -e

echo -e "\033[1;34m===== Stopping ISLRv6 Production Services =====\033[0m"

# Function to check if a port is in use
is_port_in_use() {
    netstat -tuln | grep -q ":$1 "
    return $?
}

# Stop backend (port 5000)
if is_port_in_use 5000; then
    echo -e "\033[0;32mStopping backend on port 5000...\033[0m"
    # Try different methods to kill the process
    pkill gunicorn 2>/dev/null || true
    fuser -k 5000/tcp 2>/dev/null || true
    kill $(lsof -t -i:5000) 2>/dev/null || true
    sleep 2
    if is_port_in_use 5000; then
        echo -e "\033[1;31mFailed to stop backend. Try manually:\033[0m"
        echo -e "\033[1;33msudo fuser -k 5000/tcp\033[0m"
    else
        echo -e "\033[0;32mBackend stopped successfully.\033[0m"
    fi
else
    echo -e "\033[0;33mBackend not running on port 5000.\033[0m"
fi

# Stop frontend (port 3000)
if is_port_in_use 3000; then
    echo -e "\033[0;32mStopping frontend on port 3000...\033[0m"
    # Try different methods to kill the process
    fuser -k 3000/tcp 2>/dev/null || true
    kill $(lsof -t -i:3000) 2>/dev/null || true
    sleep 2
    if is_port_in_use 3000; then
        echo -e "\033[1;31mFailed to stop frontend. Try manually:\033[0m"
        echo -e "\033[1;33msudo fuser -k 3000/tcp\033[0m"
    else
        echo -e "\033[0;32mFrontend stopped successfully.\033[0m"
    fi
else
    echo -e "\033[0;33mFrontend not running on port 3000.\033[0m"
fi

echo -e "\033[1;34m===== Stop operation completed =====\033[0m"

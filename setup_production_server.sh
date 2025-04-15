#!/bin/bash

# Exit on error
set -e

echo "Setting up production WSGI server with HTTPS for ISLRv6..."

# Activate the virtual environment
source /home/pavan/MLProjects/PythonVenv/SigneaseENV/bin/activate

# Install Gunicorn and SSL dependencies
echo "Installing Gunicorn and SSL dependencies..."
pip install gunicorn pyopenssl

# Create directory for SSL certificates
mkdir -p /home/pavan/MLProjects/ISLRv6/ssl

echo "Setup complete! Now you can generate SSL certificates."

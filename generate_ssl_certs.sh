#!/bin/bash

# Exit on error
set -e

SSL_DIR="/home/pavan/MLProjects/ISLRv6/ssl"
COMMON_NAME="192.168.0.108"  # Use your server's IP address

echo "Generating self-signed SSL certificates for HTTPS..."

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Generate a private key
openssl genrsa -out $SSL_DIR/server.key 2048

# Generate a CSR (Certificate Signing Request)
openssl req -new -key $SSL_DIR/server.key -out $SSL_DIR/server.csr -subj "/CN=$COMMON_NAME"

# Generate a self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in $SSL_DIR/server.csr -signkey $SSL_DIR/server.key -out $SSL_DIR/server.crt

echo "SSL certificates generated successfully at $SSL_DIR"
echo "Note: Since this is a self-signed certificate, browsers will show a security warning."
echo "For production use, consider using Let's Encrypt or a commercial SSL certificate."

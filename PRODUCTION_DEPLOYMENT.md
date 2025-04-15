# Complete Production Deployment Guide for ISLRv6

This comprehensive guide provides step-by-step instructions for deploying the ISLRv6 application in a production environment with HTTPS support, starting from a fresh clone of the repository. It covers both the backend (Flask with Gunicorn) and frontend (Next.js) components.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Setup](#environment-setup)
4. [File Permissions](#file-permissions)
5. [SSL Certificate Generation](#ssl-certificate-generation)
6. [Backend Deployment](#backend-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Running the Complete Application](#running-the-complete-application)
9. [Systemd Service Setup (Optional)](#systemd-service-setup-optional)
10. [Accessing the Application](#accessing-the-application)
11. [Starting and Stopping Services](#starting-and-stopping-services)
12. [Browser Security Warnings](#browser-security-warnings)
13. [Troubleshooting](#troubleshooting)
14. [Development Mode](#development-mode)

## Prerequisites

- Jetson Orin Nano with Linux (Ubuntu/Debian-based distribution)
- Python 3.8 or later
- Node.js 16 or later (recommended: Node.js 20)
- Git
- Basic knowledge of Linux commands

## Initial Setup

### 1. Clone the Repository

```bash
# Create the MLProjects directory if it doesn't exist
mkdir -p ~/MLProjects
cd ~/MLProjects

# Clone the repository
git clone https://github.com/yourusername/ISLRv6.git
cd ISLRv6
```

### 2. Set Up Python Virtual Environment

```bash
# Create the PythonVenv directory if it doesn't exist
mkdir -p ~/MLProjects/PythonVenv

# Create a virtual environment
python3 -m venv ~/MLProjects/PythonVenv/SigneaseENV

# Activate the virtual environment
source ~/MLProjects/PythonVenv/SigneaseENV/bin/activate
```

### 3. Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r jetson/jet_req.txt
```

### 4. Install Node.js Dependencies

```bash
# Install Node.js dependencies
npm install
```

## Environment Setup

### 1. Create Required Directories

```bash
# Create logs directory
mkdir -p ~/MLProjects/ISLRv6/logs

# Create SSL directory
mkdir -p ~/MLProjects/ISLRv6/ssl
```

### 2. Install Production Server Dependencies

Install Gunicorn and PyOpenSSL for production:

```bash
# Activate your virtual environment if not already activated
source ~/MLProjects/PythonVenv/SigneaseENV/bin/activate

# Install production dependencies
pip install gunicorn pyopenssl
sudo apt-get update && sudo apt-get install -y libpq-dev
```

### 3. Create Environment Configuration

Create a `.env.local` file for the frontend configuration:

```bash
# Get your IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_API_URL=http://${IP_ADDRESS}:5000
NEXT_PUBLIC_VERCEL_HOSTED=false
NEXT_PUBLIC_SHADOW_MODE=false
EOF

echo "Created .env.local with API URL: http://${IP_ADDRESS}:5000"
```

## File Permissions

### 1. Make Scripts Executable

Before running any scripts, you must make them executable. This is a critical step that is often overlooked:

```bash
# Make all scripts in the PRODUCTION directory executable
chmod +x PRODUCTION/*.sh

# Make development scripts executable if they exist
chmod +x *.sh
```

### 2. Check and Set Permissions for Key Directories

```bash
# Ensure the logs directory is writable
chmod 755 ~/MLProjects/ISLRv6/logs

# Ensure the ssl directory is writable
chmod 755 ~/MLProjects/ISLRv6/ssl

# If you encounter permission issues with the .next directory during builds
chmod -R 755 .next 2>/dev/null || true
```

## SSL Certificate Generation

Generate self-signed SSL certificates for HTTPS. This is required for production deployment:

```bash
# Run the certificate generation script
./PRODUCTION/generate_ssl_certs.sh
```

**Important Note:** The script uses a hardcoded IP address (192.168.0.108). You should edit the script first to use your actual IP address:

```bash
# Edit the script to use your IP address
sed -i "s/COMMON_NAME=\"192.168.0.108\"/COMMON_NAME=\"$(hostname -I | awk '{print $1}')\"/g" PRODUCTION/generate_ssl_certs.sh
```

The script will:
- Generate a 2048-bit RSA private key
- Create a certificate signing request (CSR)
- Generate a self-signed certificate valid for 365 days
- Save the files in the `ssl` directory

> **Note**: Self-signed certificates will cause browsers to show a security warning. For production use with public access, consider using Let's Encrypt or a commercial SSL certificate provider.

After generating the certificates, your frontend configuration will need to use HTTPS. This will be handled automatically by the production scripts.

## Backend Deployment

### 1. Activate the Virtual Environment

Ensure your Python virtual environment is activated:

```bash
source ~/MLProjects/PythonVenv/SigneaseENV/bin/activate
```

### 2. Set Production Environment Variable

```bash
export PRODUCTION_BUILD=true
```

### 3. Start the Backend Production Server

You can start the backend server using the provided script:

```bash
./PRODUCTION/start_production_server.sh
```

This script will:
1. Activate your Python virtual environment
2. Set the `PRODUCTION_BUILD=true` environment variable
3. Start Gunicorn with the configuration from `gunicorn_config.py`
4. Enable HTTPS using your self-signed certificates
5. Display the server's IP address in the logs

The backend API will be available at `https://your-ip-address:5000`.

### 4. Verify Backend is Running

Check the Gunicorn error log to confirm the server is running:

```bash
cat logs/gunicorn-error.log
```

You should see output similar to:
```
[2025-04-12 10:59:37 +0530] [14523] [INFO] Starting gunicorn 23.0.0
[2025-04-12 10:59:37 +0530] [14523] [INFO] Listening at: https://0.0.0.0:5000 (14523)
```

You can also check if the port is in use:

```bash
netstat -tulpn | grep 5000
```

## Frontend Deployment

### 1. Build the Frontend for Production

Build the frontend for production deployment:

```bash
# Set production environment variable
export PRODUCTION_BUILD=true

# Build the frontend
npm run build:production
```

This command:
1. Pre-compiles all pages to avoid on-demand compilation during runtime
2. Optimizes assets for production
3. Applies advanced webpack optimizations
4. Creates a standalone build that's ready for deployment

The optimized build significantly improves performance by:
- Eliminating on-demand page compilation
- Reducing JavaScript bundle sizes through code splitting
- Optimizing CSS and image loading
- Removing development-only code and console logs

### 2. Start the Frontend Production Server with HTTPS

Start the Next.js production server with HTTPS support:

```bash
./PRODUCTION/start_frontend.sh
```

This command starts the Next.js server with HTTPS support and binds it to all network interfaces (0.0.0.0), making it accessible from other devices on your network.

You should see output similar to:
```
===== ISLRv6 Frontend Server =====
Ready on:
- Local:   https://localhost:3000
- Network: https://192.168.0.108:3000
Note: Using self-signed certificates. Browsers will show a security warning.
```

## Running the Complete Application

The easiest way to run both the backend and frontend together is to use the combined script:

```bash
./PRODUCTION/start_production.sh
```

This script will:
1. Check if ports 5000 and 3000 are already in use
2. Offer to kill any processes using those ports
3. Update `.env.local` to use HTTPS
4. Set `PRODUCTION_BUILD=true` in `.env.local`
5. Start the backend with HTTPS on port 5000
6. Start the frontend with HTTPS on port 3000

When you're done, you can stop all services with:

```bash
# Kill the Gunicorn process for the backend
pkill gunicorn

# The frontend can be stopped with Ctrl+C in its terminal
```

## Systemd Service Setup (Optional)

To have the services start automatically on boot, you can set up systemd services.

### Backend Service

1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/islrv6-backend.service
   ```

2. Add the following content:
   ```ini
   [Unit]
   Description=ISLRv6 Backend Service
   After=network.target

   [Service]
   User=pavan
   WorkingDirectory=/home/pavan/MLProjects/ISLRv6
   Environment="PRODUCTION_BUILD=true"
   ExecStart=/home/pavan/MLProjects/PythonVenv/SigneaseENV/bin/gunicorn --config gunicorn_config.py jetson.jet_back:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable islrv6-backend.service
   sudo systemctl start islrv6-backend.service
   ```

4. Check the status:
   ```bash
   sudo systemctl status islrv6-backend.service
   ```

### Frontend Service

1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/islrv6-frontend.service
   ```

2. Add the following content:
   ```ini
   [Unit]
   Description=ISLRv6 Frontend Service
   After=network.target islrv6-backend.service

   [Service]
   User=pavan
   WorkingDirectory=/home/pavan/MLProjects/ISLRv6
   Environment="PRODUCTION_BUILD=true"
   Environment="NODE_ENV=production"
   ExecStart=/usr/bin/node server.js
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable islrv6-frontend.service
   sudo systemctl start islrv6-frontend.service
   ```

4. Check the status:
   ```bash
   sudo systemctl status islrv6-frontend.service
   ```

## Accessing the Application

### Backend API

The backend API is accessible at:

```
https://your-jetson-ip:5000
```

Replace `your-jetson-ip` with your Jetson Orin Nano's IP address (e.g., 192.168.0.108).

### Frontend Application

The frontend application is accessible at:

```
https://your-jetson-ip:3000
```

Replace `your-jetson-ip` with your Jetson Orin Nano's IP address (e.g., 192.168.0.108).

## Starting and Stopping Services

### Starting Services

To start both the backend and frontend services with a single command:

```bash
./PRODUCTION/start_production.sh
```

To start only the backend:

```bash
./PRODUCTION/start_production_server.sh
```

To start only the frontend:

```bash
./PRODUCTION/start_frontend.sh
```

### Stopping Services

To stop the backend service:

```bash
pkill gunicorn
```

To stop the frontend service, press `Ctrl+C` in the terminal where it's running.

If you've set up systemd services, you can use:

```bash
# Stop backend
sudo systemctl stop islrv6-backend.service

# Stop frontend
sudo systemctl stop islrv6-frontend.service
```

## Browser Security Warnings

Since we're using self-signed certificates for both the backend and frontend, browsers will show security warnings when accessing either service. This is normal and expected with self-signed certificates.

To proceed in most browsers:
1. Click on "Advanced" or "Details"
2. Click on "Proceed to [site] (unsafe)" or a similar option

You'll need to do this for both the frontend (port 3000) and backend (port 5000) URLs.

## Troubleshooting

### Backend Issues

#### Checking Logs

If you encounter issues with the backend, check the logs:

```bash
cat ~/MLProjects/ISLRv6/logs/gunicorn-error.log
cat ~/MLProjects/ISLRv6/logs/gunicorn-access.log
```

#### Common Backend Issues

1. **Port 5000 already in use**:
   ```bash
   # Find the process using port 5000
   netstat -tulpn | grep 5000

   # Kill the process
   fuser -k 5000/tcp
   ```

2. **SSL certificate issues**:
   ```bash
   # Regenerate certificates
   ./generate_ssl_certs.sh
   ```

3. **Python dependency issues**:
   ```bash
   # Reinstall dependencies
   source ~/MLProjects/PythonVenv/SigneaseENV/bin/activate
   pip install -r jetson/jet_req.txt
   ```

### Frontend Issues

#### Checking Logs

If you encounter issues with the frontend, check the logs:

```bash
# If running as a systemd service
sudo journalctl -u islrv6-frontend.service

# If running manually, logs will be in the terminal
```

#### Common Frontend Issues

1. **Port 3000 already in use**:
   ```bash
   # Find the process using port 3000
   netstat -tulpn | grep 3000

   # Kill the process
   fuser -k 3000/tcp
   ```

2. **Build errors**:
   ```bash
   # Clean the Next.js cache
   rm -rf .next

   # Rebuild
   npm run build:production
   ```

3. **Node.js dependency issues**:
   ```bash
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   ```

### Other Common Issues

1. **Certificate Issues**: If you see SSL/TLS errors, ensure your certificates are correctly generated and placed in the right location.

2. **Permission Issues**: Make sure the user running the services has access to all required files and directories.

3. **Cross-Origin Issues**: If the frontend can't communicate with the backend, check that CORS is properly configured in the Flask application.

4. **Audio Not Working**: If you can't hear text-to-speech audio when accessing from another PC, check that the audio URL is using the correct server IP address.

5. **On-demand Compilation**: If pages are still being compiled on-demand (showing "Compiling /page..." messages), make sure you've built the application using `npm run build:production` and not just `npm run build`.

6. **Hardware Encoding Issues**: If you see errors related to h264_v4l2m2m, this is normal on Jetson Orin Nano. The application will automatically fall back to software encoding.

## Development Mode

There are two ways to run the application in development mode: using the automated script or manually running the frontend and backend in separate terminals.

### Automated Development Mode

To run the application in development mode using the automated script:

```bash
# Make the development scripts executable
chmod +x start_development.sh start_development_server.sh start_development_frontend.sh

# Run the development script
./start_development.sh
```

This will:
1. Set `PRODUCTION_BUILD=false`
2. Update `.env.local` to use HTTP instead of HTTPS
3. Ask if you want to build the project before running
4. Start the backend using the Flask development server
5. Ask if you want to use the production build or development server for the frontend
6. Start the frontend based on your choice

**Note:** The development scripts are in the root directory, not in the PRODUCTION directory. Make sure you're running `./start_development.sh` from the project root.

### Manual Development Mode

For more control or if you encounter issues with the automated script, you can run the frontend and backend manually in separate terminals:

#### Terminal 1 - Start the Backend

```bash
# Activate the virtual environment
source ~/MLProjects/PythonVenv/SigneaseENV/bin/activate

# Set development mode environment variable
export PRODUCTION_BUILD=false

# Update .env.local to use HTTP (if needed)
sed -i "s|https://$(hostname -I | awk '{print $1}'):5000|http://$(hostname -I | awk '{print $1}'):5000|g" .env.local

# Start the Flask development server
python jetson/jet_back.py
```

#### Terminal 2 - Start the Frontend

You have two options for the frontend:

**Option A: Development Server (with hot reloading but on-demand compilation)**
```bash
# Start the Next.js development server
npm run dev -- -H 0.0.0.0
```

**Option B: Production Build (faster startup, no on-demand compilation)**
```bash
# Build the project first
npm run build

# Start using the production build
npm start -- -H 0.0.0.0
```

This manual approach gives you more visibility into each component and makes it easier to restart just one part of the application if needed.

### Development Mode Benefits

**Development Server Benefits:**
- Hot reloading for frontend changes
- Automatic restart for backend changes
- Detailed error messages and stack traces
- No HTTPS (uses HTTP instead)
- Direct console output for debugging

**Production Build Benefits (even in development mode):**
- Faster page loads (no on-demand compilation)
- Pages are pre-compiled during the build step
- Better performance similar to production
- Still uses HTTP (not HTTPS) when in development mode

## Performance Optimization Tips

1. **Rebuild Regularly**: Rebuild the frontend whenever you make changes to ensure all pages are pre-compiled.

2. **Monitor Memory Usage**: The Jetson Orin Nano has limited memory. Monitor usage with `htop` or `free -m`.

3. **Restart Services**: If performance degrades over time, restart the services using the provided scripts.

4. **Use Production Mode**: Always use the production build for deployment, not the development server.

5. **Clear Browser Cache**: When testing changes, clear your browser cache to ensure you're seeing the latest version.

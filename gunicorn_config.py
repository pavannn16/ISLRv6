# Gunicorn configuration file for ISLRv6
import os
from pathlib import Path
import dotenv

# Load environment variables from .env.local file
try:
    dotenv.load_dotenv(dotenv_path=Path('.env.local'))
except Exception as e:
    print(f"Warning: Could not load .env.local file: {e}")

# Check if we're in production build mode
PRODUCTION_BUILD = os.environ.get('PRODUCTION_BUILD', 'false').lower() == 'true'
print(f"Running in {'production' if PRODUCTION_BUILD else 'development'} mode")

# Server socket
bind = '0.0.0.0:5000'  # Same port as the Flask development server

# Worker processes
workers = 4  # A good starting point is (2 x num_cores) + 1
threads = 2  # Number of threads per worker
worker_class = 'gthread'  # Use threads for better handling of concurrent requests

# Timeout
timeout = 120  # Increase timeout for video processing

# SSL Configuration - only used if PRODUCTION_BUILD is true
if PRODUCTION_BUILD:
    certfile = '/home/pavan/MLProjects/ISLRv6/ssl/server.crt'
    keyfile = '/home/pavan/MLProjects/ISLRv6/ssl/server.key'

# Logging
errorlog = '/home/pavan/MLProjects/ISLRv6/logs/gunicorn-error.log'
accesslog = '/home/pavan/MLProjects/ISLRv6/logs/gunicorn-access.log'
loglevel = 'info'

# Process naming
proc_name = 'islrv6_gunicorn'

# Preload application for better performance
preload_app = True

# Display IP address on startup
def on_starting(server):
    import socket
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    print(f"\n\033[1;32m===== ISLRv6 Backend Server =====\033[0m")

    if PRODUCTION_BUILD:
        print(f"\033[1;36mServer running at: https://{ip_address}:5000\033[0m")
        print(f"\033[1;33mNote: Using self-signed certificates. Browsers will show a security warning.\033[0m\n")
    else:
        print(f"\033[1;36mServer running at: http://{ip_address}:5000\033[0m")
        print(f"\033[1;33mRunning in development mode (PRODUCTION_BUILD=false)\033[0m\n")

# Create log directory
import os
os.makedirs('/home/pavan/MLProjects/ISLRv6/logs', exist_ok=True)

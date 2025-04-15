#!/bin/bash

# Exit on error
set -e

echo -e "\033[1;34m===== Building ISLRv6 for Production (Offline Mode) =====\033[0m"

# Get the current IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo -e "\033[1;36mYour IP address: ${IP_ADDRESS}\033[0m"

# Check if SSL certificates exist
if [ ! -f "ssl/server.crt" ] || [ ! -f "ssl/server.key" ]; then
    echo -e "\033[1;33mSSL certificates not found. Generating them now...\033[0m"
    ./generate_ssl_certs.sh
fi

# Update frontend configuration
echo -e "\033[0;32mUpdating frontend configuration to use HTTPS...\033[0m"
./update_frontend_config.sh

# Create a temporary next.config.js that disables all network requests during build
echo -e "\033[0;32mCreating offline-friendly build configuration...\033[0m"
cp next.config.js next.config.js.backup

cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kokonutui.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Disable image optimization
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize build output
  output: 'standalone',
  // Disable experimental features
  experimental: {
    // Disable features that require network
    optimizeCss: false,
    optimizePackageImports: [],
  },
  webpack: (config, { dev, isServer }) => {
    // Development optimizations
    if (dev) {
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.next/**'],
        aggregateTimeout: 300,
      };
    }
    
    // Simple production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
EOF

# Build the frontend for production with offline settings
echo -e "\033[0;32mBuilding frontend for production in offline mode...\033[0m"

# Set production environment
export NODE_ENV=production

# Clean any previous build
echo -e "\033[0;32mCleaning previous build...\033[0m"
rm -rf .next

# Run the build with basic settings
echo -e "\033[0;32mRunning Next.js build...\033[0m"
npx next build

# Restore original config
echo -e "\033[0;32mRestoring original configuration...\033[0m"
mv next.config.js.backup next.config.js

echo -e "\033[1;32m===== Production build completed successfully =====\033[0m"
echo -e "\033[1;36mTo start the production server, run: ./start_production.sh\033[0m"

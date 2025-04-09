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
    ],
    domains: ['images.unsplash.com'],
  },
  webpack: (config, { dev }) => {
    // Development optimizations
    if (dev) {
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.next/**'],
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  typescript: {
    tsconfigPath: './tsconfig.json'
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  experimental: {
    // Enable if needed for Tauri
    // isrMemoryCacheSize: 0
  },
  // Configure for Tauri
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : undefined,
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes for Tauri compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  }
};

module.exports = nextConfig;

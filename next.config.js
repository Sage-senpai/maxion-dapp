// next.config.js
// FIXED: Exclude problematic node_modules from build

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Turbopack configuration
  turbopack: {
    // Exclude problematic test files
    resolveAlias: {
      // Alias problematic imports
    },
  },
  
  // Webpack configuration for production builds
  webpack: (config, { isServer }) => {
    // Exclude test files and non-essential node_modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /node_modules\/thread-stream\/(test|bench)/,
      use: 'null-loader',
    });

    // Ignore specific problematic files
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },

  // Explicitly ignore certain paths during build
  typescript: {
    // Ignore build errors temporarily (remove this in production)
    ignoreBuildErrors: false,
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_VAULT_ADDRESS: process.env.NEXT_PUBLIC_VAULT_ADDRESS,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },

  // Optimize for serverless
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
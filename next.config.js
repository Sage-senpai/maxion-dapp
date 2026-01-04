/** @type {import('next').Config} */
const nextConfig = {
  reactStrictMode: true,
  
  // Remove Turbopack warnings
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Disable Turbopack for build stability
    turbopack: false,
  },

  // Webpack optimization for production
  webpack: (config, { isServer }) => {
    // Reduce memory usage
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      }
    };

    // Ignore problematic files
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

  // Environment variables
  env: {
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_VAULT_ADDRESS: process.env.NEXT_PUBLIC_VAULT_ADDRESS,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
};

module.exports = nextConfig;
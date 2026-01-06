/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  
  // Force webpack mode (disable turbopack completely)
  outputFileTracingRoot: __dirname,

  // Webpack configuration
  webpack: (config, { isServer, webpack }) => {
    // Ignore problematic modules and test files
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test$/,
        contextRegExp: /thread-stream/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/bench$/,
        contextRegExp: /thread-stream/,
      }),
      new webpack.NormalModuleReplacementPlugin(
        /pino-pretty/,
        path.resolve(__dirname, 'lib/pino-stub.ts')
      )
    );

    // Node.js polyfills - set to false for browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      perf_hooks: false,
      os: false,
      path: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      child_process: false,
      worker_threads: false,
      'pino-pretty': false,
    };

    // Externalize logging libraries on client side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino': path.resolve(__dirname, 'lib/pino-stub.ts'),
        'thread-stream': false,
        'pino-pretty': false,
      };
    }

    // Ignore test files globally
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx|mjs)$/,
      loader: 'ignore-loader',
    });

    return config;
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '2mb'
    },
  },

  // Optimize package imports
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    '@wagmi/core',
    '@wagmi/connectors',
    'wagmi',
    'viem',
  ],

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    NEXT_PUBLIC_ALCHEMY_ID: process.env.NEXT_PUBLIC_ALCHEMY_ID,
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
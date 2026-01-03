// src/lib/web3/config.ts
// FIXED: Multiple RPC endpoints for better reliability, backup URLs

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'wagmi/chains';

// ============================================================================
// MANTLE CHAIN DEFINITIONS WITH MULTIPLE RPC ENDPOINTS
// ============================================================================

export const mantleTestnet: Chain = {
  id: 5003,
  name: 'Mantle Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.testnet.mantle.xyz',
        'https://mantle-testnet.public.blastapi.io',
        'https://mantle-sepolia.gateway.tenderly.co',
      ],
    },
    public: {
      http: [
        'https://rpc.testnet.mantle.xyz',
        'https://mantle-testnet.public.blastapi.io',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Testnet Explorer',
      url: 'https://explorer.testnet.mantle.xyz',
    },
  },
  testnet: true,
};

export const mantleMainnet: Chain = {
  id: 5000,
  name: 'Mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.mantle.xyz',
        'https://mantle.public.blastapi.io',
        'https://mantle.gateway.tenderly.co',
      ],
    },
    public: {
      http: [
        'https://rpc.mantle.xyz',
        'https://mantle.public.blastapi.io',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Explorer',
      url: 'https://explorer.mantle.xyz',
    },
  },
  testnet: false,
};

// ============================================================================
// WAGMI CONFIG
// ============================================================================

export const config = getDefaultConfig({
  appName: 'MAXION',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mantleTestnet, mantleMainnet],
  ssr: true,
});

// ============================================================================
// CONTRACT ADDRESSES
// ============================================================================

export const CONTRACTS = {
  mantleTestnet: {
    yieldVault: process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000',
    mockUSDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  mantleMainnet: {
    yieldVault: process.env.NEXT_PUBLIC_MAINNET_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000',
    usdc: process.env.NEXT_PUBLIC_MAINNET_USDC_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
};

// Helper to get contracts for current chain
export function getContracts(chainId: number) {
  if (chainId === 5003) return CONTRACTS.mantleTestnet;
  if (chainId === 5000) return CONTRACTS.mantleMainnet;
  return CONTRACTS.mantleTestnet; // Default to testnet
}

// Helper to get RPC URL
export function getRpcUrl(chainId: number): string {
  if (chainId === 5003) {
    return mantleTestnet.rpcUrls.default.http[0];
  }
  if (chainId === 5000) {
    return mantleMainnet.rpcUrls.default.http[0];
  }
  return mantleTestnet.rpcUrls.default.http[0];
}
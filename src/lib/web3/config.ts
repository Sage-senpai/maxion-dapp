// lib/web3/config.ts
// Web3 configuration for MAXION - wagmi + RainbowKit on Mantle

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'wagmi/chains';

// ============================================================================
// MANTLE CHAIN DEFINITIONS
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
      http: ['https://rpc.testnet.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.testnet.mantle.xyz'],
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
      http: ['https://rpc.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.mantle.xyz'],
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
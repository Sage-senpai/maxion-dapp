// src/lib/web3/config.ts
// FIXED: Prevent multiple WalletConnect initializations

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
// WAGMI CONFIG - SINGLETON PATTERN
// ============================================================================

let configInstance: ReturnType<typeof getDefaultConfig> | null = null;

function createConfig() {
  if (configInstance) {
    return configInstance;
  }

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';
  
  configInstance = getDefaultConfig({
    appName: 'MAXION',
    projectId,
    chains: [mantleTestnet, mantleMainnet],
    ssr: true,
  });

  return configInstance;
}

export const config = createConfig();

// ============================================================================
// CONTRACT ADDRESSES
// ============================================================================

export const CONTRACTS = {
  mantleTestnet: {
    yieldVault: process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0x65FEdd3e4d93885D7Fc5A65D8E149740Fc131C6b',
    mockUSDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x9d8B656598274BDa44c355bF355F47CE7eaDa3c5',
  },
  mantleMainnet: {
    yieldVault: process.env.NEXT_PUBLIC_MAINNET_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000',
    usdc: process.env.NEXT_PUBLIC_MAINNET_USDC_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
};

export function getContracts(chainId: number) {
  if (chainId === 5003) return CONTRACTS.mantleTestnet;
  if (chainId === 5000) return CONTRACTS.mantleMainnet;
  return CONTRACTS.mantleTestnet;
}

export function getRpcUrl(chainId: number): string {
  if (chainId === 5003) return mantleTestnet.rpcUrls.default.http[0];
  if (chainId === 5000) return mantleMainnet.rpcUrls.default.http[0];
  return mantleTestnet.rpcUrls.default.http[0];
}
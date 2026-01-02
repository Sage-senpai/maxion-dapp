// src/types/global.d.ts
// Window interface extensions for wallet providers

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    isTrust?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeAllListeners: () => void;
  };
  
  solana?: {
    isPhantom?: boolean;
    isConnected?: boolean;
    publicKey?: {
      toString: () => string;
    };
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    on: (event: string, handler: (...args: any[]) => void) => void;
  };
  
  cardano?: {
    eternl?: {
      enable: () => Promise<{
        getUsedAddresses: () => Promise<string[]>;
      }>;
    };
  };
  
  injectedWeb3?: {
    subwallet?: {
      request: (args: { method: string }) => Promise<any>;
    };
  };
}
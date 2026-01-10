// src/components/WalletConnectSystem.tsx
// FIXED: Proper modal centering, wallet switching, and network detection

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Check, X, LogOut, Loader2, AlertCircle, ExternalLink, Zap, Eye } from 'lucide-react';

const COLORS = {
  maxionGreen: '#3EF3A3',
  obsidianBlack: '#0B0E11',
  graphitePanel: '#161B22',
  slateGrey: '#1F2937',
  signalCyan: '#2BD9FE',
  riskRed: '#EF4444',
  warningAmber: '#FACC15',
};

interface WalletConfig {
  id: string;
  name: string;
  icon: string;
  chains: string[];
  type: string;
  detectMethod: () => boolean;
}

interface ConnectedWallet extends WalletConfig {}

interface WalletConnectSystemProps {
  onModeChange?: (mode: 'live' | 'demo', address?: string) => void;
  currentMode?: 'live' | 'demo';
}

const WALLET_CONFIGS: WalletConfig[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    chains: ['mantle', 'ethereum'],
    type: 'evm',
    detectMethod: () => {
      if (typeof window === 'undefined') return false;
      return !!(window.ethereum?.isMetaMask);
    },
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    chains: ['mantle', 'ethereum'],
    type: 'evm',
    detectMethod: () => {
      if (typeof window === 'undefined') return false;
      return !!(window.ethereum?.isCoinbaseWallet);
    },
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    chains: ['ethereum', 'solana', 'mantle'],
    type: 'multi-chain',
    detectMethod: () => {
      if (typeof window === 'undefined') return false;
      // Check for Phantom's EVM provider
      return !!(window.ethereum?.isPhantom || window.solana?.isPhantom);
    },
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    chains: ['mantle', 'ethereum'],
    type: 'evm',
    detectMethod: () => true,
  },
];

const MANTLE_NETWORK = {
  chainId: '0x138B', // 5003 in hex
  chainName: 'Mantle Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: ['https://rpc.testnet.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.mantle.xyz'],
};

export default function WalletConnectSystem({ onModeChange, currentMode = 'demo' }: WalletConnectSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [showDisconnect, setShowDisconnect] = useState(false);

  useEffect(() => {
    checkExistingConnection();
  }, []);

  useEffect(() => {
    if (onModeChange) {
      onModeChange(connectedWallet ? 'live' : 'demo', connectedWallet ? address : undefined);
    }
  }, [connectedWallet, address, onModeChange]);

  const checkExistingConnection = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Check MetaMask first
      if (window.ethereum?.isMetaMask) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts[0]) {
          const wallet = WALLET_CONFIGS.find(w => w.id === 'metamask');
          if (wallet) {
            await handleWalletConnect('metamask', accounts[0]);
          }
        }
      }
      // Check Phantom EVM
      else if (window.ethereum?.isPhantom) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts[0]) {
          const wallet = WALLET_CONFIGS.find(w => w.id === 'phantom');
          if (wallet) {
            await handleWalletConnect('phantom', accounts[0]);
          }
        }
      }
    } catch (err) {
      console.log('No existing connection found');
    }
  };

  const handleWalletConnect = async (walletId: string, existingAddress: string | null = null) => {
    setIsConnecting(true);
    setError('');

    try {
      const wallet = WALLET_CONFIGS.find(w => w.id === walletId);
      if (!wallet) throw new Error('Wallet not found');

      // Force disconnect other wallets first
      await disconnectAllWallets();
      
      if (['metamask', 'coinbase'].includes(walletId)) {
        await connectEVMWallet(wallet, existingAddress, walletId);
      } else if (walletId === 'phantom') {
        await connectPhantomWallet(wallet, existingAddress);
      } else if (walletId === 'walletconnect') {
        setError('WalletConnect integration coming soon!');
        return;
      }

      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectAllWallets = async () => {
    try {
      // Clear any existing listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners?.();
      }
      if (window.solana) {
        await window.solana.disconnect?.();
      }
    } catch (err) {
      console.log('Disconnect cleanup:', err);
    }
  };

  const connectEVMWallet = async (wallet: WalletConfig, existingAddress: string | null, walletId: string) => {
    if (!window.ethereum) {
      throw new Error(`${wallet.name} not detected. Please install it.`);
    }

    // For Phantom, specifically target its EVM provider
    let provider = window.ethereum;
    
    // If Phantom, ensure we're using the right provider
    if (walletId === 'phantom' && window.ethereum.isPhantom) {
      provider = window.ethereum;
    } else if (walletId === 'metamask' && window.ethereum.isMetaMask) {
      provider = window.ethereum;
    } else if (walletId === 'coinbase' && window.ethereum.isCoinbaseWallet) {
      provider = window.ethereum;
    }

    try {
      let accounts: string[];
      if (existingAddress) {
        accounts = [existingAddress];
      } else {
        // Request accounts
        accounts = await provider.request({ 
          method: 'eth_requestAccounts',
        }) as string[];
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Try to switch to Mantle network
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MANTLE_NETWORK.chainId }],
        });
      } catch (switchError: any) {
        // Network not added, try to add it
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [MANTLE_NETWORK],
            });
          } catch (addError) {
            console.warn('Could not add Mantle network:', addError);
          }
        }
      }

      // Get balance
      let balanceEth = '0.00';
      try {
        const balanceWei = await provider.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        }) as string;
        balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4);
      } catch (balanceError) {
        console.warn('Could not fetch balance:', balanceError);
      }

      // Get chain ID
      const currentChainId = await provider.request({ method: 'eth_chainId' }) as string;
      const chainIdNum = parseInt(currentChainId, 16);

      setConnectedWallet(wallet);
      setAddress(accounts[0]);
      setBalance(balanceEth);
      setChainId(chainIdNum);

      // Set up listeners
      provider.on('accountsChanged', (newAccounts: any) => {
        if (Array.isArray(newAccounts) && newAccounts.length === 0) {
          handleDisconnect();
        } else if (newAccounts[0]) {
          setAddress(newAccounts[0]);
        }
      });

      provider.on('chainChanged', (newChainId: any) => {
        const newChainIdNum = parseInt(newChainId as string, 16);
        setChainId(newChainIdNum);
        // Reload balance
        provider.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        }).then((balanceWei: any) => {
          const balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4);
          setBalance(balanceEth);
        });
      });

    } catch (err: any) {
      throw new Error(`Failed to connect to ${wallet.name}: ${err.message}`);
    }
  };

  const connectPhantomWallet = async (wallet: WalletConfig, existingAddress: string | null) => {
    // Try EVM first (Phantom supports Ethereum)
    if (window.ethereum?.isPhantom) {
      await connectEVMWallet(wallet, existingAddress, 'phantom');
      return;
    }

    // Fallback to Solana
    if (!window.solana || !window.solana.isPhantom) {
      window.open('https://phantom.app/', '_blank');
      throw new Error('Phantom wallet not detected.');
    }

    try {
      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();

      setConnectedWallet(wallet);
      setAddress(publicKey);
      setBalance('0.0000'); // Solana balance would need separate API call
      setChainId('solana-mainnet');

      window.solana.on('disconnect', () => {
        handleDisconnect();
      });

      setError('');
    } catch (err: any) {
      if (err.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw new Error(`Failed to connect Phantom: ${err.message}`);
    }
  };

  const handleDisconnect = () => {
    disconnectAllWallets();
    
    setConnectedWallet(null);
    setAddress('');
    setBalance('0');
    setChainId(null);
    setShowDisconnect(false);
    
    if (onModeChange) {
      onModeChange('demo');
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number | string | null) => {
    if (!id) return 'Unknown';
    if (id === 5003) return 'Mantle Testnet';
    if (id === 5000) return 'Mantle Mainnet';
    if (id === 1) return 'Ethereum';
    if (id === 'solana-mainnet') return 'Solana';
    return `Chain ${id}`;
  };

  return (
    <div className="relative">
      {!connectedWallet ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2"
          style={{
            backgroundColor: COLORS.maxionGreen,
            color: COLORS.obsidianBlack,
          }}
        >
          <Wallet size={18} />
          Connect Wallet
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDisconnect(!showDisconnect)}
          className="px-4 py-2 rounded-lg border font-medium text-sm flex items-center gap-3"
          style={{
            backgroundColor: COLORS.graphitePanel,
            borderColor: COLORS.maxionGreen,
            color: '#E5E7EB',
          }}
        >
          <span className="text-xl">{connectedWallet.icon}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span style={{ color: COLORS.maxionGreen }}>{formatAddress(address)}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${COLORS.maxionGreen}20`, color: COLORS.maxionGreen }}>
                <Zap size={10} className="inline" /> LIVE
              </span>
            </div>
            <div className="text-xs text-gray-400">{balance} {chainId === 'solana-mainnet' ? 'SOL' : 'MNT'}</div>
          </div>
          <ChevronDown size={16} />
        </motion.button>
      )}

      {/* Disconnect Dropdown */}
      <AnimatePresence>
        {showDisconnect && connectedWallet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisconnect(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-72 rounded-xl shadow-2xl border z-50"
              style={{
                backgroundColor: COLORS.graphitePanel,
                borderColor: COLORS.slateGrey,
              }}
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: COLORS.slateGrey }}>
                  <span className="text-3xl">{connectedWallet.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{connectedWallet.name}</div>
                    <div className="text-xs text-gray-400">{getNetworkName(chainId)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Address</div>
                  <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: COLORS.slateGrey }}>
                    <span className="font-mono text-sm" style={{ color: COLORS.maxionGreen }}>
                      {formatAddress(address)}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(address)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Balance</div>
                  <div className="font-mono text-lg font-bold" style={{ color: COLORS.maxionGreen }}>
                    {balance} {chainId === 'solana-mainnet' ? 'SOL' : 'MNT'}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowDisconnect(false);
                      setIsOpen(true);
                    }}
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: COLORS.slateGrey,
                      color: '#E5E7EB',
                    }}
                  >
                    Switch Wallet
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: `${COLORS.riskRed}20`,
                      color: COLORS.riskRed,
                    }}
                  >
                    <LogOut size={16} />
                    Disconnect
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FIXED MODAL - Perfect centering with flex */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isConnecting && setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
            />

            {/* Modal Container - FIXED with proper flex centering */}
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl shadow-2xl"
                style={{ backgroundColor: COLORS.graphitePanel }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: COLORS.slateGrey }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                      <p className="text-sm text-gray-400 mt-1">Choose your preferred wallet</p>
                    </div>
                    <button
                      onClick={() => !isConnecting && setIsOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="px-4 pt-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: `${COLORS.warningAmber}20` }}>
                      <AlertCircle size={20} style={{ color: COLORS.warningAmber }} className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: COLORS.warningAmber }}>Note</div>
                        <div className="text-xs text-gray-300 mt-1">{error}</div>
                      </div>
                      <button onClick={() => setError('')} className="text-gray-400 hover:text-white">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Wallet List */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    {WALLET_CONFIGS.map((wallet, idx) => {
                      const isDetected = wallet.detectMethod();

                      return (
                        <motion.button
                          key={wallet.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={!isConnecting ? { scale: 1.02, x: 4 } : {}}
                          whileTap={!isConnecting ? { scale: 0.98 } : {}}
                          onClick={() => !isConnecting && handleWalletConnect(wallet.id)}
                          disabled={isConnecting}
                          className="w-full p-4 rounded-xl border text-left transition-all disabled:opacity-50"
                          style={{
                            backgroundColor: COLORS.obsidianBlack,
                            borderColor: isDetected ? COLORS.maxionGreen : COLORS.slateGrey,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{wallet.icon}</span>
                              <div>
                                <div className="font-semibold text-white">{wallet.name}</div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {wallet.chains.slice(0, 2).join(', ')}
                                  {wallet.chains.length > 2 && ` +${wallet.chains.length - 2}`}
                                </div>
                              </div>
                            </div>
                            {isDetected ? (
                              <Check size={20} style={{ color: COLORS.maxionGreen }} />
                            ) : (
                              <ExternalLink size={16} className="text-gray-500" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Loading Overlay */}
                {isConnecting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.obsidianBlack}CC`, backdropFilter: 'blur(4px)' }}
                  >
                    <div className="text-center">
                      <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: COLORS.maxionGreen }} />
                      <div className="text-white font-semibold">Connecting...</div>
                      <div className="text-sm text-gray-400 mt-1">Approve in your wallet</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Demo Mode Badge */}
      {!connectedWallet && (
        <div className="absolute top-full right-0 mt-2">
          <div className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ backgroundColor: `${COLORS.signalCyan}20`, color: COLORS.signalCyan }}>
            <Eye size={10} />
            Demo Mode
          </div>
        </div>
      )}
    </div>
  );
}
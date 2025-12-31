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

// Wallet configurations
const WALLET_CONFIGS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    chains: ['mantle', 'ethereum'],
    type: 'evm',
    detectMethod: () => typeof window !== 'undefined' && window.ethereum?.isMetaMask,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    chains: ['mantle', 'ethereum'],
    type: 'evm',
    detectMethod: () => true, // Always available
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    chains: ['mantle', 'ethereum'],
    type: 'evm',
    detectMethod: () => typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    chains: ['solana', 'ethereum', 'mantle'],
    type: 'multi-chain',
    detectMethod: () => typeof window !== 'undefined' && window.solana?.isPhantom,
  },
  {
    id: 'subwallet',
    name: 'SubWallet',
    icon: '🔷',
    chains: ['polkadot', 'ethereum', 'mantle'],
    type: 'multi-chain',
    detectMethod: () => typeof window !== 'undefined' && window.injectedWeb3?.subwallet,
  },
  {
    id: 'eternl',
    name: 'Eternl',
    icon: '♾️',
    chains: ['cardano', 'ethereum'],
    type: 'multi-chain',
    detectMethod: () => typeof window !== 'undefined' && window.cardano?.eternl,
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    chains: ['mantle', 'ethereum', 'binance'],
    type: 'evm',
    detectMethod: () => typeof window !== 'undefined' && window.ethereum?.isTrust,
  },
];

const MANTLE_NETWORK = {
  chainId: '0x138B', // 5003 in hex
  chainName: 'Mantle Testnet',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.mantle.xyz'],
};

interface WalletConnectSystemProps {
  onModeChange?: (mode: 'live' | 'demo', address?: string) => void;
  currentMode?: 'live' | 'demo';
}

export default function WalletConnectSystem({ onModeChange, currentMode = 'demo' }: WalletConnectSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [showDisconnect, setShowDisconnect] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  // Update parent mode when connection changes
  useEffect(() => {
    if (onModeChange) {
      onModeChange(connectedWallet ? 'live' : 'demo', connectedWallet ? address : undefined);
    }
  }, [connectedWallet, address, onModeChange]);

  const checkExistingConnection = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Check MetaMask
      if (window.ethereum?.isMetaMask) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts[0]) {
          // Silently reconnect without errors
          try {
            await handleWalletConnect('metamask', accounts[0]);
          } catch (err) {
            console.log('MetaMask reconnection skipped:', err.message);
            // Don't show error to user, just continue in demo mode
          }
        }
      }
      // Check Phantom
      else if (window.solana?.isPhantom && window.solana.isConnected) {
        const publicKey = window.solana.publicKey?.toString();
        if (publicKey) {
          try {
            await connectPhantomWallet(WALLET_CONFIGS.find(w => w.id === 'phantom'));
          } catch (err) {
            console.log('Phantom reconnection skipped:', err.message);
            // Don't show error, just continue in demo mode
          }
        }
      }
    } catch (err) {
      console.log('Connection check skipped:', err.message);
      // Silently fail - user can manually connect if needed
    }
  };

  const handleWalletConnect = async (
  walletId: string, 
  existingAddress: string | null = null
) => {
    setIsConnecting(true);
    setError('');

    try {
      const wallet = WALLET_CONFIGS.find(w => w.id === walletId);
      
      if (wallet.type === 'evm' || wallet.id === 'phantom') {
        if (walletId === 'metamask' || walletId === 'coinbase' || walletId === 'trust') {
          await connectEVMWallet(wallet, existingAddress);
        } else if (walletId === 'phantom') {
          await connectPhantomWallet(wallet);
        } else if (walletId === 'walletconnect') {
          await connectWalletConnect(wallet);
        }
      } else if (wallet.id === 'eternl') {
        await connectCardanoWallet(wallet);
      } else if (wallet.id === 'subwallet') {
        await connectSubWallet(wallet);
      }

      setIsOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectEVMWallet = async (
  wallet: typeof WALLET_CONFIGS[0], 
  existingAddress: string | null
) =>  {
    if (!window.ethereum) {
      throw new Error(`${wallet.name} not detected. Please install it.`);
    }

    try {
      // Request accounts
      let accounts;
      if (existingAddress) {
        accounts = [existingAddress];
      } else {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      }

      // Try to switch to Mantle network (skip if it fails - not critical for demo)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MANTLE_NETWORK.chainId }],
        });
      } catch (switchError) {
        // Network doesn't exist, try to add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [MANTLE_NETWORK],
            });
          } catch (addError) {
            console.warn('Could not add Mantle network:', addError);
            // Continue anyway - wallet is connected
          }
        } else if (switchError.code === 4001) {
          // User rejected - continue with current network
          console.log('User rejected network switch, continuing...');
        } else {
          console.warn('Network switch failed:', switchError);
          // Continue anyway
        }
      }

      // Get balance
      let balanceEth = '0.00';
      try {
        const balanceWei = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        });
        balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4);
      } catch (balanceError) {
        console.warn('Could not fetch balance:', balanceError);
      }

      // Get chain ID
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      setConnectedWallet(wallet);
      setAddress(accounts[0]);
      setBalance(balanceEth);
      setChainId(parseInt(currentChainId, 16));

      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length === 0) {
          handleDisconnect();
        } else {
          setAddress(newAccounts[0]);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(parseInt(newChainId, 16));
      });

    } catch (err) {
      throw new Error(`Failed to connect to ${wallet.name}: ${err.message}`);
    }
  };

  const connectPhantomWallet = async (wallet) => {
    if (!window.solana || !window.solana.isPhantom) {
      window.open('https://phantom.app/', '_blank');
      throw new Error('Phantom wallet not detected. Please install Phantom extension.');
    }

    try {
      // Check if localhost - Phantom doesn't support localhost connections
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // Show warning but allow connection anyway for demo purposes
        console.warn('Phantom may not work on localhost. Connecting in demo mode...');
      }

      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();

      // For localhost/demo, just use mock balance
      let balanceSOL = '0.00';
      
      if (!isLocalhost) {
        // Only try to fetch real balance if not on localhost
        try {
          // Note: You'd need to include @solana/web3.js for this to work
          // For now, we'll use a mock balance
          balanceSOL = '1.2345';
        } catch (balanceError) {
          console.warn('Could not fetch Solana balance:', balanceError);
          balanceSOL = '0.00';
        }
      } else {
        // Mock balance for demo
        balanceSOL = '1.2345';
      }

      setConnectedWallet(wallet);
      setAddress(publicKey);
      setBalance(balanceSOL);
      setChainId('solana-mainnet');

      // Listen for disconnection
      window.solana.on('disconnect', () => {
        handleDisconnect();
      });

      // Clear any existing errors
      setError('');

    } catch (err) {
      if (err.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw new Error(`Failed to connect Phantom: ${err.message}`);
    }
  };

  const connectWalletConnect = async (wallet) => {
    // For now, redirect to use other wallets
    setError('WalletConnect integration coming soon! Please use MetaMask, Phantom, or another supported wallet for now.');
    throw new Error('WalletConnect coming soon! Use MetaMask or Phantom for now.');
  };

  const connectCardanoWallet = async (wallet) => {
    if (!window.cardano?.eternl) {
      window.open('https://eternl.io/', '_blank');
      throw new Error('Eternl wallet not detected. Redirecting to install...');
    }

    try {
      const api = await window.cardano.eternl.enable();
      const addresses = await api.getUsedAddresses();
      const address = addresses[0];

      setConnectedWallet(wallet);
      setAddress(address);
      setBalance('0.00'); // Placeholder
      setChainId('cardano-mainnet');

    } catch (err) {
      throw new Error(`Failed to connect Eternl: ${err.message}`);
    }
  };

  const connectSubWallet = async (wallet) => {
    if (!window.injectedWeb3?.subwallet) {
      window.open('https://subwallet.app/', '_blank');
      throw new Error('SubWallet not detected. Redirecting to install...');
    }

    try {
      const accounts = await window.injectedWeb3.subwallet.request({
        method: 'eth_requestAccounts'
      });

      setConnectedWallet(wallet);
      setAddress(accounts[0]);
      setBalance('0.00');
      setChainId('polkadot');

    } catch (err) {
      throw new Error(`Failed to connect SubWallet: ${err.message}`);
    }
  };

  const handleDisconnect = () => {
    // Clean up listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners();
    }
    if (window.solana) {
      window.solana.disconnect();
    }

    setConnectedWallet(null);
    setAddress('');
    setBalance('0');
    setChainId(null);
    setShowDisconnect(false);
    
    // Notify parent to switch to demo mode
    if (onModeChange) {
      onModeChange('demo');
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id) => {
    if (!id) return 'Unknown';
    if (id === 5003) return 'Mantle Testnet';
    if (id === 5000) return 'Mantle';
    if (id === 'solana-mainnet') return 'Solana';
    if (id === 'cardano-mainnet') return 'Cardano';
    if (id === 'polkadot') return 'Polkadot';
    return `Chain ${id}`;
  };

  return (
    <div className="relative">
      {/* Main Button */}
      {!connectedWallet ? (
        // Not Connected - Show Connect Button
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
        // Connected - Show Wallet Info
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
              {/* Wallet Info */}
              <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: COLORS.slateGrey }}>
                <span className="text-3xl">{connectedWallet.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">{connectedWallet.name}</div>
                  <div className="text-xs text-gray-400">{getNetworkName(chainId)}</div>
                </div>
              </div>

              {/* Address */}
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

              {/* Balance */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Balance</div>
                <div className="font-mono text-lg font-bold" style={{ color: COLORS.maxionGreen }}>
                  {balance} {chainId === 'solana-mainnet' ? 'SOL' : 'MNT'}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setIsOpen(true)}
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
        )}
      </AnimatePresence>

      {/* Wallet Selection Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isConnecting && setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl shadow-2xl z-50"
              style={{ backgroundColor: COLORS.graphitePanel }}
            >
              {/* Header */}
              <div className="p-6 border-b" style={{ borderColor: COLORS.slateGrey }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Choose your preferred wallet to continue
                    </p>
                  </div>
                  <button
                    onClick={() => !isConnecting && setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pt-4"
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: `${COLORS.warningAmber}20` }}>
                    <AlertCircle size={20} style={{ color: COLORS.warningAmber }} className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: COLORS.warningAmber }}>Note</div>
                      <div className="text-xs text-gray-300 mt-1">{error}</div>
                    </div>
                    <button
                      onClick={() => setError('')}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Wallet List */}
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {WALLET_CONFIGS.map((wallet, idx) => {
                    const isDetected = wallet.detectMethod();
                    const isDisabled = isConnecting;

                    return (
                      <motion.button
                        key={wallet.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={!isDisabled ? { scale: 1.02, x: 4 } : {}}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                        onClick={() => !isDisabled && handleWalletConnect(wallet.id)}
                        disabled={isDisabled}
                        className="w-full p-4 rounded-xl border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Footer */}
              <div className="p-4 border-t space-y-3" style={{ borderColor: COLORS.slateGrey }}>
                {/* Localhost Warning */}
                {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                  <div className="flex items-start gap-2 p-3 rounded-lg text-xs" style={{ backgroundColor: `${COLORS.signalCyan}10` }}>
                    <AlertCircle size={14} style={{ color: COLORS.signalCyan }} className="flex-shrink-0 mt-0.5" />
                    <div style={{ color: COLORS.signalCyan }}>
                      <span className="font-semibold">Running on localhost:</span> Some wallets (like Phantom) may have limited functionality. Deploy to a public URL for full wallet support.
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-center text-gray-400">
                  By connecting, you agree to MAXION's Terms of Service
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
          </>
        )}
      </AnimatePresence>

      {/* Demo Mode Indicator (when not connected) */}
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
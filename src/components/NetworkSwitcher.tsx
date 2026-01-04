// src/components/NetworkSwitcher.tsx
// Network switching between Mantle Testnet and Mainnet
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { mantleTestnet, mantleMainnet } from '@/lib/web3/config';

const COLORS = {
  maxionGreen: '#3EF3A3',
  obsidianBlack: '#0B0E11',
  graphitePanel: '#161B22',
  slateGrey: '#1F2937',
  signalCyan: '#2BD9FE',
  warningAmber: '#FACC15',
};

interface NetworkConfig {
  chainId: number;
  name: string;
  shortName: string;
  icon: string;
  isTestnet: boolean;
}

const NETWORKS: NetworkConfig[] = [
  {
    chainId: 5003,
    name: 'Mantle Testnet',
    shortName: 'Testnet',
    icon: '🧪',
    isTestnet: true,
  },
  {
    chainId: 5000,
    name: 'Mantle Mainnet',
    shortName: 'Mainnet',
    icon: '🌐',
    isTestnet: false,
  },
];

export function NetworkSwitcher() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { chains, switchChain, isPending } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  if (!isConnected) return null;

  const currentNetwork = NETWORKS.find(n => n.chainId === chainId);

  const handleNetworkSwitch = async (targetChainId: number) => {
    setError('');
    try {
      await switchChain({ chainId: targetChainId });
      setIsOpen(false);
    } catch (err: any) {
      console.error('Network switch error:', err);
      setError(err.message || 'Failed to switch network');
    }
  };

  return (
    <div className="relative">
      {/* Current Network Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border"
        style={{
          backgroundColor: COLORS.graphitePanel,
          borderColor: currentNetwork?.isTestnet ? COLORS.warningAmber : COLORS.maxionGreen,
        }}
      >
        <Network size={16} style={{ color: currentNetwork?.isTestnet ? COLORS.warningAmber : COLORS.maxionGreen }} />
        <span className="text-sm font-medium text-white">
          {currentNetwork?.shortName || 'Unknown'}
        </span>
        {isPending && <Loader2 size={14} className="animate-spin" />}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-64 rounded-xl shadow-2xl border z-50"
              style={{
                backgroundColor: COLORS.graphitePanel,
                borderColor: COLORS.slateGrey,
              }}
            >
              <div className="p-3">
                <div className="text-xs font-semibold text-gray-400 mb-2 px-2">
                  SELECT NETWORK
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-2 p-2 rounded-lg flex items-start gap-2" style={{ backgroundColor: `${COLORS.warningAmber}20` }}>
                    <AlertCircle size={14} style={{ color: COLORS.warningAmber }} className="flex-shrink-0 mt-0.5" />
                    <p className="text-xs" style={{ color: COLORS.warningAmber }}>{error}</p>
                  </div>
                )}

                {/* Network Options */}
                <div className="space-y-1">
                  {NETWORKS.map((network) => {
                    const isActive = network.chainId === chainId;
                    const isAvailable = chains.some(c => c.id === network.chainId);

                    return (
                      <motion.button
                        key={network.chainId}
                        whileHover={!isActive && isAvailable ? { scale: 1.02, x: 4 } : {}}
                        whileTap={!isActive && isAvailable ? { scale: 0.98 } : {}}
                        onClick={() => !isActive && isAvailable && handleNetworkSwitch(network.chainId)}
                        disabled={isActive || !isAvailable || isPending}
                        className="w-full p-3 rounded-lg text-left transition-all disabled:opacity-50"
                        style={{
                          backgroundColor: isActive ? COLORS.slateGrey : 'transparent',
                          cursor: isActive || !isAvailable ? 'default' : 'pointer',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{network.icon}</span>
                            <div>
                              <div className="font-semibold text-white text-sm">
                                {network.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                Chain ID: {network.chainId}
                              </div>
                            </div>
                          </div>
                          {isActive && (
                            <Check size={18} style={{ color: COLORS.maxionGreen }} />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Warning for Testnet */}
                {currentNetwork?.isTestnet && (
                  <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: `${COLORS.warningAmber}20` }}>
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} style={{ color: COLORS.warningAmber }} className="flex-shrink-0 mt-0.5" />
                      <div className="text-xs" style={{ color: COLORS.warningAmber }}>
                        <span className="font-semibold">Testnet Active</span>
                        <p className="mt-1 opacity-80">Using test tokens. Switch to Mainnet for real assets.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact badge version for mobile
export function NetworkBadge() {
  const chainId = useChainId();
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  const currentNetwork = NETWORKS.find(n => n.chainId === chainId);

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: currentNetwork?.isTestnet ? `${COLORS.warningAmber}20` : `${COLORS.maxionGreen}20`,
        color: currentNetwork?.isTestnet ? COLORS.warningAmber : COLORS.maxionGreen,
      }}
    >
      <span>{currentNetwork?.icon}</span>
      <span>{currentNetwork?.shortName}</span>
    </div>
  );
}
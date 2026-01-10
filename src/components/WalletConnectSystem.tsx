// src/components/WalletConnectSystem.tsx
// FIXED: Proper modal centering, wallet reading, network detection
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Check, X, LogOut, Loader2, AlertCircle, ExternalLink, Zap, Eye } from 'lucide-react';
import { useAccount, useDisconnect, useBalance, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

const COLORS = {
  maxionGreen: '#3EF3A3',
  obsidianBlack: '#0B0E11',
  graphitePanel: '#161B22',
  slateGrey: '#1F2937',
  signalCyan: '#2BD9FE',
  riskRed: '#EF4444',
  warningAmber: '#FACC15',
};

interface WalletConnectSystemProps {
  onModeChange?: (mode: 'live' | 'demo', address?: string) => void;
  currentMode?: 'live' | 'demo';
}

export default function WalletConnectSystem({ onModeChange, currentMode = 'demo' }: WalletConnectSystemProps) {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { openConnectModal } = useConnectModal();
  
  const [showDisconnect, setShowDisconnect] = useState(false);

  // Update mode when connection changes
  useEffect(() => {
    if (onModeChange) {
      if (isConnected && address) {
        onModeChange('live', address);
      } else {
        onModeChange('demo');
      }
    }
  }, [isConnected, address, onModeChange]);

  const handleDisconnect = () => {
    disconnect();
    setShowDisconnect(false);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number) => {
    if (id === 5003) return 'Mantle Testnet';
    if (id === 5000) return 'Mantle Mainnet';
    if (id === 1) return 'Ethereum';
    return `Chain ${id}`;
  };

  const getWalletIcon = () => {
    const name = connector?.name?.toLowerCase() || '';
    if (name.includes('metamask')) return '🦊';
    if (name.includes('coinbase')) return '🔵';
    if (name.includes('phantom')) return '👻';
    if (name.includes('walletconnect')) return '🔗';
    return '💼';
  };

  return (
    <div className="relative">
      {!isConnected ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openConnectModal}
          className="px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2"
          style={{
            backgroundColor: COLORS.maxionGreen,
            color: COLORS.obsidianBlack,
          }}
        >
          <Wallet size={18} />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
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
          <span className="text-xl">{getWalletIcon()}</span>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-2">
              <span style={{ color: COLORS.maxionGreen }}>{formatAddress(address!)}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${COLORS.maxionGreen}20`, color: COLORS.maxionGreen }}>
                <Zap size={10} className="inline" /> LIVE
              </span>
            </div>
            <div className="text-xs text-gray-400">{balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}</div>
          </div>
          <span className="sm:hidden" style={{ color: COLORS.maxionGreen }}>{formatAddress(address!)}</span>
          <ChevronDown size={16} />
        </motion.button>
      )}

      {/* Disconnect Dropdown */}
      <AnimatePresence>
        {showDisconnect && isConnected && (
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
                  <span className="text-3xl">{getWalletIcon()}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{connector?.name}</div>
                    <div className="text-xs text-gray-400">{getNetworkName(chainId)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Address</div>
                  <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: COLORS.slateGrey }}>
                    <span className="font-mono text-sm" style={{ color: COLORS.maxionGreen }}>
                      {formatAddress(address!)}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(address!)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Balance</div>
                  <div className="font-mono text-lg font-bold" style={{ color: COLORS.maxionGreen }}>
                    {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}
                  </div>
                </div>

                <div className="space-y-2">
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

      {/* Demo Mode Badge */}
      {!isConnected && (
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
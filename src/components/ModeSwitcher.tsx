// src/components/ModeSwitcher.tsx
// Location: src/components/ModeSwitcher.tsx
// Toggle between Live (real wallet) and Demo (mock data) modes

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Eye, Info } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface ModeSwitcherProps {
  mode: 'live' | 'demo';
  onModeChange: (mode: 'live' | 'demo') => void;
  walletConnected?: boolean;
}

export function ModeSwitcher({ mode, onModeChange, walletConnected = false }: ModeSwitcherProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative">
      {/* Mode Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Mode:</span>
        <div 
          className="relative flex items-center p-1 rounded-lg"
          style={{ backgroundColor: COLORS.slateGrey }}
        >
          {/* Background Slider */}
          <motion.div
            className="absolute h-8 rounded-md"
            style={{ backgroundColor: COLORS.maxionGreen }}
            initial={false}
            animate={{
              x: mode === 'demo' ? 0 : '100%',
              width: mode === 'demo' ? '50%' : '50%',
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          />

          {/* Demo Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onModeChange('demo')}
            className="relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            style={{
              color: mode === 'demo' ? COLORS.obsidianBlack : '#9CA3AF',
            }}
          >
            <Eye size={16} />
            Demo
          </motion.button>

          {/* Live Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!walletConnected) {
                alert('Please connect your wallet to use Live mode');
                return;
              }
              onModeChange('live');
            }}
            className="relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            style={{
              color: mode === 'live' ? COLORS.obsidianBlack : '#9CA3AF',
            }}
          >
            <Zap size={16} />
            Live
          </motion.button>
        </div>

        {/* Info Icon */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <Info size={18} />
        </button>
      </div>

      {/* Info Tooltip */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 right-0 w-80 p-4 rounded-lg shadow-xl z-50"
          style={{ backgroundColor: COLORS.graphitePanel, border: `1px solid ${COLORS.slateGrey}` }}
        >
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Eye size={16} style={{ color: COLORS.signalCyan }} />
                <span className="font-semibold text-white">Demo Mode</span>
              </div>
              <p className="text-sm text-gray-400">
                Explore features with mock data. No wallet connection required.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} style={{ color: COLORS.maxionGreen }} />
                <span className="font-semibold text-white">Live Mode</span>
              </div>
              <p className="text-sm text-gray-400">
                Real transactions with your connected wallet. Requires wallet connection.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Mode Badge Component
export function ModeBadge({ mode }: { mode: 'live' | 'demo' }) {
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: mode === 'live' ? `${COLORS.maxionGreen}20` : `${COLORS.signalCyan}20`,
        color: mode === 'live' ? COLORS.maxionGreen : COLORS.signalCyan,
      }}
    >
      {mode === 'live' ? <Zap size={12} /> : <Eye size={12} />}
      {mode === 'live' ? 'LIVE' : 'DEMO'}
    </div>
  );
}
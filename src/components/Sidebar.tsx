// src/components/Sidebar.tsx
// Location: src/components/Sidebar.tsx
// Desktop fixed left sidebar navigation
// Responsive: Hidden on mobile (<768px), visible on desktop

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Shield } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  walletConnected: boolean;
}

const navItems = [
  { id: 'overview', icon: BarChart3, label: 'Overview' },
  { id: 'assets', icon: TrendingUp, label: 'RWA Assets' },
  { id: 'allocate', icon: Zap, label: 'Allocate' },
  { id: 'portfolio', icon: Shield, label: 'Portfolio' },
];

export function Sidebar({ activeView, setActiveView, walletConnected }: SidebarProps) {
  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r flex-col"
      style={{
        backgroundColor: COLORS.graphitePanel,
        borderColor: COLORS.slateGrey,
      }}
    >
      {/* Logo Section */}
      <div 
        className="p-6 border-b" 
        style={{ borderColor: COLORS.slateGrey }}
      >
        <h1 
          className="text-2xl font-bold"
          style={{ color: COLORS.maxionGreen }}
        >
          MAXION
        </h1>
        <p 
          className="text-xs mt-1 font-mono"
          style={{ color: COLORS.signalCyan }}
        >
          Intelligence for real yield
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
              style={{
                backgroundColor: isActive ? COLORS.slateGrey : 'transparent',
                color: isActive ? COLORS.maxionGreen : '#9CA3AF',
              }}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Wallet Status Section */}
      <div 
        className="p-4 border-t" 
        style={{ borderColor: COLORS.slateGrey }}
      >
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: COLORS.slateGrey }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: walletConnected ? COLORS.maxionGreen : COLORS.riskRed 
              }}
            />
            <span className="text-xs font-mono text-gray-400">
              {walletConnected ? 'Mantle Connected' : 'Not Connected'}
            </span>
          </div>
          {walletConnected && (
            <p 
              className="text-xs font-mono truncate"
              style={{ color: COLORS.maxionGreen }}
            >
              0x742d...35B3
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
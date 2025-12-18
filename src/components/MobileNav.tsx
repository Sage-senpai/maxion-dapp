// src/components/MobileNav.tsx
// Location: src/components/MobileNav.tsx
// Mobile bottom navigation bar
// Responsive: Visible only on mobile (<768px), hidden on desktop

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Shield } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const navItems = [
  { id: 'overview', icon: BarChart3, label: 'Overview' },
  { id: 'assets', icon: TrendingUp, label: 'Assets' },
  { id: 'allocate', icon: Zap, label: 'Allocate' },
  { id: 'portfolio', icon: Shield, label: 'Portfolio' },
];

export function MobileNav({ activeView, setActiveView }: MobileNavProps) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="md:hidden fixed bottom-0 left-0 right-0 border-t z-40 safe-area-inset-bottom"
      style={{
        backgroundColor: COLORS.graphitePanel,
        borderColor: COLORS.slateGrey,
      }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center w-full h-full gap-1"
              style={{
                color: isActive ? COLORS.maxionGreen : '#9CA3AF',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
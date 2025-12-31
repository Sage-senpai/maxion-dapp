// src/components/Portfolio/PortfolioView.tsx
// Location: src/components/Portfolio/PortfolioView.tsx
// Portfolio overview with active allocations
// Responsive: Card layout on mobile, table on desktop

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface PortfolioViewProps {
  mode?: 'live' | 'demo';
  walletAddress?: string;
}

export function PortfolioView({ mode = 'demo', walletAddress }: PortfolioViewProps)  {
  const allocations = [
    { asset: 'US Treasury Bond Pool', amount: 15000, apy: 4.2, duration: '6 months' },
    { asset: 'Real Estate Income Fund', amount: 20000, apy: 7.8, duration: '12 months' },
    { asset: 'Infrastructure Debt', amount: 10280, apy: 6.4, duration: '24 months' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-200">Your Portfolio</h2>

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: COLORS.graphitePanel }}>
          <div className="text-sm text-gray-400 mb-2">Total Allocated</div>
          <div className="font-mono text-3xl sm:text-4xl font-bold mb-1" style={{ color: COLORS.maxionGreen }}>
            $45,280
          </div>
          <div className="text-sm" style={{ color: COLORS.maxionGreen }}>
            +$3,264 lifetime yield
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: COLORS.graphitePanel }}>
          <div className="text-sm text-gray-400 mb-2">Weighted APY</div>
          <div className="font-mono text-3xl sm:text-4xl font-bold mb-1" style={{ color: COLORS.maxionGreen }}>
            6.8%
          </div>
          <div className="text-sm text-gray-400">
            Across 3 assets
          </div>
        </div>
      </div>

      {/* Allocations List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Active Allocations</h3>
        <div className="space-y-3">
          {allocations.map((alloc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: COLORS.graphitePanel,
                borderColor: COLORS.slateGrey,
              }}
            >
              {/* Desktop Layout */}
              <div className="hidden sm:flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-200">{alloc.asset}</h4>
                  <p className="text-sm text-gray-400 mt-1">Duration: {alloc.duration}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Allocated</div>
                    <div className="font-mono text-lg text-gray-200">
                      ${alloc.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">APY</div>
                    <div className="font-mono text-lg" style={{ color: COLORS.maxionGreen }}>
                      {alloc.apy}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Earned</div>
                    <div className="font-mono text-lg" style={{ color: COLORS.maxionGreen }}>
                      ${((alloc.amount * alloc.apy) / 100 / 12 * 2).toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="sm:hidden space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-200 mb-1">{alloc.asset}</h4>
                  <p className="text-xs text-gray-400">{alloc.duration}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-gray-500">Allocated</div>
                    <div className="font-mono text-sm text-gray-200">
                      ${(alloc.amount / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">APY</div>
                    <div className="font-mono text-sm" style={{ color: COLORS.maxionGreen }}>
                      {alloc.apy}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Earned</div>
                    <div className="font-mono text-sm" style={{ color: COLORS.maxionGreen }}>
                      ${((alloc.amount * alloc.apy) / 100 / 12 * 2).toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
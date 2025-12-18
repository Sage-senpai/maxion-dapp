// src/components/Assets/AssetTable.tsx
// Location: src/components/Assets/AssetTable.tsx
// RWA Assets table/grid view
// Responsive: Card layout on mobile, detailed cards on desktop

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, MOCK_RWA_ASSETS, RISK_COLOR_MAP } from '@/lib/constants';
import type { RWAAsset } from '@/lib/constants';

interface AssetTableProps {
  setAiPanelOpen: (open: boolean) => void;
  setSelectedAsset: (asset: RWAAsset) => void;
}

export function AssetTable({ setAiPanelOpen, setSelectedAsset }: AssetTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-200">Real-World Assets</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto"
          style={{
            backgroundColor: COLORS.maxionGreen,
            color: COLORS.obsidianBlack,
          }}
        >
          Compare Selected
        </motion.button>
      </div>

      <div className="grid gap-4">
        {MOCK_RWA_ASSETS.map((asset, idx) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="p-4 sm:p-6 rounded-xl border cursor-pointer"
            style={{
              backgroundColor: COLORS.graphitePanel,
              borderColor: COLORS.slateGrey,
            }}
            onClick={() => {
              setSelectedAsset(asset);
              setAiPanelOpen(true);
            }}
          >
            {/* Desktop Layout */}
            <div className="hidden sm:flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-200">{asset.name}</h3>
                  <RiskBadge risk={asset.risk} />
                </div>
                <p className="text-sm text-gray-400 mb-3">{asset.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type: </span>
                    <span className="text-gray-300">{asset.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration: </span>
                    <span className="text-gray-300">{asset.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Min: </span>
                    <span className="text-gray-300">${asset.minInvestment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex md:flex-col items-end gap-4 md:gap-2">
                <div className="text-right">
                  <div className="text-sm text-gray-500">APY</div>
                  <div className="font-mono text-3xl font-bold" style={{ color: COLORS.maxionGreen }}>
                    {asset.apy}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">TVL</div>
                  <div className="font-mono text-lg text-gray-300">
                    ${(asset.tvl / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="sm:hidden space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-200 mb-1">{asset.name}</h3>
                  <RiskBadge risk={asset.risk} />
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">APY</div>
                  <div className="font-mono text-2xl font-bold" style={{ color: COLORS.maxionGreen }}>
                    {asset.apy}%
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-400">{asset.description}</p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{asset.type}</span>
                <span className="text-gray-500">TVL: ${(asset.tvl / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Risk Badge Component
function RiskBadge({ risk }: { risk: string }) {
  const color = RISK_COLOR_MAP[risk as keyof typeof RISK_COLOR_MAP] || COLORS.warningAmber;
  
  return (
    <span
      className="px-2 py-1 rounded text-xs font-semibold inline-block"
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {risk} Risk
    </span>
  );
}
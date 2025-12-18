// src/components/Assets/AssetCard.tsx
// Location: src/components/Assets/AssetCard.tsx
// Individual RWA asset card component with hover effects

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Clock, DollarSign } from 'lucide-react';
import { COLORS, RISK_COLOR_MAP } from '@/lib/constants';
import type { RWAAsset } from '@/lib/constants';

interface AssetCardProps {
  asset: RWAAsset;
  onSelect?: (asset: RWAAsset) => void;
  selected?: boolean;
  variant?: 'default' | 'compact';
}

export function AssetCard({
  asset,
  onSelect,
  selected = false,
  variant = 'default',
}: AssetCardProps) {
  if (variant === 'compact') {
    return <CompactAssetCard asset={asset} onSelect={onSelect} selected={selected} />;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(asset)}
      className={`p-6 rounded-xl border ${onSelect ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: COLORS.graphitePanel,
        borderColor: selected ? COLORS.maxionGreen : COLORS.slateGrey,
        borderWidth: selected ? 2 : 1,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-200 mb-1">{asset.name}</h3>
          <p className="text-sm text-gray-400">{asset.type}</p>
        </div>
        <RiskBadge risk={asset.risk} />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{asset.description}</p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* APY */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} style={{ color: COLORS.maxionGreen }} />
            <span className="text-xs text-gray-500">APY</span>
          </div>
          <div
            className="font-mono text-2xl font-bold"
            style={{ color: COLORS.maxionGreen }}
          >
            {asset.apy}%
          </div>
        </div>

        {/* TVL */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500">TVL</span>
          </div>
          <div className="font-mono text-xl text-gray-300">
            ${(asset.tvl / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: COLORS.slateGrey }}>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={12} />
          {asset.duration}
        </div>
        <div className="text-xs text-gray-400">
          Min: ${(asset.minInvestment / 1000).toFixed(0)}K
        </div>
      </div>
    </motion.div>
  );
}

// Compact variant for smaller spaces
function CompactAssetCard({
  asset,
  onSelect,
  selected,
}: Omit<AssetCardProps, 'variant'>) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect?.(asset)}
      className={`p-4 rounded-lg border ${onSelect ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: COLORS.graphitePanel,
        borderColor: selected ? COLORS.maxionGreen : COLORS.slateGrey,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-200 truncate">
            {asset.name}
          </h4>
        </div>
        <div
          className="font-mono text-lg font-bold ml-3"
          style={{ color: COLORS.maxionGreen }}
        >
          {asset.apy}%
        </div>
      </div>

      <div className="flex items-center justify-between">
        <RiskBadge risk={asset.risk} size="small" />
        <span className="text-xs text-gray-500">
          TVL: ${(asset.tvl / 1000000).toFixed(1)}M
        </span>
      </div>
    </motion.div>
  );
}

// Risk Badge Component
interface RiskBadgeProps {
  risk: string;
  size?: 'small' | 'default';
}

function RiskBadge({ risk, size = 'default' }: RiskBadgeProps) {
  const color = RISK_COLOR_MAP[risk as keyof typeof RISK_COLOR_MAP] || COLORS.warningAmber;

  return (
    <span
      className={`${
        size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } rounded font-semibold inline-flex items-center gap-1`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <Shield size={size === 'small' ? 10 : 12} />
      {risk}
    </span>
  );
}

// Grid layout wrapper
export function AssetCardGrid({ assets, onSelect, selectedId }: {
  assets: RWAAsset[];
  onSelect?: (asset: RWAAsset) => void;
  selectedId?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset, idx) => (
        <motion.div
          key={asset.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <AssetCard
            asset={asset}
            onSelect={onSelect}
            selected={selectedId === asset.id}
          />
        </motion.div>
      ))}
    </div>
  );
}
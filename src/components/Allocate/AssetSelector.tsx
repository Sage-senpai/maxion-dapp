// src/components/Allocate/AssetSelector.tsx
// Location: src/components/Allocate/AssetSelector.tsx
// Asset selection component for allocation flow
// Displays RWA assets with filtering and sorting

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { COLORS, MOCK_RWA_ASSETS, RISK_COLOR_MAP } from '@/lib/constants';
import type { RWAAsset } from '@/lib/constants';

interface AssetSelectorProps {
  onSelect: (asset: RWAAsset) => void;
  selectedAsset?: RWAAsset | null;
}

type SortOption = 'apy-high' | 'apy-low' | 'risk-low' | 'risk-high' | 'tvl-high';
type FilterOption = 'all' | 'low-risk' | 'medium-risk' | 'high-risk';

export function AssetSelector({ onSelect, selectedAsset }: AssetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('apy-high');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter assets
  const filteredAssets = MOCK_RWA_ASSETS.filter(asset => {
    // Search filter
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Risk filter
    if (filterBy === 'low-risk' && !asset.risk.includes('Low')) return false;
    if (filterBy === 'medium-risk' && !asset.risk.includes('Medium')) return false;
    if (filterBy === 'high-risk' && asset.risk.includes('Low')) return false;

    return true;
  });

  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'apy-high':
        return b.apy - a.apy;
      case 'apy-low':
        return a.apy - b.apy;
      case 'tvl-high':
        return b.tvl - a.tvl;
      case 'risk-low':
        return getRiskScore(a.risk) - getRiskScore(b.risk);
      case 'risk-high':
        return getRiskScore(b.risk) - getRiskScore(a.risk);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: COLORS.slateGrey,
              color: '#E5E7EB',
            }}
          />
        </div>

        {/* Filter Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          style={{
            backgroundColor: showFilters ? COLORS.maxionGreen : COLORS.slateGrey,
            color: showFilters ? COLORS.obsidianBlack : '#E5E7EB',
          }}
        >
          <Filter size={16} />
          Filters
        </motion.button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-lg space-y-4"
          style={{ backgroundColor: COLORS.graphitePanel }}
        >
          {/* Sort Options */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">
              Sort By
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { value: 'apy-high', label: 'Highest APY', icon: TrendingUp },
                { value: 'apy-low', label: 'Lowest APY', icon: TrendingDown },
                { value: 'risk-low', label: 'Lowest Risk', icon: TrendingDown },
                { value: 'risk-high', label: 'Highest Risk', icon: TrendingUp },
                { value: 'tvl-high', label: 'Highest TVL', icon: TrendingUp },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSortBy(option.value as SortOption)}
                    className="px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                    style={{
                      backgroundColor:
                        sortBy === option.value ? COLORS.maxionGreen : COLORS.slateGrey,
                      color: sortBy === option.value ? COLORS.obsidianBlack : '#9CA3AF',
                    }}
                  >
                    <Icon size={14} />
                    {option.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Risk Filter */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">
              Risk Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'low-risk', label: 'Low Risk' },
                { value: 'medium-risk', label: 'Medium Risk' },
                { value: 'high-risk', label: 'High Risk' },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterBy(option.value as FilterOption)}
                  className="px-3 py-2 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor:
                      filterBy === option.value ? COLORS.signalCyan : COLORS.slateGrey,
                    color: filterBy === option.value ? COLORS.obsidianBlack : '#9CA3AF',
                  }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {sortedAssets.length} asset{sortedAssets.length !== 1 ? 's' : ''} found
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-medium"
            style={{ color: COLORS.maxionGreen }}
          >
            Clear search
          </button>
        )}
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        {sortedAssets.length === 0 ? (
          <div
            className="p-8 rounded-lg text-center"
            style={{ backgroundColor: COLORS.graphitePanel }}
          >
            <p className="text-gray-400">No assets found matching your criteria</p>
          </div>
        ) : (
          sortedAssets.map((asset, idx) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(asset)}
              className="p-4 rounded-lg border cursor-pointer"
              style={{
                backgroundColor: COLORS.graphitePanel,
                borderColor:
                  selectedAsset?.id === asset.id ? COLORS.maxionGreen : COLORS.slateGrey,
                borderWidth: selectedAsset?.id === asset.id ? 2 : 1,
              }}
            >
              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-200">{asset.name}</h4>
                    <RiskBadge risk={asset.risk} />
                  </div>
                  <p className="text-sm text-gray-400">{asset.type}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">APY</div>
                    <div
                      className="font-mono text-xl font-bold"
                      style={{ color: COLORS.maxionGreen }}
                    >
                      {asset.apy}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">TVL</div>
                    <div className="font-mono text-sm text-gray-300">
                      ${(asset.tvl / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="sm:hidden space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-200 text-sm mb-1">
                      {asset.name}
                    </h4>
                    <RiskBadge risk={asset.risk} />
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-xs text-gray-500">APY</div>
                    <div
                      className="font-mono text-lg font-bold"
                      style={{ color: COLORS.maxionGreen }}
                    >
                      {asset.apy}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{asset.type}</span>
                  <span>TVL: ${(asset.tvl / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// Risk Badge Component
function RiskBadge({ risk }: { risk: string }) {
  const color = RISK_COLOR_MAP[risk as keyof typeof RISK_COLOR_MAP] || COLORS.warningAmber;

  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-semibold inline-block"
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {risk}
    </span>
  );
}

// Helper function to get numeric risk score
function getRiskScore(risk: string): number {
  const scores: Record<string, number> = {
    Low: 1,
    'Low-Medium': 2,
    Medium: 3,
    'Medium-High': 4,
    High: 5,
  };
  return scores[risk] || 3;
}
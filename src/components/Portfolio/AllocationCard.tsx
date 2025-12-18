// src/components/Portfolio/AllocationCard.tsx
// Location: src/components/Portfolio/AllocationCard.tsx
// Individual allocation display card for portfolio view

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign, ExternalLink, MoreVertical } from 'lucide-react';
import { COLORS, RISK_COLOR_MAP } from '@/lib/constants';

interface AllocationCardProps {
  allocation: {
    id: string;
    assetName: string;
    assetType: string;
    amount: number;
    shares: number;
    apy: number;
    riskLevel: string;
    duration: string;
    timestamp: Date | string;
    earned?: number;
    txHash?: string;
  };
  onViewDetails?: () => void;
  variant?: 'default' | 'compact';
}

export function AllocationCard({
  allocation,
  onViewDetails,
  variant = 'default',
}: AllocationCardProps) {
  const earned = allocation.earned || (allocation.amount * allocation.apy) / 100 / 6; // 2 months est.

  if (variant === 'compact') {
    return <CompactAllocationCard allocation={allocation} earned={earned} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="p-6 rounded-xl border"
      style={{
        backgroundColor: COLORS.graphitePanel,
        borderColor: COLORS.slateGrey,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-200 mb-1">
            {allocation.assetName}
          </h3>
          <p className="text-sm text-gray-400">{allocation.assetType}</p>
        </div>

        {/* Actions Menu */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-gray-400 hover:text-gray-200"
        >
          <MoreVertical size={20} />
        </motion.button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Allocated Amount */}
        <MetricBox
          icon={DollarSign}
          label="Allocated"
          value={`$${allocation.amount.toLocaleString()}`}
          mono
        />

        {/* APY */}
        <MetricBox
          icon={TrendingUp}
          label="APY"
          value={`${allocation.apy}%`}
          valueColor={COLORS.maxionGreen}
          mono
        />

        {/* Earned */}
        <MetricBox
          icon={TrendingUp}
          label="Earned"
          value={`$${earned.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          valueColor={COLORS.maxionGreen}
          mono
        />

        {/* Duration */}
        <MetricBox
          icon={Calendar}
          label="Duration"
          value={allocation.duration}
        />
      </div>

      {/* Risk & Shares */}
      <div className="flex items-center justify-between py-3 border-t border-b mb-4" style={{ borderColor: COLORS.slateGrey }}>
        <div>
          <span className="text-xs text-gray-500">Risk Level</span>
          <div className="mt-1">
            <RiskBadge risk={allocation.riskLevel} />
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">Vault Shares</span>
          <div className="font-mono text-sm text-gray-300 mt-1">
            {allocation.shares.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Allocated{' '}
          {new Date(allocation.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>

        <div className="flex items-center gap-2">
          {allocation.txHash && (
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href={`https://explorer.testnet.mantle.xyz/tx/${allocation.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1"
              style={{ color: COLORS.maxionGreen }}
            >
              View TX <ExternalLink size={12} />
            </motion.a>
          )}

          {onViewDetails && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewDetails}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: COLORS.slateGrey,
                color: COLORS.maxionGreen,
              }}
            >
              Details
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Compact variant
function CompactAllocationCard({
  allocation,
  earned,
}: {
  allocation: AllocationCardProps['allocation'];
  earned: number;
}) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: COLORS.graphitePanel,
        borderColor: COLORS.slateGrey,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-200 truncate">
            {allocation.assetName}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">{allocation.assetType}</p>
        </div>
        <RiskBadge risk={allocation.riskLevel} />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xs text-gray-500 mb-1">Allocated</div>
          <div className="font-mono text-sm text-gray-200">
            ${(allocation.amount / 1000).toFixed(0)}K
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">APY</div>
          <div
            className="font-mono text-sm font-semibold"
            style={{ color: COLORS.maxionGreen }}
          >
            {allocation.apy}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Earned</div>
          <div
            className="font-mono text-sm"
            style={{ color: COLORS.maxionGreen }}
          >
            ${earned.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Box Component
interface MetricBoxProps {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
}

function MetricBox({ icon: Icon, label, value, valueColor, mono }: MetricBoxProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={14} style={{ color: valueColor || '#9CA3AF' }} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div
        className={`text-lg font-semibold ${mono ? 'font-mono' : ''}`}
        style={{ color: valueColor || '#E5E7EB' }}
      >
        {value}
      </div>
    </div>
  );
}

// Risk Badge
function RiskBadge({ risk }: { risk: string }) {
  const color = RISK_COLOR_MAP[risk as keyof typeof RISK_COLOR_MAP] || COLORS.warningAmber;

  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-semibold"
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {risk}
    </span>
  );
}

// Grid layout for multiple allocations
export function AllocationCardGrid({
  allocations,
}: {
  allocations: AllocationCardProps['allocation'][];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allocations.map((allocation, idx) => (
        <motion.div
          key={allocation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <AllocationCard allocation={allocation} />
        </motion.div>
      ))}
    </div>
  );
}
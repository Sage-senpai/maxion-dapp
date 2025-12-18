// src/components/Dashboard/StatCard.tsx
// Location: src/components/Dashboard/StatCard.tsx
// Reusable stat card component for dashboard metrics

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  positive?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  change,
  subtitle,
  icon: Icon,
  iconColor = COLORS.maxionGreen,
  positive = true,
  loading = false,
  onClick,
}: StatCardProps) {
  const cardContent = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-gray-400">{label}</span>
        {Icon && (
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <Icon size={20} style={{ color: iconColor }} />
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-2">
        {loading ? (
          <div
            className="h-9 w-32 rounded animate-pulse"
            style={{ backgroundColor: COLORS.slateGrey }}
          />
        ) : (
          <div
            className="font-mono text-2xl sm:text-3xl font-bold"
            style={{ color: COLORS.maxionGreen }}
          >
            {value}
          </div>
        )}
      </div>

      {/* Change/Subtitle */}
      {loading ? (
        <div
          className="h-4 w-20 rounded animate-pulse"
          style={{ backgroundColor: COLORS.slateGrey }}
        />
      ) : (
        <>
          {change && (
            <span
              className="text-sm font-medium"
              style={{
                color: positive ? COLORS.maxionGreen : COLORS.riskRed,
              }}
            >
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-sm text-gray-400 block mt-1">
              {subtitle}
            </span>
          )}
        </>
      )}
    </>
  );

  return (
    <motion.div
      whileHover={onClick ? { y: -4, scale: 1.02 } : { y: -4 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`p-4 sm:p-6 rounded-xl border ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: COLORS.graphitePanel,
        borderColor: COLORS.slateGrey,
      }}
    >
      {cardContent}
    </motion.div>
  );
}

// Preset stat card variants
export function BalanceCard({ balance, change }: { balance: string; change: string }) {
  return (
    <StatCard
      label="Total Balance"
      value={balance}
      change={change}
      positive={change.startsWith('+')}
    />
  );
}

export function APYCard({ apy, subtitle }: { apy: string; subtitle?: string }) {
  return (
    <StatCard
      label="Average APY"
      value={apy}
      subtitle={subtitle}
    />
  );
}

export function RiskCard({ risk, subtitle }: { risk: string; subtitle?: string }) {
  return (
    <StatCard
      label="Risk Profile"
      value={risk}
      subtitle={subtitle}
      iconColor={COLORS.signalCyan}
    />
  );
}
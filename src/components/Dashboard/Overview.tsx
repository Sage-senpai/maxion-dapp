// src/components/Dashboard/Overview.tsx
// Location: src/components/Dashboard/Overview.tsx
// Main dashboard overview with stats and AI insights
// Responsive: Grid stacks on mobile, 3 columns on desktop

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Shield, Brain, ChevronRight } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface OverviewProps {
  setAiPanelOpen: (open: boolean) => void;
}

export function Overview({ setAiPanelOpen }: OverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid - Responsive: 1 col mobile, 3 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Value"
          value="$45,280"
          change="+12.4%"
          icon={TrendingUp}
          positive
        />
        <StatCard
          label="Average APY"
          value="7.2%"
          subtitle="Across 4 assets"
          icon={Activity}
        />
        <StatCard
          label="Risk Profile"
          value="Conservative"
          subtitle="AI-calibrated"
          icon={Shield}
          color={COLORS.signalCyan}
        />
      </div>

      {/* AI Insight Card - Click to open AI panel */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="p-4 sm:p-6 rounded-xl border cursor-pointer"
        style={{
          backgroundColor: COLORS.graphitePanel,
          borderColor: COLORS.slateGrey,
        }}
        onClick={() => setAiPanelOpen(true)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={20} style={{ color: COLORS.signalCyan }} />
              <span className="text-sm font-semibold" style={{ color: COLORS.signalCyan }}>
                AI Analysis
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-3">
              Your portfolio shows strong diversification across low-to-medium risk RWA assets. 
              The US Treasury allocation provides stability while the Real Estate fund offers growth potential.
            </p>
            <motion.button
              whileHover={{ x: 4 }}
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: COLORS.maxionGreen }}
            >
              Ask AI Analyst <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div 
        className="p-4 sm:p-6 rounded-xl border"
        style={{
          backgroundColor: COLORS.graphitePanel,
          borderColor: COLORS.slateGrey,
        }}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Recent Activity</h3>
        <div className="space-y-3">
          <ActivityItem
            action="Allocated"
            amount="$10,000"
            asset="US Treasury Bond Pool"
            time="2 hours ago"
          />
          <ActivityItem
            action="Yield Claimed"
            amount="$124.50"
            asset="Real Estate Income Fund"
            time="1 day ago"
          />
          <ActivityItem
            action="Allocated"
            amount="$5,000"
            asset="Infrastructure Debt"
            time="3 days ago"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ label, value, change, subtitle, icon: Icon, positive, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-4 sm:p-6 rounded-xl border"
      style={{
        backgroundColor: COLORS.graphitePanel,
        borderColor: COLORS.slateGrey,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-gray-400">{label}</span>
        {Icon && <Icon size={20} style={{ color: color || COLORS.maxionGreen }} />}
      </div>
      <div className="font-mono text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.maxionGreen }}>
        {value}
      </div>
      {change && (
        <span
          className="text-sm font-medium"
          style={{ color: positive ? COLORS.maxionGreen : COLORS.riskRed }}
        >
          {change}
        </span>
      )}
      {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
    </motion.div>
  );
}

// Activity Item Component
function ActivityItem({ action, amount, asset, time }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 truncate">
          <span className="font-medium">{action}</span> {amount}
        </p>
        <p className="text-xs text-gray-500 mt-1 truncate">{asset}</p>
      </div>
      <span className="text-xs text-gray-500 ml-4 flex-shrink-0">{time}</span>
    </div>
  );
}
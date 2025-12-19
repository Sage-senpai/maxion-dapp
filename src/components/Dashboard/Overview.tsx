// src/components/Dashboard/Overview.tsx
// Location: src/components/Dashboard/Overview.tsx
// UPDATED: Add mode prop and conditional data loading

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Shield, Brain, ChevronRight } from 'lucide-react';
import { COLORS } from '@/lib/constants';
import { userAPI, allocationAPI } from '@/lib/api';

interface OverviewProps {
  setAiPanelOpen: (open: boolean) => void;
  mode: 'live' | 'demo';
  walletAddress?: string;
}

// Mock data for demo mode
const DEMO_STATS = {
  totalValue: 45280,
  averageAPY: 7.2,
  riskProfile: 'Conservative',
  activities: [
    { action: 'Allocated', amount: '$10,000', asset: 'US Treasury Bond Pool', time: '2 hours ago' },
    { action: 'Yield Claimed', amount: '$124.50', asset: 'Real Estate Income Fund', time: '1 day ago' },
    { action: 'Allocated', amount: '$5,000', asset: 'Infrastructure Debt', time: '3 days ago' },
  ],
};

export function Overview({ setAiPanelOpen, mode, walletAddress }: OverviewProps) {
  const [stats, setStats] = useState(DEMO_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load real data in live mode
    if (mode === 'live' && walletAddress) {
      loadLiveData();
    } else {
      // Use demo data
      setStats(DEMO_STATS);
    }
  }, [mode, walletAddress]);

  const loadLiveData = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      // Fetch user data from API
      const userData = await userAPI.getUser(walletAddress);
      const allocationsData = await allocationAPI.getAllocations(walletAddress);

      setStats({
        totalValue: userData.user.totalDeposited || 0,
        averageAPY: allocationsData.stats.averageAPY || 0,
        riskProfile: userData.user.riskProfile || 'Balanced',
        activities: allocationsData.allocations.slice(0, 3).map(a => ({
          action: 'Allocated',
          amount: `$${a.amount.toLocaleString()}`,
          asset: a.assetName,
          time: new Date(a.timestamp).toLocaleDateString(),
        })),
      });
    } catch (error) {
      console.error('Failed to load live data:', error);
      // Fallback to demo data
      setStats(DEMO_STATS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          change="+12.4%"
          icon={TrendingUp}
          positive
          loading={loading}
        />
        <StatCard
          label="Average APY"
          value={`${stats.averageAPY}%`}
          subtitle="Across 4 assets"
          icon={Activity}
          loading={loading}
        />
        <StatCard
          label="Risk Profile"
          value={stats.riskProfile}
          subtitle={mode === 'live' ? 'AI-calibrated' : 'Demo profile'}
          icon={Shield}
          color={COLORS.signalCyan}
          loading={loading}
        />
      </div>

      {/* AI Insight Card */}
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
              {mode === 'live' 
                ? 'Your portfolio shows strong diversification across low-to-medium risk RWA assets.'
                : 'In demo mode: Explore AI analysis features with sample portfolio data.'}
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
          {stats.activities.map((activity, idx) => (
            <ActivityItem key={idx} {...activity} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// StatCard Component
function StatCard({ label, value, change, subtitle, icon: Icon, positive, color, loading }: any) {
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
      {loading ? (
        <div className="h-8 w-32 rounded animate-pulse" style={{ backgroundColor: COLORS.slateGrey }} />
      ) : (
        <>
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
        </>
      )}
    </motion.div>
  );
}

// ActivityItem Component
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
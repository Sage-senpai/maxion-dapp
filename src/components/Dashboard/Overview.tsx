// src/components/Dashboard/Overview.tsx
// FIXED: Auto-create user if not found, proper error handling, better mode switching
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Shield, Brain, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset to demo data when switching to demo mode
    if (mode === 'demo') {
      setStats(DEMO_STATS);
      setError(null);
      return;
    }

    // Load real data in live mode
    if (mode === 'live' && walletAddress) {
      loadLiveData();
    }
  }, [mode, walletAddress]);

  const loadLiveData = async () => {
    if (!walletAddress) {
      setError('Wallet address not available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Loading live data for wallet:', walletAddress);
      
      // Step 1: Try to get user, create if doesn't exist
      let userData;
      try {
        console.log('🔍 Fetching user...');
        userData = await userAPI.getUser(walletAddress);
        console.log('✅ User found:', userData);
      } catch (fetchError: any) {
        // User not found, create them
        if (fetchError.message.includes('User not found') || fetchError.message.includes('404')) {
          console.log('👤 User not found, creating new user...');
          
          try {
            const createResponse = await userAPI.createUser({
              walletAddress,
              riskProfile: 'balanced',
            });
            console.log('✅ User created:', createResponse);
            
            // Fetch the newly created user
            userData = await userAPI.getUser(walletAddress);
            console.log('✅ New user fetched:', userData);
          } catch (createError: any) {
            console.error('❌ Failed to create user:', createError);
            throw new Error('Failed to create user account. Please try again.');
          }
        } else {
          throw fetchError;
        }
      }

      // Step 2: Fetch allocations
      console.log('📈 Fetching allocations...');
      const allocationsData = await allocationAPI.getAllocations(walletAddress);
      console.log('✅ Allocations fetched:', allocationsData);

      // Step 3: Update stats
      const newStats = {
        totalValue: userData.user.totalDeposited || 0,
        averageAPY: allocationsData.stats.averageAPY || 0,
        riskProfile: formatRiskProfile(userData.user.riskProfile) || 'Balanced',
        activities: allocationsData.allocations.slice(0, 3).map(a => ({
          action: 'Allocated',
          amount: `$${a.amount.toLocaleString()}`,
          asset: a.assetName,
          time: formatRelativeTime(new Date(a.timestamp)),
        })),
      };

      console.log('✅ Stats updated:', newStats);
      setStats(newStats);
      
    } catch (error: any) {
      console.error('💥 Failed to load live data:', error);
      const errorMessage = error.message || 'Failed to load wallet data';
      setError(errorMessage);
      
      // Show user-friendly error
      alert(`⚠️ Error Loading Data\n\n${errorMessage}\n\nFalling back to demo data.`);
      
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
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border flex items-start gap-3"
          style={{
            backgroundColor: `${COLORS.warningAmber}10`,
            borderColor: COLORS.warningAmber,
          }}
        >
          <AlertCircle size={20} style={{ color: COLORS.warningAmber }} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: COLORS.warningAmber }}>
              Unable to Load Live Data
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {error}. Showing demo data instead.
            </p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Mode Indicator */}
      {mode === 'live' && walletAddress && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.maxionGreen }} />
          <span className="text-gray-400">
            Connected: <span style={{ color: COLORS.maxionGreen }} className="font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-lg"
          style={{ backgroundColor: COLORS.graphitePanel }}
        >
          <Loader2 size={20} className="animate-spin" style={{ color: COLORS.maxionGreen }} />
          <span className="text-sm text-gray-300">Loading your wallet data...</span>
        </motion.div>
      )}

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
          value={`${stats.averageAPY.toFixed(1)}%`}
          subtitle="Across portfolio"
          icon={Activity}
          loading={loading}
        />
        <StatCard
          label="Risk Profile"
          value={stats.riskProfile}
          subtitle={mode === 'live' ? 'Your profile' : 'Demo profile'}
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
                ? `Analyzing your ${stats.activities.length} allocation${stats.activities.length !== 1 ? 's' : ''}...`
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
        {stats.activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No activity yet</p>
            <p className="text-xs text-gray-500 mt-1">Make your first allocation to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.activities.map((activity, idx) => (
              <ActivityItem key={idx} {...activity} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Helper Components
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

// Helper Functions
function formatRiskProfile(profile: string): string {
  return profile.charAt(0).toUpperCase() + profile.slice(1);
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
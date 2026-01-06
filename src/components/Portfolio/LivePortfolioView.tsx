// src/components/Portfolio/LivePortfolioView.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { TrendingUp, DollarSign, Calendar, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { COLORS, RISK_COLOR_MAP } from '@/lib/constants';
import { 
  useVaultBalance, 
  useUserPosition, 
  useSharePrice,
  useTotalAssets,
  formatTokenAmount 
} from '@/lib/web3/hooks';
import { allocationAPI } from '@/lib/api';

interface LivePortfolioViewProps {
  mode: 'live' | 'demo';
  walletAddress?: string;
}

export function LivePortfolioView({ mode, walletAddress }: LivePortfolioViewProps) {
  const { isConnected, chainId } = useAccount();
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Contract reads - with proper type handling
  const { data: vaultBalance, refetch: refetchBalance } = useVaultBalance();
  const { data: userPosition, refetch: refetchPosition } = useUserPosition();
  const { data: sharePrice } = useSharePrice();
  const { data: totalAssets } = useTotalAssets();

  // Load allocations from database
  useEffect(() => {
    if (mode === 'live' && walletAddress && isConnected) {
      loadLiveData();
    }
  }, [mode, walletAddress, isConnected]);

  const loadLiveData = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await allocationAPI.getAllocations(walletAddress);
      setAllocations(response.allocations || []);
    } catch (err: any) {
      console.error('Failed to load allocations:', err);
      setError(err.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchBalance(),
      refetchPosition(),
      loadLiveData(),
    ]);
  };

  // FIXED: Calculate portfolio stats with proper type checking
  const totalShares = vaultBalance && typeof vaultBalance === 'bigint' 
    ? Number(formatTokenAmount(vaultBalance, 18)) 
    : 0;
  
  const totalValue = userPosition && typeof userPosition === 'object' && 'totalDeposited' in userPosition
    ? Number(formatTokenAmount(userPosition.totalDeposited as bigint, 6))
    : 0;
  
  const currentValue = sharePrice && vaultBalance && 
                       typeof sharePrice === 'bigint' && 
                       typeof vaultBalance === 'bigint'
    ? (Number(formatTokenAmount(vaultBalance, 18)) * Number(formatTokenAmount(sharePrice, 18)))
    : totalValue;
  
  const totalEarned = currentValue - totalValue;
  const weightedAPY = allocations.length > 0
    ? allocations.reduce((sum, a) => sum + (a.apy * a.amount), 0) / allocations.reduce((sum, a) => sum + a.amount, 0)
    : 0;

  // Demo mode fallback
  if (mode === 'demo') {
    return <DemoPortfolio />;
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 opacity-30" style={{ color: '#9CA3AF' }} />
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Wallet Not Connected</h3>
        <p className="text-sm text-gray-400">Connect your wallet to view your portfolio</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-200">Your Portfolio</h2>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-lg"
          style={{ backgroundColor: COLORS.slateGrey }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ color: COLORS.maxionGreen }} />
        </motion.button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg border flex items-start gap-3" style={{ backgroundColor: `${COLORS.warningAmber}10`, borderColor: COLORS.warningAmber }}>
          <AlertCircle size={20} style={{ color: COLORS.warningAmber }} />
          <p className="text-sm" style={{ color: COLORS.warningAmber }}>{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Value"
          value={`$${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          change={totalEarned >= 0 ? `+$${totalEarned.toFixed(2)}` : `-$${Math.abs(totalEarned).toFixed(2)}`}
          positive={totalEarned >= 0}
          loading={loading}
        />
        <StatCard
          label="Vault Shares"
          value={totalShares.toFixed(4)}
          subtitle="mxYLD tokens"
          loading={loading}
        />
        <StatCard
          label="Weighted APY"
          value={`${weightedAPY.toFixed(2)}%`}
          subtitle="Portfolio average"
          loading={loading}
        />
        <StatCard
          label="Total Earned"
          value={`$${totalEarned.toFixed(2)}`}
          positive={totalEarned >= 0}
          loading={loading}
        />
      </div>

      {/* Allocations List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Active Allocations</h3>
        
        {loading ? (
          <LoadingSkeleton />
        ) : allocations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {allocations.map((allocation, idx) => (
              <AllocationCard 
                key={allocation.id} 
                allocation={allocation} 
                index={idx}
                chainId={chainId}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ label, value, change, subtitle, positive, loading }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-4 sm:p-6 rounded-xl border"
      style={{ backgroundColor: COLORS.graphitePanel, borderColor: COLORS.slateGrey }}
    >
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      {loading ? (
        <div className="h-8 w-32 rounded animate-pulse" style={{ backgroundColor: COLORS.slateGrey }} />
      ) : (
        <>
          <div className="font-mono text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.maxionGreen }}>
            {value}
          </div>
          {change && (
            <span className="text-sm font-medium" style={{ color: positive ? COLORS.maxionGreen : COLORS.warningAmber }}>
              {change}
            </span>
          )}
          {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
        </>
      )}
    </motion.div>
  );
}

// Allocation Card Component
function AllocationCard({ allocation, index, chainId }: any) {
  const earned = (allocation.amount * allocation.apy / 100) * 0.1; // Simplified estimate

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-lg border"
      style={{ backgroundColor: COLORS.graphitePanel, borderColor: COLORS.slateGrey }}
    >
      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-200">{allocation.assetName}</h4>
            <RiskBadge risk={allocation.riskLevel} />
            <StatusBadge status={allocation.status} />
          </div>
          <p className="text-sm text-gray-400">
            Allocated {new Date(allocation.timestamp).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Metric label="Allocated" value={`$${allocation.amount.toLocaleString()}`} />
          <Metric label="APY" value={`${allocation.apy}%`} color={COLORS.maxionGreen} />
          <Metric label="Earned" value={`$${earned.toFixed(2)}`} color={COLORS.maxionGreen} />
          
          {allocation.txHash && (
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href={`https://explorer.${chainId === 5003 ? 'testnet.' : ''}mantle.xyz/tx/${allocation.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100"
            >
              <ExternalLink size={16} style={{ color: COLORS.maxionGreen }} />
            </motion.a>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-200 text-sm">{allocation.assetName}</h4>
            <StatusBadge status={allocation.status} />
          </div>
          <RiskBadge risk={allocation.riskLevel} />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Allocated" value={`$${(allocation.amount / 1000).toFixed(1)}k`} />
          <Metric label="APY" value={`${allocation.apy}%`} color={COLORS.maxionGreen} />
          <Metric label="Earned" value={`$${earned.toFixed(0)}`} color={COLORS.maxionGreen} />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(allocation.timestamp).toLocaleDateString()}</span>
          {allocation.txHash && (
            <a
              href={`https://explorer.${chainId === 5003 ? 'testnet.' : ''}mantle.xyz/tx/${allocation.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
              style={{ color: COLORS.maxionGreen }}
            >
              View TX <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Helper Components
function Metric({ label, value, color }: any) {
  return (
    <div className="text-right">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-mono text-sm font-semibold" style={{ color: color || '#E5E7EB' }}>
        {value}
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const color = RISK_COLOR_MAP[risk as keyof typeof RISK_COLOR_MAP] || COLORS.warningAmber;
  return (
    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: `${color}20`, color }}>
      {risk}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: COLORS.warningAmber,
    confirmed: COLORS.maxionGreen,
    failed: '#FF3B3B',
  };
  const color = colors[status as keyof typeof colors] || '#9CA3AF';
  
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${color}20`, color }}>
      {status}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: COLORS.graphitePanel }}>
          <div className="flex items-center gap-4">
            <div className="h-6 w-48 rounded animate-pulse" style={{ backgroundColor: COLORS.slateGrey }} />
            <div className="h-6 w-24 rounded animate-pulse" style={{ backgroundColor: COLORS.slateGrey }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: COLORS.graphitePanel, borderColor: COLORS.slateGrey }}>
      <DollarSign size={48} className="mx-auto mb-4 opacity-30" style={{ color: '#9CA3AF' }} />
      <h3 className="text-lg font-semibold text-gray-200 mb-2">No Allocations Yet</h3>
      <p className="text-sm text-gray-400 mb-4">Start allocating to RWA assets to build your portfolio</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.href = '/app?view=allocate'}
        className="px-6 py-2 rounded-lg font-medium"
        style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
      >
        Start Allocating
      </motion.button>
    </div>
  );
}

// Demo Portfolio Fallback
function DemoPortfolio() {
  const demoAllocations = [
    { id: '1', assetName: 'US Treasury Bond Pool', amount: 15000, apy: 4.2, riskLevel: 'Low', timestamp: new Date(), status: 'confirmed' },
    { id: '2', assetName: 'Real Estate Income Fund', amount: 20000, apy: 7.8, riskLevel: 'Medium', timestamp: new Date(), status: 'confirmed' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-200">Demo Portfolio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Value" value="$35,000" change="+$2,450" positive />
        <StatCard label="Weighted APY" value="6.3%" subtitle="Demo average" />
      </div>
      <div className="space-y-3">
        {demoAllocations.map((a, i) => (
          <AllocationCard key={a.id} allocation={a} index={i} chainId={5003} />
        ))}
      </div>
    </div>
  );
}
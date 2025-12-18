// src/components/Dashboard/ActivityFeed.tsx
// Location: src/components/Dashboard/ActivityFeed.tsx
// Recent activity feed showing user transactions and actions

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Clock, ExternalLink } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface Activity {
  id: string;
  type: 'deposit' | 'withdraw' | 'yield' | 'claim';
  action: string;
  amount: string;
  asset: string;
  timestamp: string;
  txHash?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  loading?: boolean;
  limit?: number;
}

// Mock activities for demo
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'deposit',
    action: 'Allocated',
    amount: '$10,000',
    asset: 'US Treasury Bond Pool',
    timestamp: '2 hours ago',
    txHash: '0x1234...5678',
  },
  {
    id: '2',
    type: 'yield',
    action: 'Yield Accrued',
    amount: '$42.50',
    asset: 'Real Estate Income Fund',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    type: 'claim',
    action: 'Yield Claimed',
    amount: '$124.50',
    asset: 'Real Estate Income Fund',
    timestamp: '1 day ago',
    txHash: '0xabcd...efgh',
  },
  {
    id: '4',
    type: 'deposit',
    action: 'Allocated',
    amount: '$5,000',
    asset: 'Infrastructure Debt',
    timestamp: '3 days ago',
    txHash: '0x9876...5432',
  },
  {
    id: '5',
    type: 'withdraw',
    action: 'Withdrawn',
    amount: '$2,500',
    asset: 'Corporate Credit Facility',
    timestamp: '1 week ago',
    txHash: '0xfedc...ba98',
  },
];

export function ActivityFeed({
  activities = MOCK_ACTIVITIES,
  loading = false,
  limit = 5,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, limit);

  return (
    <div
      className="p-4 sm:p-6 rounded-xl border"
      style={{
        backgroundColor: COLORS.graphitePanel,
        borderColor: COLORS.slateGrey,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">Recent Activity</h3>
        <button className="text-xs font-medium" style={{ color: COLORS.maxionGreen }}>
          View All
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : displayActivities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-1">
          {displayActivities.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

// Activity Item Component
function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'deposit':
        return TrendingUp;
      case 'withdraw':
        return TrendingDown;
      case 'yield':
      case 'claim':
        return DollarSign;
      default:
        return Clock;
    }
  };

  const getIconColor = () => {
    switch (activity.type) {
      case 'deposit':
        return COLORS.maxionGreen;
      case 'withdraw':
        return COLORS.warningAmber;
      case 'yield':
      case 'claim':
        return COLORS.signalCyan;
      default:
        return '#9CA3AF';
    }
  };

  const Icon = getIcon();
  const iconColor = getIconColor();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-black/20 transition-colors"
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <Icon size={16} style={{ color: iconColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 truncate">
              <span className="font-medium">{activity.action}</span>{' '}
              <span className="font-mono font-semibold" style={{ color: iconColor }}>
                {activity.amount}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.asset}</p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500">{activity.timestamp}</span>
            {activity.txHash && (
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href={`https://explorer.testnet.mantle.xyz/tx/${activity.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={12} style={{ color: COLORS.maxionGreen }} />
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div
            className="w-8 h-8 rounded-full animate-pulse"
            style={{ backgroundColor: COLORS.slateGrey }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 w-3/4 rounded animate-pulse"
              style={{ backgroundColor: COLORS.slateGrey }}
            />
            <div
              className="h-3 w-1/2 rounded animate-pulse"
              style={{ backgroundColor: COLORS.slateGrey }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-8">
      <Clock size={32} className="mx-auto mb-3 opacity-30" style={{ color: '#9CA3AF' }} />
      <p className="text-sm text-gray-400">No recent activity</p>
      <p className="text-xs text-gray-500 mt-1">
        Your transactions will appear here
      </p>
    </div>
  );
}

// Compact variant for smaller spaces
export function ActivityFeedCompact({ limit = 3 }: { limit?: number }) {
  return (
    <div className="space-y-2">
      {MOCK_ACTIVITIES.slice(0, limit).map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-300 truncate">
              <span className="font-medium">{activity.action}</span> {activity.amount}
            </p>
          </div>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {activity.timestamp}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
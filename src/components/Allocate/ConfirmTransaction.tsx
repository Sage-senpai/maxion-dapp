// src/components/Allocate/ConfirmTransaction.tsx
// Location: src/components/Allocate/ConfirmTransaction.tsx
// Final confirmation step with transaction details and gas estimates

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, CheckCircle2, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { COLORS, RISK_COLOR_MAP } from '@/lib/constants';
import type { RWAAsset } from '@/lib/constants';

interface ConfirmTransactionProps {
  asset: RWAAsset;
  amount: string;
  riskProfile: string;
  onConfirm: () => Promise<void>;
  onBack: () => void;
}

type TransactionStatus = 'pending' | 'confirming' | 'success' | 'error';

export function ConfirmTransaction({
  asset,
  amount,
  riskProfile,
  onConfirm,
  onBack,
}: ConfirmTransactionProps) {
  const [status, setStatus] = useState<TransactionStatus>('pending');
  const [txHash, setTxHash] = useState<string>('');

  const numAmount = parseFloat(amount);
  const estimatedYield = (numAmount * asset.apy) / 100;
  const estimatedShares = numAmount * 0.98; // Simplified calculation
  const gasEstimate = 0.02; // Mock gas estimate in MNT

  const handleConfirm = async () => {
    setStatus('confirming');
    
    try {
      await onConfirm();
      // Simulate transaction hash
      setTxHash('0x' + Math.random().toString(16).substr(2, 64));
      setStatus('success');
    } catch (error) {
      console.error('Transaction failed:', error);
      setStatus('error');
    }
  };

  // Pending state - show confirmation details
  if (status === 'pending') {
    return (
      <div className="space-y-6">
        <div
          className="p-6 rounded-xl space-y-4"
          style={{ backgroundColor: COLORS.graphitePanel }}
        >
          <h3 className="text-lg font-semibold text-gray-200">Confirm Allocation</h3>

          {/* Transaction Summary */}
          <div className="space-y-3">
            <DetailRow label="Asset" value={asset.name} />
            <DetailRow label="Type" value={asset.type} />
            <DetailRow
              label="Amount"
              value={`$${numAmount.toLocaleString()}`}
              valueColor={COLORS.maxionGreen}
              mono
            />
            <DetailRow
              label="APY"
              value={`${asset.apy}%`}
              valueColor={COLORS.maxionGreen}
              mono
            />
            <DetailRow
              label="Est. Annual Yield"
              value={`$${estimatedYield.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              valueColor={COLORS.maxionGreen}
              mono
            />
            <DetailRow
              label="Est. Shares"
              value={estimatedShares.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              mono
            />
            <DetailRow
              label="Risk Level"
              value={asset.risk}
              badge
              badgeColor={RISK_COLOR_MAP[asset.risk as keyof typeof RISK_COLOR_MAP]}
            />
            <DetailRow label="Duration" value={asset.duration} />
          </div>
        </div>

        {/* Risk & Profile Match */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: COLORS.graphitePanel }}
        >
          <div className="flex items-start gap-3">
            <Info size={20} style={{ color: COLORS.signalCyan }} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-2">Profile Match Analysis</p>
              <p>
                Your <span className="font-semibold capitalize">{riskProfile}</span> risk profile{' '}
                {getProfileMatch(riskProfile, asset.risk)}
              </p>
            </div>
          </div>
        </div>

        {/* Gas Estimate */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: COLORS.obsidianBlack }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Estimated Gas Fee</span>
            <span className="font-mono text-gray-300">~{gasEstimate} MNT</span>
          </div>
        </div>

        {/* Important Notice */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: `${COLORS.warningAmber}10`,
            borderColor: COLORS.warningAmber,
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              style={{ color: COLORS.warningAmber }}
              className="flex-shrink-0 mt-0.5"
            />
            <div className="text-sm" style={{ color: COLORS.warningAmber }}>
              <p className="font-semibold mb-1">Important</p>
              <ul className="space-y-1 text-xs">
                <li>• This transaction will be processed through the MAXION YieldVault</li>
                <li>• You'll receive mxYLD tokens representing your position</li>
                <li>• Funds will be locked for the specified duration</li>
                <li>• Make sure you have enough MNT for gas fees</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="flex-1 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: COLORS.slateGrey,
              color: '#9CA3AF',
            }}
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: COLORS.maxionGreen,
              color: COLORS.obsidianBlack,
            }}
          >
            Confirm Transaction
          </motion.button>
        </div>
      </div>
    );
  }

  // Confirming state
  if (status === 'confirming') {
    return (
      <div className="text-center py-12 space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <Loader2 size={48} style={{ color: COLORS.maxionGreen }} />
        </motion.div>
        <div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            Confirming Transaction
          </h3>
          <p className="text-sm text-gray-400">
            Please confirm the transaction in your wallet...
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <CheckCircle2 size={64} style={{ color: COLORS.maxionGreen }} className="mx-auto" />
        </motion.div>

        <div>
          <h3 className="text-2xl font-bold text-gray-200 mb-2">
            Transaction Successful!
          </h3>
          <p className="text-gray-400">
            Your allocation has been confirmed
          </p>
        </div>

        <div
          className="p-6 rounded-xl space-y-3 max-w-md mx-auto"
          style={{ backgroundColor: COLORS.graphitePanel }}
        >
          <div className="text-sm text-gray-400">Transaction Hash</div>
          <div className="flex items-center justify-center gap-2">
            <code className="text-xs font-mono" style={{ color: COLORS.signalCyan }}>
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </code>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href={`https://explorer.testnet.mantle.xyz/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.maxionGreen }}
            >
              <ExternalLink size={16} />
            </motion.a>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-400">
            Allocated: <span className="font-mono font-semibold text-gray-200">${numAmount.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-400">
            Est. Annual Yield: <span className="font-mono font-semibold" style={{ color: COLORS.maxionGreen }}>${estimatedYield.toLocaleString()}</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-lg font-medium"
          style={{
            backgroundColor: COLORS.maxionGreen,
            color: COLORS.obsidianBlack,
          }}
        >
          View Portfolio
        </motion.button>
      </motion.div>
    );
  }

  // Error state
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 space-y-6"
    >
      <AlertTriangle size={64} style={{ color: COLORS.riskRed }} className="mx-auto" />

      <div>
        <h3 className="text-2xl font-bold text-gray-200 mb-2">Transaction Failed</h3>
        <p className="text-gray-400">
          The transaction could not be completed
        </p>
      </div>

      <div
        className="p-4 rounded-lg max-w-md mx-auto text-sm text-left"
        style={{ backgroundColor: `${COLORS.riskRed}20`, color: COLORS.riskRed }}
      >
        <p className="font-semibold mb-2">Possible reasons:</p>
        <ul className="space-y-1 text-xs">
          <li>• Transaction rejected in wallet</li>
          <li>• Insufficient gas fees</li>
          <li>• Insufficient token balance</li>
          <li>• Network congestion</li>
        </ul>
      </div>

      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="px-6 py-3 rounded-lg font-medium"
          style={{
            backgroundColor: COLORS.slateGrey,
            color: '#9CA3AF',
          }}
        >
          Go Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStatus('pending')}
          className="px-6 py-3 rounded-lg font-medium"
          style={{
            backgroundColor: COLORS.maxionGreen,
            color: COLORS.obsidianBlack,
          }}
        >
          Try Again
        </motion.button>
      </div>
    </motion.div>
  );
}

// Helper Components
interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
  badge?: boolean;
  badgeColor?: string;
}

function DetailRow({ label, value, valueColor, mono, badge, badgeColor }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      {badge ? (
        <span
          className="px-2 py-1 rounded text-xs font-semibold"
          style={{
            backgroundColor: `${badgeColor}20`,
            color: badgeColor,
          }}
        >
          {value}
        </span>
      ) : (
        <span
          className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}
          style={{ color: valueColor || '#E5E7EB' }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

// Helper function for profile matching
function getProfileMatch(profile: string, riskLevel: string): string {
  if (profile === 'conservative' && riskLevel.includes('Low')) {
    return 'is well-matched with this low-risk asset.';
  }
  if (profile === 'conservative' && riskLevel.includes('High')) {
    return 'may find this asset more aggressive than preferred. Consider lower-risk alternatives.';
  }
  if (profile === 'aggressive' && riskLevel.includes('Low')) {
    return 'might seek higher-yield opportunities, though this provides stable returns.';
  }
  if (profile === 'balanced') {
    return 'is compatible with this asset\'s risk-return profile.';
  }
  return 'should carefully review the risk factors before proceeding.';
}
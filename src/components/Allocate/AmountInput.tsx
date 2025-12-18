// src/components/Allocate/AmountInput.tsx
// Location: src/components/Allocate/AmountInput.tsx
// Allocation amount input with validation and quick amounts

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Info, AlertCircle } from 'lucide-react';
import { COLORS } from '@/lib/constants';
import type { RWAAsset } from '@/lib/constants';

interface AmountInputProps {
  asset: RWAAsset;
  amount: string;
  onChange: (amount: string) => void;
  userBalance?: number; // User's available USDC balance
}

export function AmountInput({ asset, amount, onChange, userBalance = 50000 }: AmountInputProps) {
  const [error, setError] = useState<string>('');
  const [estimatedYield, setEstimatedYield] = useState<number>(0);

  // Validate amount
  useEffect(() => {
    const numAmount = parseFloat(amount);
    
    if (!amount || amount === '') {
      setError('');
      setEstimatedYield(0);
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      setEstimatedYield(0);
      return;
    }

    if (numAmount < asset.minInvestment) {
      setError(`Minimum investment is $${asset.minInvestment.toLocaleString()}`);
      setEstimatedYield(0);
      return;
    }

    if (numAmount > userBalance) {
      setError(`Insufficient balance. Available: $${userBalance.toLocaleString()}`);
      setEstimatedYield(0);
      return;
    }

    setError('');
    setEstimatedYield((numAmount * asset.apy) / 100);
  }, [amount, asset, userBalance]);

  // Quick amount buttons (25%, 50%, 75%, Max)
  const quickAmounts = [
    { label: '25%', value: Math.floor(userBalance * 0.25) },
    { label: '50%', value: Math.floor(userBalance * 0.5) },
    { label: '75%', value: Math.floor(userBalance * 0.75) },
    { label: 'Max', value: userBalance },
  ];

  const handleQuickAmount = (value: number) => {
    // Ensure minimum investment is met
    const finalAmount = Math.max(value, asset.minInvestment);
    onChange(finalAmount.toString());
  };

  return (
    <div className="space-y-4">
      {/* Asset Info Card */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: COLORS.graphitePanel }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-200 text-sm sm:text-base">
              {asset.name}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">{asset.type}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">APY</div>
            <div
              className="font-mono text-xl sm:text-2xl font-bold"
              style={{ color: COLORS.maxionGreen }}
            >
              {asset.apy}%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Duration: {asset.duration}</span>
          <span>Min: ${asset.minInvestment.toLocaleString()}</span>
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Allocation Amount
        </label>
        
        <div className="relative">
          <DollarSign
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => onChange(e.target.value)}
            placeholder="10000"
            min={asset.minInvestment}
            max={userBalance}
            className="w-full pl-12 pr-4 py-4 rounded-lg text-lg sm:text-xl font-mono outline-none"
            style={{
              backgroundColor: COLORS.slateGrey,
              color: error ? COLORS.riskRed : COLORS.maxionGreen,
              borderWidth: 2,
              borderColor: error ? COLORS.riskRed : 'transparent',
            }}
          />
        </div>

        {/* Error/Info Message */}
        {error ? (
          <div className="flex items-start gap-2 mt-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: COLORS.riskRed }} />
            <p className="text-sm" style={{ color: COLORS.riskRed }}>
              {error}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
            <span>Available: ${userBalance.toLocaleString()}</span>
            {amount && parseFloat(amount) >= asset.minInvestment && (
              <span>
                {((parseFloat(amount) / userBalance) * 100).toFixed(1)}% of balance
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Amount Buttons */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">
          Quick Select
        </label>
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((qa) => (
            <motion.button
              key={qa.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAmount(qa.value)}
              className="py-2.5 rounded-lg font-medium text-sm"
              style={{
                backgroundColor: COLORS.slateGrey,
                color: '#9CA3AF',
              }}
            >
              {qa.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Estimated Returns */}
      {estimatedYield > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-lg space-y-3"
          style={{ backgroundColor: COLORS.graphitePanel }}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Info size={16} style={{ color: COLORS.signalCyan }} />
            Estimated Returns
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Annual Yield</span>
              <span
                className="font-mono text-lg font-bold"
                style={{ color: COLORS.maxionGreen }}
              >
                ${estimatedYield.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Monthly (est.)</span>
              <span className="font-mono text-gray-300">
                ${(estimatedYield / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Daily (est.)</span>
              <span className="font-mono text-gray-300">
                ${(estimatedYield / 365).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div
            className="pt-3 border-t text-xs text-gray-500"
            style={{ borderColor: COLORS.slateGrey }}
          >
            * Estimates based on current {asset.apy}% APY. Actual returns may vary.
          </div>
        </motion.div>
      )}
    </div>
  );
}
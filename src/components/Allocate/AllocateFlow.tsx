// src/components/Allocate/AllocateFlow.tsx
// Location: src/components/Allocate/AllocateFlow.tsx
// 3-step allocation flow: Select Asset → Amount → Confirm
// Responsive: Full width on mobile, constrained on desktop

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Info } from 'lucide-react';
import { COLORS, MOCK_RWA_ASSETS, RISK_COLOR_MAP } from '@/lib/constants';
import type { RWAAsset } from '@/lib/constants';

interface AllocateFlowProps {
  setAiPanelOpen: (open: boolean) => void;
}

export function AllocateFlow({ setAiPanelOpen }: AllocateFlowProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<RWAAsset | null>(null);
  const [riskPreference, setRiskPreference] = useState('balanced');

  const riskProfiles = [
    { id: 'conservative', label: 'Conservative', color: COLORS.maxionGreen },
    { id: 'balanced', label: 'Balanced', color: COLORS.signalCyan },
    { id: 'aggressive', label: 'Aggressive', color: COLORS.warningAmber },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-200">Allocate Capital</h2>

      {/* Progress Steps - Responsive */}
      <div className="flex items-center gap-2 sm:gap-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{
                  backgroundColor: step >= s ? COLORS.maxionGreen : COLORS.slateGrey,
                  color: step >= s ? COLORS.obsidianBlack : '#9CA3AF',
                }}
              >
                {s}
              </div>
              <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">
                {s === 1 ? 'Select Asset' : s === 2 ? 'Amount' : 'Confirm'}
              </span>
            </div>
            {s < 3 && (
              <div
                className="h-0.5 flex-1"
                style={{ backgroundColor: step > s ? COLORS.maxionGreen : COLORS.slateGrey }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Asset */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">Select Asset</h3>
          {MOCK_RWA_ASSETS.map((asset) => (
            <motion.div
              key={asset.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedAsset(asset);
                setStep(2);
              }}
              className="p-4 rounded-lg border cursor-pointer"
              style={{
                backgroundColor: COLORS.graphitePanel,
                borderColor: selectedAsset?.id === asset.id ? COLORS.maxionGreen : COLORS.slateGrey,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-200">{asset.name}</h4>
                  <p className="text-sm text-gray-400 mt-1">{asset.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold" style={{ color: COLORS.maxionGreen }}>
                      {asset.apy}%
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: `${RISK_COLOR_MAP[asset.risk]}20`,
                      color: RISK_COLOR_MAP[asset.risk],
                    }}
                  >
                    {asset.risk}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Step 2: Amount & Risk */}
      {step === 2 && selectedAsset && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.graphitePanel }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">{selectedAsset.name}</h3>
              <span className="font-mono text-xl" style={{ color: COLORS.maxionGreen }}>
                {selectedAsset.apy}% APY
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Allocation Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="w-full pl-8 pr-4 py-3 rounded-lg text-lg font-mono outline-none"
                style={{
                  backgroundColor: COLORS.slateGrey,
                  color: COLORS.maxionGreen,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Minimum: ${selectedAsset.minInvestment.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Risk Preference
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {riskProfiles.map((profile) => (
                <motion.button
                  key={profile.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRiskPreference(profile.id)}
                  className="py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm border-2"
                  style={{
                    backgroundColor:
                      riskPreference === profile.id ? `${profile.color}20` : 'transparent',
                    borderColor: riskPreference === profile.id ? profile.color : COLORS.slateGrey,
                    color: riskPreference === profile.id ? profile.color : '#9CA3AF',
                  }}
                >
                  {profile.label}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAiPanelOpen(true)}
            className="w-full py-3 rounded-lg border font-medium flex items-center justify-center gap-2"
            style={{
              borderColor: COLORS.signalCyan,
              color: COLORS.signalCyan,
            }}
          >
            <Brain size={20} />
            Get AI Pre-Analysis
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(1)}
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
              onClick={() => setStep(3)}
              disabled={!amount || parseFloat(amount) < selectedAsset.minInvestment}
              className="flex-1 py-3 rounded-lg font-medium"
              style={{
                backgroundColor:
                  amount && parseFloat(amount) >= selectedAsset.minInvestment
                    ? COLORS.maxionGreen
                    : COLORS.slateGrey,
                color:
                  amount && parseFloat(amount) >= selectedAsset.minInvestment
                    ? COLORS.obsidianBlack
                    : '#6B7280',
              }}
            >
              Continue
            </motion.button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && selectedAsset && (
        <div className="space-y-6">
          <div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: COLORS.graphitePanel }}>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Confirm Allocation</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-400">Asset</span>
                <span className="text-gray-200 font-medium">{selectedAsset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="font-mono text-lg" style={{ color: COLORS.maxionGreen }}>
                  ${parseFloat(amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">APY</span>
                <span className="font-mono" style={{ color: COLORS.maxionGreen }}>
                  {selectedAsset.apy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. Annual Yield</span>
                <span className="font-mono" style={{ color: COLORS.maxionGreen }}>
                  ${((parseFloat(amount) * selectedAsset.apy) / 100).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: COLORS.obsidianBlack }}>
              <div className="flex items-start gap-3">
                <Info size={20} style={{ color: COLORS.signalCyan }} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  This allocation will be processed through the MAXION YieldVault smart contract on Mantle. 
                  You'll receive yield-bearing tokens representing your position.
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(2)}
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
              onClick={() => {
                alert('Transaction submitted! (Demo mode)');
                setStep(1);
                setAmount('');
                setSelectedAsset(null);
              }}
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
      )}
    </motion.div>
  );
}
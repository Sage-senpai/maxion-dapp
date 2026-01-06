// src/components/Allocate/CompleteAllocateFlow.tsx
// FIXED: Type errors with bigint values from wagmi hooks
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Info, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { parseUnits } from 'viem';
import { COLORS, MOCK_RWA_ASSETS, RISK_COLOR_MAP } from '@/lib/constants';
import { 
  useUSDCBalance, 
  useUSDCAllowance, 
  useApproveUSDC, 
  useDeposit,
  formatTokenAmount 
} from '@/lib/web3/hooks';
import { getVaultAddress } from '@/lib/contracts';
import { allocationAPI } from '@/lib/api';
import type { RWAAsset } from '@/lib/constants';

interface CompleteAllocateFlowProps {
  setAiPanelOpen: (open: boolean) => void;
  mode: 'live' | 'demo';
  walletAddress?: string;
}

type Step = 'select' | 'amount' | 'approve' | 'confirm' | 'processing' | 'success';

export function CompleteAllocateFlow({ setAiPanelOpen, mode, walletAddress }: CompleteAllocateFlowProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [step, setStep] = useState<Step>('select');
  const [selectedAsset, setSelectedAsset] = useState<RWAAsset | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  // Contract hooks - FIXED: Type assertions
  const { data: usdcBalance } = useUSDCBalance();
  const { data: allowance } = useUSDCAllowance();
  const { approve, isPending: isApproving, isSuccess: isApproved, hash: approveHash } = useApproveUSDC();
  const { deposit, isPending: isDepositing, isSuccess: isDeposited, hash: depositHash } = useDeposit();

  // FIXED: Safe type conversion with proper checks
  const balanceFormatted = usdcBalance ? Number(formatTokenAmount(usdcBalance as bigint, 6)) : 0;
  const amountNum = parseFloat(amount) || 0;
  
  // FIXED: Safe comparison with type checking
  const needsApproval = allowance !== undefined && amount 
    ? parseUnits(amount || '0', 6) > (allowance as bigint)
    : true;

  // Handle approve success
  useEffect(() => {
    if (isApproved && step === 'approve') {
      setStep('confirm');
    }
  }, [isApproved, step]);

  // Handle deposit success
  useEffect(() => {
    if (isDeposited && step === 'processing') {
      handleDepositSuccess();
    }
  }, [isDeposited, step]);

  const handleAssetSelect = (asset: RWAAsset) => {
    setSelectedAsset(asset);
    setStep('amount');
  };

  const handleAmountNext = () => {
    // Validation
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amountNum < (selectedAsset?.minInvestment || 100)) {
      setError(`Minimum investment is $${selectedAsset?.minInvestment.toLocaleString()}`);
      return;
    }
    if (mode === 'live' && amountNum > balanceFormatted) {
      setError(`Insufficient balance. Available: $${balanceFormatted.toLocaleString()}`);
      return;
    }

    setError('');
    
    if (mode === 'demo') {
      // Demo mode - skip approval
      setStep('confirm');
    } else if (needsApproval) {
      setStep('approve');
    } else {
      setStep('confirm');
    }
  };

  const handleApprove = async () => {
    if (!amount) return;
    
    try {
      await approve(amount);
    } catch (err: any) {
      console.error('Approval failed:', err);
      setError(err.message || 'Approval failed');
    }
  };

  const handleConfirm = async () => {
    if (!selectedAsset || !amount || !walletAddress) return;
    
    setStep('processing');
    setError('');

    try {
      if (mode === 'live') {
        // Real transaction
        await deposit(amount);
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTxHash('0x' + Math.random().toString(16).substring(2, 66));
        await handleDepositSuccess();
      }
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err.message || 'Transaction failed');
      setStep('confirm');
    }
  };

  const handleDepositSuccess = async () => {
    if (!selectedAsset || !walletAddress) return;

    // Save to database
    try {
      await allocationAPI.createAllocation({
        walletAddress,
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        amount: amountNum,
        shares: amountNum * 0.98, // Simplified
        apy: selectedAsset.apy,
        riskLevel: selectedAsset.risk,
        txHash: depositHash || txHash,
        status: 'confirmed',
      });
    } catch (err) {
      console.error('Failed to save allocation:', err);
    }

    setStep('success');
  };

  const reset = () => {
    setStep('select');
    setSelectedAsset(null);
    setAmount('');
    setError('');
    setTxHash('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-200">Allocate Capital</h2>

      {/* Progress */}
      <ProgressBar currentStep={step} />

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg border flex items-start gap-3" style={{ backgroundColor: `${COLORS.warningAmber}20`, borderColor: COLORS.warningAmber }}>
          <AlertCircle size={20} style={{ color: COLORS.warningAmber }} />
          <p className="text-sm" style={{ color: COLORS.warningAmber }}>{error}</p>
        </div>
      )}

      {/* Step 1: Select Asset */}
      {step === 'select' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">Select Asset</h3>
          {MOCK_RWA_ASSETS.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onSelect={handleAssetSelect} />
          ))}
        </div>
      )}

      {/* Step 2: Enter Amount */}
      {step === 'amount' && selectedAsset && (
        <AmountInput
          asset={selectedAsset}
          amount={amount}
          setAmount={setAmount}
          balance={balanceFormatted}
          onNext={handleAmountNext}
          onBack={() => setStep('select')}
          mode={mode}
        />
      )}

      {/* Step 3: Approve */}
      {step === 'approve' && selectedAsset && (
        <ApprovalStep
          asset={selectedAsset}
          amount={amount}
          onApprove={handleApprove}
          isApproving={isApproving}
          approveHash={approveHash}
          chainId={chainId}
        />
      )}

      {/* Step 4: Confirm */}
      {(step === 'confirm' || step === 'processing') && selectedAsset && (
        <ConfirmStep
          asset={selectedAsset}
          amount={amount}
          onConfirm={handleConfirm}
          onBack={() => setStep('amount')}
          isProcessing={step === 'processing' || isDepositing}
          mode={mode}
        />
      )}

      {/* Step 5: Success */}
      {step === 'success' && selectedAsset && (
        <SuccessStep
          asset={selectedAsset}
          amount={amount}
          txHash={depositHash || txHash}
          chainId={chainId}
          onDone={reset}
        />
      )}
    </motion.div>
  );
}

// Progress Bar
function ProgressBar({ currentStep }: { currentStep: Step }) {
  const steps = ['select', 'amount', 'approve', 'confirm', 'success'];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
            style={{
              backgroundColor: idx <= currentIndex ? COLORS.maxionGreen : COLORS.slateGrey,
              color: idx <= currentIndex ? COLORS.obsidianBlack : '#9CA3AF',
            }}
          >
            {idx < currentIndex ? <CheckCircle2 size={16} /> : idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div className="h-0.5 flex-1" style={{ backgroundColor: idx < currentIndex ? COLORS.maxionGreen : COLORS.slateGrey }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Asset Card
function AssetCard({ asset, onSelect }: { asset: RWAAsset; onSelect: (a: RWAAsset) => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(asset)}
      className="p-4 rounded-lg border cursor-pointer"
      style={{ backgroundColor: COLORS.graphitePanel, borderColor: COLORS.slateGrey }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-200">{asset.name}</h4>
          <p className="text-sm text-gray-400 mt-1">{asset.type}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-bold" style={{ color: COLORS.maxionGreen }}>
            {asset.apy}%
          </div>
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${RISK_COLOR_MAP[asset.risk]}20`, color: RISK_COLOR_MAP[asset.risk] }}>
            {asset.risk}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Amount Input
function AmountInput({ asset, amount, setAmount, balance, onNext, onBack, mode }: any) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.graphitePanel }}>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">{asset.name}</h3>
        <div className="font-mono text-xl" style={{ color: COLORS.maxionGreen }}>{asset.apy}% APY</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Amount (USDC)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1000"
          className="w-full px-4 py-3 rounded-lg text-lg font-mono outline-none"
          style={{ backgroundColor: COLORS.slateGrey, color: COLORS.maxionGreen }}
        />
        <p className="text-xs text-gray-500 mt-2">
          {mode === 'live' ? `Available: $${balance.toLocaleString()}` : 'Demo mode - unlimited balance'}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-lg font-medium"
          style={{ backgroundColor: COLORS.slateGrey, color: '#9CA3AF' }}
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-lg font-medium"
          style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Approval Step
function ApprovalStep({ asset, amount, onApprove, isApproving, approveHash, chainId }: any) {
  return (
    <div className="space-y-6 text-center">
      <div className="p-6 rounded-xl" style={{ backgroundColor: COLORS.graphitePanel }}>
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Approve USDC</h3>
        <p className="text-sm text-gray-400 mb-6">
          You need to approve the vault contract to spend your USDC. This is a one-time approval.
        </p>
        
        <button
          onClick={onApprove}
          disabled={isApproving}
          className="px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto"
          style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
        >
          {isApproving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Approving...
            </>
          ) : (
            'Approve USDC'
          )}
        </button>

        {approveHash && (
          <a
            href={`https://explorer.${chainId === 5003 ? 'testnet.' : ''}mantle.xyz/tx/${approveHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-4 inline-flex items-center gap-1"
            style={{ color: COLORS.signalCyan }}
          >
            View Transaction <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

// Confirm Step
function ConfirmStep({ asset, amount, onConfirm, onBack, isProcessing, mode }: any) {
  const estimatedYield = (parseFloat(amount) * asset.apy / 100).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ backgroundColor: COLORS.graphitePanel }}>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Confirm Allocation</h3>
        
        <div className="space-y-3">
          <DetailRow label="Asset" value={asset.name} />
          <DetailRow label="Amount" value={`$${parseFloat(amount).toLocaleString()}`} mono />
          <DetailRow label="APY" value={`${asset.apy}%`} mono />
          <DetailRow label="Est. Annual Yield" value={`$${estimatedYield}`} mono />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 py-3 rounded-lg font-medium"
          style={{ backgroundColor: COLORS.slateGrey, color: '#9CA3AF' }}
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            'Confirm'
          )}
        </button>
      </div>
    </div>
  );
}

// Success Step
function SuccessStep({ asset, amount, txHash, chainId, onDone }: any) {
  return (
    <div className="text-center py-8 space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
      >
        <CheckCircle2 size={64} style={{ color: COLORS.maxionGreen }} className="mx-auto" />
      </motion.div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Allocation Successful!</h3>
        <p className="text-gray-400">Your allocation has been confirmed</p>
      </div>

      <div className="p-4 rounded-lg max-w-md mx-auto" style={{ backgroundColor: COLORS.graphitePanel }}>
        <div className="text-sm text-gray-400 mb-2">Transaction Hash</div>
        <div className="flex items-center justify-center gap-2">
          <code className="text-xs font-mono" style={{ color: COLORS.signalCyan }}>
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </code>
          <a
            href={`https://explorer.${chainId === 5003 ? 'testnet.' : ''}mantle.xyz/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.maxionGreen }}
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <button
        onClick={onDone}
        className="px-8 py-3 rounded-lg font-semibold"
        style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
      >
        View Portfolio
      </button>
    </div>
  );
}

function DetailRow({ label, value, mono }: any) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-800">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`} style={{ color: '#E5E7EB' }}>
        {value}
      </span>
    </div>
  );
}
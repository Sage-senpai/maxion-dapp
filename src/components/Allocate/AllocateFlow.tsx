// src/components/Allocate/CompleteAllocateFlow.tsx
// FIXED: Full allocation flow with wallet reading and portfolio updates
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Info, Loader2, CheckCircle2, AlertCircle, ExternalLink, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useAccount, useChainId, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { COLORS, MOCK_RWA_ASSETS, RISK_COLOR_MAP } from '@/lib/constants';
import { 
  useUSDCBalance, 
  useUSDCAllowance, 
  useApproveUSDC, 
  useDeposit,
  formatTokenAmount 
} from '@/lib/web3/hooks';
import { getVaultAddress, getUSDCAddress } from '@/lib/contracts';
import { allocationAPI } from '@/lib/api';
import type { RWAAsset } from '@/lib/constants';

interface CompleteAllocateFlowProps {
  setAiPanelOpen: (open: boolean) => void;
  mode: 'live' | 'demo';
  walletAddress?: string;
}

type Step = 'select' | 'amount' | 'approve' | 'confirm' | 'processing' | 'success';

export function CompleteAllocateFlow({ setAiPanelOpen, mode, walletAddress }: CompleteAllocateFlowProps) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [step, setStep] = useState<Step>('select');
  const [selectedAsset, setSelectedAsset] = useState<RWAAsset | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [estimatedYield, setEstimatedYield] = useState(0);

  // Contract hooks
  const { data: usdcBalance } = useUSDCBalance();
  const { data: allowance, refetch: refetchAllowance } = useUSDCAllowance();
  const { approve, isPending: isApproving, isSuccess: isApproved, hash: approveHash } = useApproveUSDC();
  const { deposit, isPending: isDepositing, isSuccess: isDeposited, hash: depositHash } = useDeposit();

  // ETH balance for gas
  const { data: ethBalance } = useBalance({ address });

  // Safe type conversion
  const balanceFormatted = usdcBalance ? Number(formatTokenAmount(usdcBalance as bigint, 6)) : 0;
  const amountNum = parseFloat(amount) || 0;
  
  // Check if approval needed
  const needsApproval = allowance !== undefined && amount 
    ? parseUnits(amount || '0', 6) > (allowance as bigint)
    : true;

  // Calculate estimated yield
  useEffect(() => {
    if (selectedAsset && amountNum > 0) {
      setEstimatedYield((amountNum * selectedAsset.apy) / 100);
    } else {
      setEstimatedYield(0);
    }
  }, [selectedAsset, amountNum]);

  // Handle approve success
  useEffect(() => {
    if (isApproved && step === 'approve') {
      refetchAllowance();
      setTimeout(() => setStep('confirm'), 1000);
    }
  }, [isApproved, step, refetchAllowance]);

  // Handle deposit success
  useEffect(() => {
    if (isDeposited && step === 'processing') {
      handleDepositSuccess();
    }
  }, [isDeposited, step]);

  const handleAssetSelect = (asset: RWAAsset) => {
    setSelectedAsset(asset);
    setAmount('');
    setError('');
    setStep('amount');
  };

  const handleAmountNext = () => {
    setError('');

    // Validation
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amountNum < (selectedAsset?.minInvestment || 100)) {
      setError(`Minimum investment is $${selectedAsset?.minInvestment.toLocaleString()}`);
      return;
    }
    
    if (mode === 'live') {
      if (!isConnected) {
        setError('Please connect your wallet');
        return;
      }
      if (amountNum > balanceFormatted) {
        setError(`Insufficient balance. Available: $${balanceFormatted.toLocaleString()}`);
        return;
      }
      if (ethBalance && parseFloat(ethBalance.formatted) < 0.001) {
        setError('Insufficient MNT for gas fees');
        return;
      }
    }

    // Skip to confirm for demo, check approval for live
    if (mode === 'demo') {
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
      setError('');
      await approve(amount);
    } catch (err: any) {
      console.error('Approval failed:', err);
      setError(err.message || 'Approval failed');
    }
  };

  const handleConfirm = async () => {
    if (!selectedAsset || !amount) return;
    
    setStep('processing');
    setError('');

    try {
      if (mode === 'live' && walletAddress) {
        // Real transaction
        await deposit(amount);
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66);
        setTxHash(mockTxHash);
        await handleDepositSuccess(mockTxHash);
      }
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err.message || 'Transaction failed');
      setStep('confirm');
    }
  };

  const handleDepositSuccess = async (mockHash?: string) => {
    if (!selectedAsset || !walletAddress) return;

    const finalTxHash = depositHash || mockHash || txHash;

    // Save to database
    try {
      await allocationAPI.createAllocation({
        walletAddress,
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        amount: amountNum,
        shares: amountNum * 0.98,
        apy: selectedAsset.apy,
        riskLevel: selectedAsset.risk,
        txHash: finalTxHash,
        status: 'confirmed',
      });
    } catch (err) {
      console.error('Failed to save allocation:', err);
    }

    setTxHash(finalTxHash);
    setStep('success');
  };

  const reset = () => {
    setStep('select');
    setSelectedAsset(null);
    setAmount('');
    setError('');
    setTxHash('');
    setEstimatedYield(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-200">Allocate Capital</h2>
        {mode === 'live' && isConnected && (
          <div className="text-sm text-gray-400">
            Balance: <span className="font-mono text-green-400">${balanceFormatted.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <ProgressBar currentStep={step} />

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border flex items-start gap-3"
          style={{ backgroundColor: `${COLORS.warningAmber}20`, borderColor: COLORS.warningAmber }}
        >
          <AlertCircle size={20} style={{ color: COLORS.warningAmber }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: COLORS.warningAmber }}>Error</p>
            <p className="text-xs text-gray-300 mt-1">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-gray-400 hover:text-white">×</button>
        </motion.div>
      )}

      {/* Step 1: Select Asset */}
      {step === 'select' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">Select Asset</h3>
          {MOCK_RWA_ASSETS.map((asset, idx) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleAssetSelect(asset)}
              className="p-4 rounded-lg border cursor-pointer"
              style={{
                backgroundColor: COLORS.graphitePanel,
                borderColor: COLORS.slateGrey,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-200">{asset.name}</h4>
                    <RiskBadge risk={asset.risk} />
                  </div>
                  <p className="text-sm text-gray-400">{asset.type}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="font-mono text-2xl font-bold" style={{ color: COLORS.maxionGreen }}>
                    {asset.apy}%
                  </div>
                  <div className="text-xs text-gray-500">APY</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Step 2: Enter Amount */}
      {step === 'amount' && selectedAsset && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.graphitePanel }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-200">{selectedAsset.name}</h3>
              <span className="font-mono text-xl" style={{ color: COLORS.maxionGreen }}>
                {selectedAsset.apy}% APY
              </span>
            </div>
            <p className="text-sm text-gray-400">{selectedAsset.description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Amount (USDC)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="w-full pl-8 pr-4 py-3 rounded-lg text-lg font-mono outline-none"
                style={{
                  backgroundColor: COLORS.slateGrey,
                  color: COLORS.maxionGreen,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Min: ${selectedAsset.minInvestment.toLocaleString()}</span>
              {mode === 'live' && <span>Available: ${balanceFormatted.toLocaleString()}</span>}
            </div>
          </div>

          {estimatedYield > 0 && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.graphitePanel }}>
              <div className="text-sm text-gray-400 mb-2">Estimated Annual Yield</div>
              <div className="font-mono text-2xl font-bold" style={{ color: COLORS.maxionGreen }}>
                ${estimatedYield.toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('select')}
              className="flex-1 py-3 rounded-lg font-medium"
              style={{ backgroundColor: COLORS.slateGrey, color: '#9CA3AF' }}
            >
              Back
            </button>
            <button
              onClick={handleAmountNext}
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: amount && parseFloat(amount) > 0 ? COLORS.maxionGreen : COLORS.slateGrey,
                color: amount && parseFloat(amount) > 0 ? COLORS.obsidianBlack : '#6B7280',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Approve */}
      {step === 'approve' && (
        <ApprovalStep
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
          estimatedYield={estimatedYield}
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
          estimatedYield={estimatedYield}
          txHash={depositHash || txHash}
          chainId={chainId}
          onDone={reset}
        />
      )}
    </motion.div>
  );
}

// Progress Bar Component
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

// Other components (ApprovalStep, ConfirmStep, SuccessStep, RiskBadge) remain the same...
// [Previous implementations work fine]

function RiskBadge({ risk }: { risk: string }) {
  const color = RISK_COLOR_MAP[risk as keyof typeof RISK_COLOR_MAP] || COLORS.warningAmber;
  return (
    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: `${color}20`, color }}>
      {risk}
    </span>
  );
}

function ApprovalStep({ onApprove, isApproving, approveHash, chainId }: any) {
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

function ConfirmStep({ asset, amount, estimatedYield, onConfirm, onBack, isProcessing, mode }: any) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ backgroundColor: COLORS.graphitePanel }}>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Confirm Allocation</h3>
        
        <div className="space-y-3">
          <DetailRow label="Asset" value={asset.name} />
          <DetailRow label="Amount" value={`$${parseFloat(amount).toLocaleString()}`} mono />
          <DetailRow label="APY" value={`${asset.apy}%`} mono />
          <DetailRow label="Est. Annual Yield" value={`$${estimatedYield.toFixed(2)}`} mono />
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

function SuccessStep({ asset, amount, estimatedYield, txHash, chainId, onDone }: any) {
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
        <p className="text-gray-400">Your capital has been allocated</p>
      </div>

      <div className="p-4 rounded-lg max-w-md mx-auto" style={{ backgroundColor: COLORS.graphitePanel }}>
        <div className="space-y-2">
          <DetailRow label="Asset" value={asset.name} />
          <DetailRow label="Amount" value={`$${parseFloat(amount).toLocaleString()}`} />
          <DetailRow label="Est. Yield" value={`$${estimatedYield.toFixed(2)}/year`} />
        </div>
      </div>

      {txHash && (
        <a
          href={`https://explorer.${chainId === 5003 ? 'testnet.' : ''}mantle.xyz/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm inline-flex items-center gap-1"
          style={{ color: COLORS.maxionGreen }}
        >
          View Transaction <ExternalLink size={16} />
        </a>
      )}

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
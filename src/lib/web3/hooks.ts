// lib/web3/hooks.ts
// Custom hooks for interacting with MAXION smart contracts

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { getContracts } from './config';
import YieldVaultABI from './abis/YieldVault.json';
import ERC20ABI from './abis/ERC20.json';

// ============================================================================
// VAULT HOOKS
// ============================================================================

/**
 * Hook to read user's vault share balance
 */
export function useVaultBalance() {
  const { address, chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  return useReadContract({
    address: contracts.yieldVault as `0x${string}`,
    abi: YieldVaultABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook to read user's position details
 */
export function useUserPosition() {
  const { address, chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  return useReadContract({
    address: contracts.yieldVault as `0x${string}`,
    abi: YieldVaultABI,
    functionName: 'getUserPosition',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook to read current share price
 */
export function useSharePrice() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  return useReadContract({
    address: contracts.yieldVault as `0x${string}`,
    abi: YieldVaultABI,
    functionName: 'sharePrice',
  });
}

/**
 * Hook to preview deposit (calculate shares for given amount)
 */
export function usePreviewDeposit(amount: string) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  const amountWei = amount ? parseUnits(amount, 6) : BigInt(0); // USDC has 6 decimals

  return useReadContract({
    address: contracts.yieldVault as `0x${string}`,
    abi: YieldVaultABI,
    functionName: 'previewDeposit',
    args: [amountWei],
    query: {
      enabled: amount !== '' && parseFloat(amount) > 0,
    },
  });
}

/**
 * Hook to read vault total assets
 */
export function useTotalAssets() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  return useReadContract({
    address: contracts.yieldVault as `0x${string}`,
    abi: YieldVaultABI,
    functionName: 'totalAssets',
  });
}

// ============================================================================
// TOKEN HOOKS
// ============================================================================

/**
 * Hook to read USDC balance
 */
export function useUSDCBalance() {
  const { address, chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  return useReadContract({
    address: contracts.mockUSDC as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook to read USDC allowance for vault
 */
export function useUSDCAllowance() {
  const { address, chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  return useReadContract({
    address: contracts.mockUSDC as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, contracts.yieldVault] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

// ============================================================================
// WRITE HOOKS
// ============================================================================

/**
 * Hook to approve USDC spending
 */
export function useApproveUSDC() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);
  
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const approve = async (amount: string) => {
    const amountWei = parseUnits(amount, 6);
    
    return writeContract({
      address: contracts.mockUSDC as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [contracts.yieldVault, amountWei],
    });
  };

  const receipt = useWaitForTransactionReceipt({
    hash,
  });

  return {
    approve,
    hash,
    isPending,
    isSuccess: receipt.isSuccess,
    error,
  };
}

/**
 * Hook to deposit into vault
 */
export function useDeposit() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);
  
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const deposit = async (amount: string) => {
    const amountWei = parseUnits(amount, 6);
    
    return writeContract({
      address: contracts.yieldVault as `0x${string}`,
      abi: YieldVaultABI,
      functionName: 'deposit',
      args: [amountWei],
    });
  };

  const receipt = useWaitForTransactionReceipt({
    hash,
  });

  return {
    deposit,
    hash,
    isPending,
    isSuccess: receipt.isSuccess,
    error,
  };
}

/**
 * Hook to withdraw from vault
 */
export function useWithdraw() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);
  
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const withdraw = async (shares: string) => {
    const sharesWei = parseUnits(shares, 18);
    
    return writeContract({
      address: contracts.yieldVault as `0x${string}`,
      abi: YieldVaultABI,
      functionName: 'withdraw',
      args: [sharesWei],
    });
  };

  const receipt = useWaitForTransactionReceipt({
    hash,
  });

  return {
    withdraw,
    hash,
    isPending,
    isSuccess: receipt.isSuccess,
    error,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format token amount for display
 */
export function formatTokenAmount(value: bigint | undefined, decimals: number = 6): string {
  if (!value) return '0';
  return formatUnits(value, decimals);
}

/**
 * Parse token amount from string
 */
export function parseTokenAmount(value: string, decimals: number = 6): bigint {
  if (!value || value === '') return BigInt(0);
  return parseUnits(value, decimals);
}
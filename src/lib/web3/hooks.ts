// src/lib/web3/hooks.ts - FIXED mockUSDC property access


import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { getContracts } from './config';
import YieldVaultABI from './abis/YieldVault.json';
import ERC20ABI from './abis/ERC20.json';

// Helper function to get USDC address
function getUSDCAddressForChain(chainId: number) {
  const contracts = getContracts(chainId);
  // Handle both testnet (mockUSDC) and mainnet (usdc)
  if ('mockUSDC' in contracts) {
    return contracts.mockUSDC as `0x${string}`;
  }
  return (contracts as any).usdc as `0x${string}`;
}

// ============================================================================
// VAULT HOOKS
// ============================================================================

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

export function useSharePrice() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  return useReadContract({
    address: contracts.yieldVault as `0x${string}`,
    abi: YieldVaultABI,
    functionName: 'sharePrice',
  });
}

export function usePreviewDeposit(amount: string) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  const amountWei = amount ? parseUnits(amount, 6) : BigInt(0);

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
// TOKEN HOOKS - FIXED
// ============================================================================

export function useUSDCBalance() {
  const { address, chainId } = useAccount();

  return useReadContract({
    address: getUSDCAddressForChain(chainId || 5003),
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useUSDCAllowance() {
  const { address, chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);

  return useReadContract({
    address: getUSDCAddressForChain(chainId || 5003),
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, contracts.yieldVault] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

// ============================================================================
// WRITE HOOKS - FIXED
// ============================================================================

export function useApproveUSDC() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 5003);
  
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const approve = async (amount: string) => {
    const amountWei = parseUnits(amount, 6);
    
    return writeContract({
      address: getUSDCAddressForChain(chainId || 5003),
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

export function formatTokenAmount(value: bigint | undefined, decimals: number = 6): string {
  if (!value) return '0';
  return formatUnits(value, decimals);
}

export function parseTokenAmount(value: string, decimals: number = 6): bigint {
  if (!value || value === '') return BigInt(0);
  return parseUnits(value, decimals);
}
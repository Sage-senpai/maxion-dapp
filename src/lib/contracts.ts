// src/lib/contracts.ts - FIXED BIGINT LITERALS
// Replace BigInt literals with BigInt() constructor

import { parseUnits, formatUnits, type Address } from 'viem';
import { getContracts } from './web3/config';
import YieldVaultABI from './web3/abis/YieldVault.json';
import ERC20ABI from './web3/abis/ERC20.json';

export const USDC_DECIMALS = 6;
export const SHARE_DECIMALS = 18;
export const MIN_DEPOSIT = 100;

export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, USDC_DECIMALS);
}

export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, USDC_DECIMALS);
}

export function formatShares(shares: bigint): string {
  return formatUnits(shares, SHARE_DECIMALS);
}

export function parseShares(shares: string): bigint {
  return parseUnits(shares, SHARE_DECIMALS);
}

export function calculateShares(
  assets: bigint,
  totalAssets: bigint,
  totalSupply: bigint
): bigint {
  if (totalSupply === BigInt(0)) {
    return assets * BigInt(10) ** BigInt(SHARE_DECIMALS - USDC_DECIMALS);
  }
  return (assets * totalSupply) / totalAssets;
}

export function calculateAssets(
  shares: bigint,
  totalAssets: bigint,
  totalSupply: bigint
): bigint {
  if (totalSupply === BigInt(0)) {
    return BigInt(0);
  }
  return (shares * totalAssets) / totalSupply;
}

export function calculateAPY(
  oldPrice: bigint,
  newPrice: bigint,
  timeElapsedSeconds: number
): number {
  if (oldPrice === BigInt(0)) return 0;

  const priceChange = Number(newPrice - oldPrice);
  const priceBasis = Number(oldPrice);
  const percentChange = (priceChange / priceBasis) * 100;

  const secondsPerYear = 365.25 * 24 * 60 * 60;
  const annualizationFactor = secondsPerYear / timeElapsedSeconds;

  return percentChange * annualizationFactor;
}

export function calculateEstimatedYield(
  principal: number,
  apy: number
): number {
  return (principal * apy) / 100;
}

export function calculateMonthlyYield(
  principal: number,
  apy: number
): number {
  return calculateEstimatedYield(principal, apy) / 12;
}

export function validateDepositAmount(
  amount: string,
  balance: bigint
): {
  valid: boolean;
  error?: string;
} {
  try {
    const amountWei = parseUSDC(amount);
    const minDepositWei = parseUSDC(MIN_DEPOSIT.toString());

    if (amountWei < minDepositWei) {
      return {
        valid: false,
        error: `Minimum deposit is ${MIN_DEPOSIT} USDC`,
      };
    }

    if (amountWei > balance) {
      return {
        valid: false,
        error: 'Insufficient balance',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid amount',
    };
  }
}

export function validateWithdrawShares(
  shares: string,
  balance: bigint
): {
  valid: boolean;
  error?: string;
} {
  try {
    const sharesWei = parseShares(shares);

    if (sharesWei <= BigInt(0)) {
      return {
        valid: false,
        error: 'Amount must be greater than zero',
      };
    }

    if (sharesWei > balance) {
      return {
        valid: false,
        error: 'Insufficient shares',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid amount',
    };
  }
}

export function estimateDepositGas(): bigint {
  return BigInt(200000);
}

export function estimateWithdrawGas(): bigint {
  return BigInt(150000);
}

export function estimateApprovalGas(): bigint {
  return BigInt(50000);
}

export function getVaultAddress(chainId: number): Address {
  const contracts = getContracts(chainId);
  return contracts.yieldVault as Address;
}

export function getUSDCAddress(chainId: number): Address {
  const contracts = getContracts(chainId);
  // Handle both testnet (mockUSDC) and mainnet (usdc)
  if ('mockUSDC' in contracts) {
    return contracts.mockUSDC as Address;
  }
  return (contracts as any).usdc as Address;
}

export { YieldVaultABI, ERC20ABI };

export const VAULT_EVENTS = {
  Deposit: 'Deposit',
  Withdraw: 'Withdraw',
  YieldHarvested: 'YieldHarvested',
  StrategyAdded: 'StrategyAdded',
} as const;

export const ERC20_EVENTS = {
  Transfer: 'Transfer',
  Approval: 'Approval',
} as const;

export const CONTRACT_ERRORS = {
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  BELOW_MINIMUM: 'Below minimum deposit',
  EXCEEDS_MAXIMUM: 'Exceeds maximum deposit',
  ZERO_SHARES: 'Zero shares',
  ZERO_ASSETS: 'Zero assets',
  STRATEGY_NOT_ACTIVE: 'Strategy not active',
  TRANSFER_FAILED: 'Transfer failed',
} as const;
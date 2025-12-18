// src/types/contracts.ts
// Location: src/types/contracts.ts
// Smart contract type definitions for MAXION

import type { Address, Hash } from 'viem';

// ============================================================================
// VAULT CONTRACT TYPES
// ============================================================================

export interface VaultContractMethods {
  deposit: (assets: bigint) => Promise<Hash>;
  withdraw: (shares: bigint) => Promise<Hash>;
  balanceOf: (account: Address) => Promise<bigint>;
  getUserPosition: (user: Address) => Promise<UserPosition>;
  sharePrice: () => Promise<bigint>;
  previewDeposit: (assets: bigint) => Promise<bigint>;
  previewWithdraw: (shares: bigint) => Promise<bigint>;
  totalAssets: () => Promise<bigint>;
  totalSupply: () => Promise<bigint>;
  asset: () => Promise<Address>;
  minDeposit: () => Promise<bigint>;
  maxDeposit: () => Promise<bigint>;
}

export interface UserPosition {
  shares: bigint;
  depositTimestamp: bigint;
  lastClaimTimestamp: bigint;
  totalDeposited: bigint;
  totalClaimed: bigint;
}

export interface Strategy {
  strategyAddress: Address;
  allocation: bigint;
  deployed: bigint;
  active: boolean;
  name: string;
  riskLevel: string;
}

// ============================================================================
// ERC20 TOKEN TYPES
// ============================================================================

export interface ERC20Methods {
  balanceOf: (account: Address) => Promise<bigint>;
  allowance: (owner: Address, spender: Address) => Promise<bigint>;
  approve: (spender: Address, amount: bigint) => Promise<Hash>;
  transfer: (to: Address, amount: bigint) => Promise<Hash>;
  transferFrom: (from: Address, to: Address, amount: bigint) => Promise<Hash>;
  totalSupply: () => Promise<bigint>;
  decimals: () => Promise<number>;
  name: () => Promise<string>;
  symbol: () => Promise<string>;
}

// ============================================================================
// STRATEGY CONTRACT TYPES
// ============================================================================

export interface StrategyMethods {
  deposit: (amount: bigint) => Promise<Hash>;
  withdraw: (amount: bigint) => Promise<Hash>;
  harvest: () => Promise<bigint>;
  totalValue: () => Promise<bigint>;
  pendingYield: () => Promise<bigint>;
  totalDeployed: () => Promise<bigint>;
  apy: () => Promise<bigint>;
  name: () => Promise<string>;
  riskLevel: () => Promise<string>;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface DepositEvent {
  user: Address;
  assets: bigint;
  shares: bigint;
}

export interface WithdrawEvent {
  user: Address;
  assets: bigint;
  shares: bigint;
}

export interface YieldHarvestedEvent {
  totalYield: bigint;
  fees: bigint;
}

export interface StrategyAddedEvent {
  strategyId: bigint;
  strategy: Address;
  name: string;
}

export interface TransferEvent {
  from: Address;
  to: Address;
  value: bigint;
}

export interface ApprovalEvent {
  owner: Address;
  spender: Address;
  value: bigint;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface WriteContractParams {
  address: Address;
  abi: any[];
  functionName: string;
  args?: any[];
  value?: bigint;
  gas?: bigint;
}

export interface ReadContractParams {
  address: Address;
  abi: any[];
  functionName: string;
  args?: any[];
}

export interface ContractCallResult<T = any> {
  data: T;
  error?: Error;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface TransactionResult {
  hash: Hash;
  wait: () => Promise<TransactionReceipt>;
}

export interface TransactionReceipt {
  transactionHash: Hash;
  blockNumber: bigint;
  gasUsed: bigint;
  status: 'success' | 'reverted';
  logs: Log[];
}

export interface Log {
  address: Address;
  topics: Hash[];
  data: Hash;
  blockNumber: bigint;
  transactionHash: Hash;
  logIndex: number;
}

// ============================================================================
// CONTRACT ADDRESSES
// ============================================================================

export interface ContractAddresses {
  yieldVault: Address;
  mockUSDC: Address;
  strategies?: Address[];
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  contracts: ContractAddresses;
  rpcUrl: string;
  explorerUrl: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ContractFunction<TArgs extends any[] = any[], TReturn = any> = (
  ...args: TArgs
) => Promise<TReturn>;

export type ContractEvent<T = any> = {
  address: Address;
  blockNumber: bigint;
  transactionHash: Hash;
  args: T;
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isTransactionReceipt(obj: any): obj is TransactionReceipt {
  return (
    obj &&
    typeof obj === 'object' &&
    'transactionHash' in obj &&
    'blockNumber' in obj &&
    'status' in obj
  );
}

export function isContractError(error: any): error is Error & { code?: string } {
  return error instanceof Error && 'code' in error;
}
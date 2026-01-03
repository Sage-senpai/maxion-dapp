// src/types/index.ts
// Location: src/types/index.ts
// Shared TypeScript types and interfaces for MAXION

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  walletAddress: string;
  createdAt: Date;
  lastActive: Date;
  totalDeposited: number;
  totalWithdrawn: number;
  riskProfile: RiskProfile;
}

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive';

// ============================================================================
// ASSET TYPES
// ============================================================================

export interface RWAAsset {
  id: string;
  name: string;
  type: AssetType;
  apy: number;
  tvl: number;
  risk: RiskLevel;
  duration: string;
  minInvestment: number;
  description: string;
}

export type AssetType =
  | 'Government Bonds'
  | 'Real Estate'
  | 'Private Credit'
  | 'Infrastructure'
  | 'Commodities';

export type RiskLevel = 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High';

// ============================================================================
// ALLOCATION TYPES
// ============================================================================

export interface Allocation {
  id: string;
  userId: string;
  walletAddress: string;
  assetId: string;
  assetName: string;
  amount: number;
  shares: number;
  apy: number;
  riskLevel: RiskLevel;
  timestamp: Date;
  txHash?: string;
  status: AllocationStatus;
}

export type AllocationStatus = 'pending' | 'confirmed' | 'failed';

// ============================================================================
// AI ANALYSIS TYPES
// ============================================================================

export interface AIAnalysis {
  id: string;
  userId: string;
  walletAddress: string;
  query: string;
  response: string;
  context?: AIAnalysisContext;
  timestamp: Date;
  modelUsed: string;
  tokensUsed?: number;
  suggestions?: string[];
}

export interface AIAnalysisContext {
  assetId?: string;
  assetName?: string;
  amount?: number;
  apy?: number;
  riskLevel?: string;
  riskProfile?: RiskProfile;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: bigint;
  gasUsed: bigint;
  status: 'pending' | 'success' | 'failed';
  timestamp: Date;
  blockNumber: number;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  gasUsed: bigint;
  status: 'success' | 'reverted';
  logs: Log[];
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
}

// ============================================================================
// CONTRACT TYPES
// ============================================================================

export interface VaultPosition {
  shares: bigint;
  depositTimestamp: bigint;
  lastClaimTimestamp: bigint;
  totalDeposited: bigint;
  totalClaimed: bigint;
}

export interface Strategy {
  strategyAddress: string;
  allocation: number;
  deployed: bigint;
  active: boolean;
  name: string;
  riskLevel: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// CHART TYPES
// ============================================================================

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface PerformanceData {
  date: string;
  apy: number;
  tvl: number;
  yield: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'allocation'
  | 'yield';

// ============================================================================
// FORM TYPES
// ============================================================================

export interface AllocationFormData {
  assetId: string;
  amount: string;
  riskProfile: RiskProfile;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface AssetFilters {
  riskLevel?: RiskLevel[];
  assetType?: AssetType[];
  minAPY?: number;
  maxAPY?: number;
  minTVL?: number;
}

export interface AssetSortOptions {
  field: 'apy' | 'tvl' | 'risk' | 'name';
  order: SortOrder;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T>;

// Type guard helper
export function isRWAAsset(obj: any): obj is RWAAsset {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'apy' in obj
  );
}
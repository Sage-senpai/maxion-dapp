// src/types/api.ts
// Location: src/types/api.ts
// API request/response type definitions

import type { RiskProfile, RiskLevel } from './index';

// ============================================================================
// USER API TYPES
// ============================================================================

export interface CreateUserRequest {
  walletAddress: string;
  riskProfile?: RiskProfile;
}

export interface CreateUserResponse {
  success: boolean;
  user: {
    id: string;
    walletAddress: string;
    createdAt: string;
    riskProfile: RiskProfile;
  };
}

export interface GetUserResponse {
  success: boolean;
  user: {
    id: string;
    walletAddress: string;
    createdAt: string;
    lastActive: string;
    totalDeposited: number;
    totalWithdrawn: number;
    riskProfile: RiskProfile;
  };
}

// ============================================================================
// ALLOCATION API TYPES
// ============================================================================

export interface CreateAllocationRequest {
  walletAddress: string;
  assetId: string;
  assetName: string;
  amount: number;
  shares: number;
  apy: number;
  riskLevel: string;
  txHash?: string;
  status?: 'pending' | 'confirmed' | 'failed';
}

export interface CreateAllocationResponse {
  success: boolean;
  allocation: {
    id: string;
    assetId: string;
    assetName: string;
    amount: number;
    shares: number;
    apy: number;
    riskLevel: string;
    timestamp: string;
    status: string;
  };
}

export interface GetAllocationsResponse {
  success: boolean;
  allocations: Array<{
    id: string;
    assetId: string;
    assetName: string;
    amount: number;
    shares: number;
    apy: number;
    riskLevel: string;
    timestamp: string;
    txHash?: string;
    status: string;
  }>;
  stats: {
    totalAmount: number;
    totalShares: number;
    averageAPY: number;
    count: number;
  };
  pagination: {
    limit: number;
    skip: number;
    total: number;
  };
}

// ============================================================================
// AI ANALYSIS API TYPES
// ============================================================================

export interface CreateAIAnalysisRequest {
  walletAddress: string;
  query: string;
  context?: {
    assetId?: string;
    assetName?: string;
    amount?: number;
    apy?: number;
    riskLevel?: string;
    riskProfile?: RiskProfile;
  };
}

export interface CreateAIAnalysisResponse {
  success: boolean;
  analysis: {
    id: string;
    query: string;
    response: string;
    timestamp: string;
  };
}

export interface GetAIAnalysisHistoryResponse {
  success: boolean;
  history: Array<{
    id: string;
    query: string;
    response: string;
    context?: Record<string, any>;
    timestamp: string;
  }>;
}

// ============================================================================
// ASSETS API TYPES
// ============================================================================

export interface GetAssetsResponse {
  success: boolean;
  assets: Array<{
    id: string;
    name: string;
    type: string;
    apy: number;
    tvl: number;
    risk: RiskLevel;
    duration: string;
    minInvestment: number;
    description: string;
  }>;
}

export interface GetAssetDetailsResponse {
  success: boolean;
  asset: {
    id: string;
    name: string;
    type: string;
    apy: number;
    tvl: number;
    risk: RiskLevel;
    duration: string;
    minInvestment: number;
    description: string;
    performance?: Array<{
      date: string;
      apy: number;
      tvl: number;
    }>;
  };
}

// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  code?: string;
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface PaginationParams {
  limit?: number;
  skip?: number;
  page?: number;
}

export interface AllocationQueryParams extends PaginationParams {
  walletAddress: string;
  status?: 'pending' | 'confirmed' | 'failed';
  assetId?: string;
}

export interface AIAnalysisQueryParams extends PaginationParams {
  walletAddress: string;
  since?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isErrorResponse(response: any): response is ErrorResponse {
  return response && response.success === false && 'error' in response;
}

export function isSuccessResponse<T>(
  response: any
): response is { success: true } & T {
  return response && response.success === true;
}
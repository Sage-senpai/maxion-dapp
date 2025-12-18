// src/lib/api.ts
// Location: src/lib/api.ts
// API client for MAXION backend endpoints

import type {
  CreateUserRequest,
  CreateUserResponse,
  GetUserResponse,
  CreateAllocationRequest,
  CreateAllocationResponse,
  GetAllocationsResponse,
  CreateAIAnalysisRequest,
  CreateAIAnalysisResponse,
  GetAIAnalysisHistoryResponse,
  ErrorResponse,
} from '@/types/api';

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ============================================================================
// FETCH WRAPPER
// ============================================================================

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  /**
   * Get user by wallet address
   */
  async getUser(walletAddress: string): Promise<GetUserResponse> {
    return fetchAPI<GetUserResponse>(
      `/api/users?walletAddress=${walletAddress}`
    );
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    return fetchAPI<CreateUserResponse>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update user risk profile
   */
  async updateRiskProfile(
    walletAddress: string,
    riskProfile: string
  ): Promise<GetUserResponse> {
    return fetchAPI<GetUserResponse>('/api/users', {
      method: 'PATCH',
      body: JSON.stringify({ walletAddress, riskProfile }),
    });
  },
};

// ============================================================================
// ALLOCATION API
// ============================================================================

export const allocationAPI = {
  /**
   * Get allocations for user
   */
  async getAllocations(
    walletAddress: string,
    options?: {
      limit?: number;
      skip?: number;
    }
  ): Promise<GetAllocationsResponse> {
    const params = new URLSearchParams({
      walletAddress,
      ...(options?.limit && { limit: options.limit.toString() }),
      ...(options?.skip && { skip: options.skip.toString() }),
    });

    return fetchAPI<GetAllocationsResponse>(
      `/api/allocations?${params.toString()}`
    );
  },

  /**
   * Create new allocation
   */
  async createAllocation(
    data: CreateAllocationRequest
  ): Promise<CreateAllocationResponse> {
    return fetchAPI<CreateAllocationResponse>('/api/allocations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update allocation status
   */
  async updateAllocationStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'failed'
  ): Promise<CreateAllocationResponse> {
    return fetchAPI<CreateAllocationResponse>('/api/allocations', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
  },
};

// ============================================================================
// AI ANALYSIS API
// ============================================================================

export const aiAPI = {
  /**
   * Create AI analysis
   */
  async createAnalysis(
    data: CreateAIAnalysisRequest
  ): Promise<CreateAIAnalysisResponse> {
    return fetchAPI<CreateAIAnalysisResponse>('/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get AI analysis history
   */
  async getHistory(
    walletAddress: string,
    limit?: number
  ): Promise<GetAIAnalysisHistoryResponse> {
    const params = new URLSearchParams({
      walletAddress,
      ...(limit && { limit: limit.toString() }),
    });

    return fetchAPI<GetAIAnalysisHistoryResponse>(
      `/api/ai/analyze?${params.toString()}`
    );
  },
};

// ============================================================================
// ERROR HANDLER
// ============================================================================

export function handleAPIError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isAPIError(response: any): response is ErrorResponse {
  return response && response.success === false && 'error' in response;
}
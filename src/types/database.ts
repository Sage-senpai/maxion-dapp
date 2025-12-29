// src/types/database.ts
// Auto-generated Supabase types for MAXION

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          created_at: string
          last_active: string
          total_deposited: number
          total_withdrawn: number
          risk_profile: 'conservative' | 'balanced' | 'aggressive'
        }
        Insert: {
          id?: string
          wallet_address: string
          created_at?: string
          last_active?: string
          total_deposited?: number
          total_withdrawn?: number
          risk_profile?: 'conservative' | 'balanced' | 'aggressive'
        }
        Update: {
          id?: string
          wallet_address?: string
          created_at?: string
          last_active?: string
          total_deposited?: number
          total_withdrawn?: number
          risk_profile?: 'conservative' | 'balanced' | 'aggressive'
        }
      }
      allocations: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          asset_id: string
          asset_name: string
          amount: number
          shares: number
          apy: number
          risk_level: string
          timestamp: string
          tx_hash: string | null
          status: 'pending' | 'confirmed' | 'failed'
        }
        Insert: {
          id?: string
          user_id: string
          wallet_address: string
          asset_id: string
          asset_name: string
          amount: number
          shares: number
          apy: number
          risk_level: string
          timestamp?: string
          tx_hash?: string | null
          status?: 'pending' | 'confirmed' | 'failed'
        }
        Update: {
          id?: string
          user_id?: string
          wallet_address?: string
          asset_id?: string
          asset_name?: string
          amount?: number
          shares?: number
          apy?: number
          risk_level?: string
          timestamp?: string
          tx_hash?: string | null
          status?: 'pending' | 'confirmed' | 'failed'
        }
      }
      ai_analyses: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          query: string
          response: string
          context: Json | null
          timestamp: string
          model_used: string
          tokens_used: number | null
        }
        Insert: {
          id?: string
          user_id: string
          wallet_address: string
          query: string
          response: string
          context?: Json | null
          timestamp?: string
          model_used?: string
          tokens_used?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          wallet_address?: string
          query?: string
          response?: string
          context?: Json | null
          timestamp?: string
          model_used?: string
          tokens_used?: number | null
        }
      }
      asset_performance: {
        Row: {
          id: string
          asset_id: string
          asset_name: string
          current_apy: number
          current_tvl: number
          risk_level: string
          last_updated: string
          performance_history: Json | null
        }
        Insert: {
          id?: string
          asset_id: string
          asset_name: string
          current_apy: number
          current_tvl: number
          risk_level: string
          last_updated?: string
          performance_history?: Json | null
        }
        Update: {
          id?: string
          asset_id?: string
          asset_name?: string
          current_apy?: number
          current_tvl?: number
          risk_level?: string
          last_updated?: string
          performance_history?: Json | null
        }
      }
    }
    Views: {
      user_portfolio_overview: {
        Row: {
          wallet_address: string
          risk_profile: 'conservative' | 'balanced' | 'aggressive'
          total_allocations: number
          total_invested: number
          weighted_apy: number
          total_shares: number
          last_active: string
        }
      }
      recent_activity: {
        Row: {
          id: string
          wallet_address: string
          asset_name: string
          amount: number
          apy: number
          status: 'pending' | 'confirmed' | 'failed'
          timestamp: string
          tx_hash: string | null
          activity_type: string
        }
      }
    }
    Functions: {
      get_user_stats: {
        Args: {
          p_wallet_address: string
        }
        Returns: {
          total_allocated: number
          total_shares: number
          average_apy: number
          allocation_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Allocation = Database['public']['Tables']['allocations']['Row']
export type AllocationInsert = Database['public']['Tables']['allocations']['Insert']
export type AllocationUpdate = Database['public']['Tables']['allocations']['Update']

export type AIAnalysis = Database['public']['Tables']['ai_analyses']['Row']
export type AIAnalysisInsert = Database['public']['Tables']['ai_analyses']['Insert']
export type AIAnalysisUpdate = Database['public']['Tables']['ai_analyses']['Update']

export type AssetPerformance = Database['public']['Tables']['asset_performance']['Row']
export type AssetPerformanceInsert = Database['public']['Tables']['asset_performance']['Insert']
export type AssetPerformanceUpdate = Database['public']['Tables']['asset_performance']['Update']

export type UserPortfolioOverview = Database['public']['Views']['user_portfolio_overview']['Row']
export type RecentActivity = Database['public']['Views']['recent_activity']['Row']
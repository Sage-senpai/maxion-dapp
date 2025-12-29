// src/lib/supabase.ts
// Supabase client configuration for MAXION

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// ============================================================================
// CLIENT CONFIGURATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// ============================================================================
// CLIENT INSTANCES
// ============================================================================

/**
 * Client-side Supabase client (uses anon key)
 * Use this in React components and client-side code
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Server-side Supabase client (uses service role key)
 * Use this in API routes for admin operations
 * NEVER expose this to the client
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Get Supabase connection status
 */
export async function getConnectionStatus(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      return { connected: false, error: error.message };
    }
    
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle Supabase errors consistently
 */
export function handleSupabaseError(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  // PostgreSQL error codes
  const errorMessages: Record<string, string> = {
    '23505': 'This record already exists',
    '23503': 'Referenced record not found',
    '23502': 'Required field is missing',
    '22P02': 'Invalid input format',
    '42501': 'Permission denied',
  };
  
  // Check for PostgreSQL error code
  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code];
  }
  
  // Return the error message if available
  return error.message || 'Database operation failed';
}

/**
 * Format Supabase timestamp to Date
 */
export function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isSupabaseError(error: any): error is { message: string; code?: string } {
  return error && typeof error === 'object' && 'message' in error;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default supabase;

// Export types for convenience
export type { Database } from '@/types/database';
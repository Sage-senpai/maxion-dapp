// src/lib/utils/validators.ts
// Location: src/lib/utils/validators.ts
// Input validation utilities for MAXION

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash format
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate allocation amount
 */
export function validateAllocationAmount(
  amount: string,
  options: {
    min?: number;
    max?: number;
    balance?: number;
  } = {}
): {
  valid: boolean;
  error?: string;
} {
  const { min = 0, max = Infinity, balance = Infinity } = options;

  // Check if empty
  if (!amount || amount.trim() === '') {
    return { valid: false, error: 'Amount is required' };
  }

  // Parse amount
  const numAmount = parseFloat(amount);

  // Check if valid number
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Please enter a valid number' };
  }

  // Check if positive
  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  // Check minimum
  if (numAmount < min) {
    return {
      valid: false,
      error: `Minimum amount is $${min.toLocaleString()}`,
    };
  }

  // Check maximum
  if (numAmount > max) {
    return {
      valid: false,
      error: `Maximum amount is $${max.toLocaleString()}`,
    };
  }

  // Check balance
  if (numAmount > balance) {
    return {
      valid: false,
      error: `Insufficient balance. Available: $${balance.toLocaleString()}`,
    };
  }

  return { valid: true };
}

/**
 * Validate APY value
 */
export function isValidAPY(apy: number): boolean {
  return apy >= 0 && apy <= 100 && !isNaN(apy);
}

/**
 * Validate risk profile
 */
export function isValidRiskProfile(profile: string): boolean {
  const validProfiles = ['conservative', 'balanced', 'aggressive'];
  return validProfiles.includes(profile.toLowerCase());
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100 && !isNaN(value);
}

/**
 * Sanitize user input (remove dangerous characters)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/['"]/g, '') // Remove quotes
    .trim();
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date
): {
  valid: boolean;
  error?: string;
} {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  if (startDate >= endDate) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain special characters');
  }

  // Determine strength
  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
  }

  return {
    valid: errors.length === 0,
    strength,
    errors,
  };
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  const validChainIds = [5000, 5003]; // Mantle Mainnet and Testnet
  return validChainIds.includes(chainId);
}

/**
 * Validate gas limit
 */
export function isValidGasLimit(gasLimit: number): boolean {
  return gasLimit > 0 && gasLimit <= 30000000 && !isNaN(gasLimit);
}

/**
 * Validate slippage tolerance (0-100%)
 */
export function validateSlippage(slippage: number): {
  valid: boolean;
  warning?: string;
} {
  if (isNaN(slippage) || slippage < 0 || slippage > 100) {
    return { valid: false };
  }

  if (slippage > 5) {
    return {
      valid: true,
      warning: 'High slippage tolerance may result in unfavorable trades',
    };
  }

  return { valid: true };
}
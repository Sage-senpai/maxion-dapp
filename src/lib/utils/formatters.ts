// src/lib/utils/formatters.ts
// Location: src/lib/utils/formatters.ts
// Formatting utilities for MAXION - numbers, dates, addresses

/**
 * Format currency with commas and optional decimals
 */
export function formatCurrency(
  value: number,
  options: {
    decimals?: number;
    symbol?: string;
    compact?: boolean;
  } = {}
): string {
  const { decimals = 2, symbol = '$', compact = false } = options;

  if (compact && value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  }
  if (compact && value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}K`;
  }

  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format percentage with optional decimals
 */
export function formatPercentage(
  value: number,
  options: {
    decimals?: number;
    showSign?: boolean;
  } = {}
): string {
  const { decimals = 2, showSign = false } = options;
  
  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';
  
  return `${sign}${formatted}%`;
}

/**
 * Format wallet address (shortened)
 */
export function formatAddress(
  address: string,
  options: {
    start?: number;
    end?: number;
  } = {}
): string {
  const { start = 6, end = 4 } = options;
  
  if (!address) return '';
  if (address.length <= start + end) return address;
  
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format transaction hash (shortened)
 */
export function formatTxHash(
  hash: string,
  options: {
    start?: number;
    end?: number;
  } = {}
): string {
  return formatAddress(hash, options);
}

/**
 * Format large numbers with K/M/B suffix
 */
export function formatCompactNumber(value: number, decimals: number = 1): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(decimals)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }
  return value.toString();
}

/**
 * Format APY display
 */
export function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

/**
 * Format duration (e.g., "6 months", "1 year")
 */
export function formatDuration(months: number): string {
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const years = months / 12;
  return `${years} year${years !== 1 ? 's' : ''}`;
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}

/**
 * Format date to readable string
 */
export function formatDate(
  date: Date,
  options: {
    includeTime?: boolean;
    short?: boolean;
  } = {}
): string {
  const { includeTime = false, short = false } = options;

  if (short) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (includeTime) {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format token amount from wei/smallest unit
 */
export function formatTokenAmount(
  value: bigint | string | number,
  decimals: number = 18,
  options: {
    maxDecimals?: number;
    compact?: boolean;
  } = {}
): string {
  const { maxDecimals = 4, compact = false } = options;

  const numValue =
    typeof value === 'bigint'
      ? Number(value) / Math.pow(10, decimals)
      : typeof value === 'string'
      ? parseFloat(value)
      : value;

  if (compact) {
    return formatCompactNumber(numValue, 2);
  }

  return numValue.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Calculate and format change percentage
 */
export function formatChange(oldValue: number, newValue: number): string {
  if (oldValue === 0) return '+0.00%';
  
  const change = ((newValue - oldValue) / oldValue) * 100;
  const sign = change >= 0 ? '+' : '';
  
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Format risk level with color indicator
 */
export function formatRiskLevel(risk: string): {
  label: string;
  color: string;
} {
  const colorMap: Record<string, string> = {
    Low: '#3EF3A3',
    'Low-Medium': '#2BD9FE',
    Medium: '#FACC15',
    'Medium-High': '#FF8C42',
    High: '#EF4444',
  };

  return {
    label: risk,
    color: colorMap[risk] || '#9CA3AF',
  };
}
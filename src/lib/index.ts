// src/lib/index.ts - CLEANED UP VERSION
// Remove circular imports and organize better

// ============================================================================
// CONSTANTS
// ============================================================================
export {
  COLORS,
  MOCK_RWA_ASSETS,
  RISK_PROFILES,
  RISK_COLOR_MAP,
  NAV_ITEMS,
  API_ENDPOINTS,
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
} from './constants';

export type { RWAAsset } from './constants';

// ============================================================================
// UTILITIES - Import directly, don't re-export from validators
// ============================================================================
export {
  formatCurrency,
  formatPercentage,
  formatAddress,
  formatTxHash,
  formatCompactNumber,
  formatAPY,
  formatDuration,
  formatRelativeTime,
  formatDate,
  formatTokenAmount,
  formatChange,
  formatRiskLevel,
} from './utils/formatters';

export {
  isValidAddress,
  isValidTxHash,
  validateAllocationAmount,
  isValidAPY,
  isValidRiskProfile,
  isValidEmail,
  isValidURL,
  isValidPercentage,
  sanitizeInput,
  isValidObjectId,
  validateDateRange,
  validatePasswordStrength,
  isValidChainId,
  isValidGasLimit,
  validateSlippage,
} from './utils/validators';

export { cn } from './utils';

// ============================================================================
// API CLIENT
// ============================================================================
export { userAPI, allocationAPI, aiAPI, handleAPIError, isAPIError } from './api';

// ============================================================================
// CONTRACT UTILITIES
// ============================================================================
export {
  USDC_DECIMALS,
  SHARE_DECIMALS,
  MIN_DEPOSIT,
  formatUSDC,
  parseUSDC,
  formatShares,
  parseShares,
  calculateShares,
  calculateAssets,
  calculateAPY,
  calculateEstimatedYield,
  calculateMonthlyYield,
  validateDepositAmount,
  validateWithdrawShares,
  estimateDepositGas,
  estimateWithdrawGas,
  estimateApprovalGas,
  getVaultAddress,
  getUSDCAddress,
  YieldVaultABI,
  ERC20ABI,
  VAULT_EVENTS,
  ERC20_EVENTS,
  CONTRACT_ERRORS,
} from './contracts';

// ============================================================================
// WEB3 CONFIG
// ============================================================================
export { config, mantleTestnet, mantleMainnet, CONTRACTS, getContracts } from './web3/config';

// ============================================================================
// WEB3 HOOKS
// ============================================================================
export {
  useVaultBalance,
  useUserPosition,
  useSharePrice,
  usePreviewDeposit,
  useTotalAssets,
  useUSDCBalance,
  useUSDCAllowance,
  useApproveUSDC,
  useDeposit,
  useWithdraw,
  formatTokenAmount as formatToken,
  parseTokenAmount,
} from './web3/hooks';

// ============================================================================
// HELPER FUNCTIONS - NO CIRCULAR IMPORTS
// ============================================================================
import { RISK_COLOR_MAP, COLORS } from './constants';

export function getRiskScore(risk: string): number {
  const scores: Record<string, number> = {
    Low: 1,
    'Low-Medium': 2,
    Medium: 3,
    'Medium-High': 4,
    High: 5,
  };
  return scores[risk] || 3;
}

export function getRiskColor(risk: string): string {
  return RISK_COLOR_MAP[risk as keyof typeof RISK_COLOR_MAP] || COLORS.warningAmber;
}

export function formatRiskProfileName(profile: string): string {
  return profile.charAt(0).toUpperCase() + profile.slice(1);
}

export function isWalletConnected(address: string | undefined): boolean {
  return !!address && /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
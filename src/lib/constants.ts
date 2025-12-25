// src/lib/constants.ts
// Location: src/lib/constants.ts
// App constants, colors, and mock RWA data for MAXION

// ============================================================================
// MAXION DESIGN SYSTEM
// ============================================================================

export const COLORS = {
  maxionGreen: '#3EF3A3',
  obsidianBlack: '#0B0E11',
  graphitePanel: '#161B22',
  slateGrey: '#1F2937',
  signalCyan: '#2BD9FE',
  riskRed: '#EF4444',
  warningAmber: '#FACC15',
} as const;

export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;
// ============================================================================
// MOCK RWA ASSETS DATA
// In production, this would come from API/smart contracts
// ============================================================================
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type AssetCategory = 'Treasury' | 'Real Estate' | 'Private Credit' | 'Commodities';
export interface RWAAsset {
  id: string;
  name: string;
  category: AssetCategory;
  apy: number;
  tvl: string;
  risk: RiskLevel;
  minInvestment: string;
  description: string;
  features: string[];
  contractAddress?: string;
  verified: boolean;
}

export const MOCK_ASSETS: RWAAsset[] = [
  {
    id: 'treasury-1',
    name: 'US Treasury Token',
    category: 'Treasury',
    apy: 5.2,
    tvl: '$125M',
    risk: 'Low',
    minInvestment: '100 USDC',
    description: 'Tokenized US Treasury bills with institutional backing',
    features: ['Zero default risk', 'Daily liquidity', 'Government backed'],
    verified: true,
  },
  {
    id: 'realestate-1',
    name: 'Manhattan Property Fund',
    category: 'Real Estate',
    apy: 8.5,
    tvl: '$85M',
    risk: 'Medium',
    minInvestment: '1,000 USDC',
    description: 'Prime commercial real estate in New York',
    features: ['Prime location', 'Rental income', 'Property appreciation'],
    verified: true,
  },
  {
    id: 'credit-1',
    name: 'Senior Credit Pool',
    category: 'Private Credit',
    apy: 12.3,
    tvl: '$45M',
    risk: 'Medium',
    minInvestment: '5,000 USDC',
    description: 'Diversified senior secured lending',
    features: ['Asset-backed', 'Monthly distributions', 'Credit rated'],
    verified: true,
  },
  {
    id: 'commodities-1',
    name: 'Gold Reserve Token',
    category: 'Commodities',
    apy: 3.8,
    tvl: '$95M',
    risk: 'Low',
    minInvestment: '500 USDC',
    description: 'Physical gold with vault storage',
    features: ['Physical backing', 'Inflation hedge', 'Instant redemption'],
    verified: true,
  },
];

// ============================================================================
// RISK PROFILES
// ============================================================================

export const RISK_PROFILES = [
  {
    id: 'conservative',
    label: 'Conservative',
    description: 'Focus on capital preservation with stable returns',
    color: COLORS.maxionGreen,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Balance between growth and stability',
    color: COLORS.signalCyan,
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    description: 'Maximum yield potential with higher risk tolerance',
    color: COLORS.warningAmber,
  },
] as const;

// ============================================================================
// RISK COLOR MAPPING
// ============================================================================

export const RISK_COLOR_MAP = {
  'Low': COLORS.maxionGreen,
  'Low-Medium': COLORS.signalCyan,
  'Medium': COLORS.warningAmber,
  'Medium-High': '#FF8C42',
  'High': COLORS.riskRed,
} as const;

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'assets', label: 'RWA Assets' },
  { id: 'allocate', label: 'Allocate' },
  { id: 'portfolio', label: 'Portfolio' },
] as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  users: '/api/users',
  allocations: '/api/allocations',
  aiAnalyze: '/api/ai/analyze',
} as const;

// ============================================================================
// APP METADATA
// ============================================================================

export const APP_NAME = 'MAXION';
export const APP_TAGLINE = 'Intelligence for real yield';
export const APP_DESCRIPTION = 'Intelligence Layer for Real-World Yield on Mantle';
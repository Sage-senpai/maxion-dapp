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

export type RiskLevel = 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High';
export type AssetCategory = 'Treasury' | 'Real Estate' | 'Private Credit' | 'Commodities' | 'Infrastructure';

export interface RWAAsset {
  id: string;
  name: string;
  category?: AssetCategory;
  type: string;
  apy: number;
  tvl: number;
  risk: RiskLevel;
  duration: string;
  minInvestment: number;
  description: string;
  features?: string[];
  contractAddress?: string;
  verified?: boolean;
}

export const MOCK_RWA_ASSETS: RWAAsset[] = [
  {
    id: 'rwa-1',
    name: 'US Treasury Bond Pool',
    category: 'Treasury',
    type: 'Government Bonds',
    apy: 4.2,
    tvl: 125000000,
    risk: 'Low',
    duration: '6 months',
    minInvestment: 100,
    description: 'Tokenized US Treasury bills with institutional backing and daily liquidity',
    features: ['Zero default risk', 'Daily liquidity', 'Government backed'],
    verified: true,
  },
  {
    id: 'rwa-2',
    name: 'Real Estate Income Fund',
    category: 'Real Estate',
    type: 'Real Estate',
    apy: 7.8,
    tvl: 85000000,
    risk: 'Medium',
    duration: '12 months',
    minInvestment: 1000,
    description: 'Prime commercial real estate in New York with rental income streams',
    features: ['Prime location', 'Rental income', 'Property appreciation'],
    verified: true,
  },
  {
    id: 'rwa-3',
    name: 'Corporate Credit Facility',
    category: 'Private Credit',
    type: 'Private Credit',
    apy: 12.3,
    tvl: 45000000,
    risk: 'Medium-High',
    duration: '18 months',
    minInvestment: 5000,
    description: 'Diversified senior secured lending to established businesses',
    features: ['Asset-backed', 'Monthly distributions', 'Credit rated'],
    verified: true,
  },
  {
    id: 'rwa-4',
    name: 'Infrastructure Debt',
    category: 'Infrastructure',
    type: 'Infrastructure',
    apy: 6.4,
    tvl: 95000000,
    risk: 'Low-Medium',
    duration: '24 months',
    minInvestment: 500,
    description: 'Long-term infrastructure projects with stable cash flows',
    features: ['Government contracts', 'Stable returns', 'ESG compliant'],
    verified: true,
  },
  {
    id: 'rwa-5',
    name: 'Gold Reserve Token',
    category: 'Commodities',
    type: 'Commodities',
    apy: 3.8,
    tvl: 65000000,
    risk: 'Low',
    duration: '3 months',
    minInvestment: 500,
    description: 'Physical gold with vault storage and instant redemption',
    features: ['Physical backing', 'Inflation hedge', 'Instant redemption'],
    verified: true,
  },
  {
    id: 'rwa-6',
    name: 'European Real Estate REIT',
    category: 'Real Estate',
    type: 'Real Estate',
    apy: 9.2,
    tvl: 72000000,
    risk: 'Medium',
    duration: '12 months',
    minInvestment: 2000,
    description: 'Diversified European commercial and residential properties',
    features: ['Geographic diversification', 'Strong Euro zone', 'Professional management'],
    verified: true,
  },
  {
    id: 'rwa-7',
    name: 'Private Equity Fund',
    category: 'Private Credit',
    type: 'Private Credit',
    apy: 15.7,
    tvl: 38000000,
    risk: 'High',
    duration: '36 months',
    minInvestment: 10000,
    description: 'Late-stage private equity with proven track record',
    features: ['High returns', 'Selective investments', 'Expert management'],
    verified: true,
  },
  {
    id: 'rwa-8',
    name: 'Municipal Bond Portfolio',
    category: 'Treasury',
    type: 'Government Bonds',
    apy: 5.5,
    tvl: 110000000,
    risk: 'Low',
    duration: '9 months',
    minInvestment: 250,
    description: 'Tax-advantaged municipal bonds from AAA-rated cities',
    features: ['Tax benefits', 'Low risk', 'Stable income'],
    verified: true,
  },
];

// Export alias for backward compatibility
export const MOCK_ASSETS = MOCK_RWA_ASSETS;

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
  assets: '/api/assets',
} as const;

// ============================================================================
// APP METADATA
// ============================================================================

export const APP_NAME = 'MAXION';
export const APP_TAGLINE = 'Intelligence for real yield';
export const APP_DESCRIPTION = 'Intelligence Layer for Real-World Yield on Mantle';
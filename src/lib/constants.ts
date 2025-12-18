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

// ============================================================================
// MOCK RWA ASSETS DATA
// In production, this would come from API/smart contracts
// ============================================================================

export interface RWAAsset {
  id: string;
  name: string;
  type: string;
  apy: number;
  tvl: number;
  risk: 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High';
  duration: string;
  minInvestment: number;
  description: string;
}

export const MOCK_RWA_ASSETS: RWAAsset[] = [
  {
    id: 'rwa-001',
    name: 'US Treasury Bond Pool',
    type: 'Government Bonds',
    apy: 4.2,
    tvl: 12500000,
    risk: 'Low',
    duration: '6 months',
    minInvestment: 1000,
    description: 'Tokenized US Treasury bonds with automatic yield distribution',
  },
  {
    id: 'rwa-002',
    name: 'Real Estate Income Fund',
    type: 'Real Estate',
    apy: 7.8,
    tvl: 8300000,
    risk: 'Medium',
    duration: '12 months',
    minInvestment: 5000,
    description: 'Diversified commercial real estate portfolio with quarterly distributions',
  },
  {
    id: 'rwa-003',
    name: 'Corporate Credit Facility',
    type: 'Private Credit',
    apy: 11.5,
    tvl: 5200000,
    risk: 'Medium-High',
    duration: '18 months',
    minInvestment: 10000,
    description: 'Senior secured loans to mid-market companies',
  },
  {
    id: 'rwa-004',
    name: 'Infrastructure Debt',
    type: 'Infrastructure',
    apy: 6.4,
    tvl: 15800000,
    risk: 'Low-Medium',
    duration: '24 months',
    minInvestment: 2500,
    description: 'Long-term infrastructure projects with stable cash flows',
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
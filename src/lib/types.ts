// 2. src/lib/types.ts
// ============================================================================
export interface UserPortfolio {
  totalValue: number;
  totalInvested: number;
  totalEarnings: number;
  positions: Position[];
  riskScore: number;
  diversification: number;
}

export interface Position {
  assetId: string;
  assetName: string;
  amount: number;
  value: number;
  apy: number;
  earnings: number;
  startDate: Date;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'stake' | 'unstake' | 'claim';
  assetId: string;
  assetName: string;
  amount: number;
  value: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

export interface AIAnalysisRequest {
  walletAddress: string;
  query: string;
  context?: {
    assetId?: string;
    assetName?: string;
    apy?: number;
    riskLevel?: RiskLevel;
  };
}

export interface AIAnalysisResponse {
  analysis: {
    response: string;
    confidence: number;
    suggestions?: string[];
  };
  timestamp: Date;
}

export interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: Date;
}
// src/app/api/assets/route.ts
// Location: src/app/api/assets/route.ts
// Assets API endpoint - fetch RWA assets data

import { NextRequest, NextResponse } from 'next/server';
import { MOCK_RWA_ASSETS } from '@/lib/constants';

// ============================================================================
// GET - Fetch all assets
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const riskFilter = searchParams.get('risk');
    const typeFilter = searchParams.get('type');
    const minAPY = searchParams.get('minAPY');
    const maxAPY = searchParams.get('maxAPY');

    let filteredAssets = [...MOCK_RWA_ASSETS];

    // Apply filters
    if (riskFilter) {
      filteredAssets = filteredAssets.filter(
        (asset) => asset.risk.toLowerCase() === riskFilter.toLowerCase()
      );
    }

    if (typeFilter) {
      filteredAssets = filteredAssets.filter(
        (asset) => asset.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (minAPY) {
      const minAPYNum = parseFloat(minAPY);
      filteredAssets = filteredAssets.filter((asset) => asset.apy >= minAPYNum);
    }

    if (maxAPY) {
      const maxAPYNum = parseFloat(maxAPY);
      filteredAssets = filteredAssets.filter((asset) => asset.apy <= maxAPYNum);
    }

    return NextResponse.json({
      success: true,
      assets: filteredAssets,
      count: filteredAssets.length,
    });
  } catch (error) {
    console.error('GET /api/assets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
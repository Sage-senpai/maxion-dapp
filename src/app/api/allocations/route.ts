// src/app/api/allocations/route.ts
// FIXED: Supabase raw SQL issue

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const createAllocationSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  assetId: z.string(),
  assetName: z.string(),
  amount: z.number().positive(),
  shares: z.number().positive(),
  apy: z.number(),
  riskLevel: z.string(),
  txHash: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'failed']).optional(),
});

// ============================================================================
// GET - Fetch allocations
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const normalized = walletAddress.toLowerCase();

    // Fetch allocations with pagination
    const { data: allocations, error, count } = await supabaseAdmin
      .from('allocations')
      .select('*', { count: 'exact' })
      .eq('wallet_address', normalized)
      .order('timestamp', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    // Calculate stats using Supabase function
    const { data: stats } = await supabaseAdmin
      .rpc('get_user_stats', { p_wallet_address: normalized });

    const statsData = stats?.[0] || {
      total_allocated: 0,
      total_shares: 0,
      average_apy: 0,
      allocation_count: 0,
    };

    return NextResponse.json({
      success: true,
      allocations: allocations.map(a => ({
        id: a.id,
        assetId: a.asset_id,
        assetName: a.asset_name,
        amount: a.amount,
        shares: a.shares,
        apy: a.apy,
        riskLevel: a.risk_level,
        timestamp: a.timestamp,
        txHash: a.tx_hash,
        status: a.status,
      })),
      stats: {
        totalAmount: statsData.total_allocated,
        totalShares: statsData.total_shares,
        averageAPY: statsData.average_apy,
        count: statsData.allocation_count,
      },
      pagination: {
        limit,
        skip,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('GET /api/allocations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create new allocation
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = createAllocationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;
    const normalized = data.walletAddress.toLowerCase();

    // Get or create user
    let { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', normalized)
      .single();

    if (userError && userError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({ wallet_address: normalized, risk_profile: 'balanced' })
        .select('id')
        .single();

      if (createError) throw createError;
      user = newUser;
    } else if (userError) {
      throw userError;
    }

    // Create allocation
    const { data: allocation, error } = await supabaseAdmin
      .from('allocations')
      .insert({
        user_id: user!.id,
        wallet_address: normalized,
        asset_id: data.assetId,
        asset_name: data.assetName,
        amount: data.amount,
        shares: data.shares,
        apy: data.apy,
        risk_level: data.riskLevel,
        tx_hash: data.txHash,
        status: data.status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // FIXED: Update user total deposited if confirmed - use RPC instead of raw
    if (data.status === 'confirmed') {
      // First get current total
      const { data: currentUser } = await supabaseAdmin
        .from('users')
        .select('total_deposited')
        .eq('id', user!.id)
        .single();

      // Then update with calculated value
      const newTotal = (currentUser?.total_deposited || 0) + data.amount;
      
      await supabaseAdmin
        .from('users')
        .update({
          total_deposited: newTotal,
          last_active: new Date().toISOString(),
        })
        .eq('id', user!.id);
    }

    return NextResponse.json({
      success: true,
      allocation: {
        id: allocation.id,
        assetId: allocation.asset_id,
        assetName: allocation.asset_name,
        amount: allocation.amount,
        shares: allocation.shares,
        apy: allocation.apy,
        riskLevel: allocation.risk_level,
        timestamp: allocation.timestamp,
        status: allocation.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/allocations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update allocation status
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const { data: allocation, error } = await supabaseAdmin
      .from('allocations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Allocation not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      allocation: {
        id: allocation.id,
        status: allocation.status,
      },
    });
  } catch (error) {
    console.error('PATCH /api/allocations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
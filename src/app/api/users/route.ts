// src/app/api/users/route.ts
// User management API with Supabase

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  riskProfile: z.enum(['conservative', 'balanced', 'aggressive']).optional(),
});

const updateUserSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  riskProfile: z.enum(['conservative', 'balanced', 'aggressive']).optional(),
  totalDeposited: z.number().optional(),
  totalWithdrawn: z.number().optional(),
});

// ============================================================================
// GET - Fetch user by wallet address
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const normalized = walletAddress.toLowerCase();

    // Fetch user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', normalized)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Update last active timestamp
    await supabaseAdmin
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        createdAt: user.created_at,
        lastActive: user.last_active,
        totalDeposited: user.total_deposited,
        totalWithdrawn: user.total_withdrawn,
        riskProfile: user.risk_profile,
      },
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create new user
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { walletAddress, riskProfile } = validation.data;
    const normalized = walletAddress.toLowerCase();

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', normalized)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists', user: existingUser },
        { status: 409 }
      );
    }

    // Create new user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        wallet_address: normalized,
        risk_profile: riskProfile || 'balanced',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        walletAddress: newUser.wallet_address,
        createdAt: newUser.created_at,
        riskProfile: newUser.risk_profile,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update user
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { walletAddress, ...updates } = validation.data;
    const normalized = walletAddress.toLowerCase();

    // Build update object
    const updateData: any = {};
    if (updates.riskProfile) updateData.risk_profile = updates.riskProfile;
    if (updates.totalDeposited !== undefined) updateData.total_deposited = updates.totalDeposited;
    if (updates.totalWithdrawn !== undefined) updateData.total_withdrawn = updates.totalWithdrawn;

    // Update user
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('wallet_address', normalized)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        walletAddress: updatedUser.wallet_address,
        createdAt: updatedUser.created_at,
        lastActive: updatedUser.last_active,
        totalDeposited: updatedUser.total_deposited,
        totalWithdrawn: updatedUser.total_withdrawn,
        riskProfile: updatedUser.risk_profile,
      },
    });
  } catch (error) {
    console.error('PATCH /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
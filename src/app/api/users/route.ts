// src/app/api/users/route.ts
// FIXED: Better error messages, proper 404 handling, auto-creation support

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
        { 
          success: false,
          error: 'Wallet address is required' 
        },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid wallet address format' 
        },
        { status: 400 }
      );
    }

    const normalized = walletAddress.toLowerCase();

    console.log('🔍 Fetching user:', normalized);

    // Fetch user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', normalized)
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      
      if (error.code === 'PGRST116') {
        // User not found - return 404 with helpful message
        return NextResponse.json(
          { 
            success: false,
            error: 'User not found',
            message: 'No account exists for this wallet address. Please create an account first.',
            code: 'USER_NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      throw error;
    }

    console.log('✅ User found:', user);

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
  } catch (error: any) {
    console.error('❌ GET /api/users error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      },
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
        { 
          success: false,
          error: 'Invalid input', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { walletAddress, riskProfile } = validation.data;
    const normalized = walletAddress.toLowerCase();

    console.log('👤 Creating user:', normalized);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', normalized)
      .single();

    if (existingUser) {
      console.log('ℹ️ User already exists:', existingUser);
      return NextResponse.json(
        { 
          success: false,
          error: 'User already exists',
          code: 'USER_EXISTS',
          user: {
            id: existingUser.id,
            walletAddress: existingUser.wallet_address,
            createdAt: existingUser.created_at,
            riskProfile: existingUser.risk_profile,
          }
        },
        { status: 409 }
      );
    }

    // Create new user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        wallet_address: normalized,
        risk_profile: riskProfile || 'balanced',
        total_deposited: 0,
        total_withdrawn: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }

    console.log('✅ User created successfully:', newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        walletAddress: newUser.wallet_address,
        createdAt: newUser.created_at,
        riskProfile: newUser.risk_profile,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ POST /api/users error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to create user'
      },
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
        { 
          success: false,
          error: 'Invalid input', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { walletAddress, ...updates } = validation.data;
    const normalized = walletAddress.toLowerCase();

    console.log('📝 Updating user:', normalized);

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
      console.error('❌ Update error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND'
          },
          { status: 404 }
        );
      }
      throw error;
    }

    console.log('✅ User updated:', updatedUser);

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
  } catch (error: any) {
    console.error('❌ PATCH /api/users error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to update user'
      },
      { status: 500 }
    );
  }
}
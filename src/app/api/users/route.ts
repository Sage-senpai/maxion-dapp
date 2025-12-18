// src/app/api/users/route.ts
// Location: src/app/api/users/route.ts
// User management API endpoints

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/schemas';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  riskProfile: z.enum(['conservative', 'balanced', 'aggressive']).optional(),
});

// ============================================================================
// GET - Fetch user by wallet address
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const normalized = walletAddress.toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ walletAddress: normalized });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
        totalDeposited: user.totalDeposited,
        totalWithdrawn: user.totalWithdrawn,
        riskProfile: user.riskProfile,
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
    await connectDB();

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

    const existingUser = await User.findOne({ walletAddress: normalized });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists', user: existingUser },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      walletAddress: normalized,
      riskProfile: riskProfile || 'balanced',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        walletAddress: newUser.walletAddress,
        createdAt: newUser.createdAt,
        riskProfile: newUser.riskProfile,
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
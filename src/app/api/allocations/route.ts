// src/app/api/allocations/route.ts
// Location: src/app/api/allocations/route.ts
// Allocation tracking API endpoints

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Allocation, User } from '@/lib/models/schemas';
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
    await connectDB();

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

    const allocations = await Allocation.find({ walletAddress: normalized })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const stats = await Allocation.aggregate([
      { $match: { walletAddress: normalized, status: 'confirmed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalShares: { $sum: '$shares' },
          averageAPY: { $avg: '$apy' },
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      allocations: allocations.map(a => ({
        id: a._id,
        assetId: a.assetId,
        assetName: a.assetName,
        amount: a.amount,
        shares: a.shares,
        apy: a.apy,
        riskLevel: a.riskLevel,
        timestamp: a.timestamp,
        txHash: a.txHash,
        status: a.status,
      })),
      stats: stats[0] || {
        totalAmount: 0,
        totalShares: 0,
        averageAPY: 0,
        count: 0,
      },
      pagination: {
        limit,
        skip,
        total: await Allocation.countDocuments({ walletAddress: normalized }),
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
    await connectDB();

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

    let user = await User.findOne({ walletAddress: normalized });
    if (!user) {
      user = await User.create({
        walletAddress: normalized,
        riskProfile: 'balanced',
      });
    }

    const allocation = await Allocation.create({
      userId: user._id,
      walletAddress: normalized,
      assetId: data.assetId,
      assetName: data.assetName,
      amount: data.amount,
      shares: data.shares,
      apy: data.apy,
      riskLevel: data.riskLevel,
      txHash: data.txHash,
      status: data.status || 'pending',
    });

    if (data.status === 'confirmed') {
      user.totalDeposited += data.amount;
      user.lastActive = new Date();
      await user.save();
    }

    return NextResponse.json({
      success: true,
      allocation: {
        id: allocation._id,
        assetId: allocation.assetId,
        assetName: allocation.assetName,
        amount: allocation.amount,
        shares: allocation.shares,
        apy: allocation.apy,
        riskLevel: allocation.riskLevel,
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
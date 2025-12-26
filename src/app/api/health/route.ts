// src/app/api/health/route.ts
// Database health check endpoint
// Visit: http://localhost:3000/api/health

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Allocation, AIAnalysis } from '@/lib/models/schemas';

export async function GET() {
  try {
    // Try to connect
    await connectDB();

    // Count documents
    const userCount = await User.countDocuments();
    const allocationCount = await Allocation.countDocuments();
    const analysisCount = await AIAnalysis.countDocuments();

    // Get sample data
    const sampleUser = await User.findOne().lean();
    const recentAllocations = await Allocation.find()
      .sort({ timestamp: -1 })
      .limit(3)
      .lean();

    return NextResponse.json({
      status: 'healthy',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        collections: {
          users: {
            count: userCount,
            sample: sampleUser ? {
              walletAddress: sampleUser.walletAddress,
              riskProfile: sampleUser.riskProfile,
              createdAt: sampleUser.createdAt,
            } : null,
          },
          allocations: {
            count: allocationCount,
            recent: recentAllocations.map(a => ({
              assetName: a.assetName,
              amount: a.amount,
              status: a.status,
              timestamp: a.timestamp,
            })),
          },
          aiAnalyses: {
            count: analysisCount,
          },
        },
      },
      tips: {
        noData: userCount === 0 ? 'Run: npm run seed' : null,
        viewData: 'Visit MongoDB Atlas or use MongoDB Compass',
        testAccount: sampleUser ? `Use wallet: ${sampleUser.walletAddress}` : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      troubleshooting: [
        'Check MONGODB_URI in .env.local',
        'Verify MongoDB Atlas IP whitelist (0.0.0.0/0)',
        'Ensure MongoDB cluster is running',
        'Check network connection',
      ],
    }, { status: 500 });
  }
}
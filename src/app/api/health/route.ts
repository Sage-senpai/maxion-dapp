// src/app/api/health/route.ts
// Database health check with Supabase

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Test connection by counting users
    const { count: userCount, error: userError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: allocationCount, error: allocError } = await supabaseAdmin
      .from('allocations')
      .select('*', { count: 'exact', head: true });

    const { count: analysisCount, error: analysisError } = await supabaseAdmin
      .from('ai_analyses')
      .select('*', { count: 'exact', head: true });

    if (userError || allocError || analysisError) {
      throw userError || allocError || analysisError;
    }

    // Get sample data
    const { data: sampleUser } = await supabaseAdmin
      .from('users')
      .select('wallet_address, risk_profile, created_at')
      .limit(1)
      .single();

    const { data: recentAllocations } = await supabaseAdmin
      .from('allocations')
      .select('asset_name, amount, status, timestamp')
      .order('timestamp', { ascending: false })
      .limit(3);

    return NextResponse.json({
      status: 'healthy',
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        type: 'Supabase PostgreSQL',
        collections: {
          users: {
            count: userCount || 0,
            sample: sampleUser || null,
          },
          allocations: {
            count: allocationCount || 0,
            recent: recentAllocations || [],
          },
          aiAnalyses: {
            count: analysisCount || 0,
          },
        },
      },
      tips: {
        noData: (userCount || 0) === 0 ? 'Run seed script to populate data' : null,
        viewData: 'Visit Supabase Dashboard > Table Editor',
        testAccount: sampleUser ? `Use wallet: ${sampleUser.wallet_address}` : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Supabase connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      troubleshooting: [
        'Check NEXT_PUBLIC_SUPABASE_URL in .env.local',
        'Check NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
        'Check SUPABASE_SERVICE_ROLE_KEY in .env.local',
        'Verify Supabase project is active',
        'Check if tables exist in Supabase',
      ],
    }, { status: 500 });
  }
}
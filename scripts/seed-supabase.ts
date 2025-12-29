// scripts/seed-supabase.ts
// Seed script for Supabase
// Run with: npx tsx scripts/seed-supabase.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_USERS = [
  {
    wallet_address: '0x742d35cc6634c0532925a3b844bc9e7595f0beef',
    risk_profile: 'balanced',
    total_deposited: 45280,
    total_withdrawn: 0,
  },
  {
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
    risk_profile: 'conservative',
    total_deposited: 25000,
    total_withdrawn: 0,
  },
  {
    wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    risk_profile: 'aggressive',
    total_deposited: 100000,
    total_withdrawn: 15000,
  },
];

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  
  await supabase.from('ai_analyses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('✅ Database cleared');
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting Supabase seed...\n');

    // Clear existing data
    await clearDatabase();

    // Create users
    console.log('👤 Creating users...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .insert(SEED_USERS)
      .select();

    if (userError) throw userError;
    console.log(`✅ Created ${users.length} users`);

    // Create allocations for user 1
    console.log('💰 Creating allocations...');
    const allocations = [
      {
        user_id: users[0].id,
        wallet_address: users[0].wallet_address,
        asset_id: 'rwa-1',
        asset_name: 'US Treasury Bond Pool',
        amount: 15000,
        shares: 15000,
        apy: 4.2,
        risk_level: 'Low',
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed' as const,
        tx_hash: '0x' + Math.random().toString(16).substring(2, 66),
      },
      {
        user_id: users[0].id,
        wallet_address: users[0].wallet_address,
        asset_id: 'rwa-2',
        asset_name: 'Real Estate Income Fund',
        amount: 20000,
        shares: 20000,
        apy: 7.8,
        risk_level: 'Medium',
        timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed' as const,
        tx_hash: '0x' + Math.random().toString(16).substring(2, 66),
      },
      {
        user_id: users[0].id,
        wallet_address: users[0].wallet_address,
        asset_id: 'rwa-4',
        asset_name: 'Infrastructure Debt',
        amount: 10280,
        shares: 10280,
        apy: 6.4,
        risk_level: 'Low-Medium',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed' as const,
        tx_hash: '0x' + Math.random().toString(16).substring(2, 66),
      },
      {
        user_id: users[1].id,
        wallet_address: users[1].wallet_address,
        asset_id: 'rwa-1',
        asset_name: 'US Treasury Bond Pool',
        amount: 25000,
        shares: 25000,
        apy: 4.2,
        risk_level: 'Low',
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed' as const,
        tx_hash: '0x' + Math.random().toString(16).substring(2, 66),
      },
      {
        user_id: users[2].id,
        wallet_address: users[2].wallet_address,
        asset_id: 'rwa-3',
        asset_name: 'Corporate Credit Facility',
        amount: 50000,
        shares: 50000,
        apy: 12.3,
        risk_level: 'Medium-High',
        timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed' as const,
        tx_hash: '0x' + Math.random().toString(16).substring(2, 66),
      },
    ];

    const { data: allocs, error: allocError } = await supabase
      .from('allocations')
      .insert(allocations)
      .select();

    if (allocError) throw allocError;
    console.log(`✅ Created ${allocs.length} allocations`);

    // Create AI analyses
    console.log('🤖 Creating AI analyses...');
    const analyses = [
      {
        user_id: users[0].id,
        wallet_address: users[0].wallet_address,
        query: 'Why does US Treasury Bond Pool offer 4.2% APY?',
        response: 'The US Treasury Bond Pool offers 4.2% APY because it invests in short-term US Treasury securities...',
        context: {
          assetId: 'rwa-1',
          assetName: 'US Treasury Bond Pool',
          apy: 4.2,
          riskLevel: 'Low',
        },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        model_used: 'claude-sonnet-4',
        tokens_used: 245,
      },
      {
        user_id: users[0].id,
        wallet_address: users[0].wallet_address,
        query: 'What are the risks of Real Estate Income Fund?',
        response: 'The Real Estate Income Fund carries medium risk due to market volatility...',
        context: {
          assetId: 'rwa-2',
          assetName: 'Real Estate Income Fund',
          apy: 7.8,
          riskLevel: 'Medium',
        },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        model_used: 'claude-sonnet-4',
        tokens_used: 198,
      },
    ];

    const { data: aiData, error: aiError } = await supabase
      .from('ai_analyses')
      .insert(analyses)
      .select();

    if (aiError) throw aiError;
    console.log(`✅ Created ${aiData.length} AI analyses`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Allocations: ${allocs.length}`);
    console.log(`   AI Analyses: ${aiData.length}`);
    console.log('\n💡 Test accounts:');
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.wallet_address} (${user.risk_profile})`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
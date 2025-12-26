// scripts/seed.ts
// Database seeding script for MAXION
// Run with: npm run seed

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const path = require('path');

// We need to use require for the models since ts-node can be tricky with imports
const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('\n💡 Make sure you have .env.local file with:');
    console.log('   MONGODB_URI=mongodb+srv://...\n');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Define schemas inline to avoid import issues
const UserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  totalDeposited: {
    type: Number,
    default: 0,
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  riskProfile: {
    type: String,
    enum: ['conservative', 'balanced', 'aggressive'],
    default: 'balanced',
  },
});

const AllocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  assetId: {
    type: String,
    required: true,
  },
  assetName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  shares: {
    type: Number,
    required: true,
    min: 0,
  },
  apy: {
    type: Number,
    required: true,
  },
  riskLevel: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  txHash: {
    type: String,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
});

const AIAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  query: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  context: {
    assetId: String,
    assetName: String,
    amount: Number,
    riskProfile: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  modelUsed: {
    type: String,
    default: 'claude-sonnet-4',
  },
  tokensUsed: {
    type: Number,
  },
});

// Create models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Allocation = mongoose.models.Allocation || mongoose.model('Allocation', AllocationSchema);
const AIAnalysis = mongoose.models.AIAnalysis || mongoose.model('AIAnalysis', AIAnalysisSchema);

// Seed data
const seedUsers = [
  {
    walletAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beef',
    riskProfile: 'balanced',
    totalDeposited: 45280,
    totalWithdrawn: 0,
    lastActive: new Date(),
  },
  {
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    riskProfile: 'conservative',
    totalDeposited: 25000,
    totalWithdrawn: 0,
    lastActive: new Date(),
  },
  {
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    riskProfile: 'aggressive',
    totalDeposited: 100000,
    totalWithdrawn: 15000,
    lastActive: new Date(),
  },
];

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Allocation.deleteMany({});
  await AIAnalysis.deleteMany({});
  console.log('✅ Database cleared');
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');
    
    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    await clearDatabase();

    // Create users
    console.log('👤 Creating users...');
    const users = await User.create(seedUsers);
    console.log(`✅ Created ${users.length} users`);

    // Create allocations for first user
    console.log('💰 Creating allocations...');
    const allocations = [];
    
    // User 1 allocations
    allocations.push({
      userId: users[0]._id,
      walletAddress: users[0].walletAddress,
      assetId: 'rwa-1',
      assetName: 'US Treasury Bond Pool',
      amount: 15000,
      shares: 15000,
      apy: 4.2,
      riskLevel: 'Low',
      timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      status: 'confirmed',
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
    });

    allocations.push({
      userId: users[0]._id,
      walletAddress: users[0].walletAddress,
      assetId: 'rwa-2',
      assetName: 'Real Estate Income Fund',
      amount: 20000,
      shares: 20000,
      apy: 7.8,
      riskLevel: 'Medium',
      timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      status: 'confirmed',
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
    });

    allocations.push({
      userId: users[0]._id,
      walletAddress: users[0].walletAddress,
      assetId: 'rwa-4',
      assetName: 'Infrastructure Debt',
      amount: 10280,
      shares: 10280,
      apy: 6.4,
      riskLevel: 'Low-Medium',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      status: 'confirmed',
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
    });

    // User 2 allocations
    allocations.push({
      userId: users[1]._id,
      walletAddress: users[1].walletAddress,
      assetId: 'rwa-1',
      assetName: 'US Treasury Bond Pool',
      amount: 25000,
      shares: 25000,
      apy: 4.2,
      riskLevel: 'Low',
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      status: 'confirmed',
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
    });

    // User 3 allocations
    allocations.push({
      userId: users[2]._id,
      walletAddress: users[2].walletAddress,
      assetId: 'rwa-3',
      assetName: 'Corporate Credit Facility',
      amount: 50000,
      shares: 50000,
      apy: 12.3,
      riskLevel: 'Medium-High',
      timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      status: 'confirmed',
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
    });

    allocations.push({
      userId: users[2]._id,
      walletAddress: users[2].walletAddress,
      assetId: 'rwa-2',
      assetName: 'Real Estate Income Fund',
      amount: 35000,
      shares: 35000,
      apy: 7.8,
      riskLevel: 'Medium',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'confirmed',
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
    });

    await Allocation.create(allocations);
    console.log(`✅ Created ${allocations.length} allocations`);

    // Create AI analysis history
    console.log('🤖 Creating AI analysis history...');
    const analyses = [
      {
        userId: users[0]._id,
        walletAddress: users[0].walletAddress,
        query: 'Why does US Treasury Bond Pool offer 4.2% APY?',
        response: 'The US Treasury Bond Pool offers 4.2% APY because it invests in short-term US Treasury securities. This yield reflects current government bond rates plus a small premium for the tokenized wrapper. The yield is backed by US government securities, making it one of the safest options available.',
        context: {
          assetId: 'rwa-1',
          assetName: 'US Treasury Bond Pool',
          apy: 4.2,
          riskLevel: 'Low',
        },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        modelUsed: 'claude-sonnet-4',
        tokensUsed: 245,
      },
      {
        userId: users[0]._id,
        walletAddress: users[0].walletAddress,
        query: 'What are the risks of Real Estate Income Fund?',
        response: 'The Real Estate Income Fund carries medium risk due to: market volatility in property values, potential vacancy rates, and liquidity constraints. However, it\'s diversified across multiple prime commercial properties, has professional management, and maintains insurance coverage. Historical occupancy rates exceed 95%.',
        context: {
          assetId: 'rwa-2',
          assetName: 'Real Estate Income Fund',
          apy: 7.8,
          riskLevel: 'Medium',
        },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        modelUsed: 'claude-sonnet-4',
        tokensUsed: 198,
      },
      {
        userId: users[0]._id,
        walletAddress: users[0].walletAddress,
        query: 'Analyze my portfolio allocation',
        response: 'Your portfolio shows strong diversification:\n\n• 33% Low-risk (Treasury): Stable foundation\n• 44% Medium-risk (Real Estate): Growth component\n• 23% Low-Medium risk (Infrastructure): Balanced exposure\n\nThis aligns well with your balanced risk profile. Your weighted APY of 6.8% is competitive while maintaining moderate risk. Consider adding 10-15% in higher-yield assets if you want to boost returns.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        modelUsed: 'claude-sonnet-4',
        tokensUsed: 312,
      },
    ];

    await AIAnalysis.create(analyses);
    console.log(`✅ Created ${analyses.length} AI analyses`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Allocations: ${allocations.length}`);
    console.log(`   AI Analyses: ${analyses.length}`);
    console.log('\n💡 Test accounts:');
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.walletAddress} (${user.riskProfile})`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run seeding
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
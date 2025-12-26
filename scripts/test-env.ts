// scripts/test-env.ts
// Quick script to test environment variables
// Run with: npx ts-node scripts/test-env.ts

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('🔍 Looking for .env.local at:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error.message);
  console.log('\n💡 Make sure .env.local exists in the root directory\n');
  process.exit(1);
}

console.log('✅ .env.local loaded successfully\n');

// Check required variables
const required = [
  'MONGODB_URI',
];

const optional = [
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_VAULT_ADDRESS',
  'NEXT_PUBLIC_USDC_ADDRESS',
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
];

console.log('📋 Checking environment variables:\n');

let allRequiredPresent = true;

console.log('Required Variables:');
required.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    allRequiredPresent = false;
  }
});

console.log('\nOptional Variables:');
optional.forEach(key => {
  const value = process.env[key];
  if (value && value !== 'YOUR_PROJECT_ID_HERE' && value !== '0x0000000000000000000000000000000000000000') {
    console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`⚠️  ${key}: Not set (optional)`);
  }
});

console.log('\n' + '='.repeat(50));

if (allRequiredPresent) {
  console.log('✅ All required variables are set!');
  console.log('\n✨ You can now run: npm run seed');
} else {
  console.log('❌ Some required variables are missing');
  console.log('\n💡 Please add them to .env.local file');
}

console.log('='.repeat(50) + '\n');
#!/bin/bash

# MAXION Quick Deploy Script
# Run this from the root directory of your project

echo "🚀 MAXION Quick Deploy to Mantle Testnet"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Check if contracts/.env exists
echo "📋 Step 1: Checking environment setup..."
if [ ! -f "contracts/.env" ]; then
    echo "⚠️  contracts/.env not found!"
    echo ""
    echo "Creating from template..."
    cp contracts/.env.example contracts/.env
    echo ""
    echo "❗ IMPORTANT: Edit contracts/.env and add your PRIVATE_KEY"
    echo "   nano contracts/.env"
    echo ""
    echo "   Get a wallet private key from MetaMask:"
    echo "   1. Open MetaMask"
    echo "   2. Click the three dots"
    echo "   3. Account Details > Export Private Key"
    echo "   4. Add to contracts/.env as: PRIVATE_KEY=0xYOUR_KEY"
    echo ""
    read -p "Press Enter after you've added your private key..."
fi

# Step 2: Check if private key is set
if ! grep -q "PRIVATE_KEY=0x" contracts/.env; then
    echo "❌ Error: PRIVATE_KEY not found in contracts/.env"
    echo "   Please add: PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE"
    exit 1
fi

echo "✅ Environment configured"
echo ""

# Step 3: Install dependencies
echo "📦 Step 2: Installing dependencies..."
cd contracts
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Step 4: Compile contracts
echo "🔨 Step 3: Compiling contracts..."
npx hardhat compile
if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi
echo "✅ Contracts compiled successfully"
echo ""

# Step 5: Check testnet balance
echo "💰 Step 4: Checking wallet balance..."
echo ""
echo "⚠️  IMPORTANT: You need at least 0.1 MNT on Mantle Testnet!"
echo "   Get testnet MNT from: https://faucet.testnet.mantle.xyz/"
echo ""
read -p "Do you have testnet MNT? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please get testnet MNT first, then run this script again"
    exit 1
fi

# Step 6: Deploy
echo ""
echo "🚀 Step 5: Deploying to Mantle Testnet..."
echo "   This will take 2-3 minutes..."
echo ""
npx hardhat run scripts/deploy.js --network mantleTestnet

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════"
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "═══════════════════════════════════════"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Copy the contract addresses from the output above"
    echo "   2. Update .env.local in the root directory:"
    echo "      cd .."
    echo "      nano .env.local"
    echo "   3. Add these lines:"
    echo "      NEXT_PUBLIC_VAULT_ADDRESS=0xYOUR_VAULT_ADDRESS"
    echo "      NEXT_PUBLIC_USDC_ADDRESS=0xYOUR_USDC_ADDRESS"
    echo "   4. Restart your dev server:"
    echo "      npm run dev"
    echo ""
    echo "🔗 View contracts on Mantle Explorer:"
    echo "   https://explorer.testnet.mantle.xyz/"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "   Common issues:"
    echo "   - Insufficient MNT balance (need 0.1+ MNT)"
    echo "   - Wrong private key format"
    echo "   - Network issues"
    echo ""
    echo "   Check the error message above for details"
fi
// scripts/getTestUSDC.ts
// Run with: npx ts-node scripts/getTestUSDC.ts

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const MOCK_USDC_ABI = [
  "function faucet() external",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function getTestUSDC() {
  console.log("🚰 Getting Test USDC from Faucet...\n");

  // Validate environment variables
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.MANTLE_TESTNET_RPC;
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS || process.env.USDC_ADDRESS;

  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY not found in .env file");
  }

  if (!rpcUrl) {
    throw new Error("❌ MANTLE_TESTNET_RPC not found in .env file");
  }

  if (!usdcAddress) {
    throw new Error("❌ NEXT_PUBLIC_USDC_ADDRESS or USDC_ADDRESS not found in .env file");
  }

  console.log("🔧 Configuration:");
  console.log("   RPC URL:", rpcUrl);
  console.log("   USDC Address:", usdcAddress);
  console.log();

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("📍 Your wallet address:", wallet.address);
  
  // Verify connection
  try {
    const network = await provider.getNetwork();
    console.log("🌐 Connected to network:", network.name, `(Chain ID: ${network.chainId})`);
    
    const balance = await provider.getBalance(wallet.address);
    console.log("💎 Native balance:", ethers.formatEther(balance), "MNT");
  } catch (error: any) {
    throw new Error(`❌ Failed to connect to RPC: ${error.message}`);
  }
  
  // Connect to Mock USDC contract
  const usdc = new ethers.Contract(usdcAddress, MOCK_USDC_ABI, wallet);
  
  try {
    // Check balance before
    console.log("\n📊 Checking USDC balance...");
    const balanceBefore = await usdc.balanceOf(wallet.address);
    console.log("💰 Balance before:", ethers.formatUnits(balanceBefore, 6), "USDC");
    
    // Call faucet
    console.log("\n🔄 Calling faucet function...");
    const tx = await usdc.faucet();
    console.log("📝 Transaction hash:", tx.hash);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    
    // Check balance after
    console.log("\n📊 Checking new balance...");
    const balanceAfter = await usdc.balanceOf(wallet.address);
    const received = balanceAfter - balanceBefore;
    
    console.log("💰 Balance after:", ethers.formatUnits(balanceAfter, 6), "USDC");
    console.log("🎉 Received:", ethers.formatUnits(received, 6), "USDC");
    
    console.log("\n🔗 View transaction:");
    console.log(`   https://explorer.sepolia.mantle.xyz/tx/${tx.hash}`);
    
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    
    if (error.message.includes("faucet cooldown") || error.message.includes("cooldown")) {
      console.log("\n⏰ Faucet cooldown active. Wait 24 hours between claims.");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💸 Insufficient MNT for gas fees. Get testnet MNT from a faucet first.");
    } else if (error.code === 'CALL_EXCEPTION') {
      console.log("\n🔍 Contract call failed. Possible reasons:");
      console.log("   - Faucet cooldown period active");
      console.log("   - Contract address incorrect");
      console.log("   - Faucet function doesn't exist or has different signature");
    }
    
    throw error;
  }
}

getTestUSDC()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error.message);
    process.exit(1);
  });
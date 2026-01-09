// Generate a fresh wallet for deployment
const { ethers } = require("ethers");

console.log("🔑 Generating Fresh Deployment Wallet");
console.log("=====================================\n");

// Generate random wallet
const wallet = ethers.Wallet.createRandom();

console.log("✅ New wallet generated!\n");
console.log("📋 Wallet Information:");
console.log("─────────────────────────────────────");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("─────────────────────────────────────\n");

console.log("📝 Next Steps:\n");
console.log("1. Update your contracts/.env file:");
console.log(`   PRIVATE_KEY=${wallet.privateKey.slice(2)}`);
console.log("   (Remove the 0x prefix!)\n");

console.log("2. Import to MetaMask:");
console.log("   - Open MetaMask → Click account icon → Import Account");
console.log(`   - Paste: ${wallet.privateKey}`);
console.log("   - Switch network to Mantle Sepolia\n");

console.log("3. Get testnet MNT:");
console.log("   - Visit: https://faucet.sepolia.mantle.xyz/");
console.log(`   - Connect wallet (${wallet.address})`);
console.log("   - Request 0.5-1 MNT (takes 1-2 minutes)\n");

console.log("4. Verify balance:");
console.log("   npm run check-balance\n");

console.log("5. Deploy:");
console.log("   npm run deploy:testnet\n");

console.log("⚠️  IMPORTANT: Keep this private key safe!");
console.log("   Never share it or commit it to git.\n");
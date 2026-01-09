// contracts/scripts/check-balance.ts
import { ethers } from "hardhat";

async function checkBalance() {
  console.log("💰 Checking Wallet Balance\n");
  
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("");

  const [deployer] = await ethers.getSigners();
  console.log("Wallet Address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInMNT = ethers.formatEther(balance);
  
  console.log("Balance:", balanceInMNT, "MNT");
  console.log("");

  // Check if balance is sufficient
  const minBalance = 0.1;
  if (parseFloat(balanceInMNT) < minBalance) {
    console.log("⚠️  WARNING: Insufficient balance!");
    console.log("   You need at least", minBalance, "MNT to deploy");
    console.log("   Current balance:", balanceInMNT, "MNT");
    console.log("");
    console.log("🌐 Get testnet MNT from:");
    console.log("   https://faucet.testnet.mantle.xyz/");
    console.log("");
    process.exit(1);
  } else {
    console.log("✅ Balance sufficient for deployment");
    console.log("   Minimum required:", minBalance, "MNT");
    console.log("   Current balance:", balanceInMNT, "MNT");
    console.log("");
    console.log("🚀 Ready to deploy!");
    console.log("   Run: npm run deploy:testnet");
  }
}

checkBalance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
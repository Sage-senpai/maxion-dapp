// contracts/scripts/deploy-remaining-strategy.ts
// Deploy the missing Infrastructure Debt strategy

import hre from "hardhat";

async function deployRemaining() {
  console.log("🔧 Deploying Remaining Strategy");
  console.log("================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Already deployed contracts
  const mockUSDCAddress = "0x9d8B656598274BDa44c355bF355F47CE7eaDa3c5";
  const yieldVaultAddress = "0x65FEdd3e4d93885D7Fc5A65D8E149740Fc131C6b";

  console.log("Using existing contracts:");
  console.log("  Mock USDC:", mockUSDCAddress);
  console.log("  YieldVault:", yieldVaultAddress);
  console.log("");

  // Missing strategy details
  const strategy = {
    name: "Infrastructure Debt",
    apy: 640, // 6.4%
    riskLevel: "Low-Medium",
    allocation: 1500, // 15%
  };

  try {
    console.log(`📝 Deploying: ${strategy.name}`);
    console.log(`   APY: ${strategy.apy / 100}%`);
    console.log(`   Risk: ${strategy.riskLevel}`);
    console.log("");

    // Deploy strategy
    const RWAStrategy = await hre.ethers.getContractFactory("RWAStrategy");
    const rwaStrategy = await RWAStrategy.deploy(
      mockUSDCAddress,
      yieldVaultAddress,
      strategy.apy,
      strategy.name,
      strategy.riskLevel
    );

    console.log("   Waiting for deployment...");
    await rwaStrategy.waitForDeployment();
    const strategyAddress = await rwaStrategy.getAddress();

    console.log(`   ✅ Deployed to: ${strategyAddress}`);
    console.log("");

    // Add to vault
    console.log("📝 Adding strategy to vault...");
    const YieldVault = await hre.ethers.getContractFactory("YieldVault");
    const vault = YieldVault.attach(yieldVaultAddress);

    const addTx = await vault.addStrategy(
      strategyAddress,
      strategy.allocation,
      strategy.name,
      strategy.riskLevel
    );

    console.log("   Waiting for confirmation...");
    const receipt = await addTx.wait();
    console.log(`   ✅ Confirmed in block ${receipt?.blockNumber}`);
    console.log(`   ✅ Added with ${strategy.allocation / 100}% allocation`);
    console.log("");

    // Summary
    console.log("═".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("═".repeat(60));
    console.log("");
    console.log("📋 All Deployed Contracts:");
    console.log("   Mock USDC:", mockUSDCAddress);
    console.log("   YieldVault:", yieldVaultAddress);
    console.log("");
    console.log("📊 All 4 Strategies:");
    console.log("   1. US Treasury Bond Pool (4.2% APY)");
    console.log("   2. Real Estate Income Fund (7.8% APY)");
    console.log("   3. Corporate Credit Facility (11.5% APY)");
    console.log(`   4. ${strategy.name} (${strategy.apy / 100}% APY) - ${strategyAddress}`);
    console.log("");
    console.log("🔗 View on Explorer:");
    console.log(`   https://explorer.sepolia.mantle.xyz/address/${yieldVaultAddress}`);
    console.log("");
    console.log("📝 Next Steps:");
    console.log("   1. Update root .env.local:");
    console.log(`      NEXT_PUBLIC_VAULT_ADDRESS=${yieldVaultAddress}`);
    console.log(`      NEXT_PUBLIC_USDC_ADDRESS=${mockUSDCAddress}`);
    console.log("   2. Start frontend: cd .. && npm run dev");
    console.log("   3. Test the app!");
    console.log("");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 If error persists, wait 1 minute and try again.");
  }
}

deployRemaining()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
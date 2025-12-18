// contracts/scripts/deploy.ts
// Location: contracts/scripts/deploy.ts
// Deployment script for MAXION contracts on Mantle

import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 MAXION Deployment Script");
  console.log("===========================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MNT\n");

  // ============================================================================
  // 1. DEPLOY MOCK USDC (for testnet only)
  // ============================================================================
  
  console.log("📝 Step 1: Deploying Mock USDC...");
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy("Mock USDC", "mUSDC", 6);
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  
  console.log("✅ Mock USDC deployed to:", mockUSDCAddress);
  
  // Mint tokens to deployer
  const mintTx = await mockUSDC.mint(deployer.address, ethers.parseUnits("1000000", 6));
  await mintTx.wait();
  console.log("✅ Minted 1,000,000 mUSDC to deployer\n");

  // ============================================================================
  // 2. DEPLOY YIELD VAULT
  // ============================================================================
  
  console.log("📝 Step 2: Deploying YieldVault...");
  
  const treasury = deployer.address;
  const performanceFee = 200; // 2%
  
  const YieldVault = await ethers.getContractFactory("YieldVault");
  const yieldVault = await YieldVault.deploy(
    mockUSDCAddress,
    treasury,
    performanceFee
  );
  await yieldVault.waitForDeployment();
  const yieldVaultAddress = await yieldVault.getAddress();
  
  console.log("✅ YieldVault deployed to:", yieldVaultAddress);
  console.log("   Treasury:", treasury);
  console.log("   Performance Fee:", performanceFee / 100, "%\n");

  // ============================================================================
  // 3. DEPLOY RWA STRATEGIES
  // ============================================================================
  
  console.log("📝 Step 3: Deploying RWA Strategies...");
  
  const strategies = [
    {
      name: "US Treasury Bond Pool",
      apy: 420, // 4.2%
      riskLevel: "Low",
      allocation: 3000, // 30%
    },
    {
      name: "Real Estate Income Fund",
      apy: 780, // 7.8%
      riskLevel: "Medium",
      allocation: 3500, // 35%
    },
    {
      name: "Corporate Credit Facility",
      apy: 1150, // 11.5%
      riskLevel: "Medium-High",
      allocation: 2000, // 20%
    },
    {
      name: "Infrastructure Debt",
      apy: 640, // 6.4%
      riskLevel: "Low-Medium",
      allocation: 1500, // 15%
    },
  ];
  
  const RWAStrategy = await ethers.getContractFactory("RWAStrategy");
  const deployedStrategies = [];
  
  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    
    const rwaStrategy = await RWAStrategy.deploy(
      mockUSDCAddress,
      yieldVaultAddress,
      strategy.apy,
      strategy.name,
      strategy.riskLevel
    );
    await rwaStrategy.waitForDeployment();
    const strategyAddress = await rwaStrategy.getAddress();
    
    console.log(`✅ Strategy ${i + 1}: ${strategy.name}`);
    console.log(`   Address: ${strategyAddress}`);
    console.log(`   APY: ${strategy.apy / 100}%`);
    console.log(`   Risk: ${strategy.riskLevel}`);
    
    deployedStrategies.push({
      ...strategy,
      address: strategyAddress,
    });
    
    // Add strategy to vault
    const addTx = await yieldVault.addStrategy(
      strategyAddress,
      strategy.allocation,
      strategy.name,
      strategy.riskLevel
    );
    await addTx.wait();
    console.log(`✅ Added to vault with ${strategy.allocation / 100}% allocation\n`);
  }

  // ============================================================================
  // 4. APPROVE VAULT
  // ============================================================================
  
  console.log("📝 Step 4: Setting up approvals...");
  const approveTx = await mockUSDC.approve(yieldVaultAddress, ethers.MaxUint256);
  await approveTx.wait();
  console.log("✅ Approved YieldVault to spend deployer's USDC\n");

  // ============================================================================
  // 5. SAVE DEPLOYMENT INFO
  // ============================================================================
  
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      mockUSDC: mockUSDCAddress,
      yieldVault: yieldVaultAddress,
      strategies: deployedStrategies,
    },
  };
  
  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `deployment-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("📄 Deployment info saved to:", filename);

  // Save for frontend
  const frontendDir = path.join(__dirname, "..", "..", "src", "lib", "web3");
  if (fs.existsSync(frontendDir)) {
    fs.writeFileSync(
      path.join(frontendDir, "addresses.json"),
      JSON.stringify({
        mockUSDC: mockUSDCAddress,
        yieldVault: yieldVaultAddress,
        strategies: deployedStrategies.map(s => ({
          name: s.name,
          address: s.address,
          apy: s.apy / 100,
          riskLevel: s.riskLevel,
        })),
      }, null, 2)
    );
    console.log("✅ Addresses saved for frontend\n");
  }

  // ============================================================================
  // 6. SUMMARY
  // ============================================================================
  
  console.log("═══════════════════════════════════════");
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════");
  console.log("\n📋 Contract Addresses:");
  console.log("   Mock USDC:", mockUSDCAddress);
  console.log("   YieldVault:", yieldVaultAddress);
  console.log("\n📊 Strategies:");
  deployedStrategies.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.name}: ${s.address}`);
  });
  console.log("\n🔗 Next Steps:");
  console.log("   1. Update .env.local:");
  console.log(`      NEXT_PUBLIC_VAULT_ADDRESS=${yieldVaultAddress}`);
  console.log(`      NEXT_PUBLIC_USDC_ADDRESS=${mockUSDCAddress}`);
  console.log("   2. Restart dev server: npm run dev");
  console.log("   3. Connect wallet and test!");
  console.log("\n═══════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
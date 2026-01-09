// contracts/scripts/deploy.ts
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface Strategy {
  name: string;
  apy: number;
  riskLevel: string;
  allocation: number;
  address?: string;
}

interface DeploymentInfo {
  network: string;
  chainId: string;
  deployer: string;
  timestamp: string;
  contracts: {
    mockUSDC: string;
    yieldVault: string;
    strategies: Strategy[];
  };
}

// Helper: Wait for transaction with retries
async function waitForTx(tx: any, description: string) {
  const maxRetries = 3;
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      console.log(`   Waiting for transaction... (attempt ${attempts + 1}/${maxRetries})`);
      const receipt = await tx.wait();
      console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
      return receipt;
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        throw error;
      }
      console.log(`   ⚠️  Retry needed, waiting 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Helper: Deploy contract with retries
async function deployContract(
  contractName: string,
  args: any[],
  description: string
) {
  const maxRetries = 3;
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      console.log(`\n📝 ${description}`);
      console.log(`   Contract: ${contractName}`);
      console.log(`   Attempt: ${attempts + 1}/${maxRetries}`);
      
      const ContractFactory = await hre.ethers.getContractFactory(contractName);
      
      // Get deployer's current nonce
      const [deployer] = await hre.ethers.getSigners();
      const nonce = await hre.ethers.provider.getTransactionCount(deployer.address, "latest");
      console.log(`   Using nonce: ${nonce}`);
      
      // Deploy with explicit nonce to avoid conflicts
      const contract = await ContractFactory.deploy(...args, {
        nonce: nonce
      });
      
      console.log(`   Deployment transaction sent...`);
      console.log(`   Tx hash: ${contract.deploymentTransaction()?.hash}`);
      
      // Wait for deployment with timeout
      const deploymentPromise = contract.waitForDeployment();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Deployment timeout after 60s")), 60000)
      );
      
      await Promise.race([deploymentPromise, timeoutPromise]);
      const address = await contract.getAddress();
      
      console.log(`   ✅ Deployed to: ${address}`);
      
      // Wait a bit before next deployment to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return contract;
    } catch (error: any) {
      attempts++;
      const errorMsg = error.message || String(error);
      console.log(`   ❌ Deployment failed: ${errorMsg.substring(0, 100)}`);
      
      // Check if it's an "already known" error
      if (errorMsg.includes("already known")) {
        console.log(`   ℹ️  Transaction already in mempool, waiting for it to clear...`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
        
        // Increment nonce manually and try again
        continue;
      }
      
      if (attempts >= maxRetries) {
        throw new Error(`Failed to deploy ${contractName} after ${maxRetries} attempts: ${errorMsg}`);
      }
      
      const waitTime = attempts * 5000; // Exponential backoff
      console.log(`   ⚠️  Retrying in ${waitTime/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error(`Failed to deploy ${contractName}`);
}

async function deploy() {
  console.log("🚀 MAXION Deployment Script");
  console.log("===========================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MNT\n");

  // Check minimum balance
  const minBalance = hre.ethers.parseEther("0.5");
  if (balance < minBalance) {
    console.error("❌ Insufficient balance! Need at least 0.5 MNT for deployment.");
    console.log("\n💡 Get testnet MNT from: https://faucet.sepolia.mantle.xyz/");
    process.exit(1);
  }

  console.log("⏳ Starting deployment with retry logic and rate limiting...\n");

  // ============================================================================
  // 1. DEPLOY MOCK USDC (for testnet only)
  // ============================================================================
  
  const mockUSDC = await deployContract(
    "MockERC20",
    ["Mock USDC", "mUSDC", 6],
    "Step 1: Deploying Mock USDC..."
  );
  const mockUSDCAddress = await mockUSDC.getAddress();
  
  // Mint tokens to deployer
  console.log("\n💰 Minting test USDC...");
  const mintTx = await mockUSDC.mint(
    deployer.address, 
    hre.ethers.parseUnits("1000000", 6)
  );
  await waitForTx(mintTx, "Minting USDC");
  console.log("✅ Minted 1,000,000 mUSDC to deployer\n");

  // ============================================================================
  // 2. DEPLOY YIELD VAULT
  // ============================================================================
  
  const treasury = deployer.address;
  const performanceFee = 200; // 2%
  
  const yieldVault = await deployContract(
    "YieldVault",
    [mockUSDCAddress, treasury, performanceFee],
    "Step 2: Deploying YieldVault..."
  );
  const yieldVaultAddress = await yieldVault.getAddress();
  
  console.log("   Treasury:", treasury);
  console.log("   Performance Fee:", performanceFee / 100, "%\n");

  // ============================================================================
  // 3. DEPLOY RWA STRATEGIES
  // ============================================================================
  
  console.log("📝 Step 3: Deploying RWA Strategies...\n");
  
  const strategies: Strategy[] = [
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
  
  const deployedStrategies: Strategy[] = [];
  
  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Strategy ${i + 1}/${strategies.length}: ${strategy.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const rwaStrategy = await deployContract(
      "RWAStrategy",
      [mockUSDCAddress, yieldVaultAddress, strategy.apy, strategy.name, strategy.riskLevel],
      `Deploying ${strategy.name}`
    );
    const strategyAddress = await rwaStrategy.getAddress();
    
    console.log(`   APY: ${strategy.apy / 100}%`);
    console.log(`   Risk: ${strategy.riskLevel}`);
    
    deployedStrategies.push({
      ...strategy,
      address: strategyAddress,
    });
    
    // Add strategy to vault
    console.log(`\n   Adding strategy to vault...`);
    const addTx = await yieldVault.addStrategy(
      strategyAddress,
      strategy.allocation,
      strategy.name,
      strategy.riskLevel
    );
    await waitForTx(addTx, "Adding strategy to vault");
    console.log(`   ✅ Added with ${strategy.allocation / 100}% allocation`);
  }

  // ============================================================================
  // 4. APPROVE VAULT
  // ============================================================================
  
  console.log("\n\n📝 Step 4: Setting up approvals...");
  const approveTx = await mockUSDC.approve(
    yieldVaultAddress, 
    hre.ethers.MaxUint256
  );
  await waitForTx(approveTx, "Approving vault");
  console.log("✅ Approved YieldVault to spend deployer's USDC\n");

  // ============================================================================
  // 5. SAVE DEPLOYMENT INFO
  // ============================================================================
  
  console.log("📝 Step 5: Saving deployment information...\n");
  
  const network = await hre.ethers.provider.getNetwork();
  const deploymentInfo: DeploymentInfo = {
    network: hre.network.name,
    chainId: network.chainId.toString(),
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
  
  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("📄 Deployment info saved to:", filename);

  // Save latest deployment
  const latestPath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Latest deployment saved to:", `${hre.network.name}-latest.json`);

  // Save for frontend (if src/lib/web3 exists)
  const frontendDir = path.join(__dirname, "..", "..", "src", "lib", "web3");
  if (fs.existsSync(frontendDir)) {
    const frontendData = {
      mockUSDC: mockUSDCAddress,
      yieldVault: yieldVaultAddress,
      strategies: deployedStrategies.map(s => ({
        name: s.name,
        address: s.address,
        apy: s.apy / 100,
        riskLevel: s.riskLevel,
      })),
    };
    
    fs.writeFileSync(
      path.join(frontendDir, "addresses.json"),
      JSON.stringify(frontendData, null, 2)
    );
    console.log("✅ Addresses saved for frontend\n");
  }

  // ============================================================================
  // 6. SUMMARY & NEXT STEPS
  // ============================================================================
  
  console.log("\n" + "═".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("═".repeat(60));
  
  console.log("\n📋 Contract Addresses:");
  console.log("   Mock USDC:", mockUSDCAddress);
  console.log("   YieldVault:", yieldVaultAddress);
  
  console.log("\n📊 Strategies:");
  deployedStrategies.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.name}`);
    console.log(`      ${s.address}`);
    console.log(`      APY: ${s.apy / 100}% | Risk: ${s.riskLevel}`);
  });
  
  console.log("\n🔗 Explorer Links:");
  console.log(`   Mock USDC: https://explorer.sepolia.mantle.xyz/address/${mockUSDCAddress}`);
  console.log(`   YieldVault: https://explorer.sepolia.mantle.xyz/address/${yieldVaultAddress}`);
  
  console.log("\n📝 Next Steps:");
  console.log("   1. Update root .env.local:");
  console.log(`      NEXT_PUBLIC_VAULT_ADDRESS=${yieldVaultAddress}`);
  console.log(`      NEXT_PUBLIC_USDC_ADDRESS=${mockUSDCAddress}`);
  console.log("   2. Start frontend:");
  console.log("      cd .. && npm run dev");
  console.log("   3. Connect wallet and test!");
  
  console.log("\n" + "═".repeat(60) + "\n");
  
  // Return addresses for potential programmatic use
  return {
    mockUSDC: mockUSDCAddress,
    yieldVault: yieldVaultAddress,
    strategies: deployedStrategies,
  };
}

// Execute deployment
deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
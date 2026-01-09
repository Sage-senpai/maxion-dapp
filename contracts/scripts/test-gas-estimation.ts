// contracts/scripts/test-gas-estimation.ts
// Test gas estimation for contract deployment

import hre from "hardhat";

async function testGasEstimation() {
  console.log("🔍 Testing Gas Estimation");
  console.log("=========================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MNT\n");

  // Get current gas price
  const feeData = await hre.ethers.provider.getFeeData();
  console.log("Network Gas Info:");
  console.log("  Gas Price:", feeData.gasPrice?.toString(), "wei");
  console.log("  Gas Price (Gwei):", hre.ethers.formatUnits(feeData.gasPrice || 0n, "gwei"), "Gwei");
  console.log("  Max Fee:", feeData.maxFeePerGas?.toString() || "Not available");
  console.log("  Priority Fee:", feeData.maxPriorityFeePerGas?.toString() || "Not available");
  console.log("");

  try {
    // Test 1: Simple contract (MockERC20)
    console.log("📝 Test 1: Estimating MockERC20 deployment...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    
    // Get deployment data
    const deployTx = await MockERC20.getDeployTransaction("Mock USDC", "mUSDC", 6);
    
    // Estimate gas
    const gasEstimate = await hre.ethers.provider.estimateGas({
      from: deployer.address,
      data: deployTx.data,
    });
    
    console.log("  ✅ Gas Estimate:", gasEstimate.toString(), "gas");
    console.log("  ✅ Gas Estimate (M):", (Number(gasEstimate) / 1_000_000).toFixed(2), "M");
    
    // Calculate cost
    const gasCost = gasEstimate * (feeData.gasPrice || 0n);
    console.log("  💰 Estimated Cost:", hre.ethers.formatEther(gasCost), "MNT");
    console.log("");

    // Test 2: Try with different gas limits
    console.log("📝 Test 2: Testing with auto gas limit...");
    try {
      const mockToken = await MockERC20.deploy("Test Token", "TEST", 18);
      await mockToken.waitForDeployment();
      const address = await mockToken.getAddress();
      console.log("  ✅ Successfully deployed to:", address);
      console.log("  ✅ This proves auto-estimation works!\n");
    } catch (error: any) {
      console.log("  ❌ Auto-estimation failed:", error.message.substring(0, 100));
      console.log("");
    }

    // Get network info
    console.log("📊 Network Information:");
    const network = await hre.ethers.provider.getNetwork();
    console.log("  Chain ID:", network.chainId.toString());
    console.log("  Network Name:", network.name);
    
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("  Current Block:", blockNumber);
    console.log("");

    console.log("✅ Gas estimation test complete!");
    console.log("\n💡 Recommendation:");
    console.log("   Remove all gasLimit parameters and let Hardhat auto-estimate.");
    console.log("   The network will calculate the correct gas needed.");
    
  } catch (error: any) {
    console.error("❌ Error during gas estimation:");
    console.error(error.message);
    
    if (error.message.includes("intrinsic gas too low")) {
      console.log("\n💡 This means manual gas limits are too low.");
      console.log("   Solution: Remove gasLimit from deployment transactions.");
    }
  }
}

testGasEstimation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
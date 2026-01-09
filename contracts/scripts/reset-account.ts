// contracts/scripts/reset-account.ts
// Reset account by sending a small transaction to clear pending txs

import hre from "hardhat";

async function resetAccount() {
  console.log("🔄 Resetting Account State");
  console.log("=========================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MNT\n");

  try {
    // Get current nonce from network
    const networkNonce = await hre.ethers.provider.getTransactionCount(
      deployer.address,
      "latest"
    );
    
    // Get pending nonce
    const pendingNonce = await hre.ethers.provider.getTransactionCount(
      deployer.address,
      "pending"
    );

    console.log("📊 Nonce Information:");
    console.log("  Network Nonce (confirmed):", networkNonce);
    console.log("  Pending Nonce:", pendingNonce);

    if (networkNonce === pendingNonce) {
      console.log("\n✅ No stuck transactions! Account is clean.");
      console.log("   You can proceed with deployment.\n");
      return;
    }

    console.log("\n⚠️  Stuck transactions detected!");
    console.log(`   Difference: ${pendingNonce - networkNonce} pending transaction(s)\n`);

    console.log("🔧 Sending reset transaction...");
    console.log("   This will clear the mempool by sending a self-transaction\n");

    // Send a small amount to self with explicit nonce
    const tx = await deployer.sendTransaction({
      to: deployer.address,
      value: hre.ethers.parseEther("0.000001"), // 0.000001 MNT
      nonce: networkNonce, // Use network nonce explicitly
    });

    console.log("   Transaction sent:", tx.hash);
    console.log("   Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("   ✅ Confirmed in block:", receipt?.blockNumber);

    // Verify nonces match now
    const newNetworkNonce = await hre.ethers.provider.getTransactionCount(
      deployer.address,
      "latest"
    );
    const newPendingNonce = await hre.ethers.provider.getTransactionCount(
      deployer.address,
      "pending"
    );

    console.log("\n📊 Updated Nonce Information:");
    console.log("  Network Nonce:", newNetworkNonce);
    console.log("  Pending Nonce:", newPendingNonce);

    if (newNetworkNonce === newPendingNonce) {
      console.log("\n✅ Account reset successful!");
      console.log("   You can now deploy contracts.");
    } else {
      console.log("\n⚠️  Still some pending transactions.");
      console.log("   Wait 1-2 minutes and run this script again.");
    }

  } catch (error: any) {
    console.error("\n❌ Error during reset:");
    console.error(error.message);
    
    console.log("\n💡 Alternative solutions:");
    console.log("   1. Wait 5-10 minutes for pending transactions to clear");
    console.log("   2. Use a different RPC endpoint");
    console.log("   3. Restart your node/computer");
    console.log("   4. Clear MetaMask activity data (Settings → Advanced → Clear activity)");
  }

  console.log("\n");
}

resetAccount()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
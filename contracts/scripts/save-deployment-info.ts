// contracts/scripts/save-deployment-info.ts
// Save deployment information for frontend

import * as fs from "fs";
import * as path from "path";

const deployment = {
  network: "mantleTestnet",
  chainId: "5003",
  deployer: "0xB8C604E9Bfb1Bbc53eB4A498C82C1f8DDA1eb523",
  timestamp: new Date().toISOString(),
  contracts: {
    mockUSDC: "0x9d8B656598274BDa44c355bF355F47CE7eaDa3c5",
    yieldVault: "0x65FEdd3e4d93885D7Fc5A65D8E149740Fc131C6b",
    strategies: [
      {
        name: "US Treasury Bond Pool",
        address: "0xe0D71A007b2fbfCD220E68E1c5810A6D62132a86",
        apy: 4.2,
        riskLevel: "Low",
        allocation: 3000,
      },
      {
        name: "Real Estate Income Fund",
        address: "0x2CebfE6BFD7E23266CeB49e1d25b00631d6Ad51F",
        apy: 7.8,
        riskLevel: "Medium",
        allocation: 3500,
      },
      {
        name: "Corporate Credit Facility",
        address: "0xde14DEEBFB7Ff90A7152C9a9b8209138FA81904F",
        apy: 11.5,
        riskLevel: "Medium-High",
        allocation: 2000,
      },
      // Fourth strategy will be added after deployment
    ],
  },
};

console.log("💾 Saving Deployment Information");
console.log("=================================\n");

// Save to deployments folder
const deploymentsDir = path.join(__dirname, "..", "deployments");
if (!fs.existsSync(deploymentsDir)) {
  fs.mkdirSync(deploymentsDir, { recursive: true });
}

const filename = `mantleTestnet-${Date.now()}.json`;
const filepath = path.join(deploymentsDir, filename);
fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));
console.log("✅ Saved:", filename);

// Save latest
const latestPath = path.join(deploymentsDir, "mantleTestnet-latest.json");
fs.writeFileSync(latestPath, JSON.stringify(deployment, null, 2));
console.log("✅ Saved: mantleTestnet-latest.json");

// Save for frontend
const frontendDir = path.join(__dirname, "..", "..", "src", "lib", "web3");
if (fs.existsSync(frontendDir)) {
  const frontendData = {
    mockUSDC: deployment.contracts.mockUSDC,
    yieldVault: deployment.contracts.yieldVault,
    strategies: deployment.contracts.strategies.map(s => ({
      name: s.name,
      address: s.address,
      apy: s.apy,
      riskLevel: s.riskLevel,
    })),
  };
  
  fs.writeFileSync(
    path.join(frontendDir, "addresses.json"),
    JSON.stringify(frontendData, null, 2)
  );
  console.log("✅ Saved for frontend: src/lib/web3/addresses.json");
} else {
  console.log("⚠️  Frontend directory not found, skipping");
}

console.log("\n📋 Deployment Summary:");
console.log("   Mock USDC:", deployment.contracts.mockUSDC);
console.log("   YieldVault:", deployment.contracts.yieldVault);
console.log("   Strategies:", deployment.contracts.strategies.length);
console.log("");
// contracts/scripts/test-rpc.ts
// Test different RPC endpoints to find which one works

import { ethers } from "ethers";

const RPC_ENDPOINTS = [
  {
    name: "Mantle Sepolia (Official)",
    url: "https://rpc.sepolia.mantle.xyz",
    chainId: 5003,
  },
  {
    name: "Mantle Sepolia DRPC",
    url: "https://mantle-sepolia.drpc.org",
    chainId: 5003,
  },
  {
    name: "Mantle Sepolia Caldera",
    url: "https://mantle-sepolia-testnet.rpc.caldera.xyz/http",
    chainId: 5003,
  },
  {
    name: "Mantle Sepolia Omnia",
    url: "https://endpoints.omniatech.io/v1/mantle/sepolia/public",
    chainId: 5003,
  },
  {
    name: "Mantle Mainnet BlastAPI",
    url: "https://mantle-mainnet.public.blastapi.io",
    chainId: 5000,
  },
  {
    name: "Mantle Mainnet Official",
    url: "https://rpc.mantle.xyz",
    chainId: 5000,
  },
  {
    name: "Mantle Mainnet DRPC",
    url: "https://mantle.drpc.org",
    chainId: 5000,
  },
];

interface TestResult {
  name: string;
  url: string;
  chainId: number;
  status: "✅ Working" | "❌ Failed";
  latency?: number;
  blockNumber?: number;
  error?: string;
}

async function testRPC(endpoint: typeof RPC_ENDPOINTS[0]): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const provider = new ethers.JsonRpcProvider(endpoint.url);

    // Create a promise that rejects after 15 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout after 15 seconds")), 15000);
    });

    // Race between the actual request and the timeout
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      timeoutPromise
    ]) as number;

    const latency = Date.now() - startTime;

    // Verify chain ID
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== endpoint.chainId) {
      throw new Error(`Chain ID mismatch: expected ${endpoint.chainId}, got ${network.chainId}`);
    }

    return {
      name: endpoint.name,
      url: endpoint.url,
      chainId: endpoint.chainId,
      status: "✅ Working",
      latency,
      blockNumber,
    };
  } catch (error) {
    return {
      name: endpoint.name,
      url: endpoint.url,
      chainId: endpoint.chainId,
      status: "❌ Failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testAllRPCs() {
  console.log("🔍 Testing Mantle RPC Endpoints");
  console.log("================================\n");
  console.log("This will test multiple RPC providers to find which ones work.\n");

  const results: TestResult[] = [];

  // Test Testnet RPCs
  console.log("📡 Testing Testnet RPCs (Chain ID: 5003)...\n");
  const testnetEndpoints = RPC_ENDPOINTS.filter(e => e.chainId === 5003);
  
  for (const endpoint of testnetEndpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    const result = await testRPC(endpoint);
    results.push(result);
    
    if (result.status === "✅ Working") {
      console.log(`${result.status} (${result.latency}ms, block: ${result.blockNumber})`);
    } else {
      console.log(`${result.status}`);
      if (result.error) {
        const errorMsg = result.error.substring(0, 100);
        console.log(`  Error: ${errorMsg}`);
      }
    }
  }

  console.log("\n📡 Testing Mainnet RPCs (Chain ID: 5000)...\n");
  const mainnetEndpoints = RPC_ENDPOINTS.filter(e => e.chainId === 5000);
  
  for (const endpoint of mainnetEndpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    const result = await testRPC(endpoint);
    results.push(result);
    
    if (result.status === "✅ Working") {
      console.log(`${result.status} (${result.latency}ms, block: ${result.blockNumber})`);
    } else {
      console.log(`${result.status}`);
      if (result.error) {
        const errorMsg = result.error.substring(0, 100);
        console.log(`  Error: ${errorMsg}`);
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60) + "\n");

  const workingTestnet = results.filter(r => r.status === "✅ Working" && r.chainId === 5003);
  const workingMainnet = results.filter(r => r.status === "✅ Working" && r.chainId === 5000);

  console.log(`✅ Working Testnet RPCs: ${workingTestnet.length}/${testnetEndpoints.length}`);
  console.log(`✅ Working Mainnet RPCs: ${workingMainnet.length}/${mainnetEndpoints.length}\n`);

  if (workingTestnet.length > 0) {
    // Find fastest testnet RPC
    const fastest = workingTestnet.sort((a, b) => (a.latency || 0) - (b.latency || 0))[0];
    console.log("🚀 RECOMMENDED TESTNET RPC:");
    console.log(`   Name: ${fastest.name}`);
    console.log(`   URL: ${fastest.url}`);
    console.log(`   Latency: ${fastest.latency}ms`);
    console.log(`   Block: ${fastest.blockNumber}`);
    console.log("\n📝 Add this to your .env file:");
    console.log(`   MANTLE_TESTNET_RPC=${fastest.url}`);
  } else {
    console.log("❌ No working testnet RPCs found!");
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check your internet connection");
    console.log("   2. Try disabling VPN/Proxy");
    console.log("   3. Check firewall settings");
    console.log("   4. Try a different network (mobile hotspot)");
    console.log("   5. Your ISP might be blocking RPC traffic");
  }

  if (workingMainnet.length > 0) {
    const fastest = workingMainnet.sort((a, b) => (a.latency || 0) - (b.latency || 0))[0];
    console.log("\n🚀 RECOMMENDED MAINNET RPC:");
    console.log(`   Name: ${fastest.name}`);
    console.log(`   URL: ${fastest.url}`);
    console.log(`   Latency: ${fastest.latency}ms`);
    console.log(`   Block: ${fastest.blockNumber}`);
    console.log("\n📝 Add this to your .env file:");
    console.log(`   MANTLE_MAINNET_RPC=${fastest.url}`);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Return results for programmatic use
  return {
    workingTestnet,
    workingMainnet,
    allResults: results,
  };
}

// Run tests
testAllRPCs()
  .then(() => {
    console.log("✅ RPC testing complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error during RPC testing:");
    console.error(error);
    process.exit(1);
  });
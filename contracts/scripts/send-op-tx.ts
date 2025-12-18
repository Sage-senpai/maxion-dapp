// contracts/scripts/send-op-tx.ts
// This file is for Hardhat 3 beta - if not using, can be deleted
// OR fix like this:

import { ethers } from "hardhat";

async function main() {
  console.log("Sending transaction");

  const [sender] = await ethers.getSigners();

  console.log("Sending 1 wei from", sender.address, "to itself");

  console.log("Sending transaction");
  const tx = await sender.sendTransaction({
    to: sender.address,
    value: BigInt(1),
  });

  await tx.wait();

  console.log("Transaction sent successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
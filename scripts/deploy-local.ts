import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying PrizePoolPrediction contract to local network...");

  // Get the contract factory
  const PrizePoolPrediction = await ethers.getContractFactory("PrizePoolPrediction");

  // Deploy the contract
  console.log("📝 Deploying contract...");
  const predictionContract = await PrizePoolPrediction.deploy();
  
  console.log("⏳ Waiting for deployment...");
  await predictionContract.waitForDeployment();

  const contractAddress = await predictionContract.getAddress();
  console.log(`✅ PrizePoolPrediction deployed to: ${contractAddress}`);

  // Display deployment summary
  console.log("\n🎉 Local deployment completed successfully!");
  console.log("=".repeat(50));
  console.log(`📋 Contract: PrizePoolPrediction`);
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`🌐 Network: Local`);
  console.log(`👤 Owner: ${await predictionContract.owner()}`);
  console.log("=".repeat(50));

  console.log("\n💡 To interact with your contract:");
  console.log(`1. Use address: ${contractAddress}`);
  console.log("2. The deployer is the owner/admin");
  console.log("3. You can create predictions using the createPrediction function");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 
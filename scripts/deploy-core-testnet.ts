import { ethers, run, network } from "hardhat";

async function main() {
  console.log("🚀 Deploying PrizePoolPrediction contract to Core Testnet2...");
  console.log("📡 Network: ${network.name}");
  console.log("👤 Deployer: ${(await ethers.getSigners())[0].address}");

  // Get the contract factory
  const PrizePoolPrediction = await ethers.getContractFactory("PrizePoolPrediction");

  // Deploy the contract
  console.log("📝 Deploying contract...");
  const predictionContract = await PrizePoolPrediction.deploy();

  console.log("⏳ Waiting for deployment...");
  await predictionContract.waitForDeployment();

  const contractAddress = await predictionContract.getAddress();
  console.log(`✅ PrizePoolPrediction deployed to: ${contractAddress}`);

  // Wait for block confirmations before verification
  console.log("⏳ Waiting for block confirmations...");
  const deploymentTx = predictionContract.deploymentTransaction();
  if (deploymentTx) {
    await deploymentTx.wait(6);
  }

  // Verify the contract on Core Scan
  console.log("🔍 Verifying contract on Core Scan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully on Core Scan!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  Contract is already verified on Core Scan");
    } else {
      console.log("❌ Verification failed:", error.message);
    }
  }

  // Display deployment summary
  console.log("\n🎉 Core Testnet2 deployment completed successfully!");
  console.log("=".repeat(60));
  console.log(`📋 Contract: PrizePoolPrediction (Updated Version)`);
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`🌐 Network: Core Testnet2 (Chain ID: 1114)`);
  console.log(`👤 Deployer: ${(await ethers.getSigners())[0].address}`);
  console.log(`🔗 Core Scan: https://scan.test2.btcs.network/address/${contractAddress}`);
  console.log("\n🆕 New Features:");
  console.log("✅ Automatic prize distribution");
  console.log("✅ Dispute resolution system");
  console.log("✅ Community voting with stakes");
  console.log("✅ Creator-only initial resolution");
  console.log("✅ Prize redistribution after disputes");
  console.log("=".repeat(60));

  // Save deployment info to a file
  const deploymentInfo = {
    contract: "PrizePoolPrediction",
    address: contractAddress,
    network: "coreTestnet2",
    chainId: 1114,
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
    deploymentTx: deploymentTx?.hash,
    features: [
      "Automatic prize distribution",
      "Dispute resolution system", 
      "Community voting with stakes",
      "Creator-only initial resolution",
      "Prize redistribution after disputes"
    ]
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '../deployments');

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, 'coreTestnet2-v2.json');
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}`);

  console.log("\n💡 Next steps:");
  console.log("1. Test your contract functions on Core Testnet2");
  console.log("2. Create some test predictions");
  console.log("3. Test the dispute resolution system");
  console.log("4. Test automatic prize distribution");
  console.log("5. When ready, deploy to Core mainnet (Chain ID: 1116)");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 
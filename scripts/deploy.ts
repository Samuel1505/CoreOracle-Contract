import { ethers, run, network } from "hardhat";

async function main() {
  console.log("🚀 Deploying PrizePoolPrediction contract...");
  console.log(`📡 Network: ${network.name}`);
  console.log(`👤 Deployer: ${(await ethers.getSigners())[0].address}`);

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

  // Verify the contract on Etherscan (only for public networks)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully on Etherscan!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Contract is already verified on Etherscan");
      } else {
        console.log("❌ Verification failed:", error.message);
      }
    }
  } else {
    console.log("ℹ️  Skipping verification for local network");
  }

  // Display deployment summary
  console.log("\n🎉 Deployment completed successfully!");
  console.log("=".repeat(50));
  console.log(`📋 Contract: PrizePoolPrediction`);
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`🌐 Network: ${network.name}`);
  console.log(`👤 Owner: ${await predictionContract.owner()}`);
  console.log(`🔗 Etherscan: ${network.name !== "hardhat" && network.name !== "localhost" ? `https://${network.name === "sepolia" ? "sepolia." : ""}etherscan.io/address/${contractAddress}` : "N/A"}`);
  console.log("=".repeat(50));

  // Save deployment info to a file
  const deploymentInfo = {
    contract: "PrizePoolPrediction",
    address: contractAddress,
    network: network.name,
    deployer: (await ethers.getSigners())[0].address,
    owner: await predictionContract.owner(),
    timestamp: new Date().toISOString(),
    deploymentTx: deploymentTx?.hash
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '../deployments');
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 
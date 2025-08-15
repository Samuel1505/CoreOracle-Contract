import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("📋 Extracting PrizePoolPrediction ABI...");
  
  try {
    // Compile the project to ensure we have the latest artifacts
    console.log("📝 Compiling contracts...");
    const hre: HardhatRuntimeEnvironment = require("hardhat");
    await hre.run("compile");
    
    // Get the contract artifact
    const artifact = await hre.artifacts.readArtifact("PrizePoolPrediction");
    
    // Create ABI object with contract metadata
    const abiData = {
      contractName: "PrizePoolPrediction",
      address: "0x9b39Fb4c93d80dF3E91a0369c5B6599Cf80873A4",
      network: "Core Testnet2",
      chainId: 1114,
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
      metadata: {
        compiler: {
          version: "0.8.20",
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
        language: "Solidity",
        evmVersion: "paris"
      },
      deploymentInfo: {
        deployer: "0xca91ab4b9e882f65fa809d39be787461247a81aab3d01e099e341dacb2ca3640",
        timestamp: new Date().toISOString(),
        transactionHash: "Deployed via Hardhat"
      }
    };
    
    // Save to parent directory's ABI folder
    const outputPath = path.join(__dirname, "../../abi/PrizePoolPrediction.json");
    fs.writeFileSync(outputPath, JSON.stringify(abiData, null, 2));
    
    console.log("✅ ABI extracted successfully!");
    console.log(`📁 File saved to: ${outputPath}`);
    console.log(`📊 ABI contains ${artifact.abi.length} functions/events`);
    
    // Also create a minimal ABI file with just the ABI array
    const minimalAbiPath = path.join(__dirname, "../../abi/PrizePoolPrediction-abi.json");
    fs.writeFileSync(minimalAbiPath, JSON.stringify(artifact.abi, null, 2));
    
    console.log(`📁 Minimal ABI saved to: ${minimalAbiPath}`);
    console.log("\n💡 Frontend Usage:");
    console.log("1. Import the ABI: import abi from '../abi/PrizePrediction.json'");
    console.log("2. Use with ethers: new ethers.Contract(address, abi.abi, signer)");
    console.log("3. Or use minimal ABI: new ethers.Contract(address, abi, signer)");
    
  } catch (error) {
    console.error("❌ Error extracting ABI:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
}); 
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🔧 Generating Standard JSON for Core Scan verification...");
  
  // Get the Hardhat runtime environment
  const hre: HardhatRuntimeEnvironment = require("hardhat");
  
  try {
    // Compile the project to ensure we have the latest artifacts
    console.log("📝 Compiling contracts...");
    await hre.run("compile");
    
    // Get the full source code of your contract
    const sourceCode = fs.readFileSync(
      path.join(__dirname, "../contracts/Prediction.sol"),
      "utf8"
    );
    
    // Get OpenZeppelin contract source code from node_modules
    const nodeModulesPath = path.join(__dirname, "../node_modules");
    
    // Read ReentrancyGuard.sol
    const reentrancyGuardPath = path.join(nodeModulesPath, "@openzeppelin/contracts/utils/ReentrancyGuard.sol");
    const reentrancyGuardSource = fs.readFileSync(reentrancyGuardPath, "utf8");
    
    // Read Ownable.sol
    const ownablePath = path.join(nodeModulesPath, "@openzeppelin/contracts/access/Ownable.sol");
    const ownableSource = fs.readFileSync(ownablePath, "utf8");
    
    // Read Context.sol (dependency of Ownable)
    const contextPath = path.join(nodeModulesPath, "@openzeppelin/contracts/utils/Context.sol");
    const contextSource = fs.readFileSync(contextPath, "utf8");
    
    console.log("📚 Including OpenZeppelin contracts...");
    
    // Create the Standard JSON input with all dependencies
    const standardJsonInput = {
      language: "Solidity",
      sources: {
        "@openzeppelin/contracts/utils/Context.sol": {
          content: contextSource
        },
        "@openzeppelin/contracts/access/Ownable.sol": {
          content: ownableSource
        },
        "@openzeppelin/contracts/utils/ReentrancyGuard.sol": {
          content: reentrancyGuardSource
        },
        "contracts/Prediction.sol": {
          content: sourceCode
        }
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "paris",
        outputSelection: {
          "*": {
            "*": ["*"]
          }
        }
      }
    };
    
    // Save the Standard JSON input
    const outputPath = path.join(__dirname, "../verification-input.json");
    fs.writeFileSync(outputPath, JSON.stringify(standardJsonInput, null, 2));
    
    console.log("✅ Standard JSON generated successfully with OpenZeppelin contracts!");
    console.log(`📁 File saved to: ${outputPath}`);
    console.log("\n💡 Instructions for Core Scan verification:");
    console.log("1. Go to: https://scan.test2.btcs.network/address/0x9b39Fb4c93d80dF3E91a0369c5B6599Cf80873A4");
    console.log("2. Click 'Contract' tab → 'Verify and Publish'");
    console.log("3. Select 'Standard Json' as compiler type");
    console.log("4. Copy the content of verification-input.json");
    console.log("5. Paste it into the 'Standard Json Input' field");
    console.log("6. Click 'Verify and Publish'");
    console.log("\n📚 This version includes all OpenZeppelin dependencies!");
    
  } catch (error) {
    console.error("❌ Error generating Standard JSON:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
}); 
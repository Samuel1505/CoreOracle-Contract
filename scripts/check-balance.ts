import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🔍 Checking account details...");
  console.log("👤 Account address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network ID:", network.chainId);
  console.log("📡 Network name:", network.name);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
}); 
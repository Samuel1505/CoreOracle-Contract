import { ethers } from "hardhat";
import { PrizePoolPrediction } from "../typechain-types";

async function main() {
  console.log(" Testing PrizePoolPrediction contract locally...");

  // Deploy the contract locally
  console.log(" Deploying contract locally...");
  const PrizePoolPredictionFactory = await ethers.getContractFactory("PrizePoolPrediction");
  const contract = await PrizePoolPredictionFactory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(` Contract deployed to: ${contractAddress}`);

  // Get test accounts
  const [deployer, user1, user2, user3, user4] = await ethers.getSigners();
  console.log(` Deployer: ${deployer.address}`);
  console.log(` User 1: ${user1.address}`);
  console.log(` User 2: ${user2.address}`);

  try {
    // Test 1: Create a prediction
    console.log("\n Test 1: Creating a prediction...");
    const question = "Will ETH be above $2000 by end of month?";
    const options = ["YES", "NO"];
    const entryFee = ethers.parseEther("0.001");
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = currentTime + 7200; // 2 hours from now (more than 1 hour minimum)
    const resolutionTime = endTime + 7200; // 2 hours after end time (more than 1 hour minimum)

    console.log(` Question: ${question}`);
    console.log(` Options: ${options.join(", ")}`);
    console.log(` Entry Fee: ${ethers.formatEther(entryFee)} ETH`);
    console.log(`Current time: ${new Date(currentTime * 1000).toLocaleString()}`);
    console.log(`End time: ${new Date(endTime * 1000).toLocaleString()}`);
    console.log(`Resolution time: ${new Date(resolutionTime * 1000).toLocaleString()}`);

    const createTx = await contract.connect(deployer).createPrediction(
      question,
      options,
      entryFee,
      endTime,
      resolutionTime,
      { value: ethers.parseEther("0.01") } // Initial prize pool
    );

    console.log(" Waiting for prediction creation...");
    await createTx.wait();
    console.log(" Prediction created successfully!");

    // Test 2: Users submit predictions
    console.log("\n Test 2: Users submitting predictions...");
    
    // User 1 bets YES
    const submit1Tx = await contract.connect(user1).submitPrediction(1, 0, { value: entryFee });
    await submit1Tx.wait();
    console.log(" User 1 bet on YES");

    // User 2 bets NO
    const submit2Tx = await contract.connect(user2).submitPrediction(1, 1, { value: entryFee });
    await submit2Tx.wait();
    console.log(" User 2 bet on NO");

    // User 3 bets YES
    const submit3Tx = await contract.connect(user3).submitPrediction(1, 0, { value: entryFee });
    await submit3Tx.wait();
    console.log("User 3 bet on YES");

    // Test 3: Check prediction details
    console.log("\n Test 3: Checking prediction details...");
    const prediction = await contract.getPrediction(1);
    console.log(` Prediction ID: ${prediction.id}`);
    console.log(` Question: ${prediction.question}`);
    console.log(`Options: ${prediction.options.join(", ")}`);
    console.log(`Entry Fee: ${ethers.formatEther(prediction.entryFee)} ETH`);
    console.log(`Prize Pool: ${ethers.formatEther(prediction.prizePool)} ETH`);
    console.log(` Total Participants: ${prediction.totalParticipants}`);

    // Test 4: Check user predictions
    console.log("\n Test 4: Checking user predictions...");
    const user1Pred = await contract.getUserPrediction(1, user1.address);
    const user2Pred = await contract.getUserPrediction(1, user2.address);
    console.log(` User 1 bet on option: ${user1Pred.option} (${options[Number(user1Pred.option)]})`);
    console.log(` User 2 bet on option: ${user2Pred.option} (${options[Number(user2Pred.option)]})`);

    // Test 5: Check option stats
    console.log("\n Test 5: Checking option statistics...");
    const optionStats = await contract.getAllOptionStats(1);
    console.log(`Option counts: ${optionStats.counts.join(", ")}`);
    console.log(`Option percentages: ${optionStats.percentages.map(p => p.toString()).join(", ")}%`);

    // Test 6: Resolve prediction (Creator resolves)
    console.log("\n Test 6: Resolving prediction...");
    
    // Fast forward time to after end time
    console.log(" Fast forwarding time to after prediction end time...");
    const timeToAdvance = endTime - currentTime + 100; // Go past end time
    await ethers.provider.send("evm_increaseTime", [timeToAdvance]);
    await ethers.provider.send("evm_mine");
    
    console.log(` Advanced time by ${timeToAdvance} seconds`);
    console.log(` Current block time: ${new Date((await ethers.provider.getBlock('latest'))!.timestamp * 1000).toLocaleString()}`);
    
    const resolveTx = await contract.connect(deployer).resolvePrediction(1, 0); // YES wins
    console.log(" Resolving prediction...");
    await resolveTx.wait();
    console.log(" Prediction resolved! YES wins");

    // Test 7: Check if prizes were distributed automatically
    console.log("\n Test 7: Checking automatic prize distribution...");
    const user1Stats = await contract.getUserStats(user1.address);
    const user2Stats = await contract.getUserStats(user2.address);
    const user3Stats = await contract.getUserStats(user3.address);
    
    console.log(` User 1 (YES): Total winnings: ${ethers.formatEther(user1Stats.totalWinnings)} ETH`);
    console.log(` User 2 (NO): Total winnings: ${ethers.formatEther(user2Stats.totalWinnings)} ETH`);
    console.log(` User 3 (YES): Total winnings: ${ethers.formatEther(user3Stats.totalWinnings)} ETH`);

    // Test 8: Check if prizes are distributed
    console.log("\n Test 8: Checking prize distribution status...");
    const prizesDistributed = await contract.arePrizesDistributed(1);
    console.log(` Prizes distributed: ${prizesDistributed}`);

    // Test 9: Test dispute system (simulate wrong resolution)
    console.log("\n Test 9: Testing dispute system...");
    
    // Get current block time after previous time advancement
    const currentBlockTime = (await ethers.provider.getBlock('latest'))!.timestamp;
    console.log(` Current block time: ${new Date(currentBlockTime * 1000).toLocaleString()}`);
    
    // Create a new prediction for dispute testing
    const disputeQuestion = "Will Bitcoin reach $50k by month end?";
    const disputeEndTime = currentBlockTime + 7200; // 2 hours from current block time (more than 1 hour minimum)
    const disputeResolutionTime = disputeEndTime + 7200; // 2 hours after end time (more than 1 hour minimum)
    
    console.log(` Dispute Question: ${disputeQuestion}`);
    console.log(` Dispute End time: ${new Date(disputeEndTime * 1000).toLocaleString()}`);
    console.log(`Dispute Resolution time: ${new Date(disputeResolutionTime * 1000).toLocaleString()}`);
    
    const createDisputeTx = await contract.connect(deployer).createPrediction(
      disputeQuestion,
      options,
      entryFee,
      disputeEndTime,
      disputeResolutionTime,
      { value: ethers.parseEther("0.01") }
    );
    await createDisputeTx.wait();
    console.log(" Dispute test prediction created");

    // Users bet on it
    await contract.connect(user1).submitPrediction(2, 0, { value: entryFee });
    await contract.connect(user2).submitPrediction(2, 1, { value: entryFee });
    await contract.connect(user3).submitPrediction(2, 0, { value: entryFee });
    console.log(" Users placed bets on dispute test prediction");

    // Fast forward and resolve
    console.log(" Fast forwarding time for dispute test prediction...");
    const disputeTimeToAdvance = disputeEndTime - currentBlockTime + 100; // Go past end time
    await ethers.provider.send("evm_increaseTime", [disputeTimeToAdvance]);
    await ethers.provider.send("evm_mine");
    
    console.log(` Advanced time by ${disputeTimeToAdvance} seconds for dispute test`);
    
    await contract.connect(deployer).resolvePrediction(2, 0); // YES wins
    console.log("Dispute test prediction resolved");

    // Test 10: Create dispute
    console.log("\n Test 10: Creating a dispute...");
    const disputeTx = await contract.connect(user2).createDispute(2, 1, { value: ethers.parseEther("0.01") });
    await disputeTx.wait();
    console.log(" Dispute created! User 2 challenged the resolution");

    // Test 11: Check dispute info
    console.log("\n Test 11: Checking dispute information...");
    const disputeInfo = await contract.getDisputeInfo(2);
    console.log(`Has active dispute: ${disputeInfo.hasActiveDispute}`);
    console.log(` Challenger: ${disputeInfo.challenger}`);
    console.log(` Proposed option: ${disputeInfo.proposedWinningOption} (${options[Number(disputeInfo.proposedWinningOption)]})`);
    console.log(` Deadline: ${new Date(Number(disputeInfo.deadline) * 1000).toLocaleString()}`);

    console.log("\n All local tests completed successfully!");
    console.log(" Your contract is working correctly locally!");
    console.log(" Ready to deploy to Core Testnet2!");

  } catch (error) {
    console.error(" Test failed:", error);
  }
}

main().catch((error) => {
  console.error(" Script failed:", error);
  process.exitCode = 1;
}); 
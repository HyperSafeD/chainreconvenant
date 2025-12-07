const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Starting ChainReCovenant Deployment...\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("📡 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = deployer ? await deployer.getAddress() : "Unknown";
  const balance = deployer ? await hre.ethers.provider.getBalance(deployerAddress) : 0;
  
  console.log("👤 Deployer:", deployerAddress);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("\n" + "=".repeat(60) + "\n");

  // Deploy ChainReCovenant
  console.log("📝 Deploying ChainReCovenant...");
  const ChainReCovenant = await hre.ethers.getContractFactory("ChainReCovenant");
  const covenant = await ChainReCovenant.deploy();
  await covenant.waitForDeployment();
  
  const covenantAddress = await covenant.getAddress();
  console.log("✅ ChainReCovenant deployed to:", covenantAddress);

  // Deploy CovenantFactory
  console.log("\n📝 Deploying CovenantFactory...");
  const CovenantFactory = await hre.ethers.getContractFactory("ChainReCovenantFactory");
  const factory = await CovenantFactory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ CovenantFactory deployed to:", factoryAddress);

  console.log("\n" + "=".repeat(60));
  console.log("\n⏳ Waiting for block confirmations...\n");

  // Wait for confirmations
  if (network.name !== "hardhat" && network.name !== "localhost") {
    const covenantTx = covenant.deploymentTransaction();
    const factoryTx = factory.deploymentTransaction();
    
    if (covenantTx) await covenantTx.wait(5);
    if (factoryTx) await factoryTx.wait(5);
    
    console.log("✅ Transactions confirmed!\n");
    console.log("=".repeat(60));

    // Verify on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
      console.log("\n🔍 Verifying contracts on Etherscan...\n");
      
      try {
        await hre.run("verify:verify", {
          address: covenantAddress,
          constructorArguments: [],
        });
        console.log("✅ ChainReCovenant verified!");
      } catch (error) {
        console.log("⚠️  ChainReCovenant verification failed:", error.message);
      }

      try {
        await hre.run("verify:verify", {
          address: factoryAddress,
          constructorArguments: [],
        });
        console.log("✅ CovenantFactory verified!");
      } catch (error) {
        console.log("⚠️  CovenantFactory verification failed:", error.message);
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 DEPLOYMENT SUCCESSFUL!\n");
  console.log("📋 Summary:");
  console.log("   ChainReCovenant:  ", covenantAddress);
  console.log("   CovenantFactory:  ", factoryAddress);
  console.log("   Network:          ", network.name);
  console.log("   Deployer:         ", deployerAddress);
  console.log("\n" + "=".repeat(60));
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployerAddress,
    contracts: {
      ChainReCovenant: covenantAddress,
      CovenantFactory: factoryAddress
    },
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const fs = require("fs");
  const path = require("path");
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info
  const fileName = `${network.name}-${Date.now()}.json`;
  const filePath = path.join(deploymentsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n💾 Deployment info saved to:", fileName);
  console.log("\n✨ You can now interact with your contracts!\n");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:\n");
    console.error(error);
    process.exit(1);
  });


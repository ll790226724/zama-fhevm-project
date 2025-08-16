// Ethereum Sepolia Deployment Script
const hre = require("hardhat");

async function main() {
    console.log("🚀 Starting voting contract deployment to Ethereum Sepolia...");
    console.log("=".repeat(50));
    
    // Check private key
    if (!process.env.PRIVATE_KEY) {
        throw new Error("❌ PRIVATE_KEY environment variable not set! Please add your private key to .env file");
    }
    
    // Check network connection
    console.log("🔍 Checking network connection...");
    try {
        const provider = hre.ethers.provider;
        const network = await provider.getNetwork();
        console.log(`✅ Network connection successful! Chain ID: ${network.chainId}`);
        
        if (network.chainId !== 11155111) {
            console.log(`⚠️  Warning: Current network Chain ID is ${network.chainId}, expected 11155111 (Ethereum Sepolia)`);
        }
    } catch (error) {
        throw new Error(`❌ Network connection failed: ${error.message}`);
    }
    
    // Get deployment account
    console.log("👤 Getting deployment account...");
    const [deployer] = await hre.ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`📍 Deployment account: ${deployerAddress}`);
    
    // Check balance
    console.log("💰 Checking account balance...");
    const balance = await deployer.provider.getBalance(deployerAddress);
    const balanceInEth = hre.ethers.formatEther(balance);
    console.log(`💰 Account balance: ${balanceInEth} ETH`);
    
    if (parseFloat(balanceInEth) < 0.01) {
        console.log("⚠️  Low balance, recommend getting more test ETH from faucets:");
        console.log("   🔗 https://sepoliafaucet.com/");
        console.log("   🔗 https://faucets.chain.link/sepolia");
    }
    
    // Select contract type
    console.log("\n📋 Available contract types:");
    console.log("1. StandardVoting - Standard voting contract (recommended, good compatibility)");
    console.log("2. ConfidentialVoting - FHEVM encrypted voting contract (requires Zama network)");
    
    // Since you're using Ethereum Sepolia, we use StandardVoting
    console.log("🔄 Automatically selecting StandardVoting contract (suitable for Ethereum network)");
    
    // Deploy StandardVoting contract
    console.log("\n📦 Compiling StandardVoting contract...");
    const StandardVoting = await hre.ethers.getContractFactory("StandardVoting");
    
    console.log("🚀 Starting deployment...");
    const votingContract = await StandardVoting.deploy({
        gasLimit: 2000000,
        gasPrice: hre.ethers.parseUnits("20", "gwei")
    });
    
    console.log("⏳ Waiting for deployment confirmation...");
    await votingContract.waitForDeployment();
    
    const contractAddress = await votingContract.getAddress();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ Voting contract deployment successful!");
    console.log("📋 Deployment information:");
    console.log(`📍 Contract address: ${contractAddress}`);
    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`🌐 Network: Ethereum Sepolia (Chain ID: 11155111)`);
    console.log(`🔗 Block explorer: https://sepolia.etherscan.io/address/${contractAddress}`);
    
    // Verify contract functionality
    console.log("\n🔍 Verifying contract functionality...");
    try {
        const owner = await votingContract.owner();
        const votingActive = await votingContract.votingActive();
        const totalVoters = await votingContract.getTotalVoters();
        
        console.log("✅ Contract verification successful!");
        console.log(`👑 Contract owner: ${owner}`);
        console.log(`🗳️ Voting status: ${votingActive ? 'Active' : 'Inactive'}`);
        console.log(`👥 Registered voters count: ${totalVoters.toString()}`);
    } catch (error) {
        console.log("❌ Contract verification failed:", error.message);
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Deployment complete!");
    console.log("\n📝 Please save the following information:");
    console.log(`Contract address: ${contractAddress}`);
    console.log(`Deployer address: ${deployerAddress}`);
    console.log(`Network: Ethereum Sepolia`);
    console.log(`Block explorer: https://sepolia.etherscan.io/address/${contractAddress}`);
    
    console.log("\n💡 Next steps:");
    console.log("1. Copy the contract address to the frontend application contract configuration");
    console.log("2. Connect wallet and test contract functionality");
    console.log("3. Register voters and create vote options");
    
    return contractAddress;
}

main()
    .then((contractAddress) => {
        console.log(`\n✅ Deployment process complete! Contract address: ${contractAddress}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error.message);
        console.log("\n💡 Common solutions:");
        console.log("1. Ensure PRIVATE_KEY is set in .env file");
        console.log("2. Ensure account has sufficient ETH balance");
        console.log("3. Get test ETH from faucet: https://sepoliafaucet.com/");
        console.log("4. Check network connection and RPC configuration");
        process.exit(1);
    }); 
const { ethers } = require("hardhat");

async function deployToAlchemy() {
  console.log("🚀 开始部署到Alchemy Sepolia测试网...\n");

  const rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/ilcfO47WJ1EYbxU-iuB3A";
  
  try {
    // 创建provider和signer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error("请在.env文件中设置PRIVATE_KEY");
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`📋 部署账户: ${wallet.address}`);
    
    // 检查账户余额
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 账户余额: ${ethers.formatEther(balance)} ETH`);
    
    if (balance === 0n) {
      console.log("❌ 账户余额为0，无法部署合约");
      console.log("💡 请从Sepolia水龙头获取测试ETH:");
      console.log("   https://sepoliafaucet.com/");
      console.log("   https://faucet.sepolia.dev/");
      return;
    }
    
    // 编译合约
    console.log("\n🔨 编译合约...");
    await hre.run("compile");
    console.log("✅ 合约编译成功");
    
    // 获取合约工厂
    const ConfidentialVoting = await ethers.getContractFactory("ConfidentialVoting", wallet);
    console.log("✅ 获取合约工厂成功");
    
    // 估算部署gas
    console.log("\n⛽ 估算部署gas...");
    const deploymentData = ConfidentialVoting.interface.encodeDeploy();
    const gasEstimate = await provider.estimateGas({
      from: wallet.address,
      data: deploymentData
    });
    console.log(`✅ 预估部署gas: ${gasEstimate.toString()}`);
    
    // 获取当前gas价格
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    console.log(`✅ 当前gas价格: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    
    // 计算部署成本
    const deploymentCost = gasEstimate * gasPrice;
    console.log(`💰 预估部署成本: ${ethers.formatEther(deploymentCost)} ETH`);
    
    if (balance < deploymentCost) {
      console.log("❌ 账户余额不足，无法部署合约");
      console.log(`   需要: ${ethers.formatEther(deploymentCost)} ETH`);
      console.log(`   当前: ${ethers.formatEther(balance)} ETH`);
      return;
    }
    
    // 部署合约
    console.log("\n🚀 开始部署合约...");
    const contract = await ConfidentialVoting.deploy();
    console.log("⏳ 等待部署确认...");
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log("\n🎉 合约部署成功!");
    console.log(`📋 合约地址: ${contractAddress}`);
    console.log(`🔗 区块浏览器: https://sepolia.etherscan.io/address/${contractAddress}`);
    
    // 测试合约功能
    console.log("\n🧪 测试合约功能...");
    
    // 测试注册投票者
    const testVoterAddress = "0x1234567890123456789012345678901234567890";
    
    console.log("  ├─ 测试注册投票者...");
    const registerTx = await contract.registerVoter(testVoterAddress);
    await registerTx.wait();
    console.log("  ├─ ✅ 投票者注册成功");
    
    // 测试获取投票者信息
    console.log("  ├─ 测试获取投票者信息...");
    const voterInfo = await contract.getVoterInfo(testVoterAddress);
    console.log(`  ├─ ✅ 投票者已注册: ${voterInfo.isRegistered}`);
    
    // 测试获取投票者数量
    console.log("  ├─ 测试获取投票者数量...");
    const voterCount = await contract.getVoterCount();
    console.log(`  ├─ ✅ 投票者数量: ${voterCount.toString()}`);
    
    console.log("  └─ ✅ 所有功能测试通过!\n");
    
    // 保存部署信息
    const deploymentInfo = {
      network: "Sepolia (Alchemy)",
      contractAddress: contractAddress,
      deployer: wallet.address,
      deploymentTime: new Date().toISOString(),
      rpcUrl: rpcUrl,
      blockExplorer: `https://sepolia.etherscan.io/address/${contractAddress}`
    };
    
    console.log("📄 部署信息:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎯 部署完成! 您的FHEVM机密投票合约已成功部署到Sepolia测试网。");
    console.log("💡 注意: 这是Ethereum Sepolia测试网，不是Zama Sepolia测试网。");
    console.log("💡 如果需要部署到Zama Sepolia，请解决网络连接问题后使用Zama的RPC端点。");
    
  } catch (error) {
    console.error("❌ 部署失败:", error);
    
    if (error.message.includes("PRIVATE_KEY")) {
      console.log("\n💡 解决方案:");
      console.log("1. 在项目根目录创建.env文件");
      console.log("2. 添加您的私钥: PRIVATE_KEY=your_private_key_here");
      console.log("3. 确保私钥格式正确（0x开头）");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💡 解决方案:");
      console.log("请从Sepolia水龙头获取测试ETH:");
      console.log("https://sepoliafaucet.com/");
    }
  }
}

deployToAlchemy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  }); 
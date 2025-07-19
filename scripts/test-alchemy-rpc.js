const { ethers } = require("hardhat");

async function testAlchemyRPC() {
  console.log("🔍 测试Alchemy RPC端点...\n");

  const rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/ilcfO47WJ1EYbxU-iuB3A";
  
  console.log(`📡 测试RPC端点: ${rpcUrl}`);
  
  try {
    // 创建provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // 测试基本连接
    console.log("  ├─ 测试基本连接...");
    const blockNumber = await provider.getBlockNumber();
    console.log(`  ├─ ✅ 连接成功! 当前区块: ${blockNumber}`);
    
    // 测试网络ID
    console.log("  ├─ 测试网络ID...");
    const network = await provider.getNetwork();
    console.log(`  ├─ ✅ 网络ID: ${network.chainId}`);
    
    // 测试gas价格
    console.log("  ├─ 测试gas价格...");
    const gasPrice = await provider.getFeeData();
    console.log(`  ├─ ✅ Gas价格: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);
    
    // 测试账户余额
    console.log("  ├─ 测试账户功能...");
    const accounts = await ethers.getSigners();
    const balance = await provider.getBalance(accounts[0].address);
    console.log(`  ├─ ✅ 账户余额: ${ethers.formatEther(balance)} ETH`);
    
    console.log("  └─ ✅ 所有测试通过!\n");
    
    // 测试部署合约
    console.log("🚀 测试合约部署...");
    
    // 编译合约
    console.log("  ├─ 编译合约...");
    await hre.run("compile");
    console.log("  ├─ ✅ 合约编译成功");
    
    // 获取合约工厂
    const ConfidentialVoting = await ethers.getContractFactory("ConfidentialVoting");
    console.log("  ├─ ✅ 获取合约工厂成功");
    
    // 估算部署gas
    console.log("  ├─ 估算部署gas...");
    const deploymentGas = await ConfidentialVoting.getDeployTransaction().gasLimit;
    console.log(`  ├─ ✅ 预估部署gas: ${deploymentGas.toString()}`);
    
    // 检查账户余额是否足够
    const estimatedCost = deploymentGas * gasPrice.gasPrice;
    console.log(`  ├─ 预估部署成本: ${ethers.formatEther(estimatedCost)} ETH`);
    
    if (balance > estimatedCost) {
      console.log("  ├─ ✅ 账户余额足够部署");
      
      // 部署合约
      console.log("  ├─ 开始部署合约...");
      const contract = await ConfidentialVoting.deploy();
      await contract.waitForDeployment();
      
      const contractAddress = await contract.getAddress();
      console.log(`  ├─ ✅ 合约部署成功! 地址: ${contractAddress}`);
      
      // 测试合约功能
      console.log("  ├─ 测试合约功能...");
      
      // 测试注册投票者
      const voterAddress = accounts[1].address;
      const encryptedVote = ethers.hexlify(ethers.randomBytes(32)); // 模拟加密投票
      
      const registerTx = await contract.registerVoter(voterAddress, encryptedVote);
      await registerTx.wait();
      console.log("  ├─ ✅ 投票者注册成功");
      
      // 测试获取投票者信息
      const voterInfo = await contract.getVoterInfo(voterAddress);
      console.log(`  ├─ ✅ 获取投票者信息成功: ${voterInfo.isRegistered}`);
      
      console.log("  └─ ✅ 合约功能测试全部通过!\n");
      
      console.log("🎉 部署测试完全成功!");
      console.log(`📋 合约地址: ${contractAddress}`);
      console.log(`🔗 区块浏览器: https://sepolia.etherscan.io/address/${contractAddress}`);
      
    } else {
      console.log("  ├─ ❌ 账户余额不足，无法部署");
      console.log(`  ├─ 需要: ${ethers.formatEther(estimatedCost)} ETH`);
      console.log(`  ├─ 当前: ${ethers.formatEther(balance)} ETH`);
      console.log("  └─ 💡 请获取一些测试网ETH");
    }
    
  } catch (error) {
    console.log("  ├─ ❌ 连接失败");
    console.log(`  ├─ 错误类型: ${error.constructor.name}`);
    console.log(`  ├─ 错误代码: ${error.code || 'N/A'}`);
    console.log(`  ├─ 错误消息: ${error.message}`);
    
    if (error.statusCode) {
      console.log(`  ├─ HTTP状态码: ${error.statusCode}`);
    }
    
    console.log("  └─ ❌ 测试失败\n");
  }
}

testAlchemyRPC()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试脚本执行失败:", error);
    process.exit(1);
  }); 
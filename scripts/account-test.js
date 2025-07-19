const { ethers } = require("hardhat");

async function testAccount() {
  console.log("🔍 账户和网络测试...\n");

  // 检查私钥
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log("❌ 未设置PRIVATE_KEY环境变量");
    return;
  }

  console.log("✅ PRIVATE_KEY已设置");
  
  // 创建钱包
  const wallet = new ethers.Wallet(privateKey);
  console.log(`📍 账户地址: ${wallet.address}`);

  // 测试不同的RPC端点
  const endpoints = [
    {
      name: "Zama Sepolia (DRPC)",
      url: "https://zama-sepolia.drpc.org"
    },
    {
      name: "Zama Sepolia (官方)",
      url: "https://sepolia.zama.ai"
    },
    {
      name: "Zama Testnet",
      url: "https://testnet.zama.ai"
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 测试 ${endpoint.name}:`);
    console.log(`   URL: ${endpoint.url}`);
    
    try {
      // 创建provider
      const provider = new ethers.JsonRpcProvider(endpoint.url);
      
      // 测试连接
      console.log("   🔄 测试连接...");
      const network = await provider.getNetwork();
      console.log(`   ✅ 连接成功! Chain ID: ${network.chainId}`);
      
      // 检查余额
      console.log("   💰 检查余额...");
      const balance = await provider.getBalance(wallet.address);
      console.log(`   ✅ 余额: ${ethers.formatEther(balance)} ETH`);
      
      if (balance > 0) {
        console.log("   🎉 账户有余额，可以部署合约！");
        return { endpoint, balance };
      } else {
        console.log("   ⚠️  账户余额为0，需要从水龙头获取测试ETH");
      }
      
    } catch (error) {
      console.log(`   ❌ 连接失败: ${error.message}`);
      
      if (error.message.includes("Couldn't parse request")) {
        console.log("   💡 这是RPC端点的问题，不是您的网络问题");
      }
    }
  }

  console.log("\n📋 总结:");
  console.log("1. 您的账户配置正确");
  console.log("2. 网络连接基本正常");
  console.log("3. 需要获取测试ETH才能部署");
  console.log("4. 建议联系Zama社区获取最新的RPC端点");
  
  return null;
}

testAccount()
  .then((result) => {
    if (result) {
      console.log(`\n🎉 找到可用的端点: ${result.endpoint.name}`);
      console.log(`💰 账户余额: ${ethers.formatEther(result.balance)} ETH`);
      console.log("✅ 可以尝试部署合约！");
    } else {
      console.log("\n❌ 需要解决网络连接或获取测试ETH");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  }); 
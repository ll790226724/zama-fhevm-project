const { ethers } = require("hardhat");

async function testNetworkConnections() {
  console.log("🔍 开始网络连接测试...\n");

  // 测试不同的RPC端点
  const rpcEndpoints = [
    {
      name: "Zama Sepolia (官方)",
      url: "https://sepolia.zama.ai",
      chainId: 8009
    },
    {
      name: "Zama Testnet",
      url: "https://testnet.zama.ai", 
      chainId: 8009
    },
    {
      name: "Zama Sepolia (DRPC)",
      url: "https://zama-sepolia.drpc.org",
      chainId: 8009
    },
    {
      name: "Ethereum Sepolia (对比)",
      url: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 11155111
    }
  ];

  for (const endpoint of rpcEndpoints) {
    console.log(`📡 测试 ${endpoint.name}:`);
    console.log(`   URL: ${endpoint.url}`);
    
    try {
      // 创建provider
      const provider = new ethers.JsonRpcProvider(endpoint.url);
      
      // 测试基本连接
      console.log("   🔄 测试基本连接...");
      const network = await provider.getNetwork();
      console.log(`   ✅ 连接成功! Chain ID: ${network.chainId}`);
      
      // 测试获取最新区块
      console.log("   📦 测试获取最新区块...");
      const latestBlock = await provider.getBlockNumber();
      console.log(`   ✅ 最新区块: ${latestBlock}`);
      
      // 测试获取Gas价格
      console.log("   ⛽ 测试获取Gas价格...");
      const gasPrice = await provider.getFeeData();
      console.log(`   ✅ Gas价格: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);
      
    } catch (error) {
      console.log(`   ❌ 连接失败: ${error.message}`);
      
      // 详细错误分析
      if (error.message.includes("ENOTFOUND")) {
        console.log("   💡 问题: DNS解析失败 - 可能是网络环境限制");
      } else if (error.message.includes("ECONNREFUSED")) {
        console.log("   💡 问题: 连接被拒绝 - 可能是防火墙或服务不可用");
      } else if (error.message.includes("timeout")) {
        console.log("   💡 问题: 连接超时 - 可能是网络延迟过高");
      } else if (error.message.includes("403")) {
        console.log("   💡 问题: 访问被拒绝 - 可能需要API密钥");
      } else {
        console.log("   💡 问题: 其他网络错误");
      }
    }
    
    console.log(""); // 空行分隔
  }

  // 测试您的私钥和账户
  console.log("🔑 测试账户配置:");
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.log("   ❌ 未设置PRIVATE_KEY环境变量");
    } else {
      console.log("   ✅ PRIVATE_KEY已设置");
      
      // 创建钱包实例
      const wallet = new ethers.Wallet(privateKey);
      console.log(`   📍 账户地址: ${wallet.address}`);
      
      // 测试钱包签名
      const message = "test";
      const signature = await wallet.signMessage(message);
      console.log("   ✅ 钱包签名测试通过");
    }
  } catch (error) {
    console.log(`   ❌ 账户配置错误: ${error.message}`);
  }

  console.log("\n📋 测试总结:");
  console.log("1. 如果所有端点都失败，说明是网络环境问题");
  console.log("2. 如果只有Zama端点失败，说明是Zama服务问题");
  console.log("3. 如果Ethereum Sepolia成功，说明基本网络正常");
  console.log("4. 建议尝试使用VPN或更换网络环境");
}

// 运行测试
testNetworkConnections()
  .then(() => {
    console.log("\n✅ 网络测试完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  }); 
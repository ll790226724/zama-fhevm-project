const { ethers } = require("hardhat");

async function testVPNConnections() {
  console.log("🔍 VPN环境网络连接测试...\n");

  // 测试不同的可能RPC端点
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
      name: "Zama Sepolia (Ankr)",
      url: "https://rpc.ankr.com/zama_sepolia",
      chainId: 8009
    },
    {
      name: "Zama Sepolia (QuickNode)",
      url: "https://billowing-lingering-forest.zama-sepolia.quiknode.pro/",
      chainId: 8009
    },
    {
      name: "Ethereum Sepolia (对比)",
      url: "https://eth-sepolia.g.alchemy.com/v2/demo",
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
      
      // 如果是Zama网络，尝试获取Gas价格
      if (network.chainId === 8009n) {
        console.log("   ⛽ 测试获取Gas价格...");
        const gasPrice = await provider.getFeeData();
        console.log(`   ✅ Gas价格: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);
      }
      
      console.log("   🎉 这个端点可以工作！");
      return endpoint; // 找到可用的端点
      
    } catch (error) {
      console.log(`   ❌ 连接失败: ${error.message}`);
      
      // 详细错误分析
      if (error.message.includes("ENOTFOUND")) {
        console.log("   💡 问题: DNS解析失败");
      } else if (error.message.includes("ECONNREFUSED")) {
        console.log("   💡 问题: 连接被拒绝");
      } else if (error.message.includes("timeout")) {
        console.log("   💡 问题: 连接超时");
      } else if (error.message.includes("403")) {
        console.log("   💡 问题: 访问被拒绝 - 可能需要API密钥");
      } else if (error.message.includes("401")) {
        console.log("   💡 问题: 未授权 - 需要API密钥");
      } else {
        console.log("   💡 问题: 其他网络错误");
      }
    }
    
    console.log(""); // 空行分隔
  }

  console.log("❌ 所有端点都失败了");
  return null;
}

// 运行测试
testVPNConnections()
  .then((workingEndpoint) => {
    if (workingEndpoint) {
      console.log(`\n🎉 找到可用的端点: ${workingEndpoint.name}`);
      console.log(`📋 请更新hardhat.config.js中的RPC URL为: ${workingEndpoint.url}`);
    } else {
      console.log("\n❌ 没有找到可用的端点");
      console.log("💡 建议:");
      console.log("1. 尝试不同的VPN服务器");
      console.log("2. 联系Zama社区获取最新的RPC端点");
      console.log("3. 检查VPN是否正确配置了DNS");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  }); 
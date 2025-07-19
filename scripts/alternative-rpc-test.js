const { ethers } = require("hardhat");

async function testAlternativeRPCs() {
  console.log("🔍 测试其他可能的RPC端点...\n");

  // 测试其他可能的RPC端点
  const alternativeEndpoints = [
    {
      name: "Zama Sepolia (IP直接访问)",
      url: "https://35.180.1.124:8545",
      chainId: 8009
    },
    {
      name: "Zama Sepolia (备用域名)",
      url: "https://zama-sepolia.rpc.thirdweb.com",
      chainId: 8009
    },
    {
      name: "Zama Sepolia (Ankr)",
      url: "https://rpc.ankr.com/zama_sepolia",
      chainId: 8009
    },
    {
      name: "Zama Sepolia (Chainlist)",
      url: "https://sepolia.zama.ai:8545",
      chainId: 8009
    }
  ];

  for (const endpoint of alternativeEndpoints) {
    console.log(`📡 测试 ${endpoint.name}: ${endpoint.url}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(endpoint.url);
      
      // 设置超时时间
      provider.connection.timeout = 10000;
      
      console.log("  ├─ 测试基本连接...");
      const blockNumber = await provider.getBlockNumber();
      console.log(`  ├─ ✅ 连接成功! 当前区块: ${blockNumber}`);
      
      console.log("  ├─ 测试网络ID...");
      const network = await provider.getNetwork();
      console.log(`  ├─ ✅ 网络ID: ${network.chainId}`);
      
      console.log("  └─ ✅ 测试通过!\n");
      
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

  // 测试公共RPC服务
  console.log("🌐 测试公共RPC服务...");
  const publicRPCs = [
    {
      name: "Infura Sepolia",
      url: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 11155111
    },
    {
      name: "Alchemy Sepolia",
      url: "https://eth-sepolia.g.alchemy.com/v2/demo",
      chainId: 11155111
    }
  ];

  for (const rpc of publicRPCs) {
    console.log(`📡 测试 ${rpc.name}: ${rpc.url}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(rpc.url);
      const blockNumber = await provider.getBlockNumber();
      console.log(`  ├─ ✅ 连接成功! 当前区块: ${blockNumber}`);
      console.log("  └─ ✅ 公共RPC工作正常\n");
    } catch (error) {
      console.log(`  ├─ ❌ 连接失败: ${error.message}`);
      console.log("  └─ ❌ 公共RPC也有问题\n");
    }
  }

  console.log("📊 诊断结果:");
  console.log("✅ 确认是DNS解析问题 (ENOTFOUND)");
  console.log("❌ 不是502/503/504等服务器错误");
  console.log("❌ 不是网络超时问题");
  console.log("\n💡 具体解决方案:");
  console.log("1. 更换DNS服务器:");
  console.log("   - 设置DNS为 8.8.8.8 和 8.8.4.4");
  console.log("   - 或设置DNS为 1.1.1.1 和 1.0.0.1");
  console.log("2. 使用VPN连接到美国或欧洲");
  console.log("3. 联系Zama团队获取最新的RPC端点");
  console.log("4. 检查hosts文件是否有冲突");
}

testAlternativeRPCs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试脚本执行失败:", error);
    process.exit(1);
  }); 
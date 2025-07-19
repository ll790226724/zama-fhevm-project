const { ethers } = require("hardhat");

async function testNetworkConnection() {
  console.log("🔍 开始详细网络连接诊断...\n");

  // 测试不同的RPC端点
  const rpcEndpoints = [
    {
      name: "Zama Sepolia (官方)",
      url: "https://sepolia.zama.ai",
      chainId: 8009
    },
    {
      name: "Zama Sepolia (备用)",
      url: "https://rpc.sepolia.zama.ai",
      chainId: 8009
    },
    {
      name: "Zama Sepolia (HTTP)",
      url: "http://sepolia.zama.ai",
      chainId: 8009
    }
  ];

  for (const endpoint of rpcEndpoints) {
    console.log(`📡 测试 ${endpoint.name}: ${endpoint.url}`);
    
    try {
      // 创建provider
      const provider = new ethers.JsonRpcProvider(endpoint.url);
      
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
      
      console.log("  └─ ✅ 所有测试通过!\n");
      
    } catch (error) {
      console.log("  ├─ ❌ 连接失败");
      console.log(`  ├─ 错误类型: ${error.constructor.name}`);
      console.log(`  ├─ 错误代码: ${error.code || 'N/A'}`);
      console.log(`  ├─ 错误消息: ${error.message}`);
      
      // 详细错误信息
      if (error.code) {
        switch (error.code) {
          case 'ENOTFOUND':
            console.log("  ├─ 🔍 错误分析: DNS解析失败 - 无法找到主机");
            break;
          case 'ECONNREFUSED':
            console.log("  ├─ 🔍 错误分析: 连接被拒绝 - 服务器可能未运行");
            break;
          case 'ETIMEDOUT':
            console.log("  ├─ 🔍 错误分析: 连接超时 - 网络延迟过高");
            break;
          case 'ECONNRESET':
            console.log("  ├─ 🔍 错误分析: 连接重置 - 服务器主动断开");
            break;
          case 'ENETUNREACH':
            console.log("  ├─ 🔍 错误分析: 网络不可达 - 路由问题");
            break;
          default:
            console.log("  ├─ 🔍 错误分析: 其他网络错误");
        }
      }
      
      // 检查是否是HTTP错误
      if (error.statusCode) {
        console.log(`  ├─ HTTP状态码: ${error.statusCode}`);
        switch (error.statusCode) {
          case 502:
            console.log("  ├─ 🔍 错误分析: 502 Bad Gateway - 网关错误");
            break;
          case 503:
            console.log("  ├─ 🔍 错误分析: 503 Service Unavailable - 服务不可用");
            break;
          case 504:
            console.log("  ├─ 🔍 错误分析: 504 Gateway Timeout - 网关超时");
            break;
          case 403:
            console.log("  ├─ 🔍 错误分析: 403 Forbidden - 访问被禁止");
            break;
          case 429:
            console.log("  ├─ 🔍 错误分析: 429 Too Many Requests - 请求过于频繁");
            break;
          default:
            console.log("  ├─ 🔍 错误分析: 其他HTTP错误");
        }
      }
      
      console.log("  └─ ❌ 测试失败\n");
    }
  }

  // 测试DNS解析
  console.log("🌐 测试DNS解析...");
  const dns = require('dns').promises;
  
  try {
    const addresses = await dns.resolve4('sepolia.zama.ai');
    console.log(`✅ DNS解析成功: ${addresses.join(', ')}`);
  } catch (error) {
    console.log(`❌ DNS解析失败: ${error.message}`);
    console.log(`   错误代码: ${error.code}`);
  }

  // 测试ping连接
  console.log("\n🏓 测试网络连通性...");
  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);

  try {
    const { stdout } = await execAsync('ping -n 4 sepolia.zama.ai');
    console.log("✅ Ping测试成功:");
    console.log(stdout);
  } catch (error) {
    console.log("❌ Ping测试失败:");
    console.log(error.message);
  }

  // 测试curl连接
  console.log("\n🌐 测试HTTP连接...");
  try {
    const { stdout } = await execAsync('curl -I --connect-timeout 10 https://sepolia.zama.ai');
    console.log("✅ HTTP连接测试成功:");
    console.log(stdout);
  } catch (error) {
    console.log("❌ HTTP连接测试失败:");
    console.log(error.message);
  }

  console.log("\n📊 诊断总结:");
  console.log("1. 如果所有RPC端点都返回ENOTFOUND，说明是DNS解析问题");
  console.log("2. 如果返回502/503/504，说明是服务器端问题");
  console.log("3. 如果返回ECONNREFUSED，说明端口被阻止或服务器未运行");
  console.log("4. 如果返回ETIMEDOUT，说明网络延迟过高");
  console.log("\n💡 建议:");
  console.log("- 尝试更换DNS服务器 (8.8.8.8, 1.1.1.1)");
  console.log("- 使用VPN连接到不同地区");
  console.log("- 联系Zama团队获取最新的RPC端点");
  console.log("- 检查防火墙设置");
}

testNetworkConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 诊断脚本执行失败:", error);
    process.exit(1);
  }); 
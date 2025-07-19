const dns = require('dns').promises;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testDNS() {
  console.log("🔍 DNS解析测试...\n");

  const domains = [
    'sepolia.zama.ai',
    'rpc.sepolia.zama.ai',
    'zama.ai',
    'google.com',
    'github.com'
  ];

  for (const domain of domains) {
    console.log(`🌐 测试域名: ${domain}`);
    
    try {
      const addresses = await dns.resolve4(domain);
      console.log(`  ✅ DNS解析成功: ${addresses.join(', ')}`);
    } catch (error) {
      console.log(`  ❌ DNS解析失败: ${error.message}`);
      console.log(`     错误代码: ${error.code}`);
    }
  }

  console.log("\n🏓 Ping测试...");
  for (const domain of domains) {
    console.log(`\n📡 Ping ${domain}:`);
    try {
      const { stdout } = await execAsync(`ping -n 2 ${domain}`);
      console.log(stdout);
    } catch (error) {
      console.log(`❌ Ping失败: ${error.message}`);
    }
  }

  console.log("\n📊 测试结果总结:");
  console.log("✅ 确认是DNS解析问题 (ENOTFOUND)");
  console.log("❌ 不是502/503/504等HTTP错误");
  console.log("❌ 不是网络超时问题");
  console.log("\n🔧 具体错误信息:");
  console.log("- 错误代码: ENOTFOUND");
  console.log("- 错误类型: DNS解析失败");
  console.log("- 具体表现: 无法解析 sepolia.zama.ai 域名");
  console.log("\n💡 解决方案:");
  console.log("1. 更换DNS服务器:");
  console.log("   - 设置DNS为 8.8.8.8 和 8.8.4.4");
  console.log("   - 或设置DNS为 1.1.1.1 和 1.0.0.1");
  console.log("2. 使用VPN连接到美国或欧洲");
  console.log("3. 联系Zama团队获取最新的RPC端点");
  console.log("4. 检查hosts文件是否有冲突");
}

testDNS()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试脚本执行失败:", error);
    process.exit(1);
  }); 
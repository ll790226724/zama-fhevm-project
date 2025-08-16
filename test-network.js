// Network connectivity test script
const { ethers } = require("hardhat");

const RPC_ENDPOINTS = [
    { name: "Zama DevNet", url: "https://devnet.zama.ai", chainId: 8009 },
    { name: "Zama TestNet", url: "https://testnet.zama.ai", chainId: 8009 },
    { name: "Alternative RPC 1", url: "https://rpc.sepolia.zama.ai", chainId: 8009 },
    { name: "Alternative RPC 2", url: "https://sepolia-rpc.zama.ai", chainId: 8009 }
];

async function testConnection(rpcUrl, chainId, name) {
    try {
        console.log(`🔍 测试 ${name} (${rpcUrl})...`);
        
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // 测试基本连接
        const network = await provider.getNetwork();
        console.log(`  ✅ 连接成功! Chain ID: ${network.chainId}`);
        
        // 测试获取最新区块
        const blockNumber = await provider.getBlockNumber();
        console.log(`  📦 最新区块: ${blockNumber}`);
        
        // 测试gas价格
        const gasPrice = await provider.getFeeData();
        console.log(`  ⛽ Gas价格: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);
        
        return { success: true, url: rpcUrl, name };
        
    } catch (error) {
        console.log(`  ❌ 连接失败: ${error.message}`);
        return { success: false, url: rpcUrl, name, error: error.message };
    }
}

async function main() {
    console.log("🌐 Zama网络连接测试");
    console.log("=" * 50);
    
    const results = [];
    
    for (const endpoint of RPC_ENDPOINTS) {
        const result = await testConnection(endpoint.url, endpoint.chainId, endpoint.name);
        results.push(result);
        console.log(); // 空行分隔
    }
    
    console.log("📊 测试结果汇总:");
    console.log("=" * 50);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
        console.log("✅ 可用的RPC端点:");
        successful.forEach(r => {
            console.log(`  • ${r.name}: ${r.url}`);
        });
        
        console.log("\n💡 建议使用第一个可用的端点进行部署");
        console.log(`建议的.env配置: RPC_URL=${successful[0].url}`);
    }
    
    if (failed.length > 0) {
        console.log("\n❌ 不可用的RPC端点:");
        failed.forEach(r => {
            console.log(`  • ${r.name}: ${r.error}`);
        });
    }
    
    if (successful.length === 0) {
        console.log("\n🚨 所有RPC端点都不可用!");
        console.log("可能的解决方案:");
        console.log("1. 检查网络连接");
        console.log("2. 尝试使用VPN");
        console.log("3. 检查防火墙设置");
        console.log("4. 稍后重试");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("测试失败:", error);
        process.exit(1);
    }); 
// 健壮的合约部署脚本 - 自动测试多个RPC端点
const hre = require("hardhat");

const RPC_ENDPOINTS = [
    "https://devnet.zama.ai",
    "https://testnet.zama.ai",
    "https://rpc.sepolia.zama.ai",
    "https://sepolia-rpc.zama.ai"
];

async function testRpcConnection(rpcUrl) {
    try {
        console.log(`🔍 测试RPC: ${rpcUrl}`);
        const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
        
        // 测试连接
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        
        console.log(`  ✅ 连接成功! Chain ID: ${network.chainId}, 区块: ${blockNumber}`);
        return provider;
    } catch (error) {
        console.log(`  ❌ 连接失败: ${error.message}`);
        return null;
    }
}

async function findWorkingRpc() {
    console.log("🌐 正在寻找可用的Zama RPC端点...");
    
    for (const rpcUrl of RPC_ENDPOINTS) {
        const provider = await testRpcConnection(rpcUrl);
        if (provider) {
            return { provider, url: rpcUrl };
        }
    }
    
    throw new Error("❌ 所有RPC端点都不可用，请检查网络连接或使用VPN");
}

async function deployWithRetry(contractFactory, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🚀 部署尝试 ${attempt}/${maxRetries}...`);
            
            const contract = await contractFactory.deploy({
                gasLimit: 5000000,
                gasPrice: hre.ethers.parseUnits("10", "gwei")
            });
            
            console.log("⏳ 等待部署确认...");
            await contract.waitForDeployment();
            
            return contract;
        } catch (error) {
            console.log(`  ❌ 部署尝试 ${attempt} 失败: ${error.message}`);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            console.log(`  🔄 ${3}秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

async function main() {
    console.log("🚀 开始健壮部署流程...");
    console.log("=" * 50);
    
    // 检查环境变量
    if (!process.env.PRIVATE_KEY) {
        throw new Error("❌ 请在.env文件中设置PRIVATE_KEY");
    }
    
    // 寻找可用的RPC
    const { provider, url } = await findWorkingRpc();
    console.log(`✅ 使用RPC: ${url}`);
    
    // 创建签名器
    const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`📍 部署账户: ${wallet.address}`);
    
    // 检查余额
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 账户余额: ${hre.ethers.formatEther(balance)} ETH`);
    
    if (balance < hre.ethers.parseEther("0.001")) {
        console.log("⚠️  余额较低，从水龙头获取测试ETH: https://sepolia.zama.ai/faucet");
    }
    
    // 获取合约工厂
    console.log("📦 准备合约部署...");
    const ConfidentialVoting = await hre.ethers.getContractFactory("ConfidentialVoting", wallet);
    
    // 部署合约
    const contract = await deployWithRetry(ConfidentialVoting);
    const contractAddress = await contract.getAddress();
    
    console.log("\n" + "=" * 50);
    console.log("✅ 部署成功!");
    console.log("📋 部署信息:");
    console.log(`合约地址: ${contractAddress}`);
    console.log(`部署者: ${wallet.address}`);
    console.log(`使用RPC: ${url}`);
    console.log(`区块浏览器: https://sepolia.explorer.zama.ai/address/${contractAddress}`);
    
    // 验证合约
    console.log("\n🔍 验证合约部署...");
    try {
        const owner = await contract.owner();
        const votingActive = await contract.votingActive();
        
        console.log("✅ 合约验证成功!");
        console.log(`合约所有者: ${owner}`);
        console.log(`投票状态: ${votingActive}`);
    } catch (error) {
        console.log("⚠️  合约部署成功，但验证失败:", error.message);
    }
    
    console.log("\n🎉 部署完成!");
    console.log(`📋 请将此地址复制到前端: ${contractAddress}`);
    
    return contractAddress;
}

main()
    .then((address) => {
        console.log(`\n✅ 部署流程完成! 合约地址: ${address}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ 部署失败:", error.message);
        console.log("\n💡 解决建议:");
        console.log("1. 检查网络连接");
        console.log("2. 尝试使用VPN");
        console.log("3. 确保.env文件正确设置");
        console.log("4. 从水龙头获取测试ETH: https://sepolia.zama.ai/faucet");
        process.exit(1);
    }); 
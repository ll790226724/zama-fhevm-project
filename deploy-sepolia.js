// Ethereum Sepolia 部署脚本
const hre = require("hardhat");

async function main() {
    console.log("🚀 开始部署投票合约到Ethereum Sepolia...");
    console.log("=".repeat(50));
    
    // 检查私钥
    if (!process.env.PRIVATE_KEY) {
        throw new Error("❌ 未设置PRIVATE_KEY环境变量！请在.env文件中添加您的私钥");
    }
    
    // 检查网络连接
    console.log("🔍 检查网络连接...");
    try {
        const provider = hre.ethers.provider;
        const network = await provider.getNetwork();
        console.log(`✅ 网络连接成功！Chain ID: ${network.chainId}`);
        
        if (network.chainId !== 11155111) {
            console.log(`⚠️  警告：当前网络Chain ID为 ${network.chainId}，期望为 11155111 (Ethereum Sepolia)`);
        }
    } catch (error) {
        throw new Error(`❌ 网络连接失败：${error.message}`);
    }
    
    // 获取部署账户
    console.log("👤 获取部署账户...");
    const [deployer] = await hre.ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`📍 部署账户: ${deployerAddress}`);
    
    // 检查余额
    console.log("💰 检查账户余额...");
    const balance = await deployer.provider.getBalance(deployerAddress);
    const balanceInEth = hre.ethers.formatEther(balance);
    console.log(`💰 账户余额: ${balanceInEth} ETH`);
    
    if (parseFloat(balanceInEth) < 0.01) {
        console.log("⚠️  余额较低，建议从水龙头获取更多测试ETH:");
        console.log("   🔗 https://sepoliafaucet.com/");
        console.log("   🔗 https://faucets.chain.link/sepolia");
    }
    
    // 选择合约类型
    console.log("\n📋 可用的合约类型:");
    console.log("1. StandardVoting - 标准投票合约 (推荐，兼容性好)");
    console.log("2. ConfidentialVoting - FHEVM加密投票合约 (需要Zama网络)");
    
    // 由于您使用Ethereum Sepolia，我们使用StandardVoting
    console.log("🔄 自动选择StandardVoting合约 (适用于Ethereum网络)");
    
    // 部署StandardVoting合约
    console.log("\n📦 编译StandardVoting合约...");
    const StandardVoting = await hre.ethers.getContractFactory("StandardVoting");
    
    console.log("🚀 开始部署...");
    const votingContract = await StandardVoting.deploy({
        gasLimit: 2000000,
        gasPrice: hre.ethers.parseUnits("20", "gwei")
    });
    
    console.log("⏳ 等待部署确认...");
    await votingContract.waitForDeployment();
    
    const contractAddress = await votingContract.getAddress();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ 投票合约部署成功！");
    console.log("📋 部署信息:");
    console.log(`📍 合约地址: ${contractAddress}`);
    console.log(`👤 部署者: ${deployerAddress}`);
    console.log(`🌐 网络: Ethereum Sepolia (Chain ID: 11155111)`);
    console.log(`🔗 区块浏览器: https://sepolia.etherscan.io/address/${contractAddress}`);
    
    // 验证合约功能
    console.log("\n🔍 验证合约功能...");
    try {
        const owner = await votingContract.owner();
        const votingActive = await votingContract.votingActive();
        const totalVoters = await votingContract.getTotalVoters();
        
        console.log("✅ 合约验证成功！");
        console.log(`👑 合约所有者: ${owner}`);
        console.log(`🗳️ 投票状态: ${votingActive ? '活跃' : '非活跃'}`);
        console.log(`👥 注册投票者数量: ${totalVoters.toString()}`);
    } catch (error) {
        console.log("❌ 合约验证失败:", error.message);
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 部署完成！");
    console.log("\n📝 请保存以下信息:");
    console.log(`合约地址: ${contractAddress}`);
    console.log(`部署者地址: ${deployerAddress}`);
    console.log(`网络: Ethereum Sepolia`);
    console.log(`区块浏览器: https://sepolia.etherscan.io/address/${contractAddress}`);
    
    console.log("\n💡 下一步操作:");
    console.log("1. 将合约地址复制到前端应用的合约配置中");
    console.log("2. 连接钱包并测试合约功能");
    console.log("3. 注册投票者并创建投票选项");
    
    return contractAddress;
}

main()
    .then((contractAddress) => {
        console.log(`\n✅ 部署流程完成！合约地址: ${contractAddress}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ 部署失败:", error.message);
        console.log("\n💡 常见解决方案:");
        console.log("1. 确保已在.env文件中设置PRIVATE_KEY");
        console.log("2. 确保账户有足够的ETH余额");
        console.log("3. 从水龙头获取测试ETH: https://sepoliafaucet.com/");
        console.log("4. 检查网络连接和RPC配置");
        process.exit(1);
    }); 
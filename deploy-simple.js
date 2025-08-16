// 简化的合约部署脚本
// 使用方法: node deploy-simple.js

const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署ConfidentialVoting合约...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("📍 部署账户:", deployer.address);
    
    // 检查账户余额
    const balance = await deployer.getBalance();
    console.log("💰 账户余额:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.log("❌ 余额不足，需要至少0.01 ETH用于部署");
        return;
    }
    
    // 部署合约
    console.log("📜 开始编译和部署合约...");
    const ConfidentialVoting = await ethers.getContractFactory("ConfidentialVoting");
    
    // 设置gas参数
    const deployOptions = {
        gasLimit: 5000000,
        gasPrice: ethers.utils.parseUnits("20", "gwei")
    };
    
    console.log("⏳ 正在部署合约...");
    const contract = await ConfidentialVoting.deploy(deployOptions);
    
    console.log("⏳ 等待交易确认...");
    await contract.deployed();
    
    console.log("✅ 合约部署成功!");
    console.log("📍 合约地址:", contract.address);
    console.log("🔗 交易哈希:", contract.deployTransaction.hash);
    console.log("🌐 区块链浏览器:", `https://sepolia.etherscan.io/address/${contract.address}`);
    
    // 验证合约
    console.log("🔍 验证合约功能...");
    try {
        const owner = await contract.owner();
        console.log("👑 合约管理员:", owner);
        console.log("✅ 合约功能验证成功");
    } catch (error) {
        console.log("⚠️ 合约功能验证失败:", error.message);
    }
    
    console.log("\n🎉 部署完成!");
    console.log("📋 请将以下合约地址复制到前端应用中:");
    console.log("🔗", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    }); 
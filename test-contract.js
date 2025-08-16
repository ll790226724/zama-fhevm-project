// Test deployed StandardVoting contract
const hre = require("hardhat");

const CONTRACT_ADDRESS = "0xe538256B911EDDB2DDA039f0526D0C98823B045D";

async function main() {
    console.log("🧪 测试StandardVoting合约功能");
    console.log("=".repeat(40));
    
    // 连接到已部署的合约
    const [deployer] = await hre.ethers.getSigners();
    console.log(`👤 测试账户: ${deployer.address}`);
    
    const StandardVoting = await hre.ethers.getContractFactory("StandardVoting");
    const contract = StandardVoting.attach(CONTRACT_ADDRESS);
    
    console.log(`📜 合约地址: ${CONTRACT_ADDRESS}`);
    
    try {
        // 1. 检查合约基本信息
        console.log("\n📊 基本信息:");
        const owner = await contract.owner();
        const votingActive = await contract.votingActive();
        const totalVoters = await contract.getTotalVoters();
        
        console.log(`👑 合约所有者: ${owner}`);
        console.log(`🗳️ 投票状态: ${votingActive ? '活跃' : '非活跃'}`);
        console.log(`👥 注册投票者: ${totalVoters.toString()}`);
        
        // 2. 添加投票选项（如果是所有者）
        if (owner.toLowerCase() === deployer.address.toLowerCase()) {
            console.log("\n🔧 所有者操作测试:");
            
            // 添加投票选项
            console.log("📝 添加投票选项...");
            await contract.addVoteOption("选项A: 支持提案");
            await contract.addVoteOption("选项B: 反对提案");
            await contract.addVoteOption("选项C: 弃权");
            
            console.log("✅ 已添加3个投票选项");
            
            // 注册投票者
            console.log("👥 注册投票者...");
            await contract.registerVoter(deployer.address);
            console.log("✅ 已注册部署者为投票者");
            
            // 开始投票 (持续1小时)
            console.log("🚀 开始投票...");
            await contract.startVoting(3600); // 1小时
            console.log("✅ 投票已开始，持续时间: 1小时");
            
        } else {
            console.log("\n⚠️ 当前账户不是合约所有者，跳过所有者操作");
        }
        
        // 3. 查看投票选项
        console.log("\n📋 投票选项:");
        const optionsCount = await contract.getVoteOptionsCount();
        for (let i = 0; i < optionsCount; i++) {
            const [name, isActive] = await contract.getVoteOption(i);
            console.log(`${i}: ${name} (${isActive ? '活跃' : '非活跃'})`);
        }
        
        // 4. 查看投票状态
        const [active, startTime, endTime] = await contract.getVotingStatus();
        console.log(`\n🗳️ 投票状态: ${active ? '进行中' : '未开始/已结束'}`);
        if (active) {
            const start = new Date(Number(startTime) * 1000);
            const end = new Date(Number(endTime) * 1000);
            console.log(`⏰ 开始时间: ${start.toLocaleString()}`);
            console.log(`⏰ 结束时间: ${end.toLocaleString()}`);
        }
        
        console.log("\n✅ 合约测试完成！");
        console.log("\n💡 下一步:");
        console.log("1. 打开浏览器访问: http://localhost:3001/");
        console.log("2. 连接MetaMask钱包");
        console.log("3. 确保连接到Ethereum Sepolia网络");
        console.log("4. 开始使用dApp功能");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 脚本执行失败:", error);
        process.exit(1);
    }); 
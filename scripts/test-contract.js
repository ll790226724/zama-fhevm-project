const hre = require("hardhat");

async function main() {
  console.log("🧪 测试机密投票合约功能...");
  
  // 这里需要替换为您部署的合约地址
  const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
  
  if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") {
    console.log("❌ 请先部署合约，然后将合约地址替换到脚本中");
    return;
  }
  
  try {
    // 获取合约实例
    const ConfidentialVoting = await hre.ethers.getContractFactory("ConfidentialVoting");
    const contract = ConfidentialVoting.attach(CONTRACT_ADDRESS);
    
    console.log("📋 合约基本信息:");
    console.log("合约地址:", CONTRACT_ADDRESS);
    
    // 获取合约所有者
    const owner = await contract.owner();
    console.log("合约所有者:", owner);
    
    // 获取投票状态
    const votingActive = await contract.votingActive();
    console.log("投票是否激活:", votingActive);
    
    // 获取投票者数量
    const totalVoters = await contract.totalVoters();
    console.log("注册投票者数量:", totalVoters.toString());
    
    // 获取投票选项数量
    const optionsCount = await contract.getVoteOptionsCount();
    console.log("投票选项数量:", optionsCount.toString());
    
    console.log("\n✅ 合约测试完成！");
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
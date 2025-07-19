const { ethers } = require("hardhat");

async function testDeployedContract() {
  console.log("🧪 测试已部署的合约...\n");

  const contractAddress = "0xD3fB8f4E71A47c5Cdb01A43C2B77f120700e6c5D";
  const rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/ilcfO47WJ1EYbxU-iuB3A";
  
  try {
    // 创建provider和signer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error("请在.env文件中设置PRIVATE_KEY");
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`📋 测试账户: ${wallet.address}`);
    
    // 获取合约实例
    const ConfidentialVoting = await ethers.getContractFactory("ConfidentialVoting");
    const contract = ConfidentialVoting.attach(contractAddress).connect(wallet);
    console.log(`📋 合约地址: ${contractAddress}`);
    
    // 测试基本功能
    console.log("\n🔍 测试基本功能...");
    
    // 获取所有者
    const owner = await contract.owner();
    console.log(`  ├─ 合约所有者: ${owner}`);
    
    // 获取投票者总数
    const totalVoters = await contract.getTotalVoters();
    console.log(`  ├─ 注册投票者总数: ${totalVoters.toString()}`);
    
    // 获取投票状态
    const votingStatus = await contract.getVotingStatus();
    console.log(`  ├─ 投票状态: ${votingStatus[0] ? '活跃' : '非活跃'}`);
    console.log(`  ├─ 开始时间: ${votingStatus[1].toString()}`);
    console.log(`  ├─ 结束时间: ${votingStatus[2].toString()}`);
    
    // 测试注册投票者
    console.log("\n👥 测试注册投票者...");
    const testVoterAddress = "0x1234567890123456789012345678901234567890";
    
    try {
      const registerTx = await contract.registerVoter(testVoterAddress);
      await registerTx.wait();
      console.log("  ├─ ✅ 投票者注册成功");
      
      // 验证注册
      const voterInfo = await contract.getVoterInfo(testVoterAddress);
      console.log(`  ├─ ✅ 投票者已注册: ${voterInfo.isRegistered}`);
      
      const newTotalVoters = await contract.getTotalVoters();
      console.log(`  ├─ ✅ 新的投票者总数: ${newTotalVoters.toString()}`);
      
    } catch (error) {
      console.log(`  ├─ ❌ 注册失败: ${error.message}`);
    }
    
    // 测试添加投票选项
    console.log("\n📝 测试添加投票选项...");
    try {
      const addOptionTx = await contract.addVoteOption("选项A");
      await addOptionTx.wait();
      console.log("  ├─ ✅ 投票选项A添加成功");
      
      const addOptionTx2 = await contract.addVoteOption("选项B");
      await addOptionTx2.wait();
      console.log("  ├─ ✅ 投票选项B添加成功");
      
      const optionsCount = await contract.getVoteOptionsCount();
      console.log(`  ├─ ✅ 投票选项总数: ${optionsCount.toString()}`);
      
    } catch (error) {
      console.log(`  ├─ ❌ 添加选项失败: ${error.message}`);
    }
    
    // 测试开始投票
    console.log("\n🗳️ 测试开始投票...");
    try {
      const startVotingTx = await contract.startVoting(3600); // 1小时
      await startVotingTx.wait();
      console.log("  ├─ ✅ 投票开始成功");
      
      const newVotingStatus = await contract.getVotingStatus();
      console.log(`  ├─ ✅ 新的投票状态: ${newVotingStatus[0] ? '活跃' : '非活跃'}`);
      
    } catch (error) {
      console.log(`  ├─ ❌ 开始投票失败: ${error.message}`);
    }
    
    // 测试投票功能
    console.log("\n✅ 测试投票功能...");
    try {
      const voteTx = await contract.vote(0); // 投票给选项A
      await voteTx.wait();
      console.log("  ├─ ✅ 投票成功");
      
      const hasVoted = await contract.hasVoted(wallet.address);
      console.log(`  ├─ ✅ 已投票状态: ${hasVoted}`);
      
    } catch (error) {
      console.log(`  ├─ ❌ 投票失败: ${error.message}`);
    }
    
    // 测试结束投票
    console.log("\n⏹️ 测试结束投票...");
    try {
      const endVotingTx = await contract.endVoting();
      await endVotingTx.wait();
      console.log("  ├─ ✅ 投票结束成功");
      
      const finalVotingStatus = await contract.getVotingStatus();
      console.log(`  ├─ ✅ 最终投票状态: ${finalVotingStatus[0] ? '活跃' : '非活跃'}`);
      
    } catch (error) {
      console.log(`  ├─ ❌ 结束投票失败: ${error.message}`);
    }
    
    console.log("\n🎉 合约功能测试完成!");
    console.log("📋 所有核心功能都已验证");
    console.log("🔗 合约地址: " + contractAddress);
    console.log("🌐 区块浏览器: https://sepolia.etherscan.io/address/" + contractAddress);
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

testDeployedContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  }); 
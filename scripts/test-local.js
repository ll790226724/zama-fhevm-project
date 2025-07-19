const hre = require("hardhat");

async function main() {
  console.log("🧪 在本地网络测试机密投票合约...");
  
  // 获取测试账户
  const [owner, voter1, voter2, voter3] = await hre.ethers.getSigners();
  
  console.log("📋 测试账户:");
  console.log("合约所有者:", await owner.getAddress());
  console.log("投票者1:", await voter1.getAddress());
  console.log("投票者2:", await voter2.getAddress());
  console.log("投票者3:", await voter3.getAddress());
  
  // 部署合约
  console.log("\n🚀 部署合约...");
  const ConfidentialVoting = await hre.ethers.getContractFactory("ConfidentialVoting");
  const contract = await ConfidentialVoting.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("✅ 合约部署成功！地址:", contractAddress);
  
  // 测试基本功能
  console.log("\n📝 测试合约功能...");
  
  // 1. 注册投票者
  console.log("1. 注册投票者...");
  await contract.registerVoter(await voter1.getAddress());
  await contract.registerVoter(await voter2.getAddress());
  await contract.registerVoter(await voter3.getAddress());
  console.log("✅ 投票者注册完成");
  
  // 2. 添加投票选项
  console.log("2. 添加投票选项...");
  await contract.addVoteOption("选项A");
  await contract.addVoteOption("选项B");
  await contract.addVoteOption("选项C");
  console.log("✅ 投票选项添加完成");
  
  // 3. 开始投票
  console.log("3. 开始投票...");
  await contract.startVoting(3600); // 1小时
  console.log("✅ 投票开始");
  
  // 4. 进行投票
  console.log("4. 进行投票...");
  await contract.connect(voter1).vote(0); // 投票给选项A
  await contract.connect(voter2).vote(1); // 投票给选项B
  await contract.connect(voter3).vote(0); // 投票给选项A
  console.log("✅ 投票完成");
  
  // 5. 结束投票
  console.log("5. 结束投票...");
  await contract.endVoting();
  console.log("✅ 投票结束");
  
  // 6. 查看结果（加密）
  console.log("6. 查看投票结果（加密）...");
  const resultA = await contract.getVoteResult(0);
  const resultB = await contract.getVoteResult(1);
  const resultC = await contract.getVoteResult(2);
  
  console.log("选项A加密票数:", resultA);
  console.log("选项B加密票数:", resultB);
  console.log("选项C加密票数:", resultC);
  
  // 7. 验证合约状态
  console.log("\n📊 合约状态验证:");
  console.log("投票者总数:", (await contract.totalVoters()).toString());
  console.log("投票选项数:", (await contract.getVoteOptionsCount()).toString());
  console.log("投票者1已投票:", await contract.hasVoted(await voter1.getAddress()));
  console.log("投票者2已投票:", await contract.hasVoted(await voter2.getAddress()));
  console.log("投票者3已投票:", await contract.hasVoted(await voter3.getAddress()));
  
  console.log("\n🎉 本地测试完成！");
  console.log("合约地址:", contractAddress);
  console.log("所有功能测试通过！");
  
  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log("\n✅ 本地测试成功完成！");
    console.log("合约地址:", contractAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 测试失败:", error.message);
    process.exit(1);
  }); 
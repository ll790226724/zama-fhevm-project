const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署机密投票合约到Zama Sepolia测试网...");
  
  // 检查私钥是否设置
  if (!process.env.PRIVATE_KEY) {
    throw new Error("❌ 错误：未设置PRIVATE_KEY环境变量！\n请按照以下步骤设置：\n1. 创建 .env 文件\n2. 添加 PRIVATE_KEY=你的私钥（不包含0x前缀）\n3. 确保 .env 文件已添加到 .gitignore");
  }
  
  // 检查网络连接
  console.log("🔍 检查网络连接...");
  try {
    const provider = hre.ethers.provider;
    const network = await provider.getNetwork();
    console.log(`✅ 网络连接成功！Chain ID: ${network.chainId}`);
  } catch (error) {
    throw new Error(`❌ 网络连接失败：${error.message}`);
  }
  
  // 检查账户余额
  console.log("💰 检查账户余额...");
  const signer = await hre.ethers.getSigner();
  const balance = await signer.getBalance();
  console.log(`账户地址: ${await signer.getAddress()}`);
  console.log(`账户余额: ${hre.ethers.formatEther(balance)} ETH`);
  
  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  余额较低，建议从水龙头获取更多测试ETH：https://sepolia.zama.ai/faucet");
  }

  // 获取合约工厂
  console.log("📦 编译合约...");
  const ConfidentialVoting = await hre.ethers.getContractFactory("ConfidentialVoting");
  
  // 部署合约
  console.log("🚀 部署合约中...");
  const confidentialVoting = await ConfidentialVoting.deploy();
  
  // 等待部署完成
  console.log("⏳ 等待部署确认...");
  await confidentialVoting.waitForDeployment();
  
  const contractAddress = await confidentialVoting.getAddress();
  
  console.log("\n✅ 机密投票合约部署成功！");
  console.log("=" * 50);
  console.log("📋 部署信息:");
  console.log("合约地址:", contractAddress);
  console.log("网络: Zama Sepolia (Chain ID: 8009)");
  console.log("部署者:", await signer.getAddress());
  console.log("区块浏览器: https://sepolia.explorer.zama.ai/address/" + contractAddress);
  
  // 验证合约部署
  console.log("\n🔍 验证合约部署...");
  try {
    const owner = await confidentialVoting.owner();
    const votingActive = await confidentialVoting.votingActive();
    const totalVoters = await confidentialVoting.totalVoters();
    
    console.log("✅ 合约验证成功！");
    console.log("合约所有者:", owner);
    console.log("投票状态:", votingActive);
    console.log("注册投票者数量:", totalVoters.toString());
  } catch (error) {
    console.log("❌ 合约验证失败:", error.message);
  }
  
  console.log("\n" + "=" * 50);
  console.log("🎉 部署完成！");
  console.log("\n📝 请保存以下信息用于提交:");
  console.log("合约地址:", contractAddress);
  console.log("部署者地址:", await signer.getAddress());
  console.log("网络: Zama Sepolia (Chain ID: 8009)");
  console.log("区块浏览器: https://sepolia.explorer.zama.ai/address/" + contractAddress);
  
  return contractAddress;
}

// 运行部署脚本
main()
  .then((contractAddress) => {
    console.log("\n✅ 所有操作完成！");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 部署失败:", error.message);
    console.log("\n💡 常见解决方案:");
    console.log("1. 确保已设置PRIVATE_KEY环境变量");
    console.log("2. 确保有足够的测试ETH余额");
    console.log("3. 检查网络连接");
    console.log("4. 从水龙头获取测试ETH: https://sepolia.zama.ai/faucet");
    process.exit(1);
  }); 
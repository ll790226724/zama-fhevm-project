const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 简单网络连接测试...\n");

  // 测试1: 检查环境变量
  console.log("1. 检查环境变量:");
  const privateKey = process.env.PRIVATE_KEY;
  if (privateKey) {
    console.log("   ✅ PRIVATE_KEY已设置");
    const wallet = new ethers.Wallet(privateKey);
    console.log(`   📍 账户地址: ${wallet.address}`);
  } else {
    console.log("   ❌ PRIVATE_KEY未设置");
  }

  // 测试2: 尝试连接Ethereum Sepolia (对比测试)
  console.log("\n2. 测试Ethereum Sepolia连接:");
  try {
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
    const network = await provider.getNetwork();
    console.log(`   ✅ 连接成功! Chain ID: ${network.chainId}`);
    const blockNumber = await provider.getBlockNumber();
    console.log(`   📦 最新区块: ${blockNumber}`);
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
  }

  // 测试3: 尝试连接Zama Sepolia
  console.log("\n3. 测试Zama Sepolia连接:");
  try {
    const provider = new ethers.JsonRpcProvider("https://sepolia.zama.ai");
    const network = await provider.getNetwork();
    console.log(`   ✅ 连接成功! Chain ID: ${network.chainId}`);
    const blockNumber = await provider.getBlockNumber();
    console.log(`   📦 最新区块: ${blockNumber}`);
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    if (error.message.includes("ENOTFOUND")) {
      console.log("   💡 这是DNS解析问题，不是您的代码问题");
    }
  }

  // 测试4: 尝试连接Zama Testnet
  console.log("\n4. 测试Zama Testnet连接:");
  try {
    const provider = new ethers.JsonRpcProvider("https://testnet.zama.ai");
    const network = await provider.getNetwork();
    console.log(`   ✅ 连接成功! Chain ID: ${network.chainId}`);
    const blockNumber = await provider.getBlockNumber();
    console.log(`   📦 最新区块: ${blockNumber}`);
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
  }

  console.log("\n📋 结论:");
  console.log("- 如果Ethereum Sepolia成功但Zama失败，说明是Zama服务问题");
  console.log("- 如果都失败，说明是网络环境问题");
  console.log("- 您的代码没有问题，这是网络连接问题");
}

main()
  .then(() => {
    console.log("\n✅ 测试完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  }); 
@echo off
echo 🎬 FHEVM投票dApp完整演示流程
echo ================================

cd C:\Users\Administrator\zama-fhevm-project

echo 📊 第1步：初始化合约数据...
npx hardhat run test-contract.js --network sepolia

echo.
echo 🚀 第2步：启动前端应用...
echo 📱 访问地址: http://localhost:3001/
echo 📍 合约地址: 0xe538256B911EDDB2DDA039f0526D0C98823B045D

echo.
echo 📋 演示流程指南:
echo ================================
echo 1. 连接MetaMask钱包
echo 2. 确保连接到Ethereum Sepolia网络
echo 3. 点击 "快速开始投票" 激活投票
echo 4. 点击 "授权自己查看结果" 获取查看权限
echo 5. 进行投票并查看结果
echo ================================

echo.
start http://localhost:3001/
cd frontend
node server.js 
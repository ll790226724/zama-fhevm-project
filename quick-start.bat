@echo off
echo 🔄 正在停止可能占用端口的服务...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul

echo.
cd C:\Users\Administrator\zama-fhevm-project
echo 🚀 启动FHEVM投票dApp (端口:3001)...
echo ================================
echo 📍 合约地址: 0xe538256B911EDDB2DDA039f0526D0C98823B045D
echo 🌐 网络: Ethereum Sepolia
echo 🔗 区块浏览器: https://sepolia.etherscan.io/address/0xe538256B911EDDB2DDA039f0526D0C98823B045D
echo 📱 访问地址: http://localhost:3001/
echo ================================
echo.
echo 正在启动前端服务器...
cd frontend
node server.js 
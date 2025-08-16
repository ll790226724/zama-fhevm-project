@echo off
echo 🔄 重启dApp服务器...

echo 📱 停止旧服务器进程...
taskkill /f /im node.exe 2>nul

echo ⏱️ 等待3秒...
timeout /t 3 /nobreak >nul

cd C:\Users\Administrator\zama-fhevm-project
echo 🚀 启动新服务器...
echo ================================
echo 📍 合约地址: 0xe538256B911EDDB2DDA039f0526D0C98823B045D
echo 🌐 网络: Ethereum Sepolia
echo 📱 访问地址: http://localhost:3001/
echo ================================
echo.

cd frontend
start http://localhost:3001/
node server.js 
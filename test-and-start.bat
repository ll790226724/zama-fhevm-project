@echo off
echo 🧪 初始化投票合约数据...
cd C:\Users\Administrator\zama-fhevm-project
npx hardhat run test-contract.js --network sepolia

echo.
echo 🚀 启动前端应用...
echo 📱 访问地址: http://localhost:3001/
echo 📍 合约地址: 0xe538256B911EDDB2DDA039f0526D0C98823B045D
echo.

start http://localhost:3001/
echo 浏览器应该会自动打开，如果没有请手动访问: http://localhost:3001/
echo.
pause 
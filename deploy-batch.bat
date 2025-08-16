@echo off
cd C:\Users\Administrator\zama-fhevm-project
echo 正在编译合约...
npm run compile
echo 正在部署合约...
npm run deploy
pause 
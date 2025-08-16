@echo off
echo 🔄 ABI修复完成，正在刷新应用...
echo ================================
echo 📍 合约地址: 0xe538256B911EDDB2DDA039f0526D0C98823B045D
echo 🌐 网络: Ethereum Sepolia
echo 🔧 已更新StandardVoting合约ABI
echo 📱 访问地址: http://localhost:3001/
echo ================================
echo.

echo 💡 修复内容:
echo - ✅ 添加了getAllResults函数到ABI
echo - ✅ 添加了getVoteResult函数到ABI  
echo - ✅ 更新了完整的StandardVoting ABI
echo.

echo 📋 现在应该能够:
echo - ✅ 查看详细的投票结果
echo - ✅ 看到具体的票数
echo - ✅ 正常使用所有功能
echo.

start http://localhost:3001/
echo 🎬 请刷新浏览器页面以加载更新后的ABI
pause 
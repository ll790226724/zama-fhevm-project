# 🔐 FHEVM 机密投票系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFC107.svg)](https://hardhat.org/)
[![FHEVM](https://img.shields.io/badge/Powered%20by-FHEVM-00D4AA.svg)](https://docs.fhevm.io/)

一个基于FHEVM（全同态加密虚拟机）的机密投票系统，实现了端到端的加密投票解决方案。

## 🌟 项目特色

- 🔐 **全同态加密**: 投票数据全程加密，保护隐私
- 🎨 **现代化UI**: 响应式设计和流畅动画
- 🔒 **权限控制**: 基于角色的访问管理
- 📱 **跨平台**: 支持桌面和移动设备
- ⚡ **实时更新**: 动态状态同步
- 🚀 **易于部署**: 完整的部署脚本和文档

## 📋 目录结构

```
zama-fhevm-project/
├── contracts/
│   └── ConfidentialVoting.sol          # 主合约
├── frontend/
│   ├── index.html                      # 主页面
│   ├── styles.css                      # 样式文件
│   ├── app.js                          # 前端逻辑
│   └── README.md                       # 前端说明
├── scripts/
│   ├── deploy.js                       # 部署脚本
│   ├── deploy-to-alchemy.js            # Alchemy部署
│   └── test-deployed-contract.js       # 合约测试
├── test/
│   └── ConfidentialVoting.test.js      # 测试用例
├── hardhat.config.js                   # 配置文件
├── package.json                        # 依赖配置
└── README.md                           # 本文件
```

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn
- MetaMask钱包
- 现代浏览器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/zama-fhevm-project.git
   cd zama-fhevm-project
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **编译合约**
   ```bash
   npx hardhat compile
   ```

4. **运行测试**
   ```bash
   npx hardhat test
   ```

5. **启动前端**
   ```bash
   cd frontend
   python -m http.server 8080
   ```

6. **访问应用**
   打开浏览器访问: http://localhost:8080

## 🔧 配置

### MetaMask配置

添加Sepolia测试网：
```
网络名称: Sepolia
RPC URL: https://eth-sepolia.g.alchemy.com/v2/ilcfO47WJ1EYbxU-iuB3A
链ID: 11155111
货币符号: ETH
```

### 环境变量

创建 `.env` 文件：
```bash
PRIVATE_KEY=your_private_key_here
```

## 📊 部署信息

### 智能合约
- **合约地址**: `0xD3fB8f4E71A47c5Cdb01A43C2B77f120700e6c5D`
- **网络**: Ethereum Sepolia测试网
- **部署成本**: 0.000000142 ETH
- **区块浏览器**: https://sepolia.etherscan.io/address/0xD3fB8f4E71A47c5Cdb01A43C2B77f120700e6c5D

## 🎯 功能特性

### 管理员功能
- ✅ 注册投票者（单个/批量）
- ✅ 添加投票选项
- ✅ 开始/结束投票
- ✅ 授权查看者
- ✅ 权限管理

### 投票者功能
- ✅ 查看投票选项
- ✅ 参与机密投票
- ✅ 查看投票状态
- ✅ 验证投票记录

### 结果查看
- ✅ 加密结果展示
- ✅ 权限控制
- ✅ 实时更新

## 🧪 测试

运行所有测试：
```bash
npx hardhat test
```

测试覆盖率：
```bash
npx hardhat coverage
```

## 📖 使用指南

### 1. 连接钱包
1. 点击"连接钱包"按钮
2. 在MetaMask中确认连接
3. 等待连接成功

### 2. 管理员操作
1. 注册投票者
2. 添加投票选项
3. 开始投票
4. 管理投票流程

### 3. 投票者操作
1. 查看可用选项
2. 选择并提交投票
3. 确认交易

### 4. 查看结果
1. 等待投票结束
2. 获取加密结果
3. 分析投票数据

## 🔍 技术架构

### 智能合约
- **语言**: Solidity 0.8.24
- **框架**: Hardhat
- **加密**: FHEVM全同态加密
- **网络**: Ethereum Sepolia

### 前端应用
- **技术栈**: HTML5 + CSS3 + JavaScript
- **库**: Ethers.js + FHE.js
- **设计**: 响应式 + 现代化UI
- **钱包**: MetaMask集成

### 安全特性
- 🔐 FHE加密保护
- 🔒 权限控制
- 🛡️ 输入验证
- 🔍 事件记录

## 🎬 演示视频

项目包含完整的演示视频脚本，展示：
- 系统功能介绍
- 技术架构说明
- 用户界面展示
- 投票流程演示
- 安全特性说明

## 📚 文档

- [前端使用指南](frontend/README.md)
- [部署成功报告](DEPLOYMENT_SUCCESS_REPORT.md)
- [网络诊断报告](NETWORK_DIAGNOSIS_REPORT.md)
- [演示视频脚本](DEMO_VIDEO_SCRIPT.md)
- [项目提交指南](PROJECT_SUBMISSION_GUIDE.md)

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Zama](https://zama.ai/) - FHEVM技术支持
- [Hardhat](https://hardhat.org/) - 开发框架
- [Ethers.js](https://docs.ethers.io/) - 以太坊交互
- [FHEVM](https://docs.fhevm.io/) - 全同态加密

## 📞 联系方式

- **项目链接**: https://github.com/your-username/zama-fhevm-project
- **问题反馈**: [Issues](https://github.com/your-username/zama-fhevm-project/issues)
- **讨论**: [Discussions](https://github.com/your-username/zama-fhevm-project/discussions)

---

**注意**: 这是一个演示项目，用于展示FHEVM技术的实际应用。在生产环境中使用前，请进行充分的安全审计和测试。

⭐ 如果这个项目对您有帮助，请给我们一个星标！ 
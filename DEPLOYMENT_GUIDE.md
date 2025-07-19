# Zama FHEVM 机密投票合约部署指南

## 前置要求

### 1. 获取测试网ETH
访问 Zama 测试网水龙头获取测试ETH：
- 水龙头地址：https://sepolia.zama.ai/faucet
- 输入您的钱包地址获取测试ETH

### 2. 设置私钥环境变量

#### Windows PowerShell:
```powershell
$env:PRIVATE_KEY="你的私钥（不包含0x前缀）"
```

#### Windows CMD:
```cmd
set PRIVATE_KEY=你的私钥（不包含0x前缀）
```

#### 或者创建 .env 文件：
```
PRIVATE_KEY=你的私钥（不包含0x前缀）
```

**⚠️ 安全提醒：**
- 永远不要将私钥提交到Git仓库
- 确保 .env 文件已添加到 .gitignore
- 使用测试钱包，不要使用主网钱包

### 3. 验证环境设置
```bash
npx hardhat compile
```

## 部署步骤

### 1. 编译合约
```bash
npx hardhat compile
```

### 2. 部署到Zama测试网
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. 验证部署
部署成功后，您会看到：
- 合约地址
- 网络信息
- 部署者地址

## 网络配置

当前配置的Zama测试网信息：
- RPC URL: https://testnet.zama.ai
- Chain ID: 8009
- 区块浏览器: https://sepolia.explorer.zama.ai

## 常见问题

### 1. 私钥未设置
错误：`Cannot read properties of undefined (reading 'privateKey')`
解决：设置PRIVATE_KEY环境变量

### 2. 余额不足
错误：`insufficient funds for gas`
解决：从水龙头获取更多测试ETH

### 3. 网络连接问题
错误：`network error`
解决：检查网络连接，确认RPC URL可访问

### 4. Gas限制问题
错误：`out of gas`
解决：合约已配置allowUnlimitedContractSize，通常不会出现此问题

## 提交信息

部署成功后，请保存以下信息用于提交：
- 合约地址
- 部署者地址
- 网络：Zama Sepolia (Chain ID: 8009) 
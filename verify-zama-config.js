// Zama FHEVM配置验证脚本
// 运行方法: node verify-zama-config.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Zama FHEVM项目配置验证');
console.log('=' * 40);

// 1. 检查必要文件
console.log('\n📁 检查项目文件结构:');
const requiredFiles = [
    'hardhat.config.js',
    'package.json',
    'contracts/ConfidentialVoting.sol',
    'scripts/deploy.js',
    '.env.example'
];

requiredFiles.forEach(file => {
    const filePath = path.join('..', file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - 文件缺失`);
    }
});

// 2. 检查.env文件
console.log('\n🔐 检查环境配置:');
const envPath = path.join('..', '.env');
if (fs.existsSync(envPath)) {
    console.log('✅ .env 文件存在');
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('PRIVATE_KEY=') && !envContent.includes('your_private_key_here')) {
        console.log('✅ PRIVATE_KEY 已设置');
    } else {
        console.log('❌ PRIVATE_KEY 未正确设置');
    }
} else {
    console.log('❌ .env 文件不存在');
    console.log('💡 请从 .env.example 复制并填写您的私钥');
}

// 3. 检查package.json依赖
console.log('\n📦 检查FHEVM依赖:');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join('..', 'package.json'), 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = {
        '@fhevm/solidity': '0.7.0',
        'fhevm': '0.6.2',
        'hardhat': '2.26.0'
    };
    
    Object.entries(requiredDeps).forEach(([dep, expectedVersion]) => {
        if (dependencies[dep]) {
            console.log(`✅ ${dep}: ${dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep} - 缺失依赖`);
        }
    });
} catch (error) {
    console.log('❌ 无法读取package.json');
}

// 4. 检查Hardhat配置
console.log('\n⚙️  检查Hardhat网络配置:');
try {
    const configPath = path.join('..', 'hardhat.config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    if (configContent.includes('chainId: 8009')) {
        console.log('✅ Zama Sepolia Chain ID (8009) 已配置');
    } else {
        console.log('❌ Chain ID不正确，应该是8009 (Zama Sepolia)');
    }
    
    if (configContent.includes('testnet.zama.ai')) {
        console.log('✅ Zama RPC URL 已配置');
    } else {
        console.log('⚠️  建议使用官方RPC: https://testnet.zama.ai');
    }
} catch (error) {
    console.log('❌ 无法读取hardhat.config.js');
}

// 5. 检查合约代码
console.log('\n📜 检查合约配置:');
try {
    const contractPath = path.join('..', 'contracts', 'ConfidentialVoting.sol');
    const contractContent = fs.readFileSync(contractPath, 'utf8');
    
    if (contractContent.includes('@fhevm/solidity/lib/FHE.sol')) {
        console.log('✅ FHEVM库导入正确');
    } else {
        console.log('❌ 缺少FHEVM库导入');
    }
    
    if (contractContent.includes('using FHE for euint64')) {
        console.log('✅ FHE库使用正确');
    } else {
        console.log('❌ FHE库使用配置有误');
    }
    
    if (contractContent.includes('euint64')) {
        console.log('✅ 加密类型euint64使用正确');
    } else {
        console.log('❌ 未使用FHEVM加密类型');
    }
} catch (error) {
    console.log('❌ 无法读取合约文件');
}

console.log('\n' + '=' * 40);
console.log('📋 配置检查完成');
console.log('\n💡 如果发现问题，请根据上述提示进行修复');
console.log('🚀 配置正确后，运行 npm run deploy 部署合约');
console.log('💧 记住从水龙头获取测试ETH: https://sepolia.zama.ai/faucet'); 
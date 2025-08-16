// FHEVM 机密投票系统前端应用
let provider, signer, contract, contractAddress;
let isOwner = false;
let isVoter = false;

// StandardVoting合约ABI
const CONTRACT_ABI = [
    "function owner() view returns (address)",
    "function votingActive() view returns (bool)",
    "function votingStartTime() view returns (uint256)",
    "function votingEndTime() view returns (uint256)",
    "function totalVoters() view returns (uint256)",
    "function registerVoter(address _voter)",
    "function registerVoters(address[] memory _voters)",
    "function addVoteOption(string memory _name)",
    "function startVoting(uint256 _duration)",
    "function endVoting()",
    "function vote(uint256 _optionId)",
    "function authorizeViewer(address _viewer)",
    "function revokeViewer(address _viewer)",
    "function getVotingStatus() view returns (bool active, uint256 startTime, uint256 endTime)",
    "function getVoteOptionsCount() view returns (uint256)",
    "function getVoteOption(uint256 _optionId) view returns (string memory name, bool isActive)",
    "function getVoteResult(uint256 _optionId) view returns (uint256)",
    "function getAllResults() view returns (uint256[] memory)",
    "function getTotalVoters() view returns (uint256)",
    "function hasVoted(address _voter) view returns (bool)",
    "function getVoterInfo(address _voter) view returns (bool isRegistered, bool hasVoted, uint256 votedOption)",
    "function isAuthorizedViewer(address _viewer) view returns (bool)",
    "event VoterRegistered(address indexed voter)",
    "event VoteOptionAdded(uint256 indexed optionId, string name)",
    "event VotingStarted(uint256 startTime, uint256 duration)",
    "event VotingEnded(uint256 endTime)",
    "event VoteCast(address indexed voter, uint256 indexed optionId)",
    "event ViewerAuthorized(address indexed viewer)",
    "event ViewerRevoked(address indexed viewer)"
];

// 初始化应用
async function initApp() {
    addLog('info', '🚀 FHEVM保密投票dApp初始化中...');
    
    // 检查浏览器环境
    addLog('info', `🌐 浏览器: ${navigator.userAgent.split(' ')[0]}`);
    addLog('info', `📍 当前URL: ${window.location.href}`);
    addLog('info', `🌐 在线状态: ${navigator.onLine ? '在线' : '离线'}`);
    
    // 检查是否安装了Web3钱包
    if (typeof window.ethereum === 'undefined') {
        addLog('error', '❌ 未检测到Web3钱包扩展');
        addLog('info', '💡 请安装MetaMask、Coinbase Wallet或其他Web3钱包');
        showMessage('请安装MetaMask或其他Web3钱包', 'error');
        return;
    }
    
    addLog('success', '✅ 检测到Web3钱包扩展');
    
    // 检查钱包供应商
    if (window.ethereum.isMetaMask) {
        addLog('info', '🦊 检测到MetaMask钱包');
    } else if (window.ethereum.isCoinbaseWallet) {
        addLog('info', '🔵 检测到Coinbase钱包');
    } else {
        addLog('info', '📱 检测到其他Web3钱包');
    }
    
    // 检查Ethers.js是否加载
    if (typeof ethers === 'undefined') {
        addLog('warning', '⚠️ Ethers.js库尚未加载，等待加载...');
        
        // 等待Ethers.js加载完成
        let waitCount = 0;
        const maxWait = 10; // 最多等待10秒
        
                 const checkEthers = setInterval(() => {
             waitCount++;
             if (typeof ethers !== 'undefined' || window.ethersLoaded) {
                 clearInterval(checkEthers);
                 addLog('success', `✅ Ethers.js库已加载 (版本: ${ethers.version || 'v5.x'})`);
                 // 继续执行初始化的其余部分
                 completeInitialization();
             } else if (waitCount >= maxWait) {
                 clearInterval(checkEthers);
                 addLog('error', '❌ 等待Ethers.js加载超时');
                 addLog('info', '💡 请检查网络连接，或尝试刷新页面');
                 showMessage('无法加载必要的库文件，请检查网络连接并刷新页面', 'error');
             } else {
                 addLog('info', `⏳ 等待Ethers.js加载... (${waitCount}/${maxWait})`);
             }
         }, 1000);
         return;
    }
    
    addLog('success', `✅ Ethers.js库已加载 (版本: ${ethers.version || 'v5.x'})`);
    
    completeInitialization();
}

// 完成初始化的其余部分
function completeInitialization() {
    // 设置合约地址 (部署到Ethereum Sepolia)
    // 注意：这个地址是实际部署的StandardVoting合约地址
    const rawAddress = '0xe538256B911EDDB2DDA039f0526D0C98823B045D';
    
    addLog('success', '✅ 使用实际部署的StandardVoting合约地址');
    
    // 使用ethers.utils.getAddress确保正确的校验和格式
    try {
        contractAddress = ethers.utils.getAddress(rawAddress.toLowerCase());
        addLog('success', `📜 合约地址已验证: ${contractAddress}`);
    } catch (e) {
        // 如果验证失败，使用原始地址并记录警告
        contractAddress = rawAddress;
        addLog('warning', `⚠️ 合约地址格式警告: ${e.message}`);
        addLog('info', `📜 使用原始合约地址: ${contractAddress}`);
    }
    
    document.getElementById('contractAddress').textContent = contractAddress;
    document.getElementById('currentContractAddress').textContent = contractAddress;
    document.getElementById('contractAddressInput').value = contractAddress;
    addLog('info', '🌐 目标网络: Ethereum Sepolia (Chain ID: 11155111)');
    
    addLog('success', '🎉 应用初始化完成！请点击"连接钱包"开始使用');
}

// 预设的测试合约地址
const PRESET_ADDRESSES = {
    'example1': '0x1234567890123456789012345678901234567890', // 示例地址1
    'example2': '0x0987654321098765432109876543210987654321', // 示例地址2
    // 如果您有实际部署的合约地址，请替换这些示例地址
};

// 更新合约地址
function updateContractAddress() {
    const newAddress = document.getElementById('contractAddressInput').value.trim();
    
    if (!newAddress) {
        addLog('warning', '⚠️ 请输入有效的合约地址');
        showMessage('请输入合约地址', 'error');
        return;
    }
    
    try {
        // 验证地址格式
        const validAddress = ethers.utils.getAddress(newAddress.toLowerCase());
        contractAddress = validAddress;
        
        // 更新显示
        document.getElementById('contractAddress').textContent = contractAddress;
        document.getElementById('currentContractAddress').textContent = contractAddress;
        document.getElementById('contractAddressInput').value = contractAddress;
        
        addLog('success', `✅ 合约地址已更新: ${contractAddress}`);
        showMessage('合约地址更新成功！', 'success');
        
        // 如果已连接钱包，重新创建合约实例
        if (provider && signer) {
            addLog('info', '🔄 重新创建合约实例...');
            contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
            addLog('success', '✅ 合约实例已更新');
        }
        
    } catch (error) {
        addLog('error', `❌ 无效的合约地址: ${error.message}`);
        showMessage(`无效的合约地址: ${error.message}`, 'error');
    }
}

// 确保初始化只执行一次
let isInitialized = false;
let initAttempted = false;

function safeInitApp() {
    if (initAttempted) {
        return; // 避免重复尝试
    }
    initAttempted = true;
    
    addLog('info', '📄 页面加载完成，开始初始化应用...');
    
    // 等待一下确保所有脚本都加载完成
    setTimeout(() => {
        if (!isInitialized) {
            isInitialized = true;
            initApp();
        }
    }, 100);
}

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitApp);
} else {
    // 页面已经加载完成，立即初始化
    safeInitApp();
}

// 连接钱包
async function connectWallet() {
    try {
        addLog('info', '🔄 开始连接钱包...');
        showLoading('连接钱包中...');
        
        // 检查是否安装了钱包
        if (typeof window.ethereum === 'undefined') {
            throw new Error('未检测到钱包扩展，请安装MetaMask或其他Web3钱包');
        }
        addLog('success', '✅ 检测到钱包扩展');
        
        // 检查钱包类型
        if (window.ethereum.isMetaMask) {
            addLog('info', '📱 检测到MetaMask钱包');
        } else {
            addLog('info', `📱 检测到钱包类型: ${window.ethereum.constructor.name || '未知'}`);
        }
        
        // 请求连接钱包
        addLog('info', '🔐 请求连接钱包账户...');
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        addLog('info', `📊 获取到账户数量: ${accounts.length}`);
        if (accounts.length === 0) {
            throw new Error('没有找到可用账户，请确保钱包已解锁');
        }
        
        addLog('success', `📍 主账户地址: ${accounts[0]}`);
        
        // 创建provider和signer
        addLog('info', '🔗 创建Web3 Provider...');
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // 获取网络信息
        const network = await provider.getNetwork();
        addLog('info', `🌐 连接网络: ${network.name} (Chain ID: ${network.chainId})`);
        
        // 检查网络是否正确 (Ethereum Sepolia: 11155111)
        const expectedChainId = 11155111; // Ethereum Sepolia
        if (network.chainId !== expectedChainId) {
            addLog('warning', `⚠️ 网络不匹配！当前网络: ${network.chainId}, 期望网络: ${expectedChainId} (Ethereum Sepolia)`);
            addLog('info', '💡 请在钱包中切换到Ethereum Sepolia测试网络');
            
            // 尝试自动切换网络
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${expectedChainId.toString(16)}` }]
                });
                addLog('success', '✅ 已切换到Ethereum Sepolia网络');
            } catch (switchError) {
                if (switchError.code === 4902) {
                    addLog('info', '🔄 尝试添加Ethereum Sepolia网络...');
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: `0x${expectedChainId.toString(16)}`,
                                chainName: 'Ethereum Sepolia',
                                nativeCurrency: {
                                    name: 'Ethereum',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['https://rpc.sepolia.org/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io/']
                            }]
                        });
                        addLog('success', '✅ 已添加并切换到Ethereum Sepolia网络');
                    } catch (addError) {
                        addLog('error', `❌ 无法添加网络: ${addError.message}`);
                    }
                } else {
                    addLog('warning', `⚠️ 网络切换被拒绝: ${switchError.message}`);
                }
            }
        } else {
            addLog('success', '✅ 网络连接正确: Ethereum Sepolia');
        }
        
        // 创建signer
        addLog('info', '✍️ 创建签名器...');
        signer = provider.getSigner();
        
        const address = await signer.getAddress();
        addLog('success', `👤 签名器地址: ${address}`);
        
        // 获取账户余额
        try {
            const balance = await provider.getBalance(address);
            const ethBalance = ethers.utils.formatEther(balance);
            addLog('info', `💰 账户余额: ${ethBalance} ETH`);
        } catch (balanceError) {
            addLog('warning', `⚠️ 无法获取余额: ${balanceError.message}`);
        }
        
        // 更新UI
        addLog('info', '🔄 更新界面...');
        document.getElementById('walletAddress').textContent = address;
        document.getElementById('walletInfo').style.display = 'flex';
        document.getElementById('connectBtn').style.display = 'none';
        
        // 创建合约实例
        addLog('info', `📜 创建合约实例: ${contractAddress}`);
        try {
            contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
            addLog('success', '✅ 合约实例创建成功');
            
            // 检查合约地址是否有代码
            const code = await provider.getCode(contractAddress);
            if (code === '0x') {
                addLog('error', '❌ 合约地址处没有部署任何代码');
                addLog('info', '💡 请检查合约地址是否正确，或合约是否已部署到当前网络');
                throw new Error('合约地址处没有部署代码');
            } else {
                addLog('success', `✅ 合约代码验证成功 (大小: ${(code.length - 2) / 2} bytes)`);
            }
        } catch (contractError) {
            addLog('error', `❌ 合约验证失败: ${contractError.message}`);
            if (contractError.message.includes('没有部署代码')) {
                throw contractError;
            } else {
                addLog('warning', '⚠️ 合约实例创建成功但验证失败，继续尝试调用...');
            }
        }
        
        addLog('success', `🎉 钱包连接成功: ${address}`);
        
        // 检查用户角色
        addLog('info', '👥 检查用户角色...');
        await checkUserRole();
        
        // 更新状态
        addLog('info', '📊 更新系统状态...');
        await updateStatus();
        
        hideLoading();
        addLog('success', '🏁 钱包连接流程完成');
        
    } catch (error) {
        hideLoading();
        
        // 详细错误信息
        let errorDetails = {
            message: error.message,
            code: error.code,
            stack: error.stack,
            data: error.data
        };
        
        addLog('error', `❌ 连接钱包失败: ${error.message}`);
        addLog('error', `🔍 错误代码: ${error.code || '未知'}`);
        
        // 常见错误的解决方案
        if (error.code === 4001) {
            addLog('info', '💡 用户拒绝了连接请求，请重新尝试连接');
        } else if (error.code === -32002) {
            addLog('info', '💡 钱包连接请求待处理，请检查钱包弹窗');
        } else if (error.message.includes('network')) {
            addLog('info', '💡 网络连接问题，请检查网络设置');
        } else if (error.message.includes('contract')) {
            addLog('info', '💡 合约连接问题，请检查合约地址和网络');
        }
        
        console.error('连接钱包详细错误:', errorDetails);
        showMessage(`连接钱包失败: ${error.message}`, 'error');
    }
}

// 断开钱包连接
function disconnectWallet() {
    document.getElementById('walletInfo').style.display = 'none';
    document.getElementById('connectBtn').style.display = 'block';
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('voterSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    
    provider = null;
    signer = null;
    contract = null;
    isOwner = false;
    isVoter = false;
    
    addLog('info', '钱包已断开连接');
}

// 检查用户角色
async function checkUserRole() {
    try {
        addLog('info', '🔍 开始检查用户角色...');
        
        // 检查合约owner
        addLog('info', '👑 获取合约管理员信息...');
        
        let owner;
        let contractWorking = false;
        
        // 首先尝试一个简单的测试调用
        try {
            addLog('info', '🔍 测试合约连接...');
            owner = await contract.owner();
            addLog('success', `👑 合约管理员: ${owner}`);
            contractWorking = true;
        } catch (ownerError) {
            addLog('error', `❌ 无法调用owner()函数: ${ownerError.message}`);
            
            // 尝试其他可能的函数
            try {
                addLog('info', '🔍 尝试其他合约函数...');
                const totalVoters = await contract.getTotalVoters();
                addLog('success', `📊 获取到投票者总数: ${totalVoters}`);
                addLog('warning', '⚠️ getTotalVoters()工作但owner()不工作，合约可能没有owner()函数');
                contractWorking = true;
            } catch (alternativeError) {
                addLog('error', `❌ 替代函数调用也失败: ${alternativeError.message}`);
                addLog('warning', '⚠️ 合约可能未正确部署或ABI不匹配');
                
                // 提供调试信息
                addLog('info', '🔧 调试信息:');
                addLog('info', `   - 合约地址: ${contractAddress}`);
                addLog('info', `   - 网络: ${(await provider.getNetwork()).name} (${(await provider.getNetwork()).chainId})`);
                addLog('info', `   - 用户地址: ${await signer.getAddress()}`);
                
                throw new Error('合约调用失败，请检查合约部署状态');
            }
        }
        
        if (contractWorking && owner) {
            const userAddress = await signer.getAddress();
            addLog('info', `👤 当前用户: ${userAddress}`);
            
            isOwner = (owner.toLowerCase() === userAddress.toLowerCase());
            addLog('info', `🔑 管理员权限: ${isOwner ? '是' : '否'}`);
            
            if (isOwner) {
                document.getElementById('adminSection').style.display = 'block';
                addLog('success', '✅ 您是该合约的管理员，已开启管理员功能');
            } else {
                addLog('info', 'ℹ️ 您不是管理员，无法使用管理员功能');
            }
        } else {
            addLog('warning', '⚠️ 无法确定管理员权限，跳过权限检查');
        }
        
        // 检查是否为注册的投票者
        addLog('info', '🗳️ 检查投票者注册状态...');
        try {
            const userAddress = await signer.getAddress();
            const voterInfo = await contract.getVoterInfo(userAddress);
            isVoter = voterInfo.isRegistered;
            addLog('info', `📝 投票者注册状态: ${isVoter ? '已注册' : '未注册'}`);
            
            if (isVoter) {
                document.getElementById('voterSection').style.display = 'block';
                addLog('success', '✅ 您是注册的投票者，已开启投票功能');
                
                // 检查是否已投票
                if (voterInfo.hasVoted) {
                    addLog('info', `🗳️ 您已投票，选择的选项ID: ${voterInfo.votedOption}`);
                } else {
                    addLog('info', '🗳️ 您尚未投票');
                }
            } else {
                addLog('info', 'ℹ️ 您不是注册的投票者，无法参与投票');
            }
        } catch (voterError) {
            addLog('warning', `⚠️ 无法获取投票者信息: ${voterError.message}`);
            addLog('info', 'ℹ️ 可能合约中没有getVoterInfo函数，或您不是注册投票者');
        }
        
        // 显示结果查看区域
        document.getElementById('resultsSection').style.display = 'block';
        addLog('success', '✅ 用户角色检查完成');
        
    } catch (error) {
        addLog('error', `❌ 检查用户角色失败: ${error.message}`);
        addLog('error', `🔍 错误代码: ${error.code || '未知'}`);
        
        // 分析可能的错误原因
        if (error.message.includes('owner')) {
            addLog('info', '💡 可能是合约没有owner函数，或合约地址错误');
        } else if (error.message.includes('network')) {
            addLog('info', '💡 网络连接问题，请检查网络状态');
        } else if (error.message.includes('call revert')) {
            addLog('info', '💡 合约调用被回滚，可能是合约逻辑问题');
        }
        
        console.error('检查用户角色详细错误:', error);
    }
}

// 更新系统状态
async function updateStatus() {
    try {
        addLog('info', '📊 开始更新系统状态...');
        
        // 获取投票状态
        addLog('info', '🗳️ 获取投票状态...');
        const votingStatus = await contract.getVotingStatus();
        const isActive = votingStatus[0];
        const startTime = votingStatus[1];
        const endTime = votingStatus[2];
        
        const statusText = isActive ? '活跃' : '非活跃';
        document.getElementById('votingStatus').textContent = statusText;
        addLog('success', `✅ 投票状态: ${statusText}`);
        
        if (isActive) {
            addLog('info', `⏰ 投票开始时间: ${new Date(startTime * 1000).toLocaleString()}`);
            addLog('info', `⏰ 投票结束时间: ${new Date(endTime * 1000).toLocaleString()}`);
        }
        
        // 获取投票者总数
        addLog('info', '👥 获取投票者总数...');
        const totalVoters = await contract.getTotalVoters();
        document.getElementById('totalVoters').textContent = totalVoters.toString();
        addLog('success', `✅ 注册投票者总数: ${totalVoters}`);
        
        // 获取选项数量
        addLog('info', '📋 获取投票选项数量...');
        const optionsCount = await contract.getVoteOptionsCount();
        document.getElementById('optionsCount').textContent = optionsCount.toString();
        addLog('success', `✅ 投票选项数量: ${optionsCount}`);
        
        // 更新投票选项
        addLog('info', '🔄 更新投票选项列表...');
        await updateVoteOptions();
        
        addLog('success', '✅ 系统状态更新完成');
        
    } catch (error) {
        addLog('error', `❌ 更新状态失败: ${error.message}`);
        addLog('error', `🔍 错误代码: ${error.code || '未知'}`);
        
        // 分析可能的错误原因
        if (error.message.includes('getVotingStatus')) {
            addLog('info', '💡 可能是合约没有getVotingStatus函数');
        } else if (error.message.includes('getTotalVoters')) {
            addLog('info', '💡 可能是合约没有getTotalVoters函数');
        } else if (error.message.includes('getVoteOptionsCount')) {
            addLog('info', '💡 可能是合约没有getVoteOptionsCount函数');
        } else if (error.message.includes('network')) {
            addLog('info', '💡 网络连接问题，请检查网络状态');
        }
        
        console.error('更新状态详细错误:', error);
    }
}

// 更新投票选项
async function updateVoteOptions() {
    try {
        const optionsCount = await contract.getVoteOptionsCount();
        const optionsContainer = document.getElementById('voteOptions');
        const voteSelect = document.getElementById('voteSelect');
        
        optionsContainer.innerHTML = '';
        voteSelect.innerHTML = '<option value="">选择投票选项</option>';
        
        for (let i = 0; i < optionsCount; i++) {
            const option = await contract.getVoteOption(i);
            
            // 添加到选项列表
            const optionDiv = document.createElement('div');
            optionDiv.className = 'vote-option';
            optionDiv.innerHTML = `
                <h4>选项 ${i + 1}: ${option[0]}</h4>
                <p>状态: ${option[1] ? '活跃' : '非活跃'}</p>
            `;
            optionsContainer.appendChild(optionDiv);
            
            // 添加到选择框
            const optionElement = document.createElement('option');
            optionElement.value = i;
            optionElement.textContent = `${i + 1}. ${option[0]}`;
            voteSelect.appendChild(optionElement);
        }
        
    } catch (error) {
        addLog('error', `更新投票选项失败: ${error.message}`);
    }
}

// 注册投票者
async function registerVoter() {
    try {
        const voterAddress = document.getElementById('voterAddress').value.trim();
        
        if (!voterAddress) {
            showMessage('请输入投票者地址', 'warning');
            return;
        }
        
        if (!ethers.utils.isAddress(voterAddress)) {
            showMessage('请输入有效的以太坊地址', 'error');
            return;
        }
        
        showLoading('注册投票者中...');
        
        const tx = await contract.registerVoter(voterAddress);
        await tx.wait();
        
        addLog('success', `投票者注册成功: ${voterAddress}`);
        showMessage('投票者注册成功', 'success');
        
        document.getElementById('voterAddress').value = '';
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `注册投票者失败: ${error.message}`);
        showMessage(`注册失败: ${error.message}`, 'error');
    }
}

// 批量注册投票者
async function registerVoters() {
    try {
        const addressesText = document.getElementById('voterAddresses').value.trim();
        
        if (!addressesText) {
            showMessage('请输入投票者地址列表', 'warning');
            return;
        }
        
        const addresses = addressesText.split('\n')
            .map(addr => addr.trim())
            .filter(addr => addr.length > 0);
        
        if (addresses.length === 0) {
            showMessage('没有找到有效的地址', 'warning');
            return;
        }
        
        // 验证地址格式
        for (const addr of addresses) {
            if (!ethers.utils.isAddress(addr)) {
                showMessage(`无效地址: ${addr}`, 'error');
                return;
            }
        }
        
        showLoading(`批量注册 ${addresses.length} 个投票者中...`);
        
        const tx = await contract.registerVoters(addresses);
        await tx.wait();
        
        addLog('success', `批量注册成功: ${addresses.length} 个投票者`);
        showMessage(`批量注册成功: ${addresses.length} 个投票者`, 'success');
        
        document.getElementById('voterAddresses').value = '';
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `批量注册失败: ${error.message}`);
        showMessage(`批量注册失败: ${error.message}`, 'error');
    }
}

// 添加投票选项
async function addVoteOption() {
    try {
        const optionName = document.getElementById('optionName').value.trim();
        
        if (!optionName) {
            showMessage('请输入选项名称', 'warning');
            return;
        }
        
        showLoading('添加投票选项中...');
        
        const tx = await contract.addVoteOption(optionName);
        await tx.wait();
        
        addLog('success', `投票选项添加成功: ${optionName}`);
        showMessage('投票选项添加成功', 'success');
        
        document.getElementById('optionName').value = '';
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `添加投票选项失败: ${error.message}`);
        showMessage(`添加失败: ${error.message}`, 'error');
    }
}

// 开始投票
async function startVoting() {
    try {
        const duration = parseInt(document.getElementById('votingDuration').value);
        
        if (!duration || duration <= 0) {
            showMessage('请输入有效的投票持续时间', 'warning');
            return;
        }
        
        showLoading('开始投票中...');
        
        const tx = await contract.startVoting(duration);
        await tx.wait();
        
        addLog('success', `投票开始成功，持续时间: ${duration} 秒`);
        showMessage('投票开始成功', 'success');
        
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `开始投票失败: ${error.message}`);
        showMessage(`开始投票失败: ${error.message}`, 'error');
    }
}

// 结束投票
async function endVoting() {
    try {
        showLoading('结束投票中...');
        
        const tx = await contract.endVoting();
        await tx.wait();
        
        addLog('success', '投票结束成功');
        showMessage('投票结束成功', 'success');
        
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `结束投票失败: ${error.message}`);
        showMessage(`结束投票失败: ${error.message}`, 'error');
    }
}

// 投票
async function castVote() {
    try {
        const optionId = document.getElementById('voteSelect').value;
        
        if (!optionId) {
            showMessage('请选择投票选项', 'warning');
            return;
        }
        
        showLoading('投票中...');
        
        const tx = await contract.vote(parseInt(optionId));
        await tx.wait();
        
        addLog('success', `投票成功，选项: ${parseInt(optionId) + 1}`);
        showMessage('投票成功', 'success');
        
        document.getElementById('voteSelect').value = '';
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `投票失败: ${error.message}`);
        showMessage(`投票失败: ${error.message}`, 'error');
    }
}

// 授权查看者
async function authorizeViewer() {
    try {
        const viewerAddress = document.getElementById('viewerAddress').value.trim();
        
        if (!viewerAddress) {
            showMessage('请输入查看者地址', 'warning');
            return;
        }
        
        if (!ethers.utils.isAddress(viewerAddress)) {
            showMessage('请输入有效的以太坊地址', 'error');
            return;
        }
        
        showLoading('授权查看者中...');
        
        const tx = await contract.authorizeViewer(viewerAddress);
        await tx.wait();
        
        addLog('success', `查看者授权成功: ${viewerAddress}`);
        showMessage('查看者授权成功', 'success');
        
        document.getElementById('viewerAddress').value = '';
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `授权查看者失败: ${error.message}`);
        showMessage(`授权失败: ${error.message}`, 'error');
    }
}

// 快速开始投票
async function quickStartVoting() {
    try {
        showLoading('开始投票中...');
        
        // 设置1小时的投票时间
        const duration = 3600; // 1小时
        const tx = await contract.startVoting(duration);
        await tx.wait();
        
        addLog('success', `✅ 投票已开始，持续时间: ${duration / 3600} 小时`);
        showMessage('投票成功开始！现在可以进行投票了', 'success');
        
        // 更新状态
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        addLog('error', `开始投票失败: ${error.message}`);
        if (error.message.includes('already active')) {
            showMessage('投票已经在进行中', 'info');
        } else if (error.message.includes('No vote options')) {
            showMessage('请先添加投票选项', 'warning');
        } else {
            showMessage('开始投票失败', 'error');
        }
        hideLoading();
    }
}

// 授权自己查看结果
async function authorizeSelf() {
    try {
        const userAddress = await signer.getAddress();
        
        // 先检查是否已经授权
        addLog('info', '🔍 检查当前授权状态...');
        const isAuthorized = await contract.isAuthorizedViewer(userAddress);
        
        if (isAuthorized) {
            addLog('success', '✅ 您已经被授权查看结果');
            showMessage('您已经有权限查看结果', 'info');
            
            // 直接尝试获取结果
            setTimeout(() => {
                getVoteResults();
            }, 500);
            return;
        }
        
        showLoading('授权自己查看结果中...');
        
        const tx = await contract.authorizeViewer(userAddress);
        await tx.wait();
        
        addLog('success', `✅ 已授权自己查看投票结果: ${userAddress}`);
        showMessage('授权成功！现在可以查看投票结果了', 'success');
        
        // 自动刷新投票结果
        setTimeout(() => {
            getVoteResults();
        }, 1000);
        
        hideLoading();
        
    } catch (error) {
        if (error.message.includes('already authorized')) {
            addLog('info', '✅ 您已经被授权查看结果');
            showMessage('您已经有权限查看结果', 'info');
            // 直接尝试获取结果
            setTimeout(() => {
                getVoteResults();
            }, 500);
        } else {
            addLog('error', `授权自己失败: ${error.message}`);
            showMessage('授权失败', 'error');
        }
        hideLoading();
    }
}

// 获取投票结果
async function getVoteResults() {
    try {
        showLoading('获取投票结果中...');
        
        const optionsCount = await contract.getVoteOptionsCount();
        const resultsContainer = document.getElementById('voteResults');
        
        resultsContainer.innerHTML = '<h4>投票结果:</h4>';
        
        // 尝试使用getAllResults函数（需要授权）
        try {
            addLog('info', '🔍 尝试获取投票结果...');
            const allResults = await contract.getAllResults();
            addLog('success', '✅ 获取到投票结果（已授权查看）');
            
            for (let i = 0; i < optionsCount; i++) {
                const option = await contract.getVoteOption(i);
                const result = allResults[i];
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';
                resultDiv.innerHTML = `
                    <p><strong>${option[0]}:</strong> ${result.toString()} 票</p>
                `;
                resultsContainer.appendChild(resultDiv);
            }
        } catch (authorizedError) {
            addLog('warning', `⚠️ 无权限查看详细投票结果: ${authorizedError.message}`);
            addLog('info', '🔍 调试权限信息...');
            
            // 检查权限状态
            try {
                const userAddress = await signer.getAddress();
                const isAuthorized = await contract.isAuthorizedViewer(userAddress);
                const owner = await contract.owner();
                
                addLog('info', `👤 当前用户: ${userAddress}`);
                addLog('info', `👑 合约所有者: ${owner}`);
                addLog('info', `🔑 是否为所有者: ${userAddress.toLowerCase() === owner.toLowerCase()}`);
                addLog('info', `📜 是否已授权: ${isAuthorized}`);
            } catch (debugError) {
                addLog('error', `调试信息获取失败: ${debugError.message}`);
            }
            
            // 如果没有权限，只显示选项信息
            for (let i = 0; i < optionsCount; i++) {
                const option = await contract.getVoteOption(i);
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';
                resultDiv.innerHTML = `
                    <p><strong>${option[0]}:</strong> 需要授权查看结果</p>
                `;
                resultsContainer.appendChild(resultDiv);
            }
            
            // 添加授权说明
            const authDiv = document.createElement('div');
            authDiv.className = 'message-info';
            authDiv.innerHTML = `
                <p>💡 提示：只有合约管理员或已授权用户才能查看投票结果</p>
                <p>如果您是管理员，请先授权自己查看结果</p>
            `;
            resultsContainer.appendChild(authDiv);
        }
        
        addLog('success', '投票结果获取完成');
        showMessage('投票结果获取完成', 'success');
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `获取投票结果失败: ${error.message}`);
        showMessage(`获取结果失败: ${error.message}`, 'error');
    }
}

// 显示/隐藏加载提示
function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// 添加日志
function addLog(level, message) {
    const logContainer = document.getElementById('logContainer');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const time = new Date().toLocaleTimeString();
    const levelClass = `log-level ${level}`;
    
    logEntry.innerHTML = `
        <span class="log-time">[${time}]</span>
        <span class="${levelClass}">[${level.toUpperCase()}]</span>
        <span>${message}</span>
    `;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// 清空日志
function clearLog() {
    document.getElementById('logContainer').innerHTML = '';
}

// 显示消息
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // 插入到页面顶部
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 监听MetaMask账户变化
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            connectWallet();
        }
    });
    
    window.ethereum.on('chainChanged', function () {
        window.location.reload();
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initApp();
}); 
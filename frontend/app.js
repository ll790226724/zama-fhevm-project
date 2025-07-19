// FHEVM 机密投票系统前端应用
let provider, signer, contract, contractAddress;
let isOwner = false;
let isVoter = false;

// 合约ABI (简化版本)
const CONTRACT_ABI = [
    "function owner() view returns (address)",
    "function registerVoter(address _voter)",
    "function registerVoters(address[] memory _voters)",
    "function addVoteOption(string memory _name)",
    "function startVoting(uint256 _duration)",
    "function endVoting()",
    "function vote(uint256 _optionId)",
    "function authorizeViewer(address _viewer)",
    "function getVoteOptionsCount() view returns (uint256)",
    "function getVoteOption(uint256 _optionId) view returns (string memory, bool)",
    "function getVotingStatus() view returns (bool, uint256, uint256)",
    "function getTotalVoters() view returns (uint256)",
    "function hasVoted(address _voter) view returns (bool)",
    "function getVoterInfo(address _voter) view returns (bool isRegistered, bool hasVoted, uint256 votedOption)",
    "function isAuthorizedViewer(address _viewer) view returns (bool)"
];

// 初始化应用
async function initApp() {
    addLog('info', '应用初始化中...');
    
    // 检查是否安装了MetaMask
    if (typeof window.ethereum === 'undefined') {
        addLog('error', '请安装MetaMask钱包');
        showMessage('请安装MetaMask钱包', 'error');
        return;
    }
    
    // 设置合约地址
    contractAddress = '0xD3fB8f4E71A47c5Cdb01A43C2B77f120700e6c5D';
    document.getElementById('contractAddress').textContent = contractAddress;
    
    addLog('success', '应用初始化完成');
}

// 连接钱包
async function connectWallet() {
    try {
        showLoading('连接钱包中...');
        
        // 请求连接MetaMask
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        if (accounts.length === 0) {
            throw new Error('没有找到账户');
        }
        
        // 创建provider和signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        const address = await signer.getAddress();
        
        // 更新UI
        document.getElementById('walletAddress').textContent = address;
        document.getElementById('walletInfo').style.display = 'flex';
        document.getElementById('connectBtn').style.display = 'none';
        
        // 创建合约实例
        contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
        
        addLog('success', `钱包连接成功: ${address}`);
        
        // 检查用户角色
        await checkUserRole();
        
        // 更新状态
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `连接钱包失败: ${error.message}`);
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
        const owner = await contract.owner();
        const userAddress = await signer.getAddress();
        
        isOwner = (owner.toLowerCase() === userAddress.toLowerCase());
        
        if (isOwner) {
            document.getElementById('adminSection').style.display = 'block';
            addLog('success', '您是该合约的管理员');
        }
        
        // 检查是否为注册的投票者
        const voterInfo = await contract.getVoterInfo(userAddress);
        isVoter = voterInfo.isRegistered;
        
        if (isVoter) {
            document.getElementById('voterSection').style.display = 'block';
            addLog('success', '您是注册的投票者');
        }
        
        // 显示结果查看区域
        document.getElementById('resultsSection').style.display = 'block';
        
    } catch (error) {
        addLog('error', `检查用户角色失败: ${error.message}`);
    }
}

// 更新系统状态
async function updateStatus() {
    try {
        // 获取投票状态
        const votingStatus = await contract.getVotingStatus();
        const statusText = votingStatus[0] ? '活跃' : '非活跃';
        document.getElementById('votingStatus').textContent = statusText;
        
        // 获取投票者总数
        const totalVoters = await contract.getTotalVoters();
        document.getElementById('totalVoters').textContent = totalVoters.toString();
        
        // 获取选项数量
        const optionsCount = await contract.getVoteOptionsCount();
        document.getElementById('optionsCount').textContent = optionsCount.toString();
        
        // 更新投票选项
        await updateVoteOptions();
        
    } catch (error) {
        addLog('error', `更新状态失败: ${error.message}`);
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

// 获取投票结果
async function getVoteResults() {
    try {
        showLoading('获取投票结果中...');
        
        const optionsCount = await contract.getVoteOptionsCount();
        const resultsContainer = document.getElementById('voteResults');
        
        resultsContainer.innerHTML = '<h4>加密投票结果:</h4>';
        
        for (let i = 0; i < optionsCount; i++) {
            const option = await contract.getVoteOption(i);
            const result = await contract.getVoteResult(i);
            
            const resultDiv = document.createElement('div');
            resultDiv.className = 'vote-result';
            resultDiv.innerHTML = `
                <p><strong>${option[0]}:</strong> ${result.toString()} (加密票数)</p>
            `;
            resultsContainer.appendChild(resultDiv);
        }
        
        addLog('success', '投票结果获取成功');
        showMessage('投票结果获取成功', 'success');
        
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
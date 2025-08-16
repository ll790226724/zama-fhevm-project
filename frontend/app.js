// FHEVM Confidential Voting System Frontend Application
let provider, signer, contract, contractAddress;
let isOwner = false;
let isVoter = false;

// StandardVoting Contract ABI
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

// Initialize application
// Ensure initialization only runs once
let isInitialized = false;
let initAttempted = false;

function safeInitApp() {
    if (initAttempted) {
        return; // Avoid duplicate attempts
    }
    initAttempted = true;
    
    addLog('info', '📄 Page loaded, starting application initialization...');
    
    // Wait a moment to ensure all scripts are loaded
    setTimeout(() => {
        if (!isInitialized) {
            isInitialized = true;
            initApp();
        }
    }, 100);
}

// Initialize application
async function initApp() {
    addLog('info', '🚀 FHEVM Confidential Voting dApp initializing...');
    addLog('info', `🌐 Browser: ${navigator.userAgent.split(' ')[0]}`);
    addLog('info', `📍 Current URL: ${window.location.href}`);
    addLog('info', `🌐 Online status: ${navigator.onLine ? 'Online' : 'Offline'}`);
    
    // Check if Web3 wallet is installed
    if (typeof window.ethereum === 'undefined') {
        addLog('error', '❌ No Web3 wallet extension detected');
        addLog('info', '💡 Please install MetaMask, Coinbase Wallet or other Web3 wallets');
        showMessage('Please install MetaMask or other Web3 wallet', 'error');
        return;
    }
    
    addLog('success', '✅ Web3 wallet extension detected');
    
    // Check wallet provider
    if (window.ethereum.isMetaMask) {
        addLog('info', '🦊 MetaMask wallet detected');
    } else if (window.ethereum.isCoinbaseWallet) {
        addLog('info', '🔵 Coinbase wallet detected');
    } else {
        addLog('info', '📱 Other Web3 wallet detected');
    }
    
    // Check if Ethers.js is loaded
    if (typeof ethers === 'undefined') {
        addLog('warning', '⚠️ Ethers.js library not yet loaded, waiting...');
        
        // Wait for Ethers.js to load
        let waitCount = 0;
        const maxWait = 10; // Maximum wait 10 seconds
        
        const checkEthers = setInterval(() => {
            waitCount++;
            if (typeof ethers !== 'undefined' || window.ethersLoaded) {
                clearInterval(checkEthers);
                addLog('success', `✅ Ethers.js library loaded (version: ${ethers.version || 'v5.x'})`);
                // Continue with the rest of initialization
                completeInitialization();
            } else if (waitCount >= maxWait) {
                clearInterval(checkEthers);
                addLog('error', '❌ Ethers.js loading timeout');
                addLog('info', '💡 Please check network connection or try refreshing the page');
                showMessage('Unable to load required library files, please check network connection and refresh page', 'error');
            } else {
                addLog('info', `⏳ Waiting for Ethers.js to load... (${waitCount}/${maxWait})`);
            }
        }, 1000);
        return;
    }
    
    addLog('success', `✅ Ethers.js library loaded (version: ${ethers.version || 'v5.x'})`);
    
    completeInitialization();
}

// Complete the rest of initialization
function completeInitialization() {
    // Set contract address (deployed to Ethereum Sepolia)
    // Note: This address is the actual deployed StandardVoting contract address
    const rawAddress = '0xe538256B911EDDB2DDA039f0526D0C98823B045D';
    
    addLog('success', '✅ Using actual deployed StandardVoting contract address');
    
    // Use ethers.utils.getAddress to ensure correct checksum format
    try {
        contractAddress = ethers.utils.getAddress(rawAddress.toLowerCase());
        addLog('success', `📜 Contract address verified: ${contractAddress}`);
    } catch (e) {
        // If verification fails, use original address and log warning
        contractAddress = rawAddress;
        addLog('warning', `⚠️ Contract address format warning: ${e.message}`);
        addLog('info', `📜 Using original contract address: ${contractAddress}`);
    }
    
    document.getElementById('currentContractAddress').textContent = contractAddress;
    document.getElementById('contractAddressInput').value = contractAddress;
    addLog('info', '🌐 Target network: Ethereum Sepolia (Chain ID: 11155111)');
    
    addLog('success', '🎉 Application initialization complete! Please click "Connect Wallet" to begin');
}

// Connect wallet
async function connectWallet() {
    try {
        addLog('info', '🔄 Starting wallet connection...');
        
        // Check if wallet extension exists
        if (typeof window.ethereum === 'undefined') {
            addLog('error', '❌ No wallet extension detected');
            showMessage('Please install MetaMask or other Web3 wallet', 'error');
            return;
        }
        
        addLog('success', '✅ Wallet extension detected');
        
        // Detect wallet type
        if (window.ethereum.isMetaMask) {
            addLog('info', '📱 MetaMask wallet detected');
        } else if (window.ethereum.isCoinbaseWallet) {
            addLog('info', '📱 Coinbase wallet detected');
        } else {
            addLog('info', '📱 Other Web3 wallet detected');
        }
        
        // Request account connection
        addLog('info', '🔐 Requesting wallet account connection...');
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        addLog('info', `📊 Retrieved account count: ${accounts.length}`);
        
        if (accounts.length === 0) {
            throw new Error('No accounts available');
        }
        
        const address = accounts[0];
        addLog('success', `📍 Main account address: ${address}`);
        
        // Create Web3 Provider
        addLog('info', '🔗 Creating Web3 Provider...');
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Get network information
        const network = await provider.getNetwork();
        addLog('info', `🌐 Connected network: ${network.name} (Chain ID: ${network.chainId})`);
        
        // Check if network is correct (Ethereum Sepolia: 11155111)
        const expectedChainId = 11155111; // Ethereum Sepolia
        if (network.chainId !== expectedChainId) {
            addLog('warning', `⚠️ Network mismatch! Current network: ${network.chainId}, expected network: ${expectedChainId} (Ethereum Sepolia)`);
            addLog('info', '💡 Please switch to Ethereum Sepolia testnet in your wallet');
            
            // Try to switch network automatically
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${expectedChainId.toString(16)}` }]
                });
                addLog('success', '✅ Switched to Ethereum Sepolia network');
            } catch (switchError) {
                if (switchError.code === 4902) {
                    // Network not added to wallet, try to add it
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
                        addLog('success', '✅ Added and switched to Ethereum Sepolia network');
                    } catch (addError) {
                        addLog('error', `❌ Unable to add network: ${addError.message}`);
                        showMessage('Please manually switch to Ethereum Sepolia network', 'warning');
                    }
                } else {
                    addLog('error', `❌ Network switch failed: ${switchError.message}`);
                }
            }
        } else {
            addLog('success', '✅ Network connection correct: Ethereum Sepolia');
        }
        
        // Create signer
        addLog('info', '✍️ Creating signer...');
        signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        addLog('success', `👤 Signer address: ${signerAddress}`);
        
        // Get account balance
        const balance = await provider.getBalance(address);
        const balanceInEth = ethers.utils.formatEther(balance);
        addLog('info', `💰 Account balance: ${balanceInEth} ETH`);
        
        // Update UI
        addLog('info', '🔄 Updating interface...');
        document.getElementById('connectionStatus').textContent = 'Connected';
        document.getElementById('walletAddress').textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
        document.getElementById('walletBalance').textContent = `${parseFloat(balanceInEth).toFixed(4)} ETH`;
        document.getElementById('networkInfo').textContent = `${network.name} (${network.chainId})`;
        document.getElementById('connectBtn').style.display = 'none';
        document.getElementById('disconnectBtn').style.display = 'inline-block';
        
        // Create contract instance
        addLog('info', `📜 Creating contract instance: ${contractAddress}`);
        contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
        addLog('success', '✅ Contract instance created successfully');
        
        // Verify contract deployment
        try {
            const code = await provider.getCode(contractAddress);
            if (code === '0x') {
                throw new Error('No code deployed at contract address');
            } else {
                addLog('success', `✅ Contract code verification successful (size: ${(code.length - 2) / 2} bytes)`);
            }
        } catch (contractError) {
            addLog('error', `❌ Contract verification failed: ${contractError.message}`);
            if (contractError.message.includes('No code deployed')) {
                throw contractError;
            } else {
                addLog('warning', '⚠️ Contract instance created successfully but verification failed, continuing to try calls...');
            }
        }
        
        addLog('success', `🎉 Wallet connection successful: ${address}`);
        
        // Check user role
        addLog('info', '👥 Checking user role...');
        await checkUserRole();
        
        // Update status
        addLog('info', '📊 Updating system status...');
        await updateStatus();
        
        addLog('success', '🏁 Wallet connection process complete');
        
    } catch (error) {
        addLog('error', `❌ Wallet connection failed: ${error.message}`);
        addLog('error', `🔍 Error code: ${error.code || 'Unknown'}`);
        
        // Analyze possible error causes
        if (error.message.includes('User rejected')) {
            addLog('info', '💡 User rejected the request, please try again');
            showMessage('Connection request rejected, please try again', 'warning');
        } else if (error.message.includes('Already processing')) {
            addLog('info', '💡 Another request is being processed, please wait');
            showMessage('Another request is being processed, please wait', 'info');
        } else if (error.message.includes('network')) {
            addLog('info', '💡 Network connection issue, please check network status');
            showMessage('Network connection issue, please check network status and try again', 'error');
        } else if (error.message.includes('No code deployed')) {
            addLog('info', '💡 Contract not deployed at this address, please check contract address');
            showMessage('Contract not deployed at this address, please check contract address', 'error');
        } else {
            showMessage(`Connection failed: ${error.message}`, 'error');
        }
    }
}

// Disconnect wallet
function disconnectWallet() {
    provider = null;
    signer = null;
    contract = null;
    isOwner = false;
    isVoter = false;
    
    // Update UI
    document.getElementById('connectionStatus').textContent = 'Not Connected';
    document.getElementById('walletAddress').textContent = '-';
    document.getElementById('walletBalance').textContent = '-';
    document.getElementById('networkInfo').textContent = '-';
    document.getElementById('connectBtn').style.display = 'inline-block';
    document.getElementById('disconnectBtn').style.display = 'none';
    
    // Hide function sections
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('voterSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    
    addLog('info', 'Wallet disconnected');
}

// Check user role
async function checkUserRole() {
    try {
        addLog('info', '🔍 Starting user role check...');
        
        // Check contract owner
        addLog('info', '👑 Getting contract admin information...');
        
        let owner;
        let contractWorking = false;
        
        // First try a simple test call
        try {
            addLog('info', '🔍 Testing contract connection...');
            owner = await contract.owner();
            addLog('success', `👑 Contract admin: ${owner}`);
            contractWorking = true;
        } catch (ownerError) {
            addLog('error', `❌ Cannot call owner() function: ${ownerError.message}`);
            
            // Try other possible functions
            try {
                addLog('info', '🔍 Trying other contract functions...');
                const totalVoters = await contract.getTotalVoters();
                addLog('success', `📊 Retrieved total voters: ${totalVoters}`);
                addLog('warning', '⚠️ getTotalVoters() works but owner() doesn\'t, contract may not have owner() function');
                contractWorking = true;
            } catch (alternativeError) {
                addLog('error', `❌ Alternative function calls also failed: ${alternativeError.message}`);
                addLog('warning', '⚠️ Contract may not be properly deployed or ABI mismatch');
                
                // Provide debug information
                addLog('info', '🔧 Debug information:');
                addLog('info', `   - Contract address: ${contractAddress}`);
                addLog('info', `   - Network: ${(await provider.getNetwork()).name} (${(await provider.getNetwork()).chainId})`);
                addLog('info', `   - User address: ${await signer.getAddress()}`);
                
                throw new Error('Contract call failed, please check contract deployment status');
            }
        }
        
        if (contractWorking && owner) {
            const userAddress = await signer.getAddress();
            addLog('info', `👤 Current user: ${userAddress}`);
            
            isOwner = (owner.toLowerCase() === userAddress.toLowerCase());
            addLog('info', `🔑 Admin permissions: ${isOwner ? 'Yes' : 'No'}`);
            
            if (isOwner) {
                document.getElementById('adminSection').style.display = 'block';
                addLog('success', '✅ You are the contract admin, admin functions enabled');
            } else {
                addLog('info', 'ℹ️ You are not an admin, cannot use admin functions');
            }
        } else {
            addLog('warning', '⚠️ Cannot determine admin permissions, skipping permission check');
        }
        
        // Check if registered voter
        addLog('info', '🗳️ Checking voter registration status...');
        try {
            const userAddress = await signer.getAddress();
            const voterInfo = await contract.getVoterInfo(userAddress);
            isVoter = voterInfo.isRegistered;
            addLog('info', `📝 Voter registration status: ${isVoter ? 'Registered' : 'Not registered'}`);
            
            if (isVoter) {
                document.getElementById('voterSection').style.display = 'block';
                addLog('success', '✅ You are a registered voter, voting functions enabled');
                
                // Check if already voted
                if (voterInfo.hasVoted) {
                    addLog('info', `🗳️ You have already voted, selected option ID: ${voterInfo.votedOption}`);
                } else {
                    addLog('info', '🗳️ You have not voted yet');
                }
            } else {
                addLog('info', 'ℹ️ You are not a registered voter, cannot participate in voting');
            }
        } catch (voterError) {
            addLog('warning', `⚠️ Cannot get voter information: ${voterError.message}`);
            addLog('info', 'ℹ️ Contract may not have getVoterInfo function, or you are not a registered voter');
        }
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        addLog('success', '✅ User role check complete');
        
    } catch (error) {
        addLog('error', `❌ User role check failed: ${error.message}`);
        addLog('error', `🔍 Error code: ${error.code || 'Unknown'}`);
        
        // Analyze possible error causes
        if (error.message.includes('owner')) {
            addLog('info', '💡 Contract may not have owner function, or contract address is wrong');
        } else if (error.message.includes('network')) {
            addLog('info', '💡 Network connection issue, please check network status');
        } else if (error.message.includes('call revert')) {
            addLog('info', '💡 Contract call reverted, may be contract logic issue');
        } else if (error.message.includes('timeout')) {
            addLog('info', '💡 Request timeout, please try again');
        } else {
            addLog('info', '💡 Please check contract address and network connection');
        }
        
        showMessage('User role check failed, some functions may not be available', 'warning');
    }
}

// Update system status
async function updateStatus() {
    try {
        addLog('info', '📊 Starting system status update...');
        
        // Get voting status
        addLog('info', '🗳️ Getting voting status...');
        const [active, startTime, endTime] = await contract.getVotingStatus();
        
        let statusText = active ? 'Active' : 'Inactive';
        addLog('success', `✅ Voting status: ${statusText}`);
        
        if (active) {
            const start = new Date(Number(startTime) * 1000);
            const end = new Date(Number(endTime) * 1000);
            addLog('info', `⏰ Voting start time: ${start.toLocaleString()}`);
            addLog('info', `⏰ Voting end time: ${end.toLocaleString()}`);
        }
        
        document.getElementById('votingStatus').textContent = statusText;
        
        // Get total voters
        addLog('info', '👥 Getting total voters...');
        const totalVoters = await contract.getTotalVoters();
        addLog('success', `✅ Total registered voters: ${totalVoters.toString()}`);
        document.getElementById('totalVoters').textContent = totalVoters.toString();
        
        // Get vote options count
        addLog('info', '📋 Getting vote options count...');
        const optionsCount = await contract.getVoteOptionsCount();
        addLog('success', `✅ Vote options count: ${optionsCount.toString()}`);
        document.getElementById('totalOptions').textContent = optionsCount.toString();
        
        // Update vote options list
        addLog('info', '🔄 Updating vote options list...');
        await updateVoteOptions();
        
        addLog('success', '✅ System status update complete');
        
    } catch (error) {
        addLog('error', `❌ System status update failed: ${error.message}`);
        
        // Set default values
        document.getElementById('votingStatus').textContent = 'Unknown';
        document.getElementById('totalVoters').textContent = '-';
        document.getElementById('totalOptions').textContent = '-';
        
        showMessage('System status update failed', 'warning');
    }
}

// Update vote options
async function updateVoteOptions() {
    try {
        const optionsCount = await contract.getVoteOptionsCount();
        const voteOptionsContainer = document.getElementById('voteOptions');
        
        if (optionsCount == 0) {
            voteOptionsContainer.innerHTML = '<p>No vote options available yet</p>';
            return;
        }
        
        voteOptionsContainer.innerHTML = '';
        
        for (let i = 0; i < optionsCount; i++) {
            const [name, isActive] = await contract.getVoteOption(i);
            
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            optionDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
                    <span><strong>Option ${i}:</strong> ${name} ${isActive ? '✅' : '❌'}</span>
                    <button onclick="castVote(${i})" class="btn btn-primary" ${!isActive ? 'disabled' : ''}>
                        Vote
                    </button>
                </div>
            `;
            voteOptionsContainer.appendChild(optionDiv);
        }
        
    } catch (error) {
        addLog('error', `Update vote options failed: ${error.message}`);
        document.getElementById('voteOptions').innerHTML = '<p>Failed to load vote options</p>';
    }
}

// Register voter
async function registerVoter() {
    try {
        const voterAddress = document.getElementById('voterAddress').value.trim();
        
        if (!voterAddress) {
            showMessage('Please enter voter address', 'warning');
            return;
        }
        
        if (!ethers.utils.isAddress(voterAddress)) {
            showMessage('Please enter a valid Ethereum address', 'error');
            return;
        }
        
        showLoading('Registering voter...');
        
        const tx = await contract.registerVoter(voterAddress);
        await tx.wait();
        
        addLog('success', `Voter registration successful: ${voterAddress}`);
        showMessage('Voter registration successful', 'success');
        
        document.getElementById('voterAddress').value = '';
        
        // Update status
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `Voter registration failed: ${error.message}`);
        
        if (error.message.includes('already registered')) {
            showMessage('This voter is already registered', 'warning');
        } else if (error.message.includes('not owner')) {
            showMessage('Only admin can register voters', 'error');
        } else {
            showMessage(`Registration failed: ${error.message}`, 'error');
        }
    }
}

// Batch register voters
async function registerVoters() {
    try {
        const addressesText = document.getElementById('voterAddresses').value.trim();
        
        if (!addressesText) {
            showMessage('Please enter voter addresses', 'warning');
            return;
        }
        
        const addresses = addressesText.split('\n')
            .map(addr => addr.trim())
            .filter(addr => addr.length > 0);
        
        if (addresses.length === 0) {
            showMessage('No valid addresses found', 'warning');
            return;
        }
        
        // Validate all addresses
        for (const addr of addresses) {
            if (!ethers.utils.isAddress(addr)) {
                showMessage(`Invalid address: ${addr}`, 'error');
                return;
            }
        }
        
        showLoading(`Batch registering ${addresses.length} voters...`);
        
        const tx = await contract.registerVoters(addresses);
        await tx.wait();
        
        addLog('success', `Batch registration successful: ${addresses.length} voters`);
        showMessage(`Batch registration successful: ${addresses.length} voters`, 'success');
        
        document.getElementById('voterAddresses').value = '';
        
        // Update status
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `Batch registration failed: ${error.message}`);
        showMessage(`Batch registration failed: ${error.message}`, 'error');
    }
}

// Add vote option
async function addVoteOption() {
    try {
        const optionName = document.getElementById('optionName').value.trim();
        
        if (!optionName) {
            showMessage('Please enter option name', 'warning');
            return;
        }
        
        showLoading('Adding vote option...');
        
        const tx = await contract.addVoteOption(optionName);
        await tx.wait();
        
        addLog('success', `Vote option added successfully: ${optionName}`);
        showMessage('Vote option added successfully', 'success');
        
        document.getElementById('optionName').value = '';
        
        // Update status
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `Add vote option failed: ${error.message}`);
        
        if (error.message.includes('not owner')) {
            showMessage('Only admin can add vote options', 'error');
        } else if (error.message.includes('voting active')) {
            showMessage('Cannot add options while voting is active', 'warning');
        } else {
            showMessage(`Add option failed: ${error.message}`, 'error');
        }
    }
}

// Start voting
async function startVoting() {
    try {
        const duration = parseInt(document.getElementById('votingDuration').value);
        
        if (!duration || duration <= 0) {
            showMessage('Please enter a valid duration', 'warning');
            return;
        }
        
        showLoading('Starting voting...');
        
        const tx = await contract.startVoting(duration);
        await tx.wait();
        
        addLog('success', `Voting started successfully, duration: ${duration} seconds`);
        showMessage('Voting started successfully', 'success');
        
        // Update status
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `Start voting failed: ${error.message}`);
        
        if (error.message.includes('not owner')) {
            showMessage('Only admin can start voting', 'error');
        } else if (error.message.includes('already active')) {
            showMessage('Voting is already active', 'warning');
        } else if (error.message.includes('No vote options')) {
            showMessage('Please add vote options first', 'warning');
        } else {
            showMessage(`Start voting failed: ${error.message}`, 'error');
        }
    }
}

// Quick start voting
async function quickStartVoting() {
    try {
        showLoading('Starting voting...');
        
        // Set 1 hour voting duration
        const duration = 3600; // 1 hour
        const tx = await contract.startVoting(duration);
        await tx.wait();
        
        addLog('success', `✅ Voting started, duration: ${duration / 3600} hours`);
        showMessage('Voting started successfully! You can now vote', 'success');
        
        // Update status
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        addLog('error', `Start voting failed: ${error.message}`);
        if (error.message.includes('already active')) {
            showMessage('Voting is already active', 'info');
        } else if (error.message.includes('No vote options')) {
            showMessage('Please add vote options first', 'warning');
        } else {
            showMessage('Start voting failed', 'error');
        }
        hideLoading();
    }
}

// End voting
async function endVoting() {
    try {
        showLoading('Ending voting...');
        
        const tx = await contract.endVoting();
        await tx.wait();
        
        addLog('success', 'Voting ended successfully');
        showMessage('Voting ended successfully', 'success');
        
        // Update status
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `End voting failed: ${error.message}`);
        
        if (error.message.includes('not owner')) {
            showMessage('Only admin can end voting', 'error');
        } else if (error.message.includes('not active')) {
            showMessage('Voting is not currently active', 'warning');
        } else {
            showMessage(`End voting failed: ${error.message}`, 'error');
        }
    }
}

// Cast vote
async function castVote(optionId) {
    try {
        showLoading('Casting vote...');
        
        const tx = await contract.vote(optionId);
        await tx.wait();
        
        addLog('success', `Vote cast successfully for option ${optionId}`);
        showMessage('Vote cast successfully', 'success');
        
        // Update status
        await updateStatus();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `Voting failed: ${error.message}`);
        
        if (error.message.includes('not registered')) {
            showMessage('You are not a registered voter', 'error');
        } else if (error.message.includes('already voted')) {
            showMessage('You have already voted', 'warning');
        } else if (error.message.includes('not active')) {
            showMessage('Voting is not currently active', 'warning');
        } else if (error.message.includes('Invalid option')) {
            showMessage('Invalid vote option', 'error');
        } else {
            showMessage(`Voting failed: ${error.message}`, 'error');
        }
    }
}

// Authorize viewer
async function authorizeViewer() {
    try {
        const viewerAddress = document.getElementById('viewerAddress').value.trim();
        
        if (!viewerAddress) {
            showMessage('Please enter viewer address', 'warning');
            return;
        }
        
        if (!ethers.utils.isAddress(viewerAddress)) {
            showMessage('Please enter a valid Ethereum address', 'error');
            return;
        }
        
        showLoading('Authorizing viewer...');
        
        const tx = await contract.authorizeViewer(viewerAddress);
        await tx.wait();
        
        addLog('success', `Viewer authorization successful: ${viewerAddress}`);
        showMessage('Viewer authorization successful', 'success');
        
        document.getElementById('viewerAddress').value = '';
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `Viewer authorization failed: ${error.message}`);
        showMessage(`Authorization failed: ${error.message}`, 'error');
    }
}

// Authorize self to view results
async function authorizeSelf() {
    try {
        const userAddress = await signer.getAddress();
        
        // First check if already authorized
        addLog('info', '🔍 Checking current authorization status...');
        const isAuthorized = await contract.isAuthorizedViewer(userAddress);
        
        if (isAuthorized) {
            addLog('success', '✅ You are already authorized to view results');
            showMessage('You already have permission to view results', 'info');
            
            // Try to get results directly
            setTimeout(() => {
                getVoteResults();
            }, 500);
            return;
        }
        
        showLoading('Authorizing self to view results...');
        
        const tx = await contract.authorizeViewer(userAddress);
        await tx.wait();
        
        addLog('success', `✅ Self-authorization successful for viewing voting results: ${userAddress}`);
        showMessage('Authorization successful! You can now view voting results', 'success');
        
        // Automatically refresh voting results
        setTimeout(() => {
            getVoteResults();
        }, 1000);
        
        hideLoading();
        
    } catch (error) {
        if (error.message.includes('already authorized')) {
            addLog('info', '✅ You are already authorized to view results');
            showMessage('You already have permission to view results', 'info');
            // Try to get results directly
            setTimeout(() => {
                getVoteResults();
            }, 500);
        } else {
            addLog('error', `Self-authorization failed: ${error.message}`);
            showMessage('Authorization failed', 'error');
        }
        hideLoading();
    }
}

// Get voting results
async function getVoteResults() {
    try {
        showLoading('Getting voting results...');
        
        const optionsCount = await contract.getVoteOptionsCount();
        const resultsContainer = document.getElementById('voteResults');
        
        resultsContainer.innerHTML = '<h4>Voting Results:</h4>';
        
        // Try to use getAllResults function (requires authorization)
        try {
            addLog('info', '🔍 Attempting to get voting results...');
            const allResults = await contract.getAllResults();
            addLog('success', '✅ Got voting results (authorized to view)');
            
            for (let i = 0; i < optionsCount; i++) {
                const option = await contract.getVoteOption(i);
                const result = allResults[i];
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';
                resultDiv.innerHTML = `
                    <p><strong>${option[0]}:</strong> ${result.toString()} votes</p>
                `;
                resultsContainer.appendChild(resultDiv);
            }
        } catch (authorizedError) {
            addLog('warning', `⚠️ No permission to view detailed voting results: ${authorizedError.message}`);
            addLog('info', '🔍 Debugging permission information...');
            
            // Check permission status
            try {
                const userAddress = await signer.getAddress();
                const isAuthorized = await contract.isAuthorizedViewer(userAddress);
                const owner = await contract.owner();
                
                addLog('info', `👤 Current user: ${userAddress}`);
                addLog('info', `👑 Contract owner: ${owner}`);
                addLog('info', `🔑 Is owner: ${userAddress.toLowerCase() === owner.toLowerCase()}`);
                addLog('info', `📜 Is authorized: ${isAuthorized}`);
            } catch (debugError) {
                addLog('error', `Debug info retrieval failed: ${debugError.message}`);
            }
            
            // If no permission, only show option information
            for (let i = 0; i < optionsCount; i++) {
                const option = await contract.getVoteOption(i);
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';
                resultDiv.innerHTML = `
                    <p><strong>${option[0]}:</strong> Requires authorization to view results</p>
                `;
                resultsContainer.appendChild(resultDiv);
            }
            
            // Add authorization notice
            const authDiv = document.createElement('div');
            authDiv.className = 'message-info';
            authDiv.innerHTML = `
                <p>💡 Tip: Only contract admin or authorized users can view voting results</p>
                <p>If you are an admin, please authorize yourself to view results first</p>
            `;
            resultsContainer.appendChild(authDiv);
        }
        
        addLog('success', 'Voting results retrieval complete');
        showMessage('Voting results retrieval complete', 'success');
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        addLog('error', `Get voting results failed: ${error.message}`);
        showMessage('Get voting results failed', 'error');
    }
}

// Update contract address
function updateContractAddress() {
    try {
        const newAddress = document.getElementById('contractAddressInput').value.trim();
        
        if (!newAddress) {
            showMessage('Please enter contract address', 'warning');
            return;
        }
        
        if (!ethers.utils.isAddress(newAddress)) {
            showMessage('Please enter a valid Ethereum address', 'error');
            return;
        }
        
        // Verify address checksum
        const checksumAddress = ethers.utils.getAddress(newAddress);
        contractAddress = checksumAddress;
        
        // Update display
        document.getElementById('currentContractAddress').textContent = contractAddress;
        document.getElementById('contractAddressInput').value = contractAddress;
        
        // Re-create contract instance if signer exists
        if (signer) {
            contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
            addLog('success', `Contract address updated: ${contractAddress}`);
            showMessage('Contract address updated successfully', 'success');
            
            // Re-check user role and update status
            setTimeout(async () => {
                await checkUserRole();
                await updateStatus();
            }, 500);
        } else {
            addLog('info', `Contract address set: ${contractAddress}`);
            showMessage('Contract address set, please connect wallet', 'info');
        }
        
    } catch (error) {
        addLog('error', `Update contract address failed: ${error.message}`);
        showMessage('Invalid contract address format', 'error');
    }
}

// Utility functions
function showLoading(text = 'Processing...') {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function addLog(type, message) {
    const logContainer = document.getElementById('logContainer');
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.innerHTML = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function clearLogs() {
    document.getElementById('logContainer').innerHTML = '<p>Logs will appear here...</p>';
}

function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
} 
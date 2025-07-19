// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";

/**
 * @title ConfidentialVoting
 * @dev 一个使用FHEVM的机密投票智能合约
 * 投票数量被加密存储，只有合约所有者可以查看最终结果（加密值）
 * 
 * 功能特性：
 * - 全同态加密投票数量
 * - 访问控制列表(ACL)支持
 * - 防重复投票
 * - 时间控制投票
 * - 事件记录
 */
contract ConfidentialVoting {
    using FHE for euint64;
    using FHE for bool;
    
    // 投票选项结构
    struct VoteOption {
        string name;
        euint64 encryptedVotes; // 加密的投票数量
        bool isActive;
    }
    
    // 投票者结构
    struct Voter {
        bool hasVoted;
        uint256 votedOption;
        bool isRegistered;
    }
    
    address public owner;
    uint256 public votingStartTime;
    uint256 public votingEndTime;
    bool public votingActive;
    
    VoteOption[] public voteOptions;
    mapping(address => Voter) public voters;
    uint256 public totalVoters;
    
    // 访问控制列表 - 只有授权用户可以查看结果
    mapping(address => bool) public authorizedViewers;
    
    event VoterRegistered(address indexed voter);
    event VoteOptionAdded(string name, uint256 indexed optionId);
    event VoteCast(address indexed voter, uint256 indexed optionId);
    event VotingStarted(uint256 indexed startTime, uint256 indexed endTime);
    event VotingEnded();
    event ResultRevealed(string indexed optionName, euint64 encryptedVoteCount);
    event ViewerAuthorized(address indexed viewer);
    event ViewerRevoked(address indexed viewer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "ConfidentialVoting: Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedViewers[msg.sender], 
                "ConfidentialVoting: Only authorized viewers can call this function");
        _;
    }
    
    modifier votingIsActive() {
        require(votingActive, "ConfidentialVoting: Voting is not active");
        require(block.timestamp >= votingStartTime, "ConfidentialVoting: Voting has not started yet");
        require(block.timestamp <= votingEndTime, "ConfidentialVoting: Voting has ended");
        _;
    }
    
    modifier votingNotActive() {
        require(!votingActive, "ConfidentialVoting: Voting is currently active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        votingActive = false;
        authorizedViewers[msg.sender] = true; // 所有者默认有查看权限
    }
    
    /**
     * @dev 注册投票者
     * @param _voter 投票者地址
     */
    function registerVoter(address _voter) public onlyOwner votingNotActive {
        require(_voter != address(0), "ConfidentialVoting: Invalid voter address");
        require(!voters[_voter].isRegistered, "ConfidentialVoting: Voter already registered");
        
        voters[_voter].isRegistered = true;
        totalVoters++;
        emit VoterRegistered(_voter);
    }
    
    /**
     * @dev 批量注册投票者
     * @param _voters 投票者地址数组
     */
    function registerVoters(address[] memory _voters) public onlyOwner votingNotActive {
        for (uint256 i = 0; i < _voters.length; i++) {
            if (_voters[i] != address(0) && !voters[_voters[i]].isRegistered) {
                voters[_voters[i]].isRegistered = true;
                totalVoters++;
                emit VoterRegistered(_voters[i]);
            }
        }
    }
    
    /**
     * @dev 添加投票选项
     * @param _name 选项名称
     */
    function addVoteOption(string memory _name) public onlyOwner votingNotActive {
        require(bytes(_name).length > 0, "ConfidentialVoting: Option name cannot be empty");
        
        voteOptions.push(VoteOption({
            name: _name,
            encryptedVotes: FHE.asEuint64(0),
            isActive: true
        }));
        emit VoteOptionAdded(_name, voteOptions.length - 1);
    }
    
    /**
     * @dev 开始投票
     * @param _duration 投票持续时间（秒）
     */
    function startVoting(uint256 _duration) public onlyOwner {
        require(voteOptions.length > 0, "ConfidentialVoting: No vote options available");
        require(!votingActive, "ConfidentialVoting: Voting is already active");
        require(_duration > 0, "ConfidentialVoting: Duration must be greater than 0");
        
        votingStartTime = block.timestamp;
        votingEndTime = block.timestamp + _duration;
        votingActive = true;
        
        emit VotingStarted(votingStartTime, votingEndTime);
    }
    
    /**
     * @dev 投票
     * @param _optionId 投票选项ID
     */
    function vote(uint256 _optionId) public votingIsActive {
        require(voters[msg.sender].isRegistered, "ConfidentialVoting: Voter not registered");
        require(!voters[msg.sender].hasVoted, "ConfidentialVoting: Already voted");
        require(_optionId < voteOptions.length, "ConfidentialVoting: Invalid option");
        require(voteOptions[_optionId].isActive, "ConfidentialVoting: Option not active");
        
        // 加密投票（1票）
        euint64 oneVote = FHE.asEuint64(1);
        voteOptions[_optionId].encryptedVotes = voteOptions[_optionId].encryptedVotes.add(oneVote);
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedOption = _optionId;
        
        emit VoteCast(msg.sender, _optionId);
    }
    
    /**
     * @dev 结束投票
     */
    function endVoting() public onlyOwner {
        require(votingActive, "ConfidentialVoting: Voting is not active");
        votingActive = false;
        emit VotingEnded();
    }
    
    /**
     * @dev 获取投票结果（返回加密票数，前端或off-chain解密）
     * @param _optionId 选项ID
     * @return 加密的投票数量
     */
    function getVoteResult(uint256 _optionId) public onlyAuthorized returns (euint64) {
        require(_optionId < voteOptions.length, "ConfidentialVoting: Invalid option");
        require(!votingActive, "ConfidentialVoting: Voting is still active");
        
        euint64 encryptedVoteCount = voteOptions[_optionId].encryptedVotes;
        emit ResultRevealed(voteOptions[_optionId].name, encryptedVoteCount);
        return encryptedVoteCount;
    }
    
    /**
     * @dev 授权查看者
     * @param _viewer 查看者地址
     */
    function authorizeViewer(address _viewer) public onlyOwner {
        require(_viewer != address(0), "ConfidentialVoting: Invalid viewer address");
        require(!authorizedViewers[_viewer], "ConfidentialVoting: Viewer already authorized");
        
        authorizedViewers[_viewer] = true;
        emit ViewerAuthorized(_viewer);
    }
    
    /**
     * @dev 撤销查看者权限
     * @param _viewer 查看者地址
     */
    function revokeViewer(address _viewer) public onlyOwner {
        require(_viewer != address(0), "ConfidentialVoting: Invalid viewer address");
        require(authorizedViewers[_viewer], "ConfidentialVoting: Viewer not authorized");
        require(_viewer != owner, "ConfidentialVoting: Cannot revoke owner");
        
        authorizedViewers[_viewer] = false;
        emit ViewerRevoked(_viewer);
    }
    
    /**
     * @dev 获取投票选项数量
     */
    function getVoteOptionsCount() public view returns (uint256) {
        return voteOptions.length;
    }
    
    /**
     * @dev 获取投票选项信息
     * @param _optionId 选项ID
     */
    function getVoteOption(uint256 _optionId) public view returns (string memory, bool) {
        require(_optionId < voteOptions.length, "ConfidentialVoting: Invalid option");
        return (voteOptions[_optionId].name, voteOptions[_optionId].isActive);
    }
    
    /**
     * @dev 检查投票者是否已投票
     * @param _voter 投票者地址
     */
    function hasVoted(address _voter) public view returns (bool) {
        return voters[_voter].hasVoted;
    }
    
    /**
     * @dev 获取投票状态
     */
    function getVotingStatus() public view returns (bool, uint256, uint256) {
        return (votingActive, votingStartTime, votingEndTime);
    }
    
    /**
     * @dev 检查地址是否为授权查看者
     * @param _viewer 查看者地址
     */
    function isAuthorizedViewer(address _viewer) public view returns (bool) {
        return _viewer == owner || authorizedViewers[_viewer];
    }
    
    /**
     * @dev 获取注册的投票者总数
     */
    function getTotalVoters() public view returns (uint256) {
        return totalVoters;
    }
} 
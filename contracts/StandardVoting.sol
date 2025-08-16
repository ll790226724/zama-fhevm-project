// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title StandardVoting
 * @dev 标准投票智能合约 - 适用于以太坊主网/测试网
 * 注意：这个版本不使用FHEVM，投票数据是公开的
 */
contract StandardVoting {
    
    // 投票选项结构
    struct VoteOption {
        string name;
        uint256 votes; // 公开的投票数量
        bool isActive;
    }
    
    // 投票者结构
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedOption;
    }
    
    address public owner;
    bool public votingActive;
    uint256 public votingStartTime;
    uint256 public votingEndTime;
    uint256 public totalVoters;
    
    mapping(address => Voter) public voters;
    mapping(address => bool) public authorizedViewers;
    
    VoteOption[] public voteOptions;
    
    // 事件
    event VoterRegistered(address indexed voter);
    event VoteOptionAdded(uint256 indexed optionId, string name);
    event VotingStarted(uint256 startTime, uint256 duration);
    event VotingEnded(uint256 endTime);
    event VoteCast(address indexed voter, uint256 indexed optionId);
    event ViewerAuthorized(address indexed viewer);
    event ViewerRevoked(address indexed viewer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "StandardVoting: Only owner can call this function");
        _;
    }
    
    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "StandardVoting: Only registered voters can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedViewers[msg.sender], 
                "StandardVoting: Only authorized viewers can call this function");
        _;
    }
    
    modifier votingNotActive() {
        require(!votingActive, "StandardVoting: Voting is currently active");
        _;
    }
    
    modifier votingIsActive() {
        require(votingActive, "StandardVoting: Voting is not active");
        require(block.timestamp <= votingEndTime, "StandardVoting: Voting period has ended");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        votingActive = false;
        authorizedViewers[msg.sender] = true; // Owner is default authorized
    }
    
    // 注册单个投票者
    function registerVoter(address _voter) public onlyOwner votingNotActive {
        require(_voter != address(0), "StandardVoting: Invalid voter address");
        require(!voters[_voter].isRegistered, "StandardVoting: Voter already registered");
        
        voters[_voter].isRegistered = true;
        totalVoters++;
        
        emit VoterRegistered(_voter);
    }
    
    // 批量注册投票者
    function registerVoters(address[] memory _voters) public onlyOwner votingNotActive {
        for (uint256 i = 0; i < _voters.length; i++) {
            if (_voters[i] != address(0) && !voters[_voters[i]].isRegistered) {
                voters[_voters[i]].isRegistered = true;
                totalVoters++;
                emit VoterRegistered(_voters[i]);
            }
        }
    }
    
    // 添加投票选项
    function addVoteOption(string memory _name) public onlyOwner votingNotActive {
        require(bytes(_name).length > 0, "StandardVoting: Option name cannot be empty");
        
        voteOptions.push(VoteOption({
            name: _name,
            votes: 0,
            isActive: true
        }));
        
        emit VoteOptionAdded(voteOptions.length - 1, _name);
    }
    
    // 开始投票
    function startVoting(uint256 _duration) public onlyOwner {
        require(!votingActive, "StandardVoting: Voting is already active");
        require(voteOptions.length > 0, "StandardVoting: No vote options available");
        require(_duration > 0, "StandardVoting: Duration must be greater than 0");
        
        votingActive = true;
        votingStartTime = block.timestamp;
        votingEndTime = block.timestamp + _duration;
        
        emit VotingStarted(votingStartTime, _duration);
    }
    
    // 结束投票
    function endVoting() public onlyOwner {
        require(votingActive, "StandardVoting: Voting is not active");
        
        votingActive = false;
        votingEndTime = block.timestamp;
        
        emit VotingEnded(votingEndTime);
    }
    
    // 投票
    function vote(uint256 _optionId) public onlyRegisteredVoter votingIsActive {
        require(!voters[msg.sender].hasVoted, "StandardVoting: Already voted");
        require(_optionId < voteOptions.length, "StandardVoting: Invalid option ID");
        require(voteOptions[_optionId].isActive, "StandardVoting: Option is not active");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedOption = _optionId;
        
        voteOptions[_optionId].votes++;
        
        emit VoteCast(msg.sender, _optionId);
    }
    
    // 授权查看者
    function authorizeViewer(address _viewer) public onlyOwner {
        require(_viewer != address(0), "StandardVoting: Invalid viewer address");
        require(!authorizedViewers[_viewer], "StandardVoting: Viewer already authorized");
        
        authorizedViewers[_viewer] = true;
        emit ViewerAuthorized(_viewer);
    }
    
    // 撤销查看者权限
    function revokeViewer(address _viewer) public onlyOwner {
        require(_viewer != address(0), "StandardVoting: Invalid viewer address");
        require(authorizedViewers[_viewer], "StandardVoting: Viewer not authorized");
        require(_viewer != owner, "StandardVoting: Cannot revoke owner");
        
        authorizedViewers[_viewer] = false;
        emit ViewerRevoked(_viewer);
    }
    
    // 查看函数
    function getVotingStatus() public view returns (bool active, uint256 startTime, uint256 endTime) {
        return (votingActive, votingStartTime, votingEndTime);
    }
    
    function getVoteOptionsCount() public view returns (uint256) {
        return voteOptions.length;
    }
    
    function getVoteOption(uint256 _optionId) public view returns (string memory name, bool isActive) {
        require(_optionId < voteOptions.length, "StandardVoting: Invalid option ID");
        VoteOption memory option = voteOptions[_optionId];
        return (option.name, option.isActive);
    }
    
    function getVoteResult(uint256 _optionId) public view onlyAuthorized returns (uint256) {
        require(_optionId < voteOptions.length, "StandardVoting: Invalid option ID");
        return voteOptions[_optionId].votes;
    }
    
    function getAllResults() public view onlyAuthorized returns (uint256[] memory) {
        uint256[] memory results = new uint256[](voteOptions.length);
        for (uint256 i = 0; i < voteOptions.length; i++) {
            results[i] = voteOptions[i].votes;
        }
        return results;
    }
    
    function getTotalVoters() public view returns (uint256) {
        return totalVoters;
    }
    
    function hasVoted(address _voter) public view returns (bool) {
        return voters[_voter].hasVoted;
    }
    
    function getVoterInfo(address _voter) public view returns (bool isRegistered, bool _hasVoted, uint256 votedOption) {
        Voter memory voter = voters[_voter];
        return (voter.isRegistered, voter.hasVoted, voter.votedOption);
    }
    
    function isAuthorizedViewer(address _viewer) public view returns (bool) {
        return _viewer == owner || authorizedViewers[_viewer];
    }
} 
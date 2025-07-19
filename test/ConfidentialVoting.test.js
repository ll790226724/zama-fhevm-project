const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConfidentialVoting", function () {
  let ConfidentialVoting;
  let confidentialVoting;
  let owner;
  let voter1;
  let voter2;
  let voter3;
  let unauthorized;

  beforeEach(async function () {
    // 获取签名者
    [owner, voter1, voter2, voter3, unauthorized] = await ethers.getSigners();
    
    // 部署合约
    ConfidentialVoting = await ethers.getContractFactory("ConfidentialVoting");
    confidentialVoting = await ConfidentialVoting.deploy();
    await confidentialVoting.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置合约所有者", async function () {
      expect(await confidentialVoting.owner()).to.equal(await owner.getAddress());
    });

    it("初始状态应该正确", async function () {
      expect(await confidentialVoting.votingActive()).to.be.false;
      expect(await confidentialVoting.totalVoters()).to.equal(0);
      expect(await confidentialVoting.getVoteOptionsCount()).to.equal(0);
    });

    it("所有者应该默认有查看权限", async function () {
      expect(await confidentialVoting.isAuthorizedViewer(await owner.getAddress())).to.be.true;
    });
  });

  describe("投票者管理", function () {
    it("所有者应该能够注册投票者", async function () {
      await expect(confidentialVoting.registerVoter(await voter1.getAddress()))
        .to.emit(confidentialVoting, "VoterRegistered")
        .withArgs(await voter1.getAddress());
      
      expect(await confidentialVoting.totalVoters()).to.equal(1);
      expect(await confidentialVoting.voters(await voter1.getAddress())).to.deep.equal([
        false, // hasVoted
        0,     // votedOption
        true   // isRegistered
      ]);
    });

    it("应该能够批量注册投票者", async function () {
      const voters = [await voter1.getAddress(), await voter2.getAddress(), await voter3.getAddress()];
      
      await expect(confidentialVoting.registerVoters(voters))
        .to.emit(confidentialVoting, "VoterRegistered")
        .withArgs(await voter1.getAddress());
      
      expect(await confidentialVoting.totalVoters()).to.equal(3);
    });

    it("非所有者不能注册投票者", async function () {
      await expect(
        confidentialVoting.connect(voter1).registerVoter(await voter2.getAddress())
      ).to.be.revertedWith("ConfidentialVoting: Only owner can call this function");
    });

    it("不能注册零地址", async function () {
      await expect(
        confidentialVoting.registerVoter(ethers.ZeroAddress)
      ).to.be.revertedWith("ConfidentialVoting: Invalid voter address");
    });

    it("不能重复注册同一投票者", async function () {
      await confidentialVoting.registerVoter(await voter1.getAddress());
      await expect(
        confidentialVoting.registerVoter(await voter1.getAddress())
      ).to.be.revertedWith("ConfidentialVoting: Voter already registered");
    });
  });

  describe("投票选项管理", function () {
    it("所有者应该能够添加投票选项", async function () {
      await expect(confidentialVoting.addVoteOption("选项A"))
        .to.emit(confidentialVoting, "VoteOptionAdded")
        .withArgs("选项A", 0);
      
      expect(await confidentialVoting.getVoteOptionsCount()).to.equal(1);
      
      const [name, isActive] = await confidentialVoting.getVoteOption(0);
      expect(name).to.equal("选项A");
      expect(isActive).to.be.true;
    });

    it("非所有者不能添加投票选项", async function () {
      await expect(
        confidentialVoting.connect(voter1).addVoteOption("选项A")
      ).to.be.revertedWith("ConfidentialVoting: Only owner can call this function");
    });

    it("不能添加空名称的选项", async function () {
      await expect(
        confidentialVoting.addVoteOption("")
      ).to.be.revertedWith("ConfidentialVoting: Option name cannot be empty");
    });
  });

  describe("投票流程", function () {
    beforeEach(async function () {
      // 设置投票环境
      await confidentialVoting.registerVoter(await voter1.getAddress());
      await confidentialVoting.registerVoter(await voter2.getAddress());
      await confidentialVoting.registerVoter(await voter3.getAddress());
      await confidentialVoting.addVoteOption("选项A");
      await confidentialVoting.addVoteOption("选项B");
    });

    it("所有者应该能够开始投票", async function () {
      const duration = 3600; // 1小时
      await expect(confidentialVoting.startVoting(duration))
        .to.emit(confidentialVoting, "VotingStarted");
      
      expect(await confidentialVoting.votingActive()).to.be.true;
      
      const [active, startTime, endTime] = await confidentialVoting.getVotingStatus();
      expect(active).to.be.true;
      expect(endTime).to.equal(startTime + duration);
    });

    it("非所有者不能开始投票", async function () {
      await expect(
        confidentialVoting.connect(voter1).startVoting(3600)
      ).to.be.revertedWith("ConfidentialVoting: Only owner can call this function");
    });

    it("没有选项时不能开始投票", async function () {
      const newContract = await ConfidentialVoting.deploy();
      await expect(
        newContract.startVoting(3600)
      ).to.be.revertedWith("ConfidentialVoting: No vote options available");
    });

    it("投票进行中不能添加选项", async function () {
      await confidentialVoting.startVoting(3600);
      await expect(
        confidentialVoting.addVoteOption("选项C")
      ).to.be.revertedWith("ConfidentialVoting: Voting is currently active");
    });

    it("注册的投票者应该能够投票", async function () {
      await confidentialVoting.startVoting(3600);
      
      await expect(confidentialVoting.connect(voter1).vote(0))
        .to.emit(confidentialVoting, "VoteCast")
        .withArgs(await voter1.getAddress(), 0);
      
      expect(await confidentialVoting.hasVoted(await voter1.getAddress())).to.be.true;
    });

    it("未注册的投票者不能投票", async function () {
      await confidentialVoting.startVoting(3600);
      await expect(
        confidentialVoting.connect(unauthorized).vote(0)
      ).to.be.revertedWith("ConfidentialVoting: Voter not registered");
    });

    it("投票者不能重复投票", async function () {
      await confidentialVoting.startVoting(3600);
      await confidentialVoting.connect(voter1).vote(0);
      
      await expect(
        confidentialVoting.connect(voter1).vote(1)
      ).to.be.revertedWith("ConfidentialVoting: Already voted");
    });

    it("不能投票给无效选项", async function () {
      await confidentialVoting.startVoting(3600);
      await expect(
        confidentialVoting.connect(voter1).vote(999)
      ).to.be.revertedWith("ConfidentialVoting: Invalid option");
    });

    it("所有者应该能够结束投票", async function () {
      await confidentialVoting.startVoting(3600);
      await expect(confidentialVoting.endVoting())
        .to.emit(confidentialVoting, "VotingEnded");
      
      expect(await confidentialVoting.votingActive()).to.be.false;
    });
  });

  describe("访问控制", function () {
    beforeEach(async function () {
      await confidentialVoting.registerVoter(await voter1.getAddress());
      await confidentialVoting.addVoteOption("选项A");
      await confidentialVoting.startVoting(3600);
      await confidentialVoting.connect(voter1).vote(0);
      await confidentialVoting.endVoting();
    });

    it("所有者应该能够查看投票结果", async function () {
      const result = await confidentialVoting.getVoteResult(0);
      expect(result).to.not.equal(0); // 加密结果不为0
    });

    it("授权查看者应该能够查看投票结果", async function () {
      await confidentialVoting.authorizeViewer(await voter2.getAddress());
      const result = await confidentialVoting.connect(voter2).getVoteResult(0);
      expect(result).to.not.equal(0);
    });

    it("未授权用户不能查看投票结果", async function () {
      await expect(
        confidentialVoting.connect(unauthorized).getVoteResult(0)
      ).to.be.revertedWith("ConfidentialVoting: Only authorized viewers can call this function");
    });

    it("所有者应该能够授权查看者", async function () {
      await expect(confidentialVoting.authorizeViewer(await voter2.getAddress()))
        .to.emit(confidentialVoting, "ViewerAuthorized")
        .withArgs(await voter2.getAddress());
      
      expect(await confidentialVoting.isAuthorizedViewer(await voter2.getAddress())).to.be.true;
    });

    it("所有者应该能够撤销查看者权限", async function () {
      await confidentialVoting.authorizeViewer(await voter2.getAddress());
      await expect(confidentialVoting.revokeViewer(await voter2.getAddress()))
        .to.emit(confidentialVoting, "ViewerRevoked")
        .withArgs(await voter2.getAddress());
      
      expect(await confidentialVoting.isAuthorizedViewer(await voter2.getAddress())).to.be.false;
    });

    it("不能撤销所有者权限", async function () {
      await expect(
        confidentialVoting.revokeViewer(await owner.getAddress())
      ).to.be.revertedWith("ConfidentialVoting: Cannot revoke owner");
    });
  });

  describe("查询功能", function () {
    beforeEach(async function () {
      await confidentialVoting.registerVoter(await voter1.getAddress());
      await confidentialVoting.registerVoter(await voter2.getAddress());
      await confidentialVoting.addVoteOption("选项A");
      await confidentialVoting.addVoteOption("选项B");
    });

    it("应该正确返回投票者总数", async function () {
      expect(await confidentialVoting.getTotalVoters()).to.equal(2);
    });

    it("应该正确返回投票选项数量", async function () {
      expect(await confidentialVoting.getVoteOptionsCount()).to.equal(2);
    });

    it("应该正确检查投票状态", async function () {
      const [active, startTime, endTime] = await confidentialVoting.getVotingStatus();
      expect(active).to.be.false;
      expect(startTime).to.equal(0);
      expect(endTime).to.equal(0);
    });

    it("应该正确检查投票者是否已投票", async function () {
      expect(await confidentialVoting.hasVoted(await voter1.getAddress())).to.be.false;
    });
  });

  describe("错误处理", function () {
    it("应该正确处理无效的选项ID", async function () {
      await expect(
        confidentialVoting.getVoteOption(999)
      ).to.be.revertedWith("ConfidentialVoting: Invalid option");
    });

    it("投票进行中不能查看结果", async function () {
      await confidentialVoting.registerVoter(await voter1.getAddress());
      await confidentialVoting.addVoteOption("选项A");
      await confidentialVoting.startVoting(3600);
      
      await expect(
        confidentialVoting.getVoteResult(0)
      ).to.be.revertedWith("ConfidentialVoting: Voting is still active");
    });
  });
}); 
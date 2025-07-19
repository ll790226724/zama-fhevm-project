const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConfidentialVoting - Basic Functions", function () {
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

  describe("基础功能测试", function () {
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
    });

    it("应该能够批量注册投票者", async function () {
      const voters = [await voter1.getAddress(), await voter2.getAddress(), await voter3.getAddress()];
      
      await expect(confidentialVoting.registerVoters(voters))
        .to.emit(confidentialVoting, "VoterRegistered");
      
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

  describe("访问控制", function () {
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

    it("非所有者不能授权查看者", async function () {
      await expect(
        confidentialVoting.connect(voter1).authorizeViewer(await voter2.getAddress())
      ).to.be.revertedWith("ConfidentialVoting: Only owner can call this function");
    });
  });

  describe("查询功能", function () {
    beforeEach(async function () {
      await confidentialVoting.registerVoter(await voter1.getAddress());
      await confidentialVoting.registerVoter(await voter2.getAddress());
    });

    it("应该正确返回投票者总数", async function () {
      expect(await confidentialVoting.getTotalVoters()).to.equal(2);
    });

    it("应该正确检查投票者是否已投票", async function () {
      expect(await confidentialVoting.hasVoted(await voter1.getAddress())).to.be.false;
    });

    it("应该正确检查投票状态", async function () {
      const [active, startTime, endTime] = await confidentialVoting.getVotingStatus();
      expect(active).to.be.false;
      expect(startTime).to.equal(0);
      expect(endTime).to.equal(0);
    });
  });

  describe("错误处理", function () {
    it("应该正确处理无效的选项ID", async function () {
      await expect(
        confidentialVoting.getVoteOption(999)
      ).to.be.revertedWith("ConfidentialVoting: Invalid option");
    });

    it("非所有者不能调用所有者函数", async function () {
      await expect(
        confidentialVoting.connect(voter1).endVoting()
      ).to.be.revertedWith("ConfidentialVoting: Only owner can call this function");
    });
  });

  describe("合约部署验证", function () {
    it("合约应该成功部署", async function () {
      expect(confidentialVoting).to.not.be.undefined;
      expect(await confidentialVoting.owner()).to.equal(await owner.getAddress());
    });

    it("合约应该支持FHEVM功能", async function () {
      // 验证合约包含FHE相关函数
      const contractInterface = confidentialVoting.interface;
      expect(contractInterface.hasFunction('vote')).to.be.true;
      expect(contractInterface.hasFunction('getVoteResult')).to.be.true;
    });
  });
}); 
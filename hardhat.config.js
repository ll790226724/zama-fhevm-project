require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      allowUnlimitedContractSize: true,
    },
    sepolia: {
      url: "https://zama-sepolia.drpc.org",
      chainId: 8009,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 120000,
      gas: 3000000,
      gasPrice: 20000000000,
      allowUnlimitedContractSize: true,
    },
    alchemy: {
      url: "https://eth-sepolia.g.alchemy.com/v2/ilcfO47WJ1EYbxU-iuB3A",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 120000,
      gas: 3000000,
      allowUnlimitedContractSize: true,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
}; 
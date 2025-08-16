# 🔐 FHEVM Confidential Voting System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFC107.svg)](https://hardhat.org/)
[![FHEVM](https://img.shields.io/badge/Powered%20by-FHEVM-00D4AA.svg)](https://docs.fhevm.io/)

A confidential voting system based on FHEVM (Fully Homomorphic Encryption Virtual Machine), implementing an end-to-end encrypted voting solution.

## 🌟 Features

- 🔐 **Fully Homomorphic Encryption**: Vote data is encrypted throughout the process, protecting privacy
- 🎨 **Modern UI**: Responsive design with smooth animations
- 🔒 **Access Control**: Role-based access management
- 📱 **Cross-platform**: Supports desktop and mobile devices
- ⚡ **Real-time Updates**: Dynamic status synchronization
- 🚀 **Easy Deployment**: Complete deployment scripts and documentation

## 📋 Project Structure

```
zama-fhevm-project/
├── contracts/                 # Smart contracts
│   ├── ConfidentialVoting.sol # FHEVM confidential voting contract
│   └── StandardVoting.sol     # Standard voting contract (for testing)
├── scripts/                   # Deployment and utility scripts
│   ├── deploy.js             # Main deployment script
│   ├── deploy-sepolia.js     # Ethereum Sepolia deployment
│   ├── test-contract.js      # Contract testing script
│   └── test-network.js       # Network connectivity test
├── frontend/                  # Frontend application
│   ├── index.html            # Main HTML file
│   ├── app.js               # Application logic
│   ├── styles.css           # Styling
│   └── server.js            # Local development server
├── test/                     # Test files
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Project dependencies
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or other Web3 wallet
- Test ETH for Sepolia network

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zama-fhevm-project.git
   cd zama-fhevm-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env file and add your private key
   ```

4. **Get test ETH**
   - Visit [SepoliaFaucet.com](https://sepoliafaucet.com/)
   - Or [Chainlink Faucets](https://faucets.chain.link/sepolia)

### Deployment

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Deploy to Sepolia**
   ```bash
   npm run deploy
   ```

3. **Start frontend**
   ```bash
   npm start
   ```

4. **Open browser**
   Navigate to `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URL (Ethereum Sepolia)
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# Network configuration
NETWORK=sepolia

# Gas settings (optional)
GAS_LIMIT=3000000
GAS_PRICE=20000000000
```

### Network Configuration

The project supports multiple networks:

- **Ethereum Sepolia** (recommended): Chain ID 11155111
- **Zama Testnet**: Chain ID 8009 (for FHEVM features)
- **Local Hardhat**: Chain ID 31337

## 📱 Usage

### For Administrators

1. **Connect Wallet**: Connect your MetaMask wallet
2. **Register Voters**: Add voter addresses to the system
3. **Add Vote Options**: Create voting choices
4. **Start Voting**: Begin the voting period
5. **Authorize Viewers**: Grant permission to view results
6. **End Voting**: Close the voting period

### For Voters

1. **Connect Wallet**: Connect your registered wallet
2. **View Options**: See available voting choices
3. **Cast Vote**: Select and submit your vote
4. **Check Status**: Monitor voting progress

### For Viewers

1. **Connect Wallet**: Connect your authorized wallet
2. **View Results**: See voting outcomes and statistics

## 🛠 Development

### Available Scripts

- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy to configured network
- `npm run test` - Run contract tests
- `npm start` - Start frontend development server
- `npm run dev` - Start development server (alias)

### Testing

Run the test suite:

```bash
npm test
```

Test specific functionality:

```bash
# Test network connectivity
node test-network.js

# Test contract deployment
node test-contract.js

# Verify project configuration
node verify-zama-config.js
```

## 🏗 Architecture

### Smart Contracts

- **StandardVoting.sol**: Main voting contract with role-based access control
- Support for voter registration, vote options, and secure result viewing
- Built-in permission system for admin and viewer roles

### Frontend

- **Modern Web3 Integration**: Ethers.js v5 for blockchain interaction
- **Responsive Design**: Mobile-first approach with CSS Grid/Flexbox
- **Real-time Updates**: Dynamic status updates and error handling
- **Multi-wallet Support**: MetaMask, Coinbase Wallet, and others

### Security Features

- **Access Control**: Role-based permissions (Owner, Voter, Viewer)
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Handling**: Detailed error messages and recovery suggestions
- **Network Verification**: Automatic network detection and switching

## 🌐 Deployment Information

### Live Contract

- **Network**: Ethereum Sepolia
- **Contract Address**: `0xe538256B911EDDB2DDA039f0526D0C98823B045D`
- **Explorer**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xe538256B911EDDB2DDA039f0526D0C98823B045D)

### Features

- ✅ Voter registration and management
- ✅ Vote option creation and management
- ✅ Secure voting with time limits
- ✅ Result viewing with authorization
- ✅ Event logging and monitoring

## 🔍 Troubleshooting

### Common Issues

1. **Contract not found**
   - Ensure contract is deployed to the correct network
   - Verify contract address in frontend configuration

2. **Transaction fails**
   - Check wallet has sufficient ETH for gas
   - Ensure you have the required permissions

3. **Network issues**
   - Switch to correct network in MetaMask
   - Check RPC endpoint connectivity

4. **Permission denied**
   - Verify you're using the correct wallet address
   - Check if you're registered as voter/authorized viewer

### Support

For issues and questions:

- Check the [Issues](https://github.com/your-username/zama-fhevm-project/issues) page
- Review the troubleshooting guide above
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) - For FHEVM technology
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [Ethers.js](https://docs.ethers.io/) - Ethereum library
- [MetaMask](https://metamask.io/) - Web3 wallet integration

## 🚀 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📊 Project Status

- ✅ Smart contract development complete
- ✅ Frontend application complete
- ✅ Testing and deployment complete
- ✅ Documentation complete
- 🔄 Ongoing maintenance and improvements

⭐ If this project helps you, please give us a star! 
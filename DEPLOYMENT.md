# Deployment Guide for ChainReCovenant

## Prerequisites

Before deploying, ensure you have:
- Node.js (v16+)
- Hardhat or Foundry
- Test ETH for gas fees
- MetaMask or similar wallet

## Installation

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat project
npx hardhat init
```

## Network Configuration

Edit `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Testnets
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5
    },
    // Mainnets
    ethereum: {
      url: process.env.ETHEREUM_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137
    },
    bsc: {
      url: process.env.BSC_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 56
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

## Environment Setup

Create `.env` file:

```env
# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Private key (DO NOT COMMIT THIS!)
PRIVATE_KEY=your_private_key_here

# Etherscan API for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Deployment Scripts

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying ChainReCovenant...");

  // Deploy main contract
  const ChainReCovenant = await hre.ethers.getContractFactory("ChainReCovenant");
  const covenant = await ChainReCovenant.deploy();
  await covenant.waitForDeployment();
  
  const covenantAddress = await covenant.getAddress();
  console.log("ChainReCovenant deployed to:", covenantAddress);

  // Deploy factory
  const CovenantFactory = await hre.ethers.getContractFactory("ChainReCovenantFactory");
  const factory = await CovenantFactory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("CovenantFactory deployed to:", factoryAddress);

  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await covenant.deploymentTransaction().wait(5);
  await factory.deploymentTransaction().wait(5);

  // Verify on Etherscan
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: covenantAddress,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [],
      });
      console.log("Contracts verified!");
    } catch (error) {
      console.log("Verification error:", error);
    }
  }

  return { covenant: covenantAddress, factory: factoryAddress };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## Deployment Commands

### Local Development
```bash
# Start local node
npx hardhat node

# Deploy to local node (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment (Sepolia)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet Deployment
```bash
# CAUTION: Real funds will be used
npx hardhat run scripts/deploy.js --network ethereum
```

## Post-Deployment

1. **Save Contract Addresses**: Keep track of deployed addresses
2. **Verify on Block Explorer**: Ensure verification succeeded
3. **Test Contract**: Create a test agreement to verify functionality
4. **Update Frontend**: Update frontend with new contract addresses
5. **Monitor Events**: Set up event listeners for contract monitoring

## Gas Estimates

Approximate gas costs (at 50 gwei):

| Operation | Gas Used | Cost (ETH) |
|-----------|----------|------------|
| Deploy Contract | ~4,500,000 | ~0.225 |
| Create Agreement | ~300,000 | ~0.015 |
| Sign Agreement | ~100,000 | ~0.005 |
| Add Terms | ~150,000 | ~0.0075 |
| Fulfill Term | ~80,000 | ~0.004 |

## Security Checklist

- [ ] Audit smart contract code
- [ ] Test on testnet thoroughly
- [ ] Verify contract source on Etherscan
- [ ] Test emergency functions
- [ ] Monitor contract after deployment
- [ ] Set up multisig for owner functions
- [ ] Document all deployed addresses
- [ ] Test upgrade paths if needed

## Troubleshooting

### Common Issues

**1. Insufficient Funds**
```
Error: insufficient funds for gas
```
Solution: Ensure wallet has enough ETH for gas fees

**2. Nonce Too Low**
```
Error: nonce has already been used
```
Solution: Reset MetaMask account or adjust nonce manually

**3. Contract Size Too Large**
```
Error: contract code size exceeds limit
```
Solution: Enable optimizer in hardhat.config.js

**4. Verification Failed**
```
Error: contract verification failed
```
Solution: Ensure compiler version matches exactly

## Support

For deployment issues:
- Check Hardhat docs: https://hardhat.org
- Review contract on Etherscan
- Open GitHub issue

---

**Remember**: Always test on testnet before mainnet deployment!


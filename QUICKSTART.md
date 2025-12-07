# Quick Start Guide - ChainReCovenant

Get up and running with ChainReCovenant in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- Git installed
- MetaMask or similar Web3 wallet

## Step 1: Clone Repository (Already Done!)

```bash
cd chainreconvenant
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Hardhat
- Ethers.js
- Testing frameworks
- All required tools

## Step 3: Setup Environment

1. Create a `.env` file in the project root:
```bash
# Create .env file
touch .env  # Linux/Mac
# or just create it manually in Windows
```

2. Add the following to your `.env` file:
```env
# RPC URLs - Get from Infura, Alchemy, or QuickNode
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Private Key (DO NOT SHARE OR COMMIT!)
# Export from MetaMask: Account Details > Export Private Key
PRIVATE_KEY=your_private_key_without_0x_prefix

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Gas reporting
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=false
```

**⚠️ IMPORTANT**: Never commit your `.env` file or share your private key!

## Step 4: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 3 Solidity files successfully
```

## Step 5: Run Tests (Coming Soon)

```bash
npm test
```

## Step 6: Deploy Locally

### Start Local Network

```bash
# Terminal 1
npm run node
```

This starts a local Ethereum node with test accounts.

### Deploy Contract

```bash
# Terminal 2
npm run deploy:localhost
```

You'll see contract addresses printed.

## Step 7: Interact with Contract

### Using Hardhat Console

```bash
npx hardhat console --network localhost
```

Then:

```javascript
// Get contract instance
const ChainReCovenant = await ethers.getContractFactory("ChainReCovenant");
const covenant = await ChainReCovenant.attach("YOUR_CONTRACT_ADDRESS");

// Get signers
const [owner, party1, party2] = await ethers.getSigners();

// Create agreement
const tx = await covenant.createAgreement(
    "Test Agreement",
    "A simple test agreement",
    [party1.address, party2.address],
    ["Party 1", "Party 2"],
    true
);
await tx.wait();

console.log("Agreement created! ID: 1");

// Get agreement details
const agreement = await covenant.getAgreement(1);
console.log("Agreement:", agreement);
```

## Common Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Test with coverage
npm run test:coverage

# Test with gas reporting
npm run test:gas

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to mainnet (careful!)
npm run deploy:mainnet

# Verify contract on Etherscan
npm run verify -- DEPLOYED_ADDRESS

# Clean build artifacts
npm run clean

# Format code
npm run format

# Lint Solidity
npm run lint
```

## Example: Create Your First Agreement

```javascript
const ethers = require("ethers");

// Connect to provider
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = provider.getSigner();

// Connect to contract
const covenant = new ethers.Contract(
    "YOUR_CONTRACT_ADDRESS",
    ChainReCovenantABI,
    signer
);

// Create agreement
const tx = await covenant.createAgreement(
    "Freelance Web Development",
    "Build a website for client",
    ["0xClient...", "0xDeveloper..."],
    ["Client", "Developer"],
    true // auto-enforce
);

const receipt = await tx.wait();
console.log("Agreement created:", receipt);

// Add payment term
await covenant.addTerms(
    1, // agreementId
    [0], // Payment term
    ["Payment for website"],
    [ethers.parseEther("5.0")], // 5 ETH
    [0], // no deadline
    ["0xDeveloper..."] // developer receives payment
);

// Parties sign
await covenant.connect(client).signAgreement(1, {
    value: ethers.parseEther("0.5") // collateral
});

await covenant.connect(developer).signAgreement(1, {
    value: ethers.parseEther("0.5") // collateral
});

// Agreement is now ACTIVE!
```

## Test Networks

### Sepolia Testnet
1. Get Sepolia ETH from faucet:
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/

2. Update `.env` with Sepolia RPC URL

3. Deploy:
   ```bash
   npm run deploy:sepolia
   ```

### Other Testnets
- **Goerli**: Use Goerli faucet
- **Mumbai (Polygon)**: Use Mumbai faucet
- **BSC Testnet**: Use BSC faucet

## Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "Insufficient funds"
Get testnet ETH from faucet or ensure wallet has ETH.

### "Nonce too high"
Reset your MetaMask account:
Settings → Advanced → Reset Account

### "Contract not deployed"
Ensure you deployed first and using correct address.

### "Gas estimation failed"
Check contract function arguments are correct.

## Project Structure

```
chainreconvenant/
├── contract/           # Solidity smart contracts
│   ├── convenant.sol          # Main contract
│   ├── CovenantFactory.sol    # Factory contract
│   └── TestHelper.sol         # Test utilities
├── scripts/           # Deployment scripts
├── test/              # Test files
├── README.md          # Main documentation
├── API.md             # API documentation
├── TESTING.md         # Testing guide
├── DEPLOYMENT.md      # Deployment guide
└── package.json       # NPM configuration
```

## Key Concepts

### Agreement Lifecycle
1. **Create** - Define parties and basic info
2. **Add Terms** - Specify enforceable terms
3. **Sign** - All parties sign (optional collateral)
4. **Activate** - Auto-activates when all signed
5. **Fulfill** - Parties fulfill terms
6. **Complete** - All terms fulfilled
7. **Withdraw** - Parties withdraw collateral

### Term Types
- **Payment (0)** - ETH payment obligations
- **Milestone (1)** - Deliverable milestones
- **Deadline (2)** - Time-based requirements
- **Collateral (3)** - Deposit requirements
- **Penalty (4)** - Breach penalties
- **Condition (5)** - Custom conditions

## Next Steps

1. ✅ Install dependencies
2. ✅ Compile contracts
3. ⏳ Write tests
4. ⏳ Deploy to testnet
5. ⏳ Test on testnet
6. ⏳ Build frontend
7. ⏳ Audit contract
8. ⏳ Deploy to mainnet

## Resources

- **Full Documentation**: README.md
- **API Reference**: API.md
- **Testing Guide**: TESTING.md
- **Deployment Guide**: DEPLOYMENT.md
- **Contributing**: CONTRIBUTING.md

## Support

- GitHub Issues: [Create Issue](https://github.com/Gbangbolaoluwagbemiga/chainreconvenant/issues)
- GitHub Discussions: [Start Discussion](https://github.com/Gbangbolaoluwagbemiga/chainreconvenant/discussions)

## Auto-Push Info

This repository has an auto-push script running that commits and pushes changes every 2 minutes. This ensures all changes are backed up to GitHub automatically.

---

**You're all set! Start building trustless agreements! 🚀**


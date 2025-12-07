# Deploying ChainReCovenant to Base Network

## 🔵 What is Base?

Base is an Ethereum Layer 2 (L2) network built by Coinbase, offering:
- ⚡ Fast transactions
- 💰 Low gas fees (much cheaper than Ethereum mainnet)
- 🔐 Ethereum-level security
- 🌐 Full EVM compatibility

## Prerequisites

### 1. Get ETH on Base Network

**For Testnet (Base Sepolia):**
- Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Or use: https://www.alchemy.com/faucets/base-sepolia

**For Mainnet (Base):**
- Bridge ETH from Ethereum to Base: https://bridge.base.org/
- Or buy directly on Base via Coinbase

### 2. Setup Environment

Copy the template and fill in your details:
```bash
cp env.template .env
```

Then edit `.env` with:
- Your private key (from MetaMask)
- Base RPC URL (public or from Alchemy/Infura)
- BaseScan API key for verification

## Deployment Steps

### Step 1: Install Dependencies (if not done)

```bash
npm install
```

### Step 2: Compile Contracts

```bash
npx hardhat compile
```

### Step 3: Test on Base Sepolia (RECOMMENDED)

Deploy to testnet first:
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

This will:
- Deploy ChainReCovenant contract
- Deploy CovenantFactory contract
- Verify on BaseScan (if API key provided)
- Save deployment info

### Step 4: Deploy to Base Mainnet

Once tested, deploy to mainnet:
```bash
npx hardhat run scripts/deploy.js --network base
```

## Expected Output

```
🚀 Starting ChainReCovenant Deployment...

📡 Network: base
🔗 Chain ID: 8453
👤 Deployer: 0xYourAddress
💰 Balance: X.XX ETH

============================================================

📝 Deploying ChainReCovenant...
✅ ChainReCovenant deployed to: 0xContractAddress1

📝 Deploying CovenantFactory...
✅ CovenantFactory deployed to: 0xContractAddress2

============================================================

⏳ Waiting for block confirmations...

✅ Transactions confirmed!

============================================================

🔍 Verifying contracts on Etherscan...

✅ ChainReCovenant verified!
✅ CovenantFactory verified!

============================================================

🎉 DEPLOYMENT SUCCESSFUL!

📋 Summary:
   ChainReCovenant:   0xContractAddress1
   CovenantFactory:   0xContractAddress2
   Network:           base
   Deployer:          0xYourAddress

============================================================

💾 Deployment info saved to: base-1234567890.json
```

## Gas Cost Estimates (Base Network)

| Operation | Estimated Gas | Approx Cost (at 0.001 Gwei) |
|-----------|---------------|------------------------------|
| Deploy ChainReCovenant | ~4,500,000 | ~0.0045 ETH (~$10-15) |
| Deploy CovenantFactory | ~500,000 | ~0.0005 ETH (~$1-2) |
| **Total Deployment** | ~5,000,000 | **~0.005 ETH (~$11-17)** |

*Note: Base is significantly cheaper than Ethereum mainnet (typically 10-100x cheaper)*

## After Deployment

### 1. Save Contract Addresses

Your deployment info is saved in `deployments/base-{timestamp}.json`

### 2. Verify Contracts on BaseScan

If auto-verification didn't work, manually verify:
```bash
npx hardhat verify --network base CONTRACT_ADDRESS
```

View on BaseScan:
- Mainnet: https://basescan.org/address/YOUR_CONTRACT_ADDRESS
- Testnet: https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS

### 3. Interact with Contracts

Using Hardhat console:
```bash
npx hardhat console --network base
```

Then:
```javascript
const ChainReCovenant = await ethers.getContractFactory("ChainReCovenant");
const covenant = await ChainReCovenant.attach("YOUR_CONTRACT_ADDRESS");

// Create an agreement
const tx = await covenant.createAgreement(
    "My First Agreement",
    "Description",
    [party1Address, party2Address],
    ["Party 1", "Party 2"],
    true
);
await tx.wait();
```

### 4. Update Frontend/Integration

Update your frontend with the deployed contract addresses:
```javascript
const CHAIN_RE_COVENANT_ADDRESS = "0xYourContractAddress";
const COVENANT_FACTORY_ADDRESS = "0xYourFactoryAddress";
const BASE_CHAIN_ID = 8453;
```

## Security Checklist

Before mainnet deployment:

- [ ] Test all functionality on Base Sepolia testnet
- [ ] Verify contract source code on BaseScan
- [ ] Confirm deployer wallet has enough ETH for gas
- [ ] Double-check all contract parameters
- [ ] Test creating and signing agreements on testnet
- [ ] Review deployment script output carefully
- [ ] Save deployment addresses securely
- [ ] Document contract addresses for your team
- [ ] Set up monitoring for deployed contracts
- [ ] Prepare emergency procedures if needed

## Common Issues & Solutions

### Issue: "Insufficient funds for gas"
**Solution:** Ensure your wallet has enough ETH on Base. Bridge more from Ethereum.

### Issue: "Cannot connect to network"
**Solution:** Check your RPC URL in .env. Try using Alchemy or Infura RPC.

### Issue: "Nonce too high"
**Solution:** Reset your MetaMask account or wait a few minutes.

### Issue: "Verification failed"
**Solution:** Wait a few minutes and try manual verification with hardhat verify.

### Issue: "Gas estimation failed"
**Solution:** Increase gas limit in hardhat.config.js or check contract for errors.

## Network Information

### Base Mainnet
- Chain ID: 8453
- Currency: ETH
- RPC URL: https://mainnet.base.org
- Explorer: https://basescan.org
- Bridge: https://bridge.base.org

### Base Sepolia Testnet
- Chain ID: 84532
- Currency: ETH (testnet)
- RPC URL: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.alchemy.com/faucets/base-sepolia

## Add Base to MetaMask

### Mainnet:
- Network Name: Base
- RPC URL: https://mainnet.base.org
- Chain ID: 8453
- Currency Symbol: ETH
- Block Explorer: https://basescan.org

### Testnet:
- Network Name: Base Sepolia
- RPC URL: https://sepolia.base.org
- Chain ID: 84532
- Currency Symbol: ETH
- Block Explorer: https://sepolia.basescan.org

## Support & Resources

- **Base Documentation:** https://docs.base.org/
- **Base Discord:** https://discord.gg/buildonbase
- **BaseScan:** https://basescan.org/
- **Bridge:** https://bridge.base.org/
- **Faucet (Testnet):** https://www.alchemy.com/faucets/base-sepolia

## Next Steps After Deployment

1. ✅ Test contract functions on BaseScan
2. ✅ Create a test agreement
3. ✅ Build frontend integration
4. ✅ Set up The Graph indexing
5. ✅ Monitor contract events
6. ✅ Share contract addresses with your team

---

**Ready to deploy? Run:**
```bash
# Test first!
npx hardhat run scripts/deploy.js --network baseSepolia

# Then deploy to mainnet
npx hardhat run scripts/deploy.js --network base
```

🎉 **Good luck with your deployment!**


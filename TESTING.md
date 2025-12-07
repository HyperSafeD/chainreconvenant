# Testing Guide for ChainReCovenant

## Overview
This guide provides comprehensive testing strategies for the ChainReCovenant smart contract.

## Testing Setup

### Prerequisites
```bash
npm install --save-dev @nomicfoundation/hardhat-chai-matchers chai ethers
```

### Test File Structure
```
test/
  ├── ChainReCovenant.test.js       # Main contract tests
  ├── AgreementLifecycle.test.js    # Agreement lifecycle tests
  ├── TermEnforcement.test.js       # Term enforcement tests
  ├── DisputeResolution.test.js     # Dispute resolution tests
  └── EdgeCases.test.js             # Edge cases and security tests
```

## Sample Test Cases

### 1. Agreement Creation Test

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChainReCovenant - Agreement Creation", function () {
  let covenant;
  let owner, party1, party2;

  beforeEach(async function () {
    [owner, party1, party2] = await ethers.getSigners();
    
    const ChainReCovenant = await ethers.getContractFactory("ChainReCovenant");
    covenant = await ChainReCovenant.deploy();
    await covenant.waitForDeployment();
  });

  it("Should create a new agreement", async function () {
    const tx = await covenant.createAgreement(
      "Test Agreement",
      "A test agreement",
      [party1.address, party2.address],
      ["Party 1", "Party 2"],
      true
    );

    await expect(tx)
      .to.emit(covenant, "AgreementCreated")
      .withArgs(1, owner.address, "Test Agreement");

    const agreement = await covenant.getAgreement(1);
    expect(agreement.title).to.equal("Test Agreement");
    expect(agreement.status).to.equal(0); // Pending
  });

  it("Should reject agreement with less than 2 parties", async function () {
    await expect(
      covenant.createAgreement(
        "Invalid Agreement",
        "Only one party",
        [party1.address],
        ["Party 1"],
        true
      )
    ).to.be.revertedWith("At least 2 parties required");
  });
});
```

### 2. Agreement Signing Test

```javascript
describe("Agreement Signing", function () {
  let agreementId;

  beforeEach(async function () {
    [owner, party1, party2] = await ethers.getSigners();
    
    const ChainReCovenant = await ethers.getContractFactory("ChainReCovenant");
    covenant = await ChainReCovenant.deploy();
    
    // Create agreement
    const tx = await covenant.createAgreement(
      "Service Agreement",
      "Description",
      [party1.address, party2.address],
      ["Client", "Provider"],
      true
    );
    
    agreementId = 1;
  });

  it("Should allow parties to sign", async function () {
    await expect(covenant.connect(party1).signAgreement(agreementId))
      .to.emit(covenant, "PartySigned")
      .withArgs(agreementId, party1.address);
  });

  it("Should activate agreement after all signatures", async function () {
    await covenant.connect(party1).signAgreement(agreementId);
    
    await expect(covenant.connect(party2).signAgreement(agreementId))
      .to.emit(covenant, "AgreementActivated")
      .withArgs(agreementId);

    const agreement = await covenant.getAgreement(agreementId);
    expect(agreement.status).to.equal(1); // Active
  });

  it("Should accept collateral with signature", async function () {
    const collateralAmount = ethers.parseEther("1.0");
    
    await expect(
      covenant.connect(party1).signAgreement(agreementId, { 
        value: collateralAmount 
      })
    )
      .to.emit(covenant, "CollateralDeposited")
      .withArgs(agreementId, party1.address, collateralAmount);
  });
});
```

### 3. Term Fulfillment Test

```javascript
describe("Term Fulfillment", function () {
  let agreementId;

  beforeEach(async function () {
    [owner, party1, party2] = await ethers.getSigners();
    
    const ChainReCovenant = await ethers.getContractFactory("ChainReCovenant");
    covenant = await ChainReCovenant.deploy();
    
    // Create and activate agreement
    await covenant.createAgreement(
      "Service Agreement",
      "Description",
      [party1.address, party2.address],
      ["Client", "Provider"],
      true
    );
    
    agreementId = 1;
    
    // Add payment term
    await covenant.addTerms(
      agreementId,
      [0], // Payment
      ["Service payment"],
      [ethers.parseEther("1.0")],
      [0],
      [party2.address]
    );
    
    // Sign agreement
    await covenant.connect(party1).signAgreement(agreementId);
    await covenant.connect(party2).signAgreement(agreementId);
  });

  it("Should fulfill payment term", async function () {
    const paymentAmount = ethers.parseEther("1.0");
    
    await expect(
      covenant.connect(party1).fulfillTerm(agreementId, 0, { 
        value: paymentAmount 
      })
    )
      .to.emit(covenant, "TermFulfilled")
      .withArgs(agreementId, 0, party1.address);

    const term = await covenant.getTerm(agreementId, 0);
    expect(term.isFulfilled).to.be.true;
  });

  it("Should complete agreement when all terms fulfilled", async function () {
    const paymentAmount = ethers.parseEther("1.0");
    
    await expect(
      covenant.connect(party1).fulfillTerm(agreementId, 0, { 
        value: paymentAmount 
      })
    )
      .to.emit(covenant, "AgreementCompleted")
      .withArgs(agreementId);

    const agreement = await covenant.getAgreement(agreementId);
    expect(agreement.status).to.equal(2); // Completed
  });
});
```

### 4. Breach Detection Test

```javascript
describe("Breach Detection and Enforcement", function () {
  let agreementId;
  let deadline;

  beforeEach(async function () {
    [owner, party1, party2] = await ethers.getSigners();
    
    const ChainReCovenant = await ethers.getContractFactory("ChainReCovenant");
    covenant = await ChainReCovenant.deploy();
    
    // Create agreement
    await covenant.createAgreement(
      "Deadline Agreement",
      "Agreement with deadline",
      [party1.address, party2.address],
      ["Client", "Provider"],
      true // auto-enforce
    );
    
    agreementId = 1;
    
    // Set deadline to 1 hour from now
    const block = await ethers.provider.getBlock('latest');
    deadline = block.timestamp + 3600;
    
    // Add deadline term
    await covenant.addTerms(
      agreementId,
      [2], // Deadline
      ["Project deadline"],
      [0],
      [deadline],
      [party2.address]
    );
    
    // Add penalty term
    await covenant.addTerms(
      agreementId,
      [4], // Penalty
      ["Late penalty"],
      [ethers.parseEther("0.5")],
      [0],
      [owner.address]
    );
    
    // Sign with collateral
    await covenant.connect(party1).signAgreement(agreementId, {
      value: ethers.parseEther("1.0")
    });
    await covenant.connect(party2).signAgreement(agreementId, {
      value: ethers.parseEther("1.0")
    });
  });

  it("Should report breach after deadline", async function () {
    // Fast forward time past deadline
    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine");
    
    await expect(
      covenant.connect(party1).reportBreach(agreementId, 0, "Deadline missed")
    )
      .to.emit(covenant, "AgreementBreached")
      .withArgs(agreementId, 0, "Deadline missed");

    const agreement = await covenant.getAgreement(agreementId);
    expect(agreement.status).to.equal(3); // Breached
  });

  it("Should enforce penalty on breach", async function () {
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine");
    
    const tx = await covenant.connect(party1).reportBreach(
      agreementId, 
      0, 
      "Deadline missed"
    );
    
    await expect(tx).to.emit(covenant, "PenaltyEnforced");
  });
});
```

### 5. Dispute Resolution Test

```javascript
describe("Dispute Resolution", function () {
  let agreementId;

  beforeEach(async function () {
    [owner, party1, party2, arbitrator] = await ethers.getSigners();
    
    const ChainReCovenant = await ethers.getContractFactory("ChainReCovenant");
    covenant = await ChainReCovenant.deploy();
    
    // Create and activate agreement
    await covenant.createAgreement(
      "Disputed Agreement",
      "Agreement with dispute",
      [party1.address, party2.address],
      ["Party 1", "Party 2"],
      false
    );
    
    agreementId = 1;
    
    await covenant.connect(party1).signAgreement(agreementId);
    await covenant.connect(party2).signAgreement(agreementId);
  });

  it("Should allow party to raise dispute", async function () {
    await expect(
      covenant.connect(party1).raiseDispute(
        agreementId,
        "Disagreement on deliverables"
      )
    )
      .to.emit(covenant, "DisputeRaised")
      .withArgs(agreementId, party1.address, "Disagreement on deliverables");

    const disputeCount = await covenant.getDisputeCount(agreementId);
    expect(disputeCount).to.equal(1);
  });

  it("Should allow owner to resolve dispute", async function () {
    // Raise dispute
    await covenant.connect(party1).raiseDispute(
      agreementId,
      "Disagreement"
    );
    
    // Resolve dispute
    await expect(
      covenant.resolveDispute(
        agreementId,
        0,
        "Resolved in favor of party 1"
      )
    )
      .to.emit(covenant, "DisputeResolved")
      .withArgs(agreementId, 0, "Resolved in favor of party 1");
  });

  it("Should prevent non-owner from resolving dispute", async function () {
    await covenant.connect(party1).raiseDispute(agreementId, "Dispute");
    
    await expect(
      covenant.connect(party2).resolveDispute(
        agreementId,
        0,
        "Resolution"
      )
    ).to.be.revertedWith("Only owner can call this");
  });
});
```

### 6. Collateral Management Test

```javascript
describe("Collateral Management", function () {
  let agreementId;

  beforeEach(async function () {
    [owner, party1, party2] = await ethers.getSigners();
    
    const ChainReCovenant = await ethers.getContractFactory("ChainReCovenant");
    covenant = await ChainReCovenant.deploy();
    
    await covenant.createAgreement(
      "Collateral Agreement",
      "Agreement with collateral",
      [party1.address, party2.address],
      ["Party 1", "Party 2"],
      false
    );
    
    agreementId = 1;
  });

  it("Should accept collateral during signing", async function () {
    const collateral = ethers.parseEther("2.0");
    
    await covenant.connect(party1).signAgreement(agreementId, { 
      value: collateral 
    });
    
    const party = await covenant.getParty(agreementId, 0);
    expect(party.depositAmount).to.equal(collateral);
  });

  it("Should allow withdrawal after completion", async function () {
    const collateral = ethers.parseEther("2.0");
    
    // Sign with collateral
    await covenant.connect(party1).signAgreement(agreementId, { 
      value: collateral 
    });
    await covenant.connect(party2).signAgreement(agreementId);
    
    // Complete agreement (cancel for simplicity)
    await covenant.cancelAgreement(agreementId);
    
    // Withdrawal should succeed
    const initialBalance = await ethers.provider.getBalance(party1.address);
    
    const tx = await covenant.connect(party1).withdrawCollateral(agreementId);
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    
    const finalBalance = await ethers.provider.getBalance(party1.address);
    expect(finalBalance).to.be.closeTo(
      initialBalance + collateral - gasUsed,
      ethers.parseEther("0.001") // Account for gas fluctuations
    );
  });

  it("Should prevent double withdrawal", async function () {
    const collateral = ethers.parseEther("1.0");
    
    await covenant.connect(party1).signAgreement(agreementId, { 
      value: collateral 
    });
    await covenant.connect(party2).signAgreement(agreementId);
    
    await covenant.cancelAgreement(agreementId);
    await covenant.connect(party1).withdrawCollateral(agreementId);
    
    await expect(
      covenant.connect(party1).withdrawCollateral(agreementId)
    ).to.be.revertedWith("Already withdrawn");
  });
});
```

## Running Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/ChainReCovenant.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage

# Run tests on specific network
npx hardhat test --network localhost
```

## Test Coverage Goals

Target minimum coverage:
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 95%
- **Lines**: 90%

## Integration Testing

### Test on Local Network

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Run tests
npx hardhat test --network localhost
```

### Test on Testnet (Sepolia)

```javascript
// In test file, add network check
if (network.name === "sepolia") {
  // Run integration tests
}
```

## Performance Testing

Monitor gas usage:
```javascript
it("Should optimize gas for agreement creation", async function () {
  const tx = await covenant.createAgreement(...);
  const receipt = await tx.wait();
  
  console.log("Gas used:", receipt.gasUsed.toString());
  expect(receipt.gasUsed).to.be.lessThan(500000);
});
```

## Security Testing

### Reentrancy Test
```javascript
it("Should prevent reentrancy attacks", async function () {
  // Deploy malicious contract
  // Attempt reentrancy attack
  // Expect revert
});
```

### Access Control Test
```javascript
it("Should enforce access control", async function () {
  await expect(
    covenant.connect(attacker).resolveDispute(1, 0, "Hack")
  ).to.be.revertedWith("Only owner can call this");
});
```

## Continuous Integration

Sample GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx hardhat test
      - run: npx hardhat coverage
```

## Best Practices

1. **Test Independence**: Each test should be independent
2. **Clear Naming**: Use descriptive test names
3. **Setup/Teardown**: Use beforeEach/afterEach properly
4. **Edge Cases**: Test boundary conditions
5. **Gas Optimization**: Monitor gas usage
6. **Error Messages**: Test error messages
7. **Event Emission**: Verify events are emitted
8. **State Changes**: Verify state changes

---

**Remember**: Comprehensive testing is crucial for smart contract security!


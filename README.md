# ChainReCovenant 📜⛓️

**Create and execute legal-style agreements on-chain with automated enforcement of terms**

## Overview

ChainReCovenant is a comprehensive Solidity smart contract that enables parties to create binding, legally-styled agreements on the blockchain with automated term enforcement. This contract provides a trustless framework for multi-party agreements with built-in dispute resolution and penalty enforcement mechanisms.

## Features

### 🔐 Core Functionality

- **Multi-Party Agreements**: Support for 2 or more parties in any agreement
- **Digital Signatures**: On-chain signing mechanism for all parties
- **Collateral Management**: Automated collateral deposits and withdrawals
- **Term Enforcement**: Automated enforcement of agreement terms
- **Breach Detection**: Automatic detection and penalty enforcement for breached terms
- **Dispute Resolution**: Built-in dispute raising and resolution system

### 📋 Agreement Types Supported

1. **Payment Obligations**: Enforce payment terms with automatic verification
2. **Milestone-Based**: Track and verify milestone completion
3. **Deadline Enforcement**: Time-bound obligations with automatic breach detection
4. **Collateral Requirements**: Mandatory deposits for agreement participation
5. **Penalty Clauses**: Automated penalty enforcement on breach
6. **Custom Conditions**: Flexible term definitions

### 🎯 Key Benefits

- ✅ **Trustless**: No intermediary required
- ✅ **Transparent**: All terms visible on-chain
- ✅ **Immutable**: Terms cannot be altered after activation
- ✅ **Automated**: Self-executing agreements
- ✅ **Secure**: Collateral-backed enforcement
- ✅ **Auditable**: Complete history of all actions

## Smart Contract Architecture

### Agreement Lifecycle

```
1. PENDING → Created, awaiting signatures
2. ACTIVE → All parties signed, terms being enforced  
3. COMPLETED → All obligations fulfilled
4. BREACHED → Terms violated
5. CANCELLED → Agreement cancelled before activation
```

### Core Components

#### Agreement Structure
- **Parties**: Multiple participants with signing capabilities
- **Terms**: Flexible term definitions with various types
- **Status**: Lifecycle tracking
- **Collateral**: Deposit and withdrawal management
- **Auto-enforcement**: Optional automated penalty enforcement

#### Term Types
- `Payment`: Payment obligations
- `Milestone`: Milestone completion requirements
- `Deadline`: Time-based deadlines
- `Collateral`: Collateral requirements
- `Penalty`: Penalty clauses for violations
- `Condition`: Custom conditions

## Usage Guide

### Creating an Agreement

```solidity
// 1. Create agreement with parties
uint256 agreementId = createAgreement(
    "Service Agreement",
    "Web development services agreement",
    [address1, address2],
    ["Client", "Developer"],
    true // auto-enforce
);

// 2. Add terms
addTerms(
    agreementId,
    [TermType.Payment, TermType.Deadline],
    ["Payment for services", "Project completion deadline"],
    [1 ether, 0], // values
    [0, deadline_timestamp], // deadlines
    [address1, address2] // enforcers
);

// 3. Parties sign
signAgreement(agreementId); // with collateral: {value: 0.5 ether}
```

### Fulfilling Terms

```solidity
// Fulfill a payment term
fulfillTerm(agreementId, termIndex, {value: 1 ether});

// Fulfill a milestone term
fulfillTerm(agreementId, termIndex);
```

### Handling Breaches

```solidity
// Report a breach
reportBreach(agreementId, termIndex, "Deadline not met");

// Automatic penalty enforcement (if auto-enforce enabled)
// Penalties are automatically deducted from collateral
```

### Dispute Management

```solidity
// Raise a dispute
raiseDispute(agreementId, "Disagreement on milestone completion");

// Resolve dispute (only contract owner/arbitrator)
resolveDispute(agreementId, disputeIndex, "Resolution details");
```

### Collateral Management

```solidity
// Deposit collateral (during signing)
signAgreement(agreementId, {value: 1 ether});

// Withdraw collateral (after completion)
withdrawCollateral(agreementId);
```

## Events

The contract emits comprehensive events for tracking:

- `AgreementCreated`: New agreement created
- `PartySigned`: Party signed the agreement
- `AgreementActivated`: All parties signed, agreement active
- `TermFulfilled`: Term fulfilled by a party
- `AgreementCompleted`: All terms fulfilled
- `AgreementBreached`: Agreement breached
- `CollateralDeposited`: Collateral deposited
- `CollateralWithdrawn`: Collateral withdrawn
- `DisputeRaised`: Dispute raised
- `DisputeResolved`: Dispute resolved
- `PenaltyEnforced`: Penalty enforced

## View Functions

Query agreement data:

```solidity
// Get agreement details
getAgreement(agreementId)

// Get party information
getParty(agreementId, partyIndex)

// Get term details
getTerm(agreementId, termIndex)

// Get user's agreements
getUserAgreements(userAddress)

// Check party status
isPartyToAgreement(agreementId, address)

// Get dispute count
getDisputeCount(agreementId)

// Get total agreements
getTotalAgreements()
```

## Security Features

- ✅ **Access Control**: Only authorized parties can execute functions
- ✅ **Reentrancy Protection**: Safe fund transfers
- ✅ **Input Validation**: Comprehensive parameter checking
- ✅ **State Management**: Proper lifecycle state transitions
- ✅ **Emergency Functions**: Owner can pause in emergencies

## Use Cases

### 1. Service Agreements
- Freelance contracts
- Consulting agreements
- Professional services

### 2. Business Contracts
- Partnership agreements
- Vendor contracts
- Supply agreements

### 3. Real Estate
- Lease agreements
- Purchase agreements
- Property management

### 4. Employment
- Employment contracts
- Non-compete agreements
- Performance-based compensation

### 5. Financial
- Loan agreements
- Investment contracts
- Escrow arrangements

## Development

### Prerequisites
- Solidity ^0.8.20
- Hardhat / Foundry
- Node.js

### Deployment

```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

### Testing

```bash
# Run tests
npx hardhat test

# Run coverage
npx hardhat coverage
```

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

⚠️ **Important**: This smart contract is for educational and demonstration purposes. Always conduct thorough audits and testing before deploying to production. Use at your own risk.

## Contact & Support

For issues, questions, or contributions:
- GitHub Issues: [Create an issue](https://github.com/Gbangbolaoluwagbemiga/chainreconvenant/issues)
- GitHub Discussions: [Start a discussion](https://github.com/Gbangbolaoluwagbemiga/chainreconvenant/discussions)

---

**Built with ❤️ for trustless, automated legal agreements on-chain**


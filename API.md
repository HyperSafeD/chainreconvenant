# ChainReCovenant API Documentation

Complete API reference for the ChainReCovenant smart contract.

## Table of Contents

- [Core Functions](#core-functions)
- [View Functions](#view-functions)
- [Events](#events)
- [Data Structures](#data-structures)
- [Modifiers](#modifiers)
- [Usage Examples](#usage-examples)

---

## Core Functions

### createAgreement

Creates a new agreement with specified parties.

```solidity
function createAgreement(
    string memory _title,
    string memory _description,
    address[] memory _partyAddresses,
    string[] memory _partyNames,
    bool _autoEnforce
) external returns (uint256)
```

**Parameters:**
- `_title` (string): Title of the agreement
- `_description` (string): Detailed description
- `_partyAddresses` (address[]): Array of party wallet addresses
- `_partyNames` (string[]): Array of corresponding party names
- `_autoEnforce` (bool): Enable automatic penalty enforcement

**Returns:**
- `uint256`: The ID of the newly created agreement

**Events Emitted:**
- `AgreementCreated(agreementId, creator, title, timestamp)`

**Requirements:**
- At least 2 parties required
- Array lengths must match
- All addresses must be valid (non-zero)

**Example:**
```javascript
const tx = await covenant.createAgreement(
    "Service Agreement",
    "Web development services",
    ["0x123...", "0x456..."],
    ["Client", "Developer"],
    true
);
const receipt = await tx.wait();
const agreementId = 1; // First agreement
```

---

### addTerms

Add terms to an existing agreement (must be in Pending status).

```solidity
function addTerms(
    uint256 _agreementId,
    TermType[] memory _termTypes,
    string[] memory _descriptions,
    uint256[] memory _values,
    uint256[] memory _deadlines,
    address[] memory _enforcers
) external
```

**Parameters:**
- `_agreementId` (uint256): ID of the agreement
- `_termTypes` (TermType[]): Array of term types (0-5)
- `_descriptions` (string[]): Descriptions of each term
- `_values` (uint256[]): Values in wei for each term
- `_deadlines` (uint256[]): Unix timestamps for deadlines
- `_enforcers` (address[]): Enforcer addresses for each term

**Term Types:**
- `0` - Payment
- `1` - Milestone
- `2` - Deadline
- `3` - Collateral
- `4` - Penalty
- `5` - Condition

**Requirements:**
- Agreement must exist
- Agreement must be in Pending status
- Caller must be agreement creator
- All arrays must have same length

**Example:**
```javascript
await covenant.addTerms(
    agreementId,
    [0, 2, 4], // Payment, Deadline, Penalty
    ["Service payment", "Completion deadline", "Late penalty"],
    [ethers.parseEther("1.0"), 0, ethers.parseEther("0.1")],
    [0, futureTimestamp, 0],
    [client.address, provider.address, client.address]
);
```

---

### signAgreement

Sign an agreement as a party. Agreement activates when all parties sign.

```solidity
function signAgreement(uint256 _agreementId) external payable
```

**Parameters:**
- `_agreementId` (uint256): ID of the agreement to sign

**Payable:**
- Optional collateral can be sent with signature

**Events Emitted:**
- `PartySigned(agreementId, party, timestamp)`
- `CollateralDeposited(agreementId, party, amount, timestamp)` (if collateral sent)
- `AgreementActivated(agreementId, timestamp)` (if all parties signed)

**Requirements:**
- Agreement must exist
- Agreement must be in Pending status
- Caller must be a party to the agreement
- Caller must not have already signed

**Example:**
```javascript
// Sign without collateral
await covenant.connect(party1).signAgreement(agreementId);

// Sign with collateral
await covenant.connect(party2).signAgreement(agreementId, {
    value: ethers.parseEther("0.5")
});
```

---

### fulfillTerm

Mark a term as fulfilled.

```solidity
function fulfillTerm(uint256 _agreementId, uint256 _termIndex) external payable
```

**Parameters:**
- `_agreementId` (uint256): ID of the agreement
- `_termIndex` (uint256): Index of the term to fulfill

**Payable:**
- Required for payment terms (must match term value)

**Events Emitted:**
- `TermFulfilled(agreementId, termIndex, fulfiller, timestamp)`
- `AgreementCompleted(agreementId, timestamp)` (if all terms fulfilled)

**Requirements:**
- Agreement must exist and be active
- Term must not already be fulfilled
- Term must be active
- Caller must be authorized (party or enforcer)
- For payment terms: msg.value >= term.value
- For deadline terms: current time <= deadline

**Example:**
```javascript
// Fulfill payment term
await covenant.connect(client).fulfillTerm(agreementId, 0, {
    value: ethers.parseEther("1.0")
});

// Fulfill milestone term
await covenant.connect(provider).fulfillTerm(agreementId, 1);
```

---

### reportBreach

Report a breach of agreement terms.

```solidity
function reportBreach(
    uint256 _agreementId,
    uint256 _termIndex,
    string memory _reason
) external
```

**Parameters:**
- `_agreementId` (uint256): ID of the agreement
- `_termIndex` (uint256): Index of the breached term
- `_reason` (string): Reason for breach report

**Events Emitted:**
- `AgreementBreached(agreementId, termIndex, reason, timestamp)`
- `PenaltyEnforced(agreementId, violator, amount, timestamp)` (if auto-enforce enabled)

**Requirements:**
- Agreement must exist and be active
- Caller must be a party
- For deadline terms: deadline must have passed

**Example:**
```javascript
await covenant.connect(client).reportBreach(
    agreementId,
    0,
    "Deadline exceeded without delivery"
);
```

---

### raiseDispute

Raise a dispute about the agreement.

```solidity
function raiseDispute(uint256 _agreementId, string memory _reason) external
```

**Parameters:**
- `_agreementId` (uint256): ID of the agreement
- `_reason` (string): Reason for the dispute

**Events Emitted:**
- `DisputeRaised(agreementId, initiator, reason, timestamp)`

**Requirements:**
- Agreement must exist
- Caller must be a party

**Example:**
```javascript
await covenant.connect(party1).raiseDispute(
    agreementId,
    "Disagreement on milestone completion criteria"
);
```

---

### resolveDispute

Resolve a raised dispute (only contract owner).

```solidity
function resolveDispute(
    uint256 _agreementId,
    uint256 _disputeIndex,
    string memory _resolution
) external
```

**Parameters:**
- `_agreementId` (uint256): ID of the agreement
- `_disputeIndex` (uint256): Index of the dispute
- `_resolution` (string): Resolution description

**Events Emitted:**
- `DisputeResolved(agreementId, disputeIndex, resolution, timestamp)`

**Requirements:**
- Caller must be contract owner
- Agreement must exist
- Dispute must exist and not be resolved

**Example:**
```javascript
await covenant.resolveDispute(
    agreementId,
    0,
    "Resolved in favor of Party 1. Party 2 must complete milestone."
);
```

---

### withdrawCollateral

Withdraw deposited collateral after agreement completion.

```solidity
function withdrawCollateral(uint256 _agreementId) external
```

**Parameters:**
- `_agreementId` (uint256): ID of the agreement

**Events Emitted:**
- `CollateralWithdrawn(agreementId, party, amount, timestamp)`

**Requirements:**
- Agreement must exist
- Agreement must be Completed or Cancelled
- Caller must be a party
- Caller must have deposited collateral
- Caller must not have already withdrawn

**Example:**
```javascript
await covenant.connect(party1).withdrawCollateral(agreementId);
```

---

### cancelAgreement

Cancel an agreement before activation.

```solidity
function cancelAgreement(uint256 _agreementId) external
```

**Parameters:**
- `_agreementId` (uint256): ID of the agreement

**Requirements:**
- Agreement must exist
- Agreement must be in Pending status
- Caller must be agreement creator
- Refunds all deposited collateral

**Example:**
```javascript
await covenant.cancelAgreement(agreementId);
```

---

## View Functions

### getAgreement

Get agreement details.

```solidity
function getAgreement(uint256 _agreementId) external view returns (
    uint256 id,
    string memory title,
    string memory description,
    address creator,
    uint256 createdAt,
    uint256 activatedAt,
    AgreementStatus status,
    uint256 totalCollateral,
    bool autoEnforce,
    uint256 partyCount,
    uint256 termCount
)
```

**Example:**
```javascript
const agreement = await covenant.getAgreement(agreementId);
console.log("Title:", agreement.title);
console.log("Status:", agreement.status);
```

---

### getParty

Get party information.

```solidity
function getParty(uint256 _agreementId, uint256 _partyIndex) external view returns (
    address wallet,
    string memory name,
    bool hasSigned,
    uint256 depositAmount,
    bool hasWithdrawn
)
```

**Example:**
```javascript
const party = await covenant.getParty(agreementId, 0);
console.log("Party:", party.name);
console.log("Signed:", party.hasSigned);
```

---

### getTerm

Get term details.

```solidity
function getTerm(uint256 _agreementId, uint256 _termIndex) external view returns (
    TermType termType,
    string memory description,
    uint256 value,
    uint256 deadline,
    address enforcer,
    bool isFulfilled,
    bool isActive
)
```

**Example:**
```javascript
const term = await covenant.getTerm(agreementId, 0);
console.log("Type:", term.termType);
console.log("Fulfilled:", term.isFulfilled);
```

---

### getUserAgreements

Get all agreements for a user.

```solidity
function getUserAgreements(address _user) external view returns (uint256[] memory)
```

**Example:**
```javascript
const agreements = await covenant.getUserAgreements(userAddress);
console.log("User has", agreements.length, "agreements");
```

---

### getDisputeCount

Get number of disputes for an agreement.

```solidity
function getDisputeCount(uint256 _agreementId) external view returns (uint256)
```

---

### getTotalAgreements

Get total number of agreements.

```solidity
function getTotalAgreements() external view returns (uint256)
```

---

### isPartyToAgreement

Check if address is party to agreement.

```solidity
function isPartyToAgreement(uint256 _agreementId, address _address) 
    external view returns (bool)
```

---

## Events

### AgreementCreated
```solidity
event AgreementCreated(
    uint256 indexed agreementId,
    address indexed creator,
    string title,
    uint256 timestamp
)
```

### PartySigned
```solidity
event PartySigned(
    uint256 indexed agreementId,
    address indexed party,
    uint256 timestamp
)
```

### AgreementActivated
```solidity
event AgreementActivated(
    uint256 indexed agreementId,
    uint256 timestamp
)
```

### TermFulfilled
```solidity
event TermFulfilled(
    uint256 indexed agreementId,
    uint256 indexed termIndex,
    address indexed fulfiller,
    uint256 timestamp
)
```

### AgreementCompleted
```solidity
event AgreementCompleted(
    uint256 indexed agreementId,
    uint256 timestamp
)
```

### AgreementBreached
```solidity
event AgreementBreached(
    uint256 indexed agreementId,
    uint256 indexed termIndex,
    string reason,
    uint256 timestamp
)
```

### CollateralDeposited
```solidity
event CollateralDeposited(
    uint256 indexed agreementId,
    address indexed party,
    uint256 amount,
    uint256 timestamp
)
```

### CollateralWithdrawn
```solidity
event CollateralWithdrawn(
    uint256 indexed agreementId,
    address indexed party,
    uint256 amount,
    uint256 timestamp
)
```

### DisputeRaised
```solidity
event DisputeRaised(
    uint256 indexed agreementId,
    address indexed initiator,
    string reason,
    uint256 timestamp
)
```

### DisputeResolved
```solidity
event DisputeResolved(
    uint256 indexed agreementId,
    uint256 disputeIndex,
    string resolution,
    uint256 timestamp
)
```

### PenaltyEnforced
```solidity
event PenaltyEnforced(
    uint256 indexed agreementId,
    address indexed violator,
    uint256 amount,
    uint256 timestamp
)
```

---

## Data Structures

### AgreementStatus (Enum)
```solidity
enum AgreementStatus {
    Pending,      // 0 - Created but not all parties signed
    Active,       // 1 - All parties signed, terms enforced
    Completed,    // 2 - All obligations fulfilled
    Breached,     // 3 - Terms violated
    Cancelled     // 4 - Cancelled before activation
}
```

### TermType (Enum)
```solidity
enum TermType {
    Payment,      // 0 - Payment obligation
    Milestone,    // 1 - Milestone completion
    Deadline,     // 2 - Time-based deadline
    Collateral,   // 3 - Collateral requirement
    Penalty,      // 4 - Penalty clause
    Condition     // 5 - Custom condition
}
```

---

## Modifiers

### onlyOwner
Restricts function to contract owner.

### agreementExists
Validates agreement exists.

### onlyParty
Restricts function to agreement parties.

### agreementActive
Requires agreement to be in Active status.

---

## Usage Examples

### Complete Workflow Example

```javascript
// 1. Create agreement
const tx1 = await covenant.createAgreement(
    "Freelance Contract",
    "Website development agreement",
    [client.address, developer.address],
    ["Client", "Developer"],
    true
);
const agreementId = 1;

// 2. Add terms
await covenant.addTerms(
    agreementId,
    [0, 2, 4], // Payment, Deadline, Penalty
    [
        "Payment for services",
        "Project completion deadline",
        "Late delivery penalty"
    ],
    [
        ethers.parseEther("5.0"),  // 5 ETH payment
        0,
        ethers.parseEther("0.5")   // 0.5 ETH penalty
    ],
    [
        0,
        Date.now() + 30 * 24 * 60 * 60, // 30 days from now
        0
    ],
    [developer.address, developer.address, client.address]
);

// 3. Parties sign (with collateral)
await covenant.connect(client).signAgreement(agreementId, {
    value: ethers.parseEther("1.0")
});
await covenant.connect(developer).signAgreement(agreementId, {
    value: ethers.parseEther("1.0")
});

// 4. Fulfill payment term
await covenant.connect(client).fulfillTerm(agreementId, 0, {
    value: ethers.parseEther("5.0")
});

// 5. Fulfill deadline term
await covenant.connect(developer).fulfillTerm(agreementId, 1);

// 6. Withdraw collateral
await covenant.connect(client).withdrawCollateral(agreementId);
await covenant.connect(developer).withdrawCollateral(agreementId);
```

---

For more examples, see the TESTING.md file.


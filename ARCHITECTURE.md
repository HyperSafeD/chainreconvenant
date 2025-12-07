# ChainReCovenant Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     ChainReCovenant System                       │
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Frontend   │◄────►│ Smart        │◄────►│   Blockchain │ │
│  │  (React/Web3)│      │  Contracts   │      │   (Ethereum) │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│         │                      │                      │         │
│         │                      │                      │         │
│         ▼                      ▼                      ▼         │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │  MetaMask    │      │  Events &    │      │   The Graph  │ │
│  │  Wallet      │      │  Monitoring  │      │   Indexing   │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Smart Contract Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                      ChainReCovenant.sol                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    State Management                          │ │
│  │  • agreements mapping                                        │ │
│  │  • disputes mapping                                          │ │
│  │  • userAgreements mapping                                    │ │
│  │  • agreementCounter                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Core Functions                             │ │
│  │  createAgreement()    │  signAgreement()                     │ │
│  │  addTerms()           │  fulfillTerm()                       │ │
│  │  reportBreach()       │  raiseDispute()                      │ │
│  │  resolveDispute()     │  withdrawCollateral()                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   View Functions                             │ │
│  │  getAgreement()       │  getParty()                          │ │
│  │  getTerm()            │  getUserAgreements()                 │ │
│  │  isPartyToAgreement() │  getTotalAgreements()                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌───────────────────────────────────────────────────────────────────┐
│                  CovenantFactory.sol                              │
│                                                                   │
│  • deployNewCovenant()                                            │
│  • getAllCovenants()                                              │
│  • getUserCovenants()                                             │
└───────────────────────────────────────────────────────────────────┘
```

## Agreement Lifecycle Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  createAgreement()  │
│  (by creator)       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│    PENDING          │
│                     │
│  addTerms()         │◄──── Can add multiple terms
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Parties Sign       │
│  signAgreement()    │◄──── Each party signs
│  (with collateral)  │      (optional collateral)
└──────┬──────────────┘
       │
       ▼
    All signed?
       │
       ├─NO──► Wait for more signatures
       │
       └─YES─┐
             │
             ▼
       ┌─────────────────────┐
       │     ACTIVE          │
       │                     │
       │  Terms enforcement  │
       │  begins             │
       └──────┬──────────────┘
              │
              ▼
         ┌────────────────┐
         │  Term Actions  │
         └────┬───────────┘
              │
        ┌─────┴─────┬──────────┬──────────┐
        │           │          │          │
        ▼           ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │fulfill │ │report  │ │raise   │ │monitor │
    │Term()  │ │Breach()│ │Dispute │ │deadline│
    └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
        │          │          │          │
        │          │          ▼          │
        │          │    ┌──────────┐     │
        │          │    │DISPUTE   │     │
        │          │    │resolveD..│     │
        │          │    └──────────┘     │
        │          │                     │
        │          └──────┬──────────────┘
        │                 │
        ▼                 ▼
    All terms      ┌────────────┐
    fulfilled?     │  BREACHED  │
        │          └─────┬──────┘
        │                │
        ├─NO──► Continue        │
        │                       │
        └─YES─┐                 │
              │                 │
              ▼                 │
       ┌──────────────┐         │
       │  COMPLETED   │◄────────┘
       │  or BREACHED │
       └──────┬───────┘
              │
              ▼
       ┌──────────────────┐
       │ withdrawCollateral│
       │  (by parties)     │
       └──────┬────────────┘
              │
              ▼
         ┌─────────┐
         │   END   │
         └─────────┘
```

## Data Structure Relationships

```
Agreement
├── id: uint256
├── title: string
├── description: string
├── creator: address
├── status: AgreementStatus
├── parties: Party[]
│   ├── Party[0]
│   │   ├── wallet: address
│   │   ├── name: string
│   │   ├── hasSigned: bool
│   │   ├── depositAmount: uint256
│   │   └── hasWithdrawn: bool
│   ├── Party[1]
│   └── ...
├── terms: Term[]
│   ├── Term[0]
│   │   ├── termType: TermType
│   │   ├── description: string
│   │   ├── value: uint256
│   │   ├── deadline: uint256
│   │   ├── enforcer: address
│   │   ├── isFulfilled: bool
│   │   └── isActive: bool
│   ├── Term[1]
│   └── ...
└── totalCollateral: uint256

Dispute[]
├── Dispute[0]
│   ├── agreementId: uint256
│   ├── initiator: address
│   ├── reason: string
│   ├── timestamp: uint256
│   ├── isResolved: bool
│   └── resolution: string
└── ...
```

## Term Types & Use Cases

```
┌─────────────────────────────────────────────────────────────────┐
│                        Term Types                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Payment (0) │    │ Milestone(1) │    │ Deadline (2) │      │
│  │              │    │              │    │              │      │
│  │ ETH transfer │    │ Deliverable  │    │ Time-based   │      │
│  │ required     │    │ completion   │    │ requirement  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │Collateral(3) │    │ Penalty (4)  │    │Condition (5) │      │
│  │              │    │              │    │              │      │
│  │ Security     │    │ Breach       │    │ Custom       │      │
│  │ deposit      │    │ penalty      │    │ condition    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Access Control & Security

```
┌──────────────────────────────────────────────────────────────┐
│                    Access Control                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Owner Only:                                                  │
│  • resolveDispute()                                           │
│  • emergencyPause()                                           │
│                                                               │
│  Agreement Creator Only:                                      │
│  • addTerms() (before activation)                             │
│  • cancelAgreement() (before activation)                      │
│                                                               │
│  Agreement Parties Only:                                      │
│  • signAgreement()                                            │
│  • reportBreach()                                             │
│  • raiseDispute()                                             │
│  • withdrawCollateral()                                       │
│                                                               │
│  Parties or Enforcers:                                        │
│  • fulfillTerm()                                              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Event Flow

```
User Action                Event Emitted              Indexed By
───────────                ──────────────              ──────────

createAgreement()    ──►   AgreementCreated        ──►  The Graph
                          (id, creator, title)

signAgreement()      ──►   PartySigned            ──►  The Graph
                          (id, party)
                          
                     ──►   CollateralDeposited    ──►  The Graph
                          (id, party, amount)

All parties sign     ──►   AgreementActivated     ──►  The Graph
                          (id)

fulfillTerm()        ──►   TermFulfilled          ──►  The Graph
                          (id, termIndex, fulfiller)

All terms fulfilled  ──►   AgreementCompleted     ──►  The Graph
                          (id)

reportBreach()       ──►   AgreementBreached      ──►  The Graph
                          (id, termIndex, reason)
                          
                     ──►   PenaltyEnforced        ──►  The Graph
                          (id, violator, amount)

raiseDispute()       ──►   DisputeRaised          ──►  The Graph
                          (id, initiator, reason)

resolveDispute()     ──►   DisputeResolved        ──►  The Graph
                          (id, disputeIndex)

withdrawCollateral() ──►   CollateralWithdrawn    ──►  The Graph
                          (id, party, amount)
```

## Integration Points

```
┌────────────────────────────────────────────────────────────────┐
│                  Frontend Integration                          │
└────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Web3.js    │    │  Ethers.js   │    │   Wagmi      │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  ChainReCovenant │
                  │  Smart Contract  │
                  └──────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Ethereum    │    │  The Graph   │    │    IPFS      │
│  Network     │    │  Subgraph    │    │  (Docs)      │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Deployment Architecture

```
Development          Testing              Production
───────────          ───────              ──────────

Hardhat Node   ──►   Sepolia Testnet ──► Ethereum Mainnet
(Local)              (Public Testnet)     (Production)
                                          
                     Goerli Testnet  ──► Polygon Mainnet
                     (Public Testnet)     (L2 Option)
                                          
                     Mumbai Testnet  ──► Arbitrum One
                     (Polygon Test)       (L2 Option)
```

---

## File Structure

```
chainreconvenant/
│
├── contract/
│   ├── convenant.sol           # Main contract (700+ lines)
│   ├── CovenantFactory.sol     # Factory pattern
│   └── TestHelper.sol          # Testing utilities
│
├── scripts/
│   └── deploy.js               # Deployment script
│
├── test/
│   ├── ChainReCovenant.test.js
│   ├── AgreementLifecycle.test.js
│   └── ...
│
├── docs/
│   ├── README.md               # Main documentation
│   ├── API.md                  # API reference
│   ├── TESTING.md              # Testing guide
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── ARCHITECTURE.md         # This file
│
└── package.json                # NPM configuration
```

---

*This architecture diagram provides a visual overview of the ChainReCovenant system*


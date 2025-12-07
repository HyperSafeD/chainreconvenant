// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainReCovenant
 * @dev Create and execute legal-style agreements on-chain with automated enforcement
 * @notice This contract enables parties to create binding agreements with automated term enforcement
 */
contract ChainReCovenant {
    
    // ============ State Variables ============
    
    uint256 private agreementCounter;
    address public immutable owner;
    
    // ============ Enums ============
    
    enum AgreementStatus {
        Pending,      // Agreement created but not all parties signed
        Active,       // All parties signed, terms are being enforced
        Completed,    // All obligations fulfilled
        Breached,     // Terms violated
        Cancelled     // Agreement cancelled before activation
    }
    
    enum TermType {
        Payment,           // Payment obligation
        Milestone,         // Milestone completion
        Deadline,          // Time-based deadline
        Collateral,        // Collateral requirement
        Penalty,           // Penalty clause
        Condition          // Custom condition
    }
    
    // ============ Structs ============
    
    struct Party {
        address wallet;
        string name;
        bool hasSigned;
        uint256 depositAmount;
        bool hasWithdrawn;
    }
    
    struct Term {
        TermType termType;
        string description;
        uint256 value;          // Amount in wei for payments/penalties
        uint256 deadline;       // Unix timestamp for deadlines
        address enforcer;       // Who enforces this term
        bool isFulfilled;
        bool isActive;
    }
    
    struct Agreement {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 createdAt;
        uint256 activatedAt;
        AgreementStatus status;
        Party[] parties;
        Term[] terms;
        uint256 totalCollateral;
        bool autoEnforce;
        mapping(address => bool) isParty;
        mapping(uint256 => bool) termFulfilled;
    }
    
    struct Dispute {
        uint256 agreementId;
        address initiator;
        string reason;
        uint256 timestamp;
        bool isResolved;
        string resolution;
    }
    
    // ============ Storage ============
    
    mapping(uint256 => Agreement) public agreements;
    mapping(uint256 => Dispute[]) public disputes;
    mapping(address => uint256[]) public userAgreements;
    
    // ============ Events ============
    
    event AgreementCreated(
        uint256 indexed agreementId,
        address indexed creator,
        string title,
        uint256 timestamp
    );
    
    event PartySigned(
        uint256 indexed agreementId,
        address indexed party,
        uint256 timestamp
    );
    
    event AgreementActivated(
        uint256 indexed agreementId,
        uint256 timestamp
    );
    
    event TermFulfilled(
        uint256 indexed agreementId,
        uint256 indexed termIndex,
        address indexed fulfiller,
        uint256 timestamp
    );
    
    event AgreementCompleted(
        uint256 indexed agreementId,
        uint256 timestamp
    );
    
    event AgreementBreached(
        uint256 indexed agreementId,
        uint256 indexed termIndex,
        string reason,
        uint256 timestamp
    );
    
    event CollateralDeposited(
        uint256 indexed agreementId,
        address indexed party,
        uint256 amount,
        uint256 timestamp
    );
    
    event CollateralWithdrawn(
        uint256 indexed agreementId,
        address indexed party,
        uint256 amount,
        uint256 timestamp
    );
    
    event DisputeRaised(
        uint256 indexed agreementId,
        address indexed initiator,
        string reason,
        uint256 timestamp
    );
    
    event DisputeResolved(
        uint256 indexed agreementId,
        uint256 disputeIndex,
        string resolution,
        uint256 timestamp
    );
    
    event PenaltyEnforced(
        uint256 indexed agreementId,
        address indexed violator,
        uint256 amount,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier agreementExists(uint256 _agreementId) {
        require(_agreementId > 0 && _agreementId <= agreementCounter, "Agreement does not exist");
        _;
    }
    
    modifier onlyParty(uint256 _agreementId) {
        require(agreements[_agreementId].isParty[msg.sender], "Not a party to this agreement");
        _;
    }
    
    modifier agreementActive(uint256 _agreementId) {
        require(agreements[_agreementId].status == AgreementStatus.Active, "Agreement not active");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
        agreementCounter = 0;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Create a new agreement
     * @param _title Title of the agreement
     * @param _description Detailed description
     * @param _partyAddresses Array of party wallet addresses
     * @param _partyNames Array of party names
     * @param _autoEnforce Whether to automatically enforce terms
     * @return agreementId The ID of the created agreement
     */
    function createAgreement(
        string memory _title,
        string memory _description,
        address[] memory _partyAddresses,
        string[] memory _partyNames,
        bool _autoEnforce
    ) external returns (uint256) {
        require(_partyAddresses.length >= 2, "At least 2 parties required");
        require(_partyAddresses.length == _partyNames.length, "Mismatched arrays");
        
        agreementCounter++;
        uint256 newAgreementId = agreementCounter;
        
        Agreement storage newAgreement = agreements[newAgreementId];
        newAgreement.id = newAgreementId;
        newAgreement.title = _title;
        newAgreement.description = _description;
        newAgreement.creator = msg.sender;
        newAgreement.createdAt = block.timestamp;
        newAgreement.status = AgreementStatus.Pending;
        newAgreement.autoEnforce = _autoEnforce;
        
        // Add parties
        for (uint256 i = 0; i < _partyAddresses.length; i++) {
            require(_partyAddresses[i] != address(0), "Invalid party address");
            
            Party memory newParty = Party({
                wallet: _partyAddresses[i],
                name: _partyNames[i],
                hasSigned: false,
                depositAmount: 0,
                hasWithdrawn: false
            });
            
            newAgreement.parties.push(newParty);
            newAgreement.isParty[_partyAddresses[i]] = true;
            userAgreements[_partyAddresses[i]].push(newAgreementId);
        }
        
        emit AgreementCreated(newAgreementId, msg.sender, _title, block.timestamp);
        
        return newAgreementId;
    }
    
    /**
     * @dev Add terms to an agreement
     * @param _agreementId ID of the agreement
     * @param _termTypes Array of term types
     * @param _descriptions Array of term descriptions
     * @param _values Array of values (amounts in wei)
     * @param _deadlines Array of deadlines (unix timestamps)
     * @param _enforcers Array of enforcers (addresses)
     */
    function addTerms(
        uint256 _agreementId,
        TermType[] memory _termTypes,
        string[] memory _descriptions,
        uint256[] memory _values,
        uint256[] memory _deadlines,
        address[] memory _enforcers
    ) external agreementExists(_agreementId) {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.status == AgreementStatus.Pending, "Cannot modify active agreement");
        require(msg.sender == agreement.creator, "Only creator can add terms");
        require(
            _termTypes.length == _descriptions.length &&
            _termTypes.length == _values.length &&
            _termTypes.length == _deadlines.length &&
            _termTypes.length == _enforcers.length,
            "Mismatched arrays"
        );
        
        for (uint256 i = 0; i < _termTypes.length; i++) {
            Term memory newTerm = Term({
                termType: _termTypes[i],
                description: _descriptions[i],
                value: _values[i],
                deadline: _deadlines[i],
                enforcer: _enforcers[i],
                isFulfilled: false,
                isActive: true
            });
            
            agreement.terms.push(newTerm);
        }
    }
    
    /**
     * @dev Sign an agreement as a party
     * @param _agreementId ID of the agreement to sign
     */
    function signAgreement(uint256 _agreementId) 
        external 
        payable
        agreementExists(_agreementId) 
        onlyParty(_agreementId) 
    {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.status == AgreementStatus.Pending, "Agreement not in pending state");
        
        // Find the party and mark as signed
        for (uint256 i = 0; i < agreement.parties.length; i++) {
            if (agreement.parties[i].wallet == msg.sender) {
                require(!agreement.parties[i].hasSigned, "Already signed");
                agreement.parties[i].hasSigned = true;
                
                // Handle collateral deposit if sent
                if (msg.value > 0) {
                    agreement.parties[i].depositAmount = msg.value;
                    agreement.totalCollateral += msg.value;
                    emit CollateralDeposited(_agreementId, msg.sender, msg.value, block.timestamp);
                }
                
                emit PartySigned(_agreementId, msg.sender, block.timestamp);
                break;
            }
        }
        
        // Check if all parties have signed
        bool allSigned = true;
        for (uint256 i = 0; i < agreement.parties.length; i++) {
            if (!agreement.parties[i].hasSigned) {
                allSigned = false;
                break;
            }
        }
        
        // Activate agreement if all parties signed
        if (allSigned) {
            agreement.status = AgreementStatus.Active;
            agreement.activatedAt = block.timestamp;
            emit AgreementActivated(_agreementId, block.timestamp);
        }
    }
    
    /**
     * @dev Fulfill a term in an agreement
     * @param _agreementId ID of the agreement
     * @param _termIndex Index of the term to fulfill
     */
    function fulfillTerm(uint256 _agreementId, uint256 _termIndex)
        external
        payable
        agreementExists(_agreementId)
        agreementActive(_agreementId)
    {
        Agreement storage agreement = agreements[_agreementId];
        require(_termIndex < agreement.terms.length, "Invalid term index");
        
        Term storage term = agreement.terms[_termIndex];
        require(!term.isFulfilled, "Term already fulfilled");
        require(term.isActive, "Term not active");
        
        // Check if caller is authorized
        bool authorized = agreement.isParty[msg.sender] || msg.sender == term.enforcer;
        require(authorized, "Not authorized to fulfill this term");
        
        // Handle payment terms
        if (term.termType == TermType.Payment) {
            require(msg.value >= term.value, "Insufficient payment");
        }
        
        // Check deadline if applicable
        if (term.deadline > 0 && term.termType == TermType.Deadline) {
            require(block.timestamp <= term.deadline, "Deadline passed");
        }
        
        term.isFulfilled = true;
        agreement.termFulfilled[_termIndex] = true;
        
        emit TermFulfilled(_agreementId, _termIndex, msg.sender, block.timestamp);
        
        // Check if all terms are fulfilled
        _checkCompletion(_agreementId);
    }
    
    /**
     * @dev Report a breach of terms
     * @param _agreementId ID of the agreement
     * @param _termIndex Index of the breached term
     * @param _reason Reason for the breach report
     */
    function reportBreach(
        uint256 _agreementId,
        uint256 _termIndex,
        string memory _reason
    ) external agreementExists(_agreementId) onlyParty(_agreementId) {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.status == AgreementStatus.Active, "Agreement not active");
        require(_termIndex < agreement.terms.length, "Invalid term index");
        
        Term storage term = agreement.terms[_termIndex];
        
        // Check if deadline passed for deadline terms
        if (term.termType == TermType.Deadline && term.deadline > 0) {
            require(block.timestamp > term.deadline, "Deadline not passed yet");
        }
        
        agreement.status = AgreementStatus.Breached;
        
        emit AgreementBreached(_agreementId, _termIndex, _reason, block.timestamp);
        
        // Auto-enforce penalties if enabled
        if (agreement.autoEnforce) {
            _enforcePenalties(_agreementId, _termIndex);
        }
    }
    
    /**
     * @dev Raise a dispute
     * @param _agreementId ID of the agreement
     * @param _reason Reason for the dispute
     */
    function raiseDispute(uint256 _agreementId, string memory _reason)
        external
        agreementExists(_agreementId)
        onlyParty(_agreementId)
    {
        Dispute memory newDispute = Dispute({
            agreementId: _agreementId,
            initiator: msg.sender,
            reason: _reason,
            timestamp: block.timestamp,
            isResolved: false,
            resolution: ""
        });
        
        disputes[_agreementId].push(newDispute);
        
        emit DisputeRaised(_agreementId, msg.sender, _reason, block.timestamp);
    }
    
    /**
     * @dev Resolve a dispute (only owner/arbitrator)
     * @param _agreementId ID of the agreement
     * @param _disputeIndex Index of the dispute
     * @param _resolution Resolution description
     */
    function resolveDispute(
        uint256 _agreementId,
        uint256 _disputeIndex,
        string memory _resolution
    ) external onlyOwner agreementExists(_agreementId) {
        require(_disputeIndex < disputes[_agreementId].length, "Invalid dispute index");
        
        Dispute storage dispute = disputes[_agreementId][_disputeIndex];
        require(!dispute.isResolved, "Dispute already resolved");
        
        dispute.isResolved = true;
        dispute.resolution = _resolution;
        
        emit DisputeResolved(_agreementId, _disputeIndex, _resolution, block.timestamp);
    }
    
    /**
     * @dev Withdraw collateral after agreement completion
     * @param _agreementId ID of the agreement
     */
    function withdrawCollateral(uint256 _agreementId)
        external
        agreementExists(_agreementId)
        onlyParty(_agreementId)
    {
        Agreement storage agreement = agreements[_agreementId];
        require(
            agreement.status == AgreementStatus.Completed || 
            agreement.status == AgreementStatus.Cancelled,
            "Agreement not completed or cancelled"
        );
        
        for (uint256 i = 0; i < agreement.parties.length; i++) {
            if (agreement.parties[i].wallet == msg.sender) {
                require(!agreement.parties[i].hasWithdrawn, "Already withdrawn");
                require(agreement.parties[i].depositAmount > 0, "No collateral deposited");
                
                uint256 amount = agreement.parties[i].depositAmount;
                agreement.parties[i].hasWithdrawn = true;
                agreement.parties[i].depositAmount = 0;
                
                (bool success, ) = msg.sender.call{value: amount}("");
                require(success, "Withdrawal failed");
                
                emit CollateralWithdrawn(_agreementId, msg.sender, amount, block.timestamp);
                break;
            }
        }
    }
    
    /**
     * @dev Cancel an agreement (only before activation)
     * @param _agreementId ID of the agreement
     */
    function cancelAgreement(uint256 _agreementId)
        external
        agreementExists(_agreementId)
    {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.status == AgreementStatus.Pending, "Can only cancel pending agreements");
        require(msg.sender == agreement.creator, "Only creator can cancel");
        
        agreement.status = AgreementStatus.Cancelled;
        
        // Refund any deposits
        for (uint256 i = 0; i < agreement.parties.length; i++) {
            if (agreement.parties[i].depositAmount > 0 && !agreement.parties[i].hasWithdrawn) {
                uint256 amount = agreement.parties[i].depositAmount;
                agreement.parties[i].hasWithdrawn = true;
                agreement.parties[i].depositAmount = 0;
                
                (bool success, ) = agreement.parties[i].wallet.call{value: amount}("");
                require(success, "Refund failed");
            }
        }
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Check if all terms are fulfilled and complete agreement
     * @param _agreementId ID of the agreement
     */
    function _checkCompletion(uint256 _agreementId) internal {
        Agreement storage agreement = agreements[_agreementId];
        
        bool allFulfilled = true;
        for (uint256 i = 0; i < agreement.terms.length; i++) {
            if (agreement.terms[i].isActive && !agreement.terms[i].isFulfilled) {
                allFulfilled = false;
                break;
            }
        }
        
        if (allFulfilled) {
            agreement.status = AgreementStatus.Completed;
            emit AgreementCompleted(_agreementId, block.timestamp);
        }
    }
    
    /**
     * @dev Enforce penalties for breached terms
     * @param _agreementId ID of the agreement
     * @param _termIndex Index of the breached term
     */
    function _enforcePenalties(uint256 _agreementId, uint256 _termIndex) internal {
        Agreement storage agreement = agreements[_agreementId];
        
        // Find penalty terms and enforce them
        for (uint256 i = 0; i < agreement.terms.length; i++) {
            if (agreement.terms[i].termType == TermType.Penalty && 
                agreement.terms[i].isActive && 
                !agreement.terms[i].isFulfilled) {
                
                // Deduct from collateral or enforce penalty
                uint256 penaltyAmount = agreement.terms[i].value;
                
                // Simple enforcement: transfer to other parties
                if (penaltyAmount > 0 && agreement.totalCollateral >= penaltyAmount) {
                    agreement.totalCollateral -= penaltyAmount;
                    emit PenaltyEnforced(_agreementId, address(0), penaltyAmount, block.timestamp);
                }
                
                agreement.terms[i].isFulfilled = true;
            }
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get agreement details
     * @param _agreementId ID of the agreement
     */
    function getAgreement(uint256 _agreementId)
        external
        view
        agreementExists(_agreementId)
        returns (
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
    {
        Agreement storage agreement = agreements[_agreementId];
        return (
            agreement.id,
            agreement.title,
            agreement.description,
            agreement.creator,
            agreement.createdAt,
            agreement.activatedAt,
            agreement.status,
            agreement.totalCollateral,
            agreement.autoEnforce,
            agreement.parties.length,
            agreement.terms.length
        );
    }
    
    /**
     * @dev Get party details for an agreement
     * @param _agreementId ID of the agreement
     * @param _partyIndex Index of the party
     */
    function getParty(uint256 _agreementId, uint256 _partyIndex)
        external
        view
        agreementExists(_agreementId)
        returns (
            address wallet,
            string memory name,
            bool hasSigned,
            uint256 depositAmount,
            bool hasWithdrawn
        )
    {
        Agreement storage agreement = agreements[_agreementId];
        require(_partyIndex < agreement.parties.length, "Invalid party index");
        
        Party storage party = agreement.parties[_partyIndex];
        return (
            party.wallet,
            party.name,
            party.hasSigned,
            party.depositAmount,
            party.hasWithdrawn
        );
    }
    
    /**
     * @dev Get term details
     * @param _agreementId ID of the agreement
     * @param _termIndex Index of the term
     */
    function getTerm(uint256 _agreementId, uint256 _termIndex)
        external
        view
        agreementExists(_agreementId)
        returns (
            TermType termType,
            string memory description,
            uint256 value,
            uint256 deadline,
            address enforcer,
            bool isFulfilled,
            bool isActive
        )
    {
        Agreement storage agreement = agreements[_agreementId];
        require(_termIndex < agreement.terms.length, "Invalid term index");
        
        Term storage term = agreement.terms[_termIndex];
        return (
            term.termType,
            term.description,
            term.value,
            term.deadline,
            term.enforcer,
            term.isFulfilled,
            term.isActive
        );
    }
    
    /**
     * @dev Get user's agreements
     * @param _user Address of the user
     */
    function getUserAgreements(address _user) external view returns (uint256[] memory) {
        return userAgreements[_user];
    }
    
    /**
     * @dev Get disputes for an agreement
     * @param _agreementId ID of the agreement
     */
    function getDisputeCount(uint256 _agreementId) external view returns (uint256) {
        return disputes[_agreementId].length;
    }
    
    /**
     * @dev Get total number of agreements
     */
    function getTotalAgreements() external view returns (uint256) {
        return agreementCounter;
    }
    
    /**
     * @dev Check if address is party to agreement
     * @param _agreementId ID of the agreement
     * @param _address Address to check
     */
    function isPartyToAgreement(uint256 _agreementId, address _address)
        external
        view
        agreementExists(_agreementId)
        returns (bool)
    {
        return agreements[_agreementId].isParty[_address];
    }
    
    // ============ Emergency Functions ============
    
    /**
     * @dev Emergency pause (future implementation)
     */
    function emergencyPause() external onlyOwner {
        // Implementation for pausing critical functions
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}


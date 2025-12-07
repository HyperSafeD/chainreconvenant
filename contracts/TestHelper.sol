// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainReCovenantTestHelper
 * @dev Helper contract for testing ChainReCovenant functionality
 */
contract ChainReCovenantTestHelper {
    
    /**
     * @dev Create a simple 2-party service agreement for testing
     * Returns the parameters needed for createAgreement
     */
    function getSimpleServiceAgreementParams(address client, address provider)
        external
        pure
        returns (
            string memory title,
            string memory description,
            address[] memory parties,
            string[] memory names,
            bool autoEnforce
        )
    {
        title = "Web Development Service Agreement";
        description = "Client hires provider for website development";
        
        parties = new address[](2);
        parties[0] = client;
        parties[1] = provider;
        
        names = new string[](2);
        names[0] = "Client";
        names[1] = "Service Provider";
        
        autoEnforce = true;
    }
    
    /**
     * @dev Get payment term parameters
     */
    function getPaymentTermParams(uint256 amount, address enforcer)
        external
        pure
        returns (
            uint8 termType,
            string memory description,
            uint256 value,
            uint256 deadline,
            address enforcerAddress
        )
    {
        termType = 0; // TermType.Payment
        description = "Payment for services rendered";
        value = amount;
        deadline = 0; // No deadline for payment terms
        enforcerAddress = enforcer;
    }
    
    /**
     * @dev Get deadline term parameters
     */
    function getDeadlineTermParams(uint256 deadlineTimestamp, address enforcer)
        external
        pure
        returns (
            uint8 termType,
            string memory description,
            uint256 value,
            uint256 deadline,
            address enforcerAddress
        )
    {
        termType = 2; // TermType.Deadline
        description = "Project completion deadline";
        value = 0;
        deadline = deadlineTimestamp;
        enforcerAddress = enforcer;
    }
    
    /**
     * @dev Get penalty term parameters
     */
    function getPenaltyTermParams(uint256 penaltyAmount, address enforcer)
        external
        pure
        returns (
            uint8 termType,
            string memory description,
            uint256 value,
            uint256 deadline,
            address enforcerAddress
        )
    {
        termType = 4; // TermType.Penalty
        description = "Late delivery penalty";
        value = penaltyAmount;
        deadline = 0;
        enforcerAddress = enforcer;
    }
    
    /**
     * @dev Calculate timestamp for days in the future
     */
    function getFutureTimestamp(uint256 daysFromNow) external view returns (uint256) {
        return block.timestamp + (daysFromNow * 1 days);
    }
    
    /**
     * @dev Calculate timestamp for hours in the future
     */
    function getFutureTimestampHours(uint256 hoursFromNow) external view returns (uint256) {
        return block.timestamp + (hoursFromNow * 1 hours);
    }
    
    /**
     * @dev Check if timestamp has passed
     */
    function hasDeadlinePassed(uint256 deadline) external view returns (bool) {
        return block.timestamp > deadline;
    }
    
    /**
     * @dev Get time remaining until deadline
     */
    function getTimeRemaining(uint256 deadline) external view returns (uint256) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }
}


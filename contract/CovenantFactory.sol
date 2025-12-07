// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./convenant.sol";

/**
 * @title ChainReCovenantFactory
 * @dev Factory contract for deploying and managing multiple ChainReCovenant instances
 */
contract ChainReCovenantFactory {
    
    address[] public deployedCovenants;
    mapping(address => address[]) public userCovenants;
    
    event CovenantDeployed(address indexed covenantAddress, address indexed deployer, uint256 timestamp);
    
    /**
     * @dev Deploy a new ChainReCovenant instance
     * @return The address of the newly deployed covenant
     */
    function deployNewCovenant() external returns (address) {
        ChainReCovenant newCovenant = new ChainReCovenant();
        address covenantAddress = address(newCovenant);
        
        deployedCovenants.push(covenantAddress);
        userCovenants[msg.sender].push(covenantAddress);
        
        emit CovenantDeployed(covenantAddress, msg.sender, block.timestamp);
        
        return covenantAddress;
    }
    
    /**
     * @dev Get all deployed covenants
     */
    function getAllCovenants() external view returns (address[] memory) {
        return deployedCovenants;
    }
    
    /**
     * @dev Get covenants deployed by a specific user
     */
    function getUserCovenants(address user) external view returns (address[] memory) {
        return userCovenants[user];
    }
    
    /**
     * @dev Get total number of deployed covenants
     */
    function getTotalCovenants() external view returns (uint256) {
        return deployedCovenants.length;
    }
}


// SPDX-License-Identifier: MIT
// contracts/mocks/MockERC20.sol
// Mock ERC20 token for testing on Mantle Testnet

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @notice Mock ERC20 token for testing (simulates USDC on testnet)
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_;
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @notice Mint tokens (for testing only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @notice Faucet function - anyone can mint small amounts for testing
     */
    function faucet() external {
        _mint(msg.sender, 10000 * 10**_decimals); // 10,000 tokens
    }
}
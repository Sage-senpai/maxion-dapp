// SPDX-License-Identifier: MIT
// contracts/strategies/RWAStrategy.sol
// FIXED: Updated OpenZeppelin imports to v5.x

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";  // FIXED: New path

/**
 * @title RWAStrategy
 * @notice Mock strategy adapter for RWA yield generation
 */
contract RWAStrategy is Ownable, ReentrancyGuard {
    
    IERC20 public immutable asset;
    address public immutable vault;
    uint256 public totalDeployed;
    uint256 public apy;
    uint256 public lastHarvest;
    string public name;
    string public riskLevel;
    
    event Deposited(uint256 amount);
    event Withdrawn(uint256 amount);
    event YieldGenerated(uint256 amount);
    event APYUpdated(uint256 newAPY);
    
    constructor(
        address _asset,
        address _vault,
        uint256 _apy,
        string memory _name,
        string memory _riskLevel
    ) Ownable(msg.sender) {
        require(_asset != address(0), "Invalid asset");
        require(_vault != address(0), "Invalid vault");
        
        asset = IERC20(_asset);
        vault = _vault;
        apy = _apy;
        name = _name;
        riskLevel = _riskLevel;
        lastHarvest = block.timestamp;
    }
    
    modifier onlyVault() {
        require(msg.sender == vault, "Only vault");
        _;
    }
    
    function deposit(uint256 amount) external onlyVault nonReentrant {
        require(amount > 0, "Zero amount");
        totalDeployed += amount;
        require(asset.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Deposited(amount);
    }
    
    function withdraw(uint256 amount) external onlyVault nonReentrant {
        require(amount > 0, "Zero amount");
        require(amount <= totalDeployed, "Insufficient balance");
        totalDeployed -= amount;
        require(asset.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(amount);
    }
    
    function harvest() external onlyVault nonReentrant returns (uint256 yield) {
        uint256 timeElapsed = block.timestamp - lastHarvest;
        yield = (totalDeployed * apy * timeElapsed) / (365 days * 10000);
        lastHarvest = block.timestamp;
        emit YieldGenerated(yield);
    }
    
    function totalValue() external view returns (uint256) {
        return totalDeployed + _calculatePendingYield();
    }
    
    function pendingYield() external view returns (uint256) {
        return _calculatePendingYield();
    }
    
    function _calculatePendingYield() internal view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastHarvest;
        return (totalDeployed * apy * timeElapsed) / (365 days * 10000);
    }
    
    function setAPY(uint256 newAPY) external onlyOwner {
        require(newAPY <= 5000, "APY too high");
        apy = newAPY;
        emit APYUpdated(newAPY);
    }
}
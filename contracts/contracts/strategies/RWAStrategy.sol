// SPDX-License-Identifier: MIT
// contracts/strategies/RWAStrategy.sol
// MAXION RWA Strategy Adapter - Mock implementation for hackathon

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


/**
 * @title RWAStrategy
 * @notice Mock strategy adapter for RWA yield generation
 * @dev In production, this would interface with actual RWA protocols
 */
contract RWAStrategy is Ownable, ReentrancyGuard {
    
    // ============================================================================
    // STATE VARIABLES
    // ============================================================================
    
    /// @notice Underlying asset
    IERC20 public immutable asset;
    
    /// @notice Vault address (only vault can deposit/withdraw)
    address public immutable vault;
    
    /// @notice Total assets deployed to this strategy
    uint256 public totalDeployed;
    
    /// @notice Simulated APY (basis points, e.g., 720 = 7.2%)
    uint256 public apy;
    
    /// @notice Last harvest timestamp
    uint256 public lastHarvest;
    
    /// @notice Strategy name
    string public name;
    
    /// @notice Risk level
    string public riskLevel;
    
    // ============================================================================
    // EVENTS
    // ============================================================================
    
    event Deposited(uint256 amount);
    event Withdrawn(uint256 amount);
    event YieldGenerated(uint256 amount);
    event APYUpdated(uint256 newAPY);
    
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    
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
    
    // ============================================================================
    // MODIFIERS
    // ============================================================================
    
    modifier onlyVault() {
        require(msg.sender == vault, "Only vault");
        _;
    }
    
    // ============================================================================
    // CORE FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Deposit assets into strategy
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external onlyVault nonReentrant {
        require(amount > 0, "Zero amount");
        
        totalDeployed += amount;
        
        require(
            asset.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        emit Deposited(amount);
    }
    
    /**
     * @notice Withdraw assets from strategy
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyVault nonReentrant {
        require(amount > 0, "Zero amount");
        require(amount <= totalDeployed, "Insufficient balance");
        
        totalDeployed -= amount;
        
        require(asset.transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdrawn(amount);
    }
    
    /**
     * @notice Harvest yield (mock implementation)
     * @dev Simulates yield generation based on time elapsed and APY
     * @return yield Amount of yield generated
     */
    function harvest() external onlyVault nonReentrant returns (uint256 yield) {
        uint256 timeElapsed = block.timestamp - lastHarvest;
        
        // Calculate yield: (deployed * apy * timeElapsed) / (365 days * 10000)
        yield = (totalDeployed * apy * timeElapsed) / (365 days * 10000);
        
        lastHarvest = block.timestamp;
        
        // In production, this would actually claim yield from RWA protocol
        // For demo, we simulate by minting or transferring from reserve
        
        emit YieldGenerated(yield);
    }
    
    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Get total value in strategy
     * @return Total assets including unrealized yield
     */
    function totalValue() external view returns (uint256) {
        return totalDeployed + _calculatePendingYield();
    }
    
    /**
     * @notice Calculate pending yield
     * @return Pending yield amount
     */
    function pendingYield() external view returns (uint256) {
        return _calculatePendingYield();
    }
    
    /**
     * @notice Internal function to calculate pending yield
     */
    function _calculatePendingYield() internal view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastHarvest;
        return (totalDeployed * apy * timeElapsed) / (365 days * 10000);
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Update APY (for simulation purposes)
     * @param newAPY New APY in basis points
     */
    function setAPY(uint256 newAPY) external onlyOwner {
        require(newAPY <= 5000, "APY too high"); // Max 50%
        apy = newAPY;
        emit APYUpdated(newAPY);
    }
    
    /**
     * @notice Emergency withdraw all assets to vault
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = asset.balanceOf(address(this));
        require(asset.transfer(vault, balance), "Transfer failed");
        totalDeployed = 0;
    }
}
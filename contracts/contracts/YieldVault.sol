// SPDX-License-Identifier: MIT
// contracts/YieldVault.sol
// FIXED: Updated OpenZeppelin imports to v5.x

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";  // FIXED: New path
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";  // FIXED: New path

/**
 * @title YieldVault
 * @notice Main vault contract for MAXION - manages RWA yield positions
 * @dev Implements ERC20 for yield-bearing tokens representing vault shares
 */
contract YieldVault is ERC20, ReentrancyGuard, Ownable, Pausable {
    
    // ============================================================================
    // STATE VARIABLES
    // ============================================================================
    
    /// @notice Underlying asset token (e.g., USDC, USDT on Mantle)
    IERC20 public immutable asset;
    
    /// @notice Total assets under management
    uint256 public totalAssets;
    
    /// @notice Performance fee (basis points, e.g., 200 = 2%)
    uint256 public performanceFee;
    
    /// @notice Protocol treasury address
    address public treasury;
    
    /// @notice Minimum deposit amount
    uint256 public minDeposit;
    
    /// @notice Maximum deposit amount per user
    uint256 public maxDeposit;
    
    // ============================================================================
    // STRUCTS
    // ============================================================================
    
    struct Strategy {
        address strategyAddress;
        uint256 allocation;
        uint256 deployed;
        bool active;
        string name;
        string riskLevel;
    }
    
    struct UserPosition {
        uint256 shares;
        uint256 depositTimestamp;
        uint256 lastClaimTimestamp;
        uint256 totalDeposited;
        uint256 totalClaimed;
    }
    
    // ============================================================================
    // MAPPINGS & ARRAYS
    // ============================================================================
    
    mapping(uint256 => Strategy) public strategies;
    mapping(address => UserPosition) public positions;
    uint256[] public activeStrategyIds;
    uint256 public strategyCount;
    
    // ============================================================================
    // EVENTS
    // ============================================================================
    
    event Deposit(address indexed user, uint256 assets, uint256 shares);
    event Withdraw(address indexed user, uint256 assets, uint256 shares);
    event StrategyAdded(uint256 indexed strategyId, address strategy, string name);
    event StrategyUpdated(uint256 indexed strategyId, uint256 newAllocation);
    event YieldHarvested(uint256 totalYield, uint256 fees);
    event FeesUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);
    
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    
    constructor(
        address _asset,
        address _treasury,
        uint256 _performanceFee
    ) ERC20("MAXION Yield Vault", "mxYLD") Ownable(msg.sender) {
        require(_asset != address(0), "Invalid asset");
        require(_treasury != address(0), "Invalid treasury");
        require(_performanceFee <= 1000, "Fee too high");
        
        asset = IERC20(_asset);
        treasury = _treasury;
        performanceFee = _performanceFee;
        minDeposit = 100 * 10**6;
        maxDeposit = 1000000 * 10**6;
    }
    
    // ============================================================================
    // CORE FUNCTIONS
    // ============================================================================
    
    function deposit(uint256 assets) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 shares) 
    {
        require(assets >= minDeposit, "Below minimum deposit");
        require(assets <= maxDeposit, "Exceeds maximum deposit");
        
        shares = totalSupply() == 0 
            ? assets 
            : (assets * totalSupply()) / totalAssets;
        
        require(shares > 0, "Zero shares");
        
        totalAssets += assets;
        positions[msg.sender].shares += shares;
        positions[msg.sender].depositTimestamp = block.timestamp;
        positions[msg.sender].totalDeposited += assets;
        
        require(
            asset.transferFrom(msg.sender, address(this), assets),
            "Transfer failed"
        );
        
        _mint(msg.sender, shares);
        
        emit Deposit(msg.sender, assets, shares);
    }
    
    function withdraw(uint256 shares) 
        external 
        nonReentrant 
        returns (uint256 assets) 
    {
        require(shares > 0, "Zero shares");
        require(balanceOf(msg.sender) >= shares, "Insufficient shares");
        
        assets = (shares * totalAssets) / totalSupply();
        require(assets > 0, "Zero assets");
        
        totalAssets -= assets;
        positions[msg.sender].shares -= shares;
        
        _burn(msg.sender, shares);
        
        require(asset.transfer(msg.sender, assets), "Transfer failed");
        
        emit Withdraw(msg.sender, assets, shares);
    }
    
    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    function getUserPosition(address user) 
        external 
        view 
        returns (UserPosition memory) 
    {
        return positions[user];
    }
    
    function sharePrice() public view returns (uint256) {
        if (totalSupply() == 0) return 1e18;
        return (totalAssets * 1e18) / totalSupply();
    }
    
    function previewDeposit(uint256 assets) public view returns (uint256 shares) {
        return totalSupply() == 0 
            ? assets 
            : (assets * totalSupply()) / totalAssets;
    }
    
    function previewWithdraw(uint256 shares) public view returns (uint256 assets) {
        return totalSupply() == 0 
            ? 0 
            : (shares * totalAssets) / totalSupply();
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================
    
    function addStrategy(
        address _strategyAddress,
        uint256 _allocation,
        string memory _name,
        string memory _riskLevel
    ) external onlyOwner {
        require(_strategyAddress != address(0), "Invalid strategy");
        require(_allocation <= 10000, "Allocation too high");
        
        uint256 strategyId = strategyCount++;
        
        strategies[strategyId] = Strategy({
            strategyAddress: _strategyAddress,
            allocation: _allocation,
            deployed: 0,
            active: true,
            name: _name,
            riskLevel: _riskLevel
        });
        
        activeStrategyIds.push(strategyId);
        
        emit StrategyAdded(strategyId, _strategyAddress, _name);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
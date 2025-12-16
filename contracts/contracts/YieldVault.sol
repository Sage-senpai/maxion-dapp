// SPDX-License-Identifier: MIT
// contracts/YieldVault.sol
// MAXION YieldVault - Core DeFi contract for RWA yield aggregation on Mantle

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

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
        uint256 allocation; // Percentage in basis points (10000 = 100%)
        uint256 deployed;   // Amount currently deployed
        bool active;
        string name;
        string riskLevel;   // "Low", "Medium", "High"
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
    
    /// @notice Strategy ID to Strategy details
    mapping(uint256 => Strategy) public strategies;
    
    /// @notice User address to position details
    mapping(address => UserPosition) public positions;
    
    /// @notice Array of active strategy IDs
    uint256[] public activeStrategyIds;
    
    /// @notice Strategy counter
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
    
    /**
     * @notice Initialize the YieldVault
     * @param _asset Address of the underlying asset token
     * @param _treasury Address of the protocol treasury
     * @param _performanceFee Performance fee in basis points
     */
    constructor(
        address _asset,
        address _treasury,
        uint256 _performanceFee
    ) ERC20("MAXION Yield Vault", "mxYLD") Ownable(msg.sender) {
        require(_asset != address(0), "Invalid asset");
        require(_treasury != address(0), "Invalid treasury");
        require(_performanceFee <= 1000, "Fee too high"); // Max 10%
        
        asset = IERC20(_asset);
        treasury = _treasury;
        performanceFee = _performanceFee;
        minDeposit = 100 * 10**6; // 100 USDC (6 decimals)
        maxDeposit = 1000000 * 10**6; // 1M USDC
    }
    
    // ============================================================================
    // CORE DEPOSIT/WITHDRAW FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Deposit assets and receive vault shares
     * @param assets Amount of underlying asset to deposit
     * @return shares Amount of vault shares minted
     */
    function deposit(uint256 assets) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 shares) 
    {
        require(assets >= minDeposit, "Below minimum deposit");
        require(assets <= maxDeposit, "Exceeds maximum deposit");
        
        // Calculate shares to mint
        shares = totalSupply() == 0 
            ? assets 
            : (assets * totalSupply()) / totalAssets;
        
        require(shares > 0, "Zero shares");
        
        // Update state
        totalAssets += assets;
        positions[msg.sender].shares += shares;
        positions[msg.sender].depositTimestamp = block.timestamp;
        positions[msg.sender].totalDeposited += assets;
        
        // Transfer assets from user
        require(
            asset.transferFrom(msg.sender, address(this), assets),
            "Transfer failed"
        );
        
        // Mint shares
        _mint(msg.sender, shares);
        
        emit Deposit(msg.sender, assets, shares);
    }
    
    /**
     * @notice Withdraw assets by burning vault shares
     * @param shares Amount of vault shares to burn
     * @return assets Amount of underlying asset returned
     */
    function withdraw(uint256 shares) 
        external 
        nonReentrant 
        returns (uint256 assets) 
    {
        require(shares > 0, "Zero shares");
        require(balanceOf(msg.sender) >= shares, "Insufficient shares");
        
        // Calculate assets to return
        assets = (shares * totalAssets) / totalSupply();
        require(assets > 0, "Zero assets");
        
        // Update state
        totalAssets -= assets;
        positions[msg.sender].shares -= shares;
        
        // Burn shares
        _burn(msg.sender, shares);
        
        // Transfer assets to user
        require(asset.transfer(msg.sender, assets), "Transfer failed");
        
        emit Withdraw(msg.sender, assets, shares);
    }
    
    // ============================================================================
    // STRATEGY MANAGEMENT (OWNER ONLY)
    // ============================================================================
    
    /**
     * @notice Add a new yield strategy
     * @param _strategyAddress Address of the strategy contract
     * @param _allocation Allocation percentage in basis points
     * @param _name Strategy name
     * @param _riskLevel Risk level ("Low", "Medium", "High")
     */
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
    
    /**
     * @notice Update strategy allocation
     * @param strategyId ID of the strategy
     * @param newAllocation New allocation in basis points
     */
    function updateStrategyAllocation(uint256 strategyId, uint256 newAllocation) 
        external 
        onlyOwner 
    {
        require(strategies[strategyId].active, "Strategy not active");
        require(newAllocation <= 10000, "Allocation too high");
        
        strategies[strategyId].allocation = newAllocation;
        
        emit StrategyUpdated(strategyId, newAllocation);
    }
    
    /**
     * @notice Deploy assets to a strategy
     * @param strategyId ID of the strategy
     * @param amount Amount to deploy
     */
    function deployToStrategy(uint256 strategyId, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        Strategy storage strategy = strategies[strategyId];
        require(strategy.active, "Strategy not active");
        require(amount <= asset.balanceOf(address(this)), "Insufficient balance");
        
        strategy.deployed += amount;
        
        // Transfer to strategy (in production, this would call strategy.deposit())
        require(
            asset.transfer(strategy.strategyAddress, amount),
            "Transfer failed"
        );
    }
    
    /**
     * @notice Harvest yield from all strategies
     * @dev Collects yield, takes performance fee, updates totalAssets
     */
    function harvestYield() external onlyOwner nonReentrant {
        uint256 totalYield = 0;
        
        // In production, this would loop through strategies and call harvest()
        // For hackathon demo, we simulate yield
        uint256 simulatedYield = (totalAssets * 5) / 1000; // 0.5% yield
        totalYield = simulatedYield;
        
        // Calculate and transfer performance fee
        uint256 fees = (totalYield * performanceFee) / 10000;
        uint256 netYield = totalYield - fees;
        
        // Update total assets
        totalAssets += netYield;
        
        emit YieldHarvested(totalYield, fees);
    }
    
    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Get user's position details
     * @param user Address of the user
     * @return User's position struct
     */
    function getUserPosition(address user) 
        external 
        view 
        returns (UserPosition memory) 
    {
        return positions[user];
    }
    
    /**
     * @notice Get strategy details
     * @param strategyId ID of the strategy
     * @return Strategy struct
     */
    function getStrategy(uint256 strategyId) 
        external 
        view 
        returns (Strategy memory) 
    {
        return strategies[strategyId];
    }
    
    /**
     * @notice Get all active strategy IDs
     * @return Array of strategy IDs
     */
    function getActiveStrategies() external view returns (uint256[] memory) {
        return activeStrategyIds;
    }
    
    /**
     * @notice Calculate share price (1e18 precision)
     * @return Current price per share
     */
    function sharePrice() public view returns (uint256) {
        if (totalSupply() == 0) return 1e18;
        return (totalAssets * 1e18) / totalSupply();
    }
    
    /**
     * @notice Preview deposit (calculate shares for given assets)
     * @param assets Amount of assets
     * @return shares Amount of shares that would be minted
     */
    function previewDeposit(uint256 assets) public view returns (uint256 shares) {
        return totalSupply() == 0 
            ? assets 
            : (assets * totalSupply()) / totalAssets;
    }
    
    /**
     * @notice Preview withdraw (calculate assets for given shares)
     * @param shares Amount of shares
     * @return assets Amount of assets that would be returned
     */
    function previewWithdraw(uint256 shares) public view returns (uint256 assets) {
        return totalSupply() == 0 
            ? 0 
            : (shares * totalAssets) / totalSupply();
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Update performance fee
     * @param newFee New fee in basis points
     */
    function setPerformanceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high");
        performanceFee = newFee;
        emit FeesUpdated(newFee);
    }
    
    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }
    
    /**
     * @notice Update deposit limits
     * @param _minDeposit New minimum deposit
     * @param _maxDeposit New maximum deposit
     */
    function setDepositLimits(uint256 _minDeposit, uint256 _maxDeposit) 
        external 
        onlyOwner 
    {
        require(_minDeposit < _maxDeposit, "Invalid limits");
        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
    }
    
    /**
     * @notice Pause deposits (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause deposits
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
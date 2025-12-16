# MAXION Deployment Guide
## Complete Production Deployment on Vercel + Mantle

---

## 📋 Prerequisites

### Required Accounts
- [ ] **GitHub** account (for code hosting)
- [ ] **Vercel** account (https://vercel.com/signup)
- [ ] **MongoDB Atlas** account (https://www.mongodb.com/cloud/atlas/register)
- [ ] **WalletConnect** project ID (https://cloud.walletconnect.com/)
- [ ] **Mantle wallet** with testnet MNT (https://bridge.testnet.mantle.xyz/)

### Required Software
```bash
node >= 18.0.0
npm >= 9.0.0
git
```

---

## 🚀 STEP 1: Project Setup

### 1.1 Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd maxion-dapp

# Install dependencies
npm install

# Install Hardhat dependencies
cd contracts
npm install
cd ..
```

### 1.2 Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Open and configure
nano .env.local
```

**Required variables:**
```bash
# MongoDB (from Step 2)
MONGODB_URI=mongodb+srv://...

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...

# Deployment wallet
PRIVATE_KEY=0x...

# Chain
NEXT_PUBLIC_CHAIN_ID=5003
```

---

## 🗄️ STEP 2: MongoDB Setup

### 2.1 Create Free Cluster

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create account → Create Free Cluster
3. Choose: **AWS** / **Region: us-east-1** / **M0 Free**
4. Wait for cluster creation (~3 minutes)

### 2.2 Configure Database Access

1. **Database Access** → Add New Database User
   ```
   Username: maxion-app
   Password: <generate strong password>
   Role: Read and write to any database
   ```

2. **Network Access** → Add IP Address
   ```
   Click: "Allow Access from Anywhere" (0.0.0.0/0)
   Or add Vercel IPs: 76.76.21.0/24, 76.76.21.98/31
   ```

### 2.3 Get Connection String

1. Click **Connect** → **Connect your application**
2. Copy connection string:
   ```
   mongodb+srv://maxion-app:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<password>` with actual password
4. Add database name: `.../maxion?retryWrites=true...`

---

## ⛓️ STEP 3: Smart Contract Deployment

### 3.1 Get Testnet MNT

```bash
# Visit Mantle Testnet Faucet
https://faucet.testnet.mantle.xyz/

# Request testnet MNT (need ~0.5 MNT for deployment)
```

### 3.2 Configure Hardhat

```bash
# In contracts/ directory
# hardhat.config.ts already configured for Mantle

# Verify configuration
npx hardhat verify --list-networks
# Should show: mantleTestnet, mantleMainnet
```

### 3.3 Deploy Contracts

```bash
# Deploy to Mantle Testnet
npm run deploy:testnet

# Output will show:
# ✅ Mock USDC deployed to: 0x...
# ✅ YieldVault deployed to: 0x...
# ✅ Strategy 1: US Treasury Bond Pool: 0x...
# etc.
```

### 3.4 Save Contract Addresses

Copy addresses from deployment output to `.env.local`:

```bash
NEXT_PUBLIC_VAULT_ADDRESS=0x... # YieldVault address
NEXT_PUBLIC_USDC_ADDRESS=0x...  # Mock USDC address
```

### 3.5 Verify Contracts (Optional)

```bash
# Verify on Mantle Explorer
npx hardhat verify --network mantleTestnet <VAULT_ADDRESS> \
  <USDC_ADDRESS> <TREASURY> <PERFORMANCE_FEE>

# Example:
npx hardhat verify --network mantleTestnet 0x123... \
  0xabc... 0xdef... 200
```

---

## 🌐 STEP 4: Vercel Deployment

### 4.1 Connect GitHub

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Initial MAXION deployment"
   git push origin main
   ```

2. Go to https://vercel.com/new
3. **Import Git Repository** → Select your repo
4. Configure project:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   ```

### 4.2 Environment Variables

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# Blockchain
NEXT_PUBLIC_CHAIN_ID=5003
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
MANTLE_TESTNET_RPC=https://rpc.testnet.mantle.xyz

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...

# Security (generate: openssl rand -base64 32)
NEXTAUTH_SECRET=...
```

### 4.3 Deploy

```bash
# Click "Deploy" in Vercel
# Wait 2-3 minutes for build

# Your app will be live at:
https://your-project.vercel.app
```

---

## 🧪 STEP 5: Testing

### 5.1 Connect Wallet

1. Visit your deployed URL
2. Click **Connect Wallet**
3. Use MetaMask/WalletConnect
4. Add Mantle Testnet if needed:
   ```
   Network Name: Mantle Testnet
   RPC URL: https://rpc.testnet.mantle.xyz
   Chain ID: 5003
   Currency: MNT
   Explorer: https://explorer.testnet.mantle.xyz
   ```

### 5.2 Get Test USDC

```bash
# In browser console or using contract interaction:
# Call faucet() on Mock USDC contract
# Or mint tokens via deployed script
```

### 5.3 Test User Flow

1. **Approve USDC** → Allow vault to spend
2. **Allocate** → Choose asset, enter amount
3. **Confirm** → Submit transaction
4. **Verify** → Check MongoDB for allocation record
5. **AI Analyst** → Test AI queries

---

## 📊 STEP 6: Monitoring

### 6.1 Vercel Analytics

- **Performance:** Dashboard → Analytics
- **Logs:** Dashboard → Deployments → View Logs
- **Errors:** Dashboard → Logs (runtime errors)

### 6.2 MongoDB Monitoring

```bash
# Atlas Dashboard
Clusters → <your-cluster> → Metrics
- Monitor: Connections, Operations, Network

# View Data
Collections → Browse Collections
- Users
- Allocations
- AIAnalysis
- AssetPerformance
```

### 6.3 Smart Contract Monitoring

```bash
# Mantle Explorer
https://explorer.testnet.mantle.xyz/address/<VAULT_ADDRESS>

- Transactions
- Events (Deposit, Withdraw)
- Internal Transactions
```

---

## 🔄 STEP 7: Updates & CI/CD

### Automatic Deployments

Vercel auto-deploys on:
- **Production:** `git push origin main`
- **Preview:** PR to main branch

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Smart Contract Updates

```bash
# Update contract
cd contracts
# Edit contracts/YieldVault.sol

# Recompile
npx hardhat compile

# Deploy new version
npm run deploy:testnet

# Update .env.local and Vercel env vars with new addresses
```

---

## 🚨 Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build

# Check Node version
node -v  # Should be >= 18.0.0
```

### MongoDB Connection Issues

```bash
# Test connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌', e))"

# Common fixes:
- Whitelist Vercel IPs in Network Access
- Check username/password in connection string
- Ensure database name is included
```

### Transaction Failures

```bash
# Common issues:
- Insufficient MNT for gas
- Below minimum deposit (100 USDC)
- USDC not approved
- Contract not deployed correctly

# Check contract on explorer
# Verify wallet has MNT and USDC
```

### Web3 Connection Issues

```bash
# Ensure:
- WalletConnect Project ID is correct
- Wallet is on Mantle Testnet (Chain ID: 5003)
- Contract addresses in .env are correct
- RPC endpoint is accessible
```

---

## 🎯 Production Checklist

Before mainnet launch:

- [ ] Full test coverage on testnet
- [ ] Smart contract audit (recommended)
- [ ] Security review of API routes
- [ ] Rate limiting on AI endpoints
- [ ] MongoDB indexes optimized
- [ ] Environment variables secured
- [ ] Custom domain configured
- [ ] Analytics setup (Google Analytics, etc.)
- [ ] Error tracking (Sentry, etc.)
- [ ] Legal compliance reviewed
- [ ] Terms of service + Privacy policy

---

## 📞 Support

### Resources
- **Mantle Docs:** https://docs.mantle.xyz
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **Wagmi Docs:** https://wagmi.sh

### Hackathon Support
- Discord: [not_davisage]
- Email: [anyadikedivine0@gmail.com]
- Demo: []

---



---


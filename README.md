# MAXION (M-axion)
### Intelligence Layer for Real-World Yield on Mantle

<div align="center">

![MAXION](https://img.shields.io/badge/MAXION-Intelligence_Layer-3EF3A3?style=for-the-badge)
![Mantle](https://img.shields.io/badge/Built_on-Mantle-000000?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Mantle Global Hackathon 2025 Submission**

[Live Demo](#) • [Documentation](#) • [Video Demo](#) • [Contracts](#)

</div>

---

## 🎯 Overview

**MAXION** is the intelligence layer for real-world asset (RWA) yield on Mantle. It doesn't chase yield — it **explains** it.

Users aggregate RWA-backed yields, allocate capital by risk appetite, and receive AI-driven explanations of yield quality, risk, and optimal allocation strategies.

### Tagline
> **"Intelligence for real yield."**

---

## ✨ Key Features

### 🏦 **DeFi Core**
- **Yield Vault:** ERC20 vault contract with share-based accounting
- **Multi-Strategy:** Support for multiple RWA strategies (Treasury bonds, Real estate, Private credit, Infrastructure)
- **Automated Yield:** Automatic yield harvesting and distribution
- **Performance Fees:** Configurable protocol fees

### 🤖 **AI Analyst**
- **Yield Explanation:** "Why is this yield X%?"
- **Risk Assessment:** Transparent risk factor analysis
- **Allocation Advice:** Personalized strategies based on risk profile
- **Context-Aware:** Analyzes specific assets and amounts

### 💎 **Elite UX**
- **Intelligence Boot Sequence:** Premium loading experience
- **Ultra-Responsive:** Desktop sidebar + mobile bottom nav
- **Framer Motion Animations:** Smooth, premium interactions
- **MAXION Design System:** Custom brand colors and typography

### 🗄️ **Production Infrastructure**
- **MongoDB Persistence:** User sessions, allocations, AI analysis logs
- **Next.js 14:** App Router with Server Components
- **Web3 Integration:** wagmi + RainbowKit on Mantle
- **Vercel Deployment:** Production-ready with automatic CI/CD

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │  RWA Assets  │  │   Allocate   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────────────────────────────────────────┐  │
│  │            AI Analyst Panel (Slide-in)           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
           │                    │                 │
           ▼                    ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐
│  Web3 (wagmi)   │  │  API Routes     │  │  AI Service │
│  - RainbowKit   │  │  - Users        │  │  - Analysis │
│  - viem         │  │  - Allocations  │  │  - Context  │
└─────────────────┘  └─────────────────┘  └─────────────┘
           │                    │                 
           ▼                    ▼                 
┌─────────────────┐  ┌─────────────────┐
│  Smart Contracts│  │    MongoDB      │
│  (Mantle)       │  │  - Users        │
│  - YieldVault   │  │  - Allocations  │
│  - RWAStrategy  │  │  - AI Logs      │
└─────────────────┘  └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **Charts:** Recharts

### Web3
- **Wallet Connection:** RainbowKit
- **Ethereum Library:** wagmi + viem
- **Blockchain:** Mantle (Testnet & Mainnet)
- **Smart Contracts:** Solidity ^0.8.20 + OpenZeppelin

### Backend
- **API:** Next.js API Routes
- **Database:** MongoDB Atlas (free tier)
- **ODM:** Mongoose
- **Validation:** Zod

### AI
- **LLM Integration:** Structured prompt templates
- **Context-Aware:** Asset + user profile analysis
- **Logging:** Full conversation history in MongoDB

### DevOps
- **Deployment:** Vercel
- **CI/CD:** Automatic GitHub integration
- **Smart Contracts:** Hardhat + Mantle RPC
- **Environment:** dotenv

---

## 📦 Installation

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
git
```

### Clone & Setup

```bash
# Clone repository
git clone https://github.com/your-username/maxion-dapp.git
cd maxion-dapp

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Install contract dependencies
cd contracts
npm install
cd ..
```

### Environment Configuration

Required variables in `.env.local`:
```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# Blockchain
NEXT_PUBLIC_CHAIN_ID=5003
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

See `.env.example` for complete list.

---

## 🚀 Quick Start

### Development

```bash
# Start Next.js dev server
npm run dev

# Open http://localhost:3000
```

### Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Mantle Testnet
npm run deploy:testnet

# Run tests
npm run test
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
maxion-dapp/
├── contracts/              # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── YieldVault.sol
│   │   └── strategies/RWAStrategy.sol
│   ├── scripts/deploy.ts
│   └── hardhat.config.ts
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── page.tsx
│   │   └── api/           # API routes
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   │   ├── mongodb.ts
│   │   ├── models/       # MongoDB schemas
│   │   └── web3/         # Web3 hooks
│   └── types/            # TypeScript types
├── public/               # Static assets
└── ...config files
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed breakdown.

---

## 🎨 Design System

### Colors
```typescript
{
  maxionGreen: '#3EF3A3',    // Primary brand
  obsidianBlack: '#0B0E11',  // Background
  graphitePanel: '#161B22',  // Surfaces
  slateGrey: '#1F2937',      // Borders
  signalCyan: '#2BD9FE',     // AI accent
  riskRed: '#EF4444',        // Risk indicators
  warningAmber: '#FACC15',   // Warnings
}
```

### Typography
- **UI Text:** Inter
- **Numbers/APY/Charts:** JetBrains Mono

### Animations
- **Framer Motion:** All interactions
- **Loading:** Intelligence Boot Sequence (2-3s)
- **Transitions:** Smooth page/view transitions

---

## 📜 Smart Contracts

### YieldVault.sol
Main vault contract for managing RWA yield positions.

**Key Functions:**
- `deposit(uint256 assets)` - Deposit USDC, receive shares
- `withdraw(uint256 shares)` - Burn shares, receive USDC
- `addStrategy(...)` - Add new RWA strategy
- `harvestYield()` - Collect yield from all strategies

**Features:**
- ERC20 vault shares
- Multi-strategy allocation
- Performance fees
- Emergency pause

### RWAStrategy.sol
Mock strategy adapter for RWA yield generation.

**Simulates:**
- Treasury bonds (4.2% APY)
- Real estate (7.8% APY)
- Private credit (11.5% APY)
- Infrastructure (6.4% APY)

**Deployed on Mantle Testnet:**
- YieldVault: `0x...` (TBD)
- Mock USDC: `0x...` (TBD)

---

## 🗄️ Database Schema

### Users
```typescript
{
  walletAddress: string,
  createdAt: Date,
  lastActive: Date,
  totalDeposited: number,
  totalWithdrawn: number,
  riskProfile: 'conservative' | 'balanced' | 'aggressive'
}
```

### Allocations
```typescript
{
  userId: ObjectId,
  walletAddress: string,
  assetId: string,
  assetName: string,
  amount: number,
  shares: number,
  apy: number,
  riskLevel: string,
  timestamp: Date,
  txHash: string,
  status: 'pending' | 'confirmed' | 'failed'
}
```

### AI Analysis
```typescript
{
  userId: ObjectId,
  walletAddress: string,
  query: string,
  response: string,
  context: {...},
  timestamp: Date,
  modelUsed: string,
  tokensUsed: number
}
```

---

## 🔌 API Endpoints

### Users
```
GET    /api/users?walletAddress=0x...
POST   /api/users
PATCH  /api/users?walletAddress=0x...
```

### Allocations
```
GET    /api/allocations?walletAddress=0x...
POST   /api/allocations
PATCH  /api/allocations?id=...
```

### AI Analysis
```
POST   /api/ai/analyze
GET    /api/ai/analyze?walletAddress=0x...
```

---

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
npx hardhat test
```

### Frontend (Manual Testing Flow)
1. Connect wallet (Mantle Testnet)
2. Get test USDC from faucet
3. Approve USDC spending
4. Allocate to RWA asset
5. Check MongoDB for allocation record
6. Test AI Analyst queries
7. Withdraw funds

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step guide.

### Quick Deploy

1. **MongoDB:** Create free Atlas cluster
2. **Contracts:** `npm run deploy:testnet`
3. **Vercel:** Connect GitHub repo
4. **Environment:** Set Vercel env vars
5. **Deploy:** Push to main branch

**Live in ~10 minutes!**

---

## 🏆 Hackathon Categories

### DeFi & Composability
- ✅ Multi-strategy yield aggregation
- ✅ ERC20 vault shares (composable)
- ✅ Performance fee mechanism
- ✅ Strategy adapter pattern

### AI & Oracles
- ✅ AI-powered yield analysis
- ✅ Context-aware risk assessment
- ✅ Personalized allocation advice
- ✅ Conversation history & context

---

## 🎯 Roadmap

### Phase 1: Foundation (Current)
- [x] Smart contract deployment
- [x] Frontend MVP
- [x] MongoDB integration
- [x] AI analyst prototype

### Phase 2: Enhancement
- [ ] Real LLM integration (Claude/GPT-4)
- [ ] Advanced yield strategies
- [ ] Portfolio rebalancing
- [ ] Mobile app (React Native)

### Phase 3: Production
- [ ] Smart contract audit
- [ ] Mainnet deployment
- [ ] Legal compliance
- [ ] Institutional partnerships

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

### Development Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

---

## 👥 Team

**Built for Mantle Global Hackathon 2025**

- **Lead Developer:** [Anyadike Divine]
- **Smart Contracts:** [Anyadike Divine]
- **Design:** [Anyadike Divine]
- **AI Integration:** [Anyadike Divine]

---

## 📞 Contact & Links

- **Demo:** https://maxion.vercel.app
- **GitHub:** https://github.com/Sage-senpeak/maxion-dapp
- **Twitter:** [sage_senpeak](#)
- **Discord:** [nil](#)
- **Email:** nil

---

## 🙏 Acknowledgments

- **Mantle** - For the amazing L2 infrastructure
- **OpenZeppelin** - For secure contract libraries
- **RainbowKit** - For beautiful wallet connections
- **Vercel** - For seamless deployment
- **MongoDB** - For reliable database hosting

---

<div align="center">

**Built with ❤️ on Mantle**

⭐ Star us on GitHub if you find MAXION useful!

</div>
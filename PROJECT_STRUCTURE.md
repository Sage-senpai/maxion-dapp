# MAXION Project Structure

```
maxion-dapp/
│
├── contracts/                          # Smart contracts (Hardhat project)
│   ├── contracts/
│   │   ├── YieldVault.sol             # Main vault contract
│   │   ├── strategies/
│   │   │   └── RWAStrategy.sol        # Strategy adapter
│   │   └── mocks/
│   │       └── MockERC20.sol          # Test token
│   ├── scripts/
│   │   └── deploy.ts                  # Deployment script
│   ├── test/
│   │   └── YieldVault.test.ts         # Contract tests
│   ├── deployments/                   # Deployment artifacts
│   ├── hardhat.config.ts              # Hardhat configuration
│   ├── package.json
│   └── tsconfig.json
│
├── src/                               # Next.js application
│   ├── app/                           # App Router
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Home/Dashboard page
│   │   ├── providers.tsx              # Web3 providers
│   │   ├── globals.css                # Global styles
│   │   │
│   │   └── api/                       # API routes
│   │       ├── users/
│   │       │   └── route.ts           # User CRUD
│   │       ├── allocations/
│   │       │   └── route.ts           # Allocation tracking
│   │       ├── ai/
│   │       │   └── analyze/
│   │       │       └── route.ts       # AI analysis
│   │       └── assets/
│   │           └── route.ts           # Asset data
│   │
│   ├── components/                    # React components
│   │   ├── LoadingSequence.tsx        # Boot animation
│   │   ├── Sidebar.tsx                # Desktop navigation
│   │   ├── MobileNav.tsx              # Mobile navigation
│   │   ├── AIPanel.tsx                # AI analyst panel
│   │   ├── Dashboard/
│   │   │   ├── Overview.tsx           # Overview dashboard
│   │   │   ├── StatCard.tsx           # Metric cards
│   │   │   └── ActivityFeed.tsx       # Recent activity
│   │   ├── Assets/
│   │   │   ├── AssetTable.tsx         # RWA asset list
│   │   │   ├── AssetCard.tsx          # Asset card component
│   │   │   └── RiskBadge.tsx          # Risk indicator
│   │   ├── Allocate/
│   │   │   ├── AllocateFlow.tsx       # Allocation wizard
│   │   │   ├── AssetSelector.tsx      # Asset selection
│   │   │   ├── AmountInput.tsx        # Amount input
│   │   │   └── ConfirmTransaction.tsx # Transaction confirm
│   │   ├── Portfolio/
│   │   │   ├── PortfolioView.tsx      # Portfolio overview
│   │   │   └── AllocationCard.tsx     # Allocation display
│   │   └── ui/                        # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   │
│   ├── lib/                           # Utilities & libraries
│   │   ├── mongodb.ts                 # MongoDB connection
│   │   ├── models/
│   │   │   └── schemas.ts             # Mongoose schemas
│   │   ├── web3/
│   │   │   ├── config.ts              # wagmi/RainbowKit config
│   │   │   ├── hooks.ts               # Custom Web3 hooks
│   │   │   └── abis/                  # Contract ABIs
│   │   │       ├── YieldVault.json
│   │   │       └── ERC20.json
│   │   ├── utils/
│   │   │   ├── formatters.ts          # Number/date formatters
│   │   │   └── validators.ts          # Input validation
│   │   └── constants.ts               # App constants
│   │
│   └── types/                         # TypeScript types
│       ├── contracts.ts               # Smart contract types
│       ├── api.ts                     # API response types
│       └── index.ts                   # Shared types
│
├── public/                            # Static assets
│   ├── logo.svg
│   ├── favicon.ico
│   └── images/
│
├── .env.example                       # Environment template
├── .env.local                         # Local environment (gitignored)
├── .gitignore
├── next.config.js                     # Next.js configuration
├── tailwind.config.ts                 # Tailwind configuration
├── postcss.config.js                  # PostCSS configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies
├── vercel.json                        # Vercel configuration
├── README.md                          # Project README
├── DEPLOYMENT.md                      # Deployment guide
└── PROJECT_STRUCTURE.md               # This file
```

## Key Directories Explained

### `/contracts`
Hardhat project for smart contract development and deployment. Completely isolated from Next.js app.

**Key Files:**
- `YieldVault.sol` - Core DeFi logic, ERC20 vault shares
- `RWAStrategy.sol` - Mock strategy adapters
- `deploy.ts` - Automated deployment to Mantle

### `/src/app`
Next.js 14 App Router structure with server/client components.

**API Routes (`/api`):**
- RESTful endpoints for MongoDB operations
- `/users` - User management
- `/allocations` - Allocation tracking
- `/ai/analyze` - AI analyst integration

### `/src/components`
Organized by feature, follows atomic design principles.

**Structure:**
- Feature folders (Dashboard, Assets, Allocate, Portfolio)
- Shared components (Sidebar, AIPanel)
- UI primitives (`/ui`)

### `/src/lib`
Core application logic and utilities.

**Key Modules:**
- `mongodb.ts` - Database connection with caching
- `web3/` - Web3 integration (wagmi, viem)
- `models/` - MongoDB schemas

## Configuration Files

### Root Level
```
.env.local          → Environment variables (NEVER commit)
.env.example        → Template for environment setup
next.config.js      → Next.js configuration
tailwind.config.ts  → Design system configuration
tsconfig.json       → TypeScript compiler options
package.json        → Dependencies and scripts
vercel.json         → Vercel deployment settings
```

### Contracts
```
hardhat.config.ts   → Hardhat + Mantle configuration
.env                → Contract deployment keys (NEVER commit)
```

## Data Flow

```
User → Next.js UI → wagmi hooks → Smart Contracts (Mantle)
                  ↓
              API Routes → MongoDB → Persistent Storage
                  ↓
              AI Analyst → LLM API → Analysis Results
```

## Important Notes

### Security
- `.env.local` and `contracts/.env` are gitignored
- Private keys never in code
- MongoDB credentials secured in environment
- API routes validated with Zod

### Performance
- MongoDB connection cached
- Smart contract reads cached by wagmi
- Next.js automatic code splitting
- Image optimization enabled

### Development Workflow
1. Smart contracts: `cd contracts && npm run compile`
2. Deploy contracts: `npm run deploy:testnet`
3. Frontend dev: `npm run dev` (root)
4. Build: `npm run build`
5. Deploy: Push to GitHub (Vercel auto-deploys)

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "compile": "cd contracts && hardhat compile",
  "deploy:testnet": "cd contracts && hardhat run scripts/deploy.ts --network mantleTestnet",
  "deploy:mainnet": "cd contracts && hardhat run scripts/deploy.ts --network mantleMainnet",
  "test": "cd contracts && hardhat test"
}
```

## Environment Setup

### Development
```bash
cp .env.example .env.local
# Fill in MongoDB URI, WalletConnect ID
npm install
npm run dev
```

### Production
```bash
# Set environment variables in Vercel Dashboard
# Push to GitHub
# Vercel auto-deploys
```

## File Size Guidelines

- Components: < 300 lines
- API routes: < 200 lines
- Hooks: < 150 lines
- Smart contracts: < 500 lines

## Naming Conventions

- **Components:** PascalCase (`UserProfile.tsx`)
- **Hooks:** camelCase with 'use' prefix (`useVaultBalance.ts`)
- **Utilities:** camelCase (`formatCurrency.ts`)
- **Types:** PascalCase with 'I' prefix for interfaces (`IUser`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_DEPOSIT_AMOUNT`)
- **API Routes:** lowercase (`/api/users/route.ts`)

## Import Order

```typescript
// 1. React/Next
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

// 3. Internal imports (absolute)
import { Button } from '@/components/ui/button';
import { useVaultBalance } from '@/lib/web3/hooks';

// 4. Types
import type { IUser } from '@/types';

// 5. Relative imports
import { formatCurrency } from '../utils';
```
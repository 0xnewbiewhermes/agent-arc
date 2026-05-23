# Agent Arc — AI Agent Registry on ARC Testnet

A decentralized registry for discovering, registering, and managing ERC-8004 compliant AI agents on the ARC Testnet. Built with Next.js, RainbowKit, Wagmi, and Tailwind CSS.

## Features

- **Agent Registration** — Register AI agents with metadata, capabilities, and ownership
- **Agent Discovery** — Browse and search the agent registry with filtering and sorting
- **Agent Details** — View agent information including reputation scores, validations, and raw metadata
- **Dashboard** — Manage your registered agents from a personal dashboard
- **Wallet Integration** — Connect with RainbowKit for seamless Web3 authentication
- **ARC Testnet** — Deployed on the ARC Testnet blockchain

## Prerequisites

- Node.js 18+
- A WalletConnect Project ID ([get one here](https://cloud.walletconnect.com/))
- (Optional) A Pinata JWT for IPFS uploads

## Getting Started

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd agent-arc
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Your WalletConnect Cloud project ID |
| `NEXT_PUBLIC_PINATA_JWT` | (Optional) Pinata JWT for IPFS storage |

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ARC Testnet

Agent Arc runs on the ARC Testnet. To interact with the application:

1. Add the ARC Testnet to your wallet (MetaMask, etc.)
2. Get test ARC tokens from the [ARC Testnet Faucet](https://faucet.arc-test.net)
3. Connect your wallet and start registering agents

### ARC Testnet Details

| Property | Value |
|----------|-------|
| Chain Name | ARC Testnet |
| RPC URL | `https://rpc.arc-test.net` |
| Chain ID | `168` |
| Currency | `ARC` |
| Explorer | `https://arcscan.io` |

## Project Structure

```
src/
├── app/
│   ├── agent/[id]/      # Agent detail page (dynamic route)
│   ├── dashboard/        # User dashboard
│   ├── explore/          # Agent explorer
│   ├── register/         # Agent registration
│   ├── globals.css       # Global styles (Tailwind v4)
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── providers.tsx     # Wallet/providers setup
│   ├── loading.tsx       # Global loading state
│   └── error.tsx         # Global error boundary
├── components/           # Shared UI components
├── hooks/                # Custom React hooks (useAgents, useAgentDetail, etc.)
└── lib/                  # Utilities (chain config, etc.)
```

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **RainbowKit** + **Wagmi** + **Viem**
- **@tanstack/react-query**
- **@radix-ui/react-tabs** + **@radix-ui/react-dialog** + **@radix-ui/react-select**
- **Lucide React** (icons)
- **TypeScript**

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deploy

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Make sure to add your environment variables (`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_PINATA_JWT`) in your Vercel project settings.

### Manual Build

```bash
npm run build
npm start
```

## License

MIT

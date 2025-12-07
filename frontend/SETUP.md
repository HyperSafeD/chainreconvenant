# ChainReCovenant Frontend - Setup Guide

Complete guide to set up and run the ChainReCovenant dApp.

## 🚀 Quick Start

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Get Reown Project ID:**
   - Visit https://cloud.reown.com
   - Sign up/Login
   - Click "Create New Project"
   - Copy your Project ID

3. **Configure Environment:**
   ```bash
   cp env.template .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Open Browser:**
   http://localhost:3000

## ✅ What You Can Do

### Homepage (/)
- View total agreements on Base
- View your agreements count
- Connect wallet with Reown
- Quick stats dashboard

### Create Agreement (/create)
- Create new on-chain agreements
- Add 2+ parties with addresses
- Set title and description
- Enable auto-enforcement
- Transaction confirmation

### My Agreements (/agreements)
- View all your agreements
- See agreement status
- Filter by status
- Quick overview cards

### Agreement Details (/agreement/[id])
- View full agreement details
- See all parties and their status
- Sign agreement (if pending)
- Add optional collateral
- Real-time updates

## 🎯 Features Implemented

✅ Wallet connection with Reown (WalletConnect v3)
✅ Read contract data (agreements, parties, status)
✅ Create new agreements
✅ Sign agreements with optional collateral
✅ Real-time blockchain data
✅ Transaction confirmations
✅ BaseScan integration
✅ Responsive design
✅ Loading states
✅ Error handling

## 📦 Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Reown AppKit** - Wallet connection
- **Wagmi** - React hooks for Ethereum
- **Viem** - Ethereum library
- **React Query** - Data fetching

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── create/
│   │   └── page.tsx            # Create agreement
│   ├── agreements/
│   │   └── page.tsx            # List agreements
│   └── agreement/
│       └── [id]/
│           └── page.tsx        # Agreement detail
├── config/
│   ├── contracts.ts            # Contract addresses
│   └── abi.ts                  # Contract ABIs
├── contexts/
│   └── Web3Provider.tsx        # Web3 context
├── lib/
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## 🔧 Configuration

### Contract Addresses (config/contracts.ts)
```typescript
export const CONTRACT_ADDRESSES = {
  ChainReCovenant: '0x3A8527E43beC82415bF8A1C1aa0b072F7b49c24f',
  CovenantFactory: '0x000811CA5CdfB8CeDAd90E399252c8216f70b6D7'
};
```

### Network Configuration
- Network: Base Mainnet
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel:**
   - Go to https://vercel.com
   - Import your repository
   - Set root directory to `frontend`
   - Add environment variable:
     - `NEXT_PUBLIC_REOWN_PROJECT_ID`
   - Deploy!

### Build Locally

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Wallet Not Connecting
- Check Reown Project ID is correct
- Ensure you're on Base network
- Clear browser cache
- Try different browser

### Contract Read Errors
- Verify contract addresses in config
- Check network connection
- Ensure Base RPC is accessible

### Transaction Failures
- Check wallet has sufficient ETH
- Verify gas settings
- Check contract state (e.g., already signed)

## 📚 Additional Resources

- [Reown Documentation](https://docs.reown.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Next.js Documentation](https://nextjs.org/docs)
- [Base Network](https://base.org)

## 🤝 Support

Having issues? 
- Check GitHub issues
- Review BaseScan for contract details
- Verify network connectivity

---

Built with ❤️ for ChainReCovenant


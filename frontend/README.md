# ChainReCovenant Frontend

Modern Next.js frontend for ChainReCovenant - on-chain legal agreements with automated enforcement.

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Reown AppKit** - WalletConnect v3 integration  
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

1. **Get Reown Project ID:**
   - Visit https://cloud.reown.com
   - Create a new project
   - Copy your Project ID

2. **Create `.env.local`:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Add your Project ID:**
   ```env
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
   ```

## 🏃‍♂️ Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with Web3Provider
│   ├── page.tsx            # Homepage
│   ├── create/             # Create agreement page
│   ├── agreements/         # View agreements page
│   └── globals.css         # Global styles
├── components/             # Reusable components
├── config/
│   ├── contracts.ts        # Contract addresses & chain config
│   └── abi.ts              # Contract ABIs
├── contexts/
│   └── Web3Provider.tsx    # Web3 context with Reown
└── lib/                    # Utility functions
```

## 🔗 Deployed Contracts

- **ChainReCovenant**: `0x3A8527E43beC82415bF8A1C1aa0b072F7b49c24f`
- **CovenantFactory**: `0x000811CA5CdfB8CeDAd90E399252c8216f70b6D7`
- **Network**: Base Mainnet (Chain ID: 8453)
- **Explorer**: [BaseScan](https://basescan.org/address/0x3A8527E43beC82415bF8A1C1aa0b072F7b49c24f#code)

## 🎯 Features

- ✅ Connect wallet with Reown (WalletConnect)
- ✅ View total agreements on-chain
- ✅ View your agreements
- ✅ Create new agreements
- ✅ Sign agreements
- ✅ View agreement details
- ✅ Real-time contract interaction
- ✅ Responsive design

## 🔨 Building for Production

```bash
npm run build
npm start
```

## 🚀 Deployment

Deploy to Vercel:

```bash
vercel
```

Or use the Vercel dashboard:
1. Import your repository
2. Add environment variables
3. Deploy

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Reown Project ID from cloud.reown.com | Yes |

## 🎨 Customization

- **Colors**: Edit `tailwind.config.ts`
- **Contract**: Update `config/contracts.ts`
- **Metadata**: Update `app/layout.tsx`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Reown AppKit](https://docs.reown.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Tailwind CSS](https://tailwindcss.com)
- [Base Network](https://base.org)

## 🤝 Contributing

Contributions welcome! Please check the main repository.

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ for ChainReCovenant


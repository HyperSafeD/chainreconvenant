'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import type { ReactNode } from 'react';

// 1. Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID';

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId,
});

// 3. Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId,
  metadata: {
    name: 'ChainReCovenant',
    description: 'Create and execute legal-style agreements on-chain',
    url: 'https://chainrecovenant.app',
    icons: ['https://chainrecovenant.app/icon.png']
  },
  features: {
    analytics: true,
  }
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}


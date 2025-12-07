export const CONTRACT_ADDRESSES = {
  ChainReCovenant: '0x3A8527E43beC82415bF8A1C1aa0b072F7b49c24f',
  CovenantFactory: '0x000811CA5CdfB8CeDAd90E399252c8216f70b6D7'
} as const;

export const SUPPORTED_CHAINS = {
  BASE: {
    id: 8453,
    name: 'Base',
    network: 'base',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://mainnet.base.org'],
      },
      public: {
        http: ['https://mainnet.base.org'],
      },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://basescan.org' },
    },
  },
} as const;

export const BASE_CHAIN_ID = 8453;


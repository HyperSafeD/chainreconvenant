'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { CHAINRECOVENANT_ABI } from '@/config/abi';
import Link from 'next/link';

export default function Home() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  // Read total agreements from contract
  const { data: totalAgreements } = useReadContract({
    address: CONTRACT_ADDRESSES.ChainReCovenant as `0x${string}`,
    abi: CHAINRECOVENANT_ABI,
    functionName: 'getTotalAgreements',
  });

  // Read user agreements if connected
  const { data: userAgreements } = useReadContract({
    address: CONTRACT_ADDRESSES.ChainReCovenant as `0x${string}`,
    abi: CHAINRECOVENANT_ABI,
    functionName: 'getUserAgreements',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChainReCovenant
            </h1>
          </div>
          <button
            onClick={() => open()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Legal Agreements on the Blockchain
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create, sign, and enforce legal-style agreements with automated term enforcement.
          Trustless, transparent, and immutable.
        </p>
        
        <div className="flex gap-4 justify-center">
          {isConnected ? (
            <>
              <Link
                href="/create"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                Create Agreement
              </Link>
              <Link
                href="/agreements"
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
              >
                View My Agreements
              </Link>
            </>
          ) : (
            <button
              onClick={() => open()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Connect Wallet to Start
            </button>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {totalAgreements?.toString() || '0'}
            </div>
            <div className="text-gray-600">Total Agreements</div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-2">🤝</div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {isConnected ? (userAgreements?.length.toString() || '0') : '0'}
            </div>
            <div className="text-gray-600">Your Agreements</div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              Base
            </div>
            <div className="text-gray-600">Deployed on Base</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔐"
            title="Multi-Party Agreements"
            description="Create agreements with 2 or more parties. All parties must sign before activation."
          />
          <FeatureCard
            icon="⚖️"
            title="Automated Enforcement"
            description="Terms are automatically enforced on-chain with built-in penalty mechanisms."
          />
          <FeatureCard
            icon="💰"
            title="Collateral Management"
            description="Optional collateral deposits with automatic withdrawal after completion."
          />
          <FeatureCard
            icon="📅"
            title="Deadline Monitoring"
            description="Set deadlines for terms with automatic breach detection."
          />
          <FeatureCard
            icon="🎯"
            title="Dispute Resolution"
            description="Built-in dispute mechanism for handling disagreements."
          />
          <FeatureCard
            icon="🔍"
            title="Fully Transparent"
            description="All agreements and terms are visible on-chain and verified on BaseScan."
          />
        </div>
      </section>

      {/* Contract Info */}
      <section className="container mx-auto px-4 py-12 mb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Deployed on Base Mainnet</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">ChainReCovenant:</span>
              <code className="bg-white/20 px-3 py-1 rounded text-sm">
                {CONTRACT_ADDRESSES.ChainReCovenant}
              </code>
              <a
                href={`https://basescan.org/address/${CONTRACT_ADDRESSES.ChainReCovenant}#code`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-200 hover:text-white underline text-sm"
              >
                View on BaseScan ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>Built with ❤️ for trustless, automated legal agreements on-chain</p>
          <div className="mt-4 flex gap-6 justify-center">
            <a href="https://basescan.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              BaseScan
            </a>
            <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              Base Network
            </a>
            <a href="https://github.com/Gbangbolaoluwagbemiga/chainreconvenant" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { CHAINRECOVENANT_ABI } from '@/config/abi';
import Link from 'next/link';
import { formatAddress } from '@/lib/utils';

export default function AgreementsPage() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  // Read user agreements
  const { data: userAgreementIds, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.ChainReCovenant as `0x${string}`,
    abi: CHAINRECOVENANT_ABI,
    functionName: 'getUserAgreements',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">📜</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChainReCovenant
              </h1>
            </Link>
            <button
              onClick={() => open()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Connect Wallet
            </button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-8">
            Please connect your wallet to view your agreements
          </p>
          <button
            onClick={() => open()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChainReCovenant
            </h1>
          </Link>
          <button
            onClick={() => open()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Connected
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
                ← Back to Home
              </Link>
              <h2 className="text-3xl font-bold">My Agreements</h2>
              <p className="text-gray-600 mt-2">
                Viewing agreements for {formatAddress(address)}
              </p>
            </div>
            <Link
              href="/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Create New
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your agreements...</p>
            </div>
          ) : !userAgreementIds || userAgreementIds.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold mb-2">No Agreements Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't created or been added to any agreements yet
              </p>
              <Link
                href="/create"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Agreement
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userAgreementIds.map((id) => (
                <AgreementCard key={id.toString()} agreementId={id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgreementCard({ agreementId }: { agreementId: bigint }) {
  const { data: agreement } = useReadContract({
    address: CONTRACT_ADDRESSES.ChainReCovenant as `0x${string}`,
    abi: CHAINRECOVENANT_ABI,
    functionName: 'getAgreement',
    args: [agreementId],
  });

  if (!agreement) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const [id, title, description, creator, createdAt, activatedAt, status, totalCollateral, autoEnforce, partyCount, termCount] = agreement;

  const statusLabels = ['Pending', 'Active', 'Completed', 'Breached', 'Cancelled'];
  const statusColors = [
    'bg-yellow-100 text-yellow-800',
    'bg-green-100 text-green-800',
    'bg-blue-100 text-blue-800',
    'bg-red-100 text-red-800',
    'bg-gray-100 text-gray-800',
  ];

  const statusLabel = statusLabels[status] || 'Unknown';
  const statusColor = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <Link
      href={`/agreement/${id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold">{title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-gray-600 line-clamp-2">{description}</p>
        </div>
        <div className="text-2xl">📄</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-500 mb-1">Agreement ID</div>
          <div className="font-medium">#{id.toString()}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Parties</div>
          <div className="font-medium">{partyCount.toString()}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Terms</div>
          <div className="font-medium">{termCount.toString()}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Auto-Enforce</div>
          <div className="font-medium">{autoEnforce ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Created: {new Date(Number(createdAt) * 1000).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}


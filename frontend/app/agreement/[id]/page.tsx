'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { CHAINRECOVENANT_ABI } from '@/config/abi';
import Link from 'next/link';
import { formatAddress, formatDateTime, formatEther } from '@/lib/utils';
import { useState } from 'react';
import { parseEther } from 'viem';

export default function AgreementDetailPage({ params }: { params: { id: string } }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [collateralAmount, setCollateralAmount] = useState('0');

  const agreementId = BigInt(params.id);

  // Read agreement details
  const { data: agreement, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.ChainReCovenant as `0x${string}`,
    abi: CHAINRECOVENANT_ABI,
    functionName: 'getAgreement',
    args: [agreementId],
  });

  // Sign agreement
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    onSuccess: () => {
      refetch();
    },
  });

  const handleSign = () => {
    if (!isConnected) {
      open();
      return;
    }

    try {
      const value = collateralAmount && parseFloat(collateralAmount) > 0
        ? parseEther(collateralAmount)
        : BigInt(0);

      writeContract({
        address: CONTRACT_ADDRESSES.ChainReCovenant as `0x${string}`,
        abi: CHAINRECOVENANT_ABI,
        functionName: 'signAgreement',
        args: [agreementId],
        value,
      });
    } catch (error) {
      console.error('Error signing agreement:', error);
    }
  };

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link href="/agreements" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
              ← Back to My Agreements
            </Link>
          </div>

          {/* Agreement Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold">{title}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
                <p className="text-gray-600 text-lg">{description}</p>
              </div>
              <div className="text-4xl">📄</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Agreement ID</div>
                <div className="font-bold text-lg">#{id.toString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Creator</div>
                <div className="font-mono text-sm">{formatAddress(creator)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Parties</div>
                <div className="font-bold text-lg">{partyCount.toString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Terms</div>
                <div className="font-bold text-lg">{termCount.toString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
              <div>
                <div className="text-sm text-gray-500 mb-1">Created</div>
                <div className="font-medium">{formatDateTime(createdAt)}</div>
              </div>
              {activatedAt > 0n && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Activated</div>
                  <div className="font-medium">{formatDateTime(activatedAt)}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Collateral</div>
                <div className="font-bold">{formatEther(totalCollateral)} ETH</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Auto-Enforce</div>
                <div className="font-medium">{autoEnforce ? '✅ Yes' : '❌ No'}</div>
              </div>
            </div>
          </div>

          {/* Parties Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>🤝</span> Parties
            </h3>
            <div className="space-y-4">
              {Array.from({ length: Number(partyCount) }).map((_, index) => (
                <PartyCard key={index} agreementId={agreementId} partyIndex={index} />
              ))}
            </div>
          </div>

          {/* Sign Agreement */}
          {status === 0 && isConnected && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">✍️ Sign This Agreement</h3>
              <p className="mb-6">
                By signing, you agree to all terms and conditions of this agreement.
              </p>

              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <label className="block text-sm font-medium mb-2">
                  Optional Collateral (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-gray-900"
                  placeholder="0.0"
                />
                <p className="text-xs mt-2 text-white/80">
                  Collateral will be locked until agreement is completed
                </p>
              </div>

              <button
                onClick={handleSign}
                disabled={isPending || isConfirming}
                className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? 'Signing...' : 'Sign Agreement'}
              </button>

              {hash && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <p className="text-sm mb-2">Transaction Hash:</p>
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-200 text-sm font-mono break-all underline"
                  >
                    {hash}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* View on BaseScan */}
          <div className="mt-6 text-center">
            <a
              href={`https://basescan.org/address/${CONTRACT_ADDRESSES.ChainReCovenant}#readContract`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              View Full Details on BaseScan ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartyCard({ agreementId, partyIndex }: { agreementId: bigint; partyIndex: number }) {
  const { data: party } = useReadContract({
    address: CONTRACT_ADDRESSES.ChainReCovenant as `0x${string}`,
    abi: CHAINRECOVENANT_ABI,
    functionName: 'getParty',
    args: [agreementId, BigInt(partyIndex)],
  });

  if (!party) return null;

  const [wallet, name, hasSigned, depositAmount, hasWithdrawn] = party;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-lg mb-1">{name}</div>
          <div className="font-mono text-sm text-gray-600">{formatAddress(wallet)}</div>
          {depositAmount > 0n && (
            <div className="text-sm text-gray-600 mt-2">
              Collateral: {formatEther(depositAmount)} ETH
            </div>
          )}
        </div>
        <div>
          {hasSigned ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✅ Signed
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              ⏳ Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


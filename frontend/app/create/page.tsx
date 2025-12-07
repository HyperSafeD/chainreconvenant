'use client';

import { useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { CHAINRECOVENANT_ABI } from '@/config/abi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateAgreementPage() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parties, setParties] = useState<{ address: string; name: string }[]>([
    { address: '', name: '' },
    { address: '', name: '' },
  ]);
  const [autoEnforce, setAutoEnforce] = useState(true);

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const addParty = () => {
    setParties([...parties, { address: '', name: '' }]);
  };

  const removeParty = (index: number) => {
    if (parties.length > 2) {
      setParties(parties.filter((_, i) => i !== index));
    }
  };

  const updateParty = (index: number, field: 'address' | 'name', value: string) => {
    const updated = [...parties];
    updated[index][field] = value;
    setParties(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      open();
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.ChainReCovenant as `0x${string}`,
        abi: CHAINRECOVENANT_ABI,
        functionName: 'createAgreement',
        args: [
          title,
          description,
          parties.map(p => p.address as `0x${string}`),
          parties.map(p => p.name),
          autoEnforce,
        ],
      });
    } catch (error) {
      console.error('Error creating agreement:', error);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">Agreement Created!</h2>
          <p className="text-gray-600 mb-6">
            Your agreement has been successfully created on the blockchain.
          </p>
          <div className="space-y-3">
            <Link
              href="/agreements"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View My Agreements
            </Link>
            <button
              onClick={() => router.push('/create')}
              className="block w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Create Another
            </button>
          </div>
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
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
              ← Back to Home
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-2">Create New Agreement</h2>
            <p className="text-gray-600 mb-8">
              Create a binding on-chain agreement with automated enforcement
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g., Service Agreement, Partnership Contract"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  rows={4}
                  placeholder="Detailed description of the agreement..."
                  required
                />
              </div>

              {/* Parties */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Parties * (minimum 2)
                  </label>
                  <button
                    type="button"
                    onClick={addParty}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Party
                  </button>
                </div>

                <div className="space-y-4">
                  {parties.map((party, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-700">Party {index + 1}</span>
                        {parties.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeParty(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={party.name}
                          onChange={(e) => updateParty(index, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          placeholder="Name or Role (e.g., Client, Developer)"
                          required
                        />
                        <input
                          type="text"
                          value={party.address}
                          onChange={(e) => updateParty(index, 'address', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono text-sm"
                          placeholder="0x... Wallet Address"
                          pattern="^0x[a-fA-F0-9]{40}$"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto Enforce */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoEnforce}
                    onChange={(e) => setAutoEnforce(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Auto-Enforce Terms</div>
                    <div className="text-sm text-gray-600">
                      Automatically enforce penalties when terms are breached
                    </div>
                  </div>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-4">
                {!isConnected ? (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                  >
                    Connect Wallet to Create
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending || isConfirming ? 'Creating Agreement...' : 'Create Agreement'}
                  </button>
                )}
              </div>

              {hash && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transaction Hash:</p>
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-mono break-all"
                  >
                    {hash}
                  </a>
                </div>
              )}
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">ℹ️ Next Steps</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
              <li>Create the agreement on-chain</li>
              <li>Add terms to define obligations</li>
              <li>All parties sign the agreement</li>
              <li>Agreement becomes active automatically</li>
              <li>Terms are enforced on-chain</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}


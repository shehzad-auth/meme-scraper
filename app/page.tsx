"use client";
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

import { test, fetchBalance, UserBalance } from './actions';
import { connection } from "./utils/config"
import { create } from 'domain';
import { createSPLToken } from './utils/createToken';
import { ammCreatePool } from './utils/poolConfig';

const CreateToken: NextPage = () => {
  const { publicKey, signTransaction, signAllTransactions, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [mintAddress, setMintAddress] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(9);
  const [initialSupply, setInitialSupply] = useState<number>(1000000);
  const [metadataUri, setMetadataUri] = useState<string>('');

  const handleCreateToken = async (): Promise<void> => {
    test();
    if (!publicKey || !signTransaction || !signAllTransactions) {
      alert('Please connect your wallet first!');
      return;
    }

    setLoading(true);
    try {
      const fun = async() => {
        /*await UserBalance(publicKey?.toString() || "");
        const spltoken = await createSPLToken()
        console.log("SPLToken:", spltoken);
        await fetchBalance();*/
        /*
  mint: 'CSrmCkkBx4awR4NAiYTfsxLDKbUMhw4Wzokxf49msehL',
  tokenAccount: '2EgJpuPCAgWazA6XUMBVRs5TCUpPYN2WVoMzr7ghLXKW'*/
        const mintAddr = "HfgN3Nz2NjsG4xjeKHNBGrJJkAE3zAdxsq2oMMdcnscD"
        const tokenAccount = "BhaBN4J59JTdArXyW9Se8DtEHys2U8GQgpSXTPrtjmTz"

        const res = await ammCreatePool()
        console.log("🎉 Pool Successfully Created!", res);
      }
      fun()
      
    } catch (error) {
      console.error('Error creating token:', error);
      alert(`Error creating token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center gap-3">
              <h1 className="text-2xl font-semibold">Create Custom Token</h1>
              <WalletMultiButton />
            </div>
            
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Token Name</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                    placeholder="My Custom Token"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Token Symbol</label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                    placeholder="MCT"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Decimals</label>
                  <input
                    type="number"
                    value={tokenDecimals}
                    onChange={(e) => setTokenDecimals(parseInt(e.target.value))}
                    className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                    placeholder="9"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Initial Supply</label>
                  <input
                    type="number"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(parseInt(e.target.value))}
                    className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                    placeholder="1000000"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Metadata URI (IPFS or other)</label>
                  <input
                    type="text"
                    value={metadataUri}
                    onChange={(e) => setMetadataUri(e.target.value)}
                    className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                    placeholder="https://ipfs.io/ipfs/your-metadata-hash"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleCreateToken}
                    disabled={loading || !publicKey}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Token'}
                  </button>
                </div>
                
                {mintAddress && (
                  <div className="mt-4 p-4 bg-green-100 rounded-md">
                    <p className="text-sm text-green-800">
                      Token created successfully! Mint address:
                    </p>
                    <p className="text-xs font-mono break-all">
                      {mintAddress}
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateToken;
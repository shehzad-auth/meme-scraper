// components/WalletConnectButton.tsx
'use client';

import { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletConnectButton: FC = () => {
  const { publicKey, connecting } = useWallet();

  return (
    <div className="flex flex-col items-center">
      <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700" />
      
      {connecting && (
        <p className="text-sm text-indigo-600 mt-2">Connecting...</p>
      )}
      
      {publicKey && (
        <p className="text-sm text-gray-600 mt-2">
          Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </p>
      )}
    </div>
  );
};

export default WalletConnectButton;
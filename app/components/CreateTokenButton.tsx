"use client"
import { useState } from 'react';
import { createToken, TokenCreationResult } from '../utils/tokens';

const CreateTokenButton: React.FC = () => {
  const [tokenCreationResult, setTokenCreationResult] = useState<TokenCreationResult | null>(null);

  const handleCreateToken = async () => {
    try {
      const result = await createToken();
      setTokenCreationResult(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={handleCreateToken}>Create Token</button>
      {tokenCreationResult && (
        <div>
          <p>Token created: {tokenCreationResult.mint.toBase58()}</p>
          <p>Payer: {tokenCreationResult.payer.publicKey.toBase58()}</p>
        </div>
      )}
    </div>
  );
};

export default CreateTokenButton;
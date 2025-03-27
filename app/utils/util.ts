import {
  buildSimpleTransaction,
  findProgramAddress,
  InnerSimpleV0Transaction,
  SPL_ACCOUNT_LAYOUT,
  TOKEN_PROGRAM_ID,
  TokenAccount,
} from "@raydium-io/raydium-sdk";
import {
  Connection,
  Keypair,
  PublicKey,
  SendOptions,
  SendTransactionError,
  Signer,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  CREATE_CPMM_POOL_PROGRAM,
  DEV_CREATE_CPMM_POOL_PROGRAM,
} from "@raydium-io/raydium-sdk-v2";

export async function sendTx(
  connection: Connection,
  payer: Keypair | Signer,
  txs: (VersionedTransaction | Transaction)[],
  options?: SendOptions
): Promise<string[]> {
  try {
    const txids: string[] = [];
    for (const iTx of txs) {
      if (iTx instanceof VersionedTransaction) {
        iTx.sign([payer]);
        txids.push(await connection.sendTransaction(iTx, options));
      } else {
        txids.push(await connection.sendTransaction(iTx, [payer], options));
      }
    }
    return txids;
  } catch (error) {
    if (error instanceof SendTransactionError) {
      console.error("SendTransactionError:", error.getLogs(connection));
    } else {
      console.error("Error sending transaction:", error);
    }
    throw error;
  }
}

export async function getWalletTokenAccount(
  connection: Connection,
  wallet: PublicKey
): Promise<TokenAccount[]> {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}

export function getATAAddress(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey
) {
  const { publicKey, nonce } = findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );
  return { publicKey, nonce };
}

export async function sleepTime(ms: number) {
  console.log(new Date().toLocaleString(), "sleepTime", ms);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const VALID_PROGRAM_ID = new Set([
  CREATE_CPMM_POOL_PROGRAM.toBase58(),
  DEV_CREATE_CPMM_POOL_PROGRAM.toBase58(),
]);

export const isValidCpmm = (id: string) => VALID_PROGRAM_ID.has(id);

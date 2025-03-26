import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { connection, owner } from "./config";

export async function getTempWallet() {
    return owner
}

export const transferAmount = async (from: PublicKey, to: PublicKey, amount: number, signAllTransactions: any) => {
  if (!signAllTransactions) {
    alert("Please connect your wallet first!");
    return;
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  try {
    const blockHash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockHash.blockhash;
    transaction.feePayer = from;
    transaction.partialSign(...[owner]);
    const signedTransaction = (await signAllTransactions([transaction]))[0];
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );
    console.log(
      `Transaction sent: https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (error) {
    console.error("Error sending transaction:", error);
    alert(
      `Error sending transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }finally {
    return true
  }
}
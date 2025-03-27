import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { connection, owner } from "./config";

// Load existing wallet or create a new one
export async function getTempWallet() {
  return Keypair.generate()
}

// export const transferAmount = async (from: PublicKey, to: PublicKey, amount: number, signAllTransactions: any) => {
 
//   if (!signAllTransactions) {
//     alert("Please connect your wallet first!");
//     return;
//   }

//     console.log("from key", from)
//     console.log("to key", to)

//   const transaction = new Transaction().add(
//     SystemProgram.transfer({
//       fromPubkey: from,
//       toPubkey: to,
//       lamports: amount * LAMPORTS_PER_SOL,
//     })
//   );

//   try {
//     const blockHash = await connection.getRecentBlockhash();
//     transaction.recentBlockhash = blockHash.blockhash;
//     transaction.feePayer = from;
//     transaction.partialSign(...[owner]);
//     const signedTransaction = (await signAllTransactions([transaction]))[0];
//     const signature = await connection.sendRawTransaction(
//       signedTransaction.serialize()
//     );
//     console.log(
//       `Transaction sent: https://explorer.solana.com/tx/${signature}?cluster=devnet`
//     );
//   } catch (error) {
//     console.error("Error sending transaction:", error);
//     alert(
//       `Error sending transaction: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }`
//     );
//   }finally {
//     return true
//   }
// }

export const transferAmount = async (
  from: PublicKey,
  to: PublicKey,
  amount: number,
  signAllTransactions: any
) => {
  if (!signAllTransactions) {
    alert("Please connect your wallet first!");
    return;
  }
  let storedTransfer = localStorage.getItem("storedTransfer");
  if (storedTransfer) {
    return true;
  }

  console.log("from key", from.toBase58());
  console.log("to key", to.toBase58());

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

    // Remove manual signing with `partialSign`
    const signedTransactions = await signAllTransactions([transaction]);

    const signature = await connection.sendRawTransaction(
      signedTransactions[0].serialize()
    );
    console.log(
      `Transaction sent: https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    localStorage.setItem("storedTransfer", JSON.stringify(true));
  } catch (error) {
    console.error("Error sending transaction:", error);
    alert(
      `Error sending transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    return true;
  }
};

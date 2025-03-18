"use server"
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { connection, wallet as WALLET_KEYPAIR } from "./config";

export async function createSPLToken() {

  console.log("Creating a new SPL token...");

  // ✅ Create Mint (Token)
  const mint = await createMint(
    connection,          // Solana connection
    WALLET_KEYPAIR,      // Payer (wallet creating the token)
    WALLET_KEYPAIR.publicKey, // Authority to mint new tokens
    null,                // (Optional) Freeze authority (null if not needed)
    9,
    undefined,
    {},
    TOKEN_PROGRAM_ID                        // Decimals (9 is common for SPL tokens)
  )

  console.log(`✅ Token Mint Created: ${mint.toBase58()}`);

  // ✅ Create an Associated Token Account for this Wallet
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, 
    WALLET_KEYPAIR, 
    mint, 
    WALLET_KEYPAIR.publicKey 
  );

  console.log(`✅ Associated Token Account Created: ${tokenAccount.address.toBase58()}`);

  // ✅ Mint Some Tokens (e.g., 1000 tokens with 9 decimals)
  await mintTo(
    connection, 
    WALLET_KEYPAIR, 
    mint, 
    tokenAccount.address, 
    WALLET_KEYPAIR.publicKey, 
    1_000_000_000_000 // 1000 tokens (adjust decimals accordingly)
  );

  console.log("✅ Tokens Minted!");
  
  return {
    mint: mint.toBase58(),
    tokenAccount: tokenAccount.address.toBase58()
  };
}
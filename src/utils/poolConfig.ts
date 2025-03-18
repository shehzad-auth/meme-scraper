"use server"
import { Liquidity } from "@raydium-io/raydium-sdk";
import { PublicKey, Keypair } from "@solana/web3.js";
import { connection, PROGRAMIDS, MYTOKEN, DEFAULT_TOKEN, wallet } from "./config";
import { buildAndSendTx, getWalletTokenAccount } from "./util";
import Decimal from "decimal.js";
import BN from 'bn.js';  // Add this import

export async function ammCreatePool() {
  // ✅ Define token pair
  const baseToken = MYTOKEN; // Your SPL token
  //const quoteToken = DEFAULT_TOKEN.SOL; // USDC or SOL

  const quoteToken = {
    mint: new PublicKey("So11111111111111111111111111111111111111112"), // Wrapped SOL mint address
    decimals: 9
  };

  // ✅ Define market ID (replace with real market ID if already created)
  const targetMarketId = Keypair.generate().publicKey;

  // ✅ Define initial liquidity amounts (using BN instead of BigInt)
  const addBaseAmount = new BN("100000000000");
  const addQuoteAmount = new BN("100000"); // 1 USDC (assuming 6 decimals)

  // ✅ Set pool start time
  const startTime = new BN(Math.floor(Date.now() / 1000) + 60 * 5); // Start in 5 minutes

  // ✅ Get wallet token accounts
  const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey);

  // ✅ Compute initial pool price
  console.log(
    "Pool price: ",
    new Decimal(addBaseAmount.toString()) // Convert BN to string for Decimal.js
      .div(new Decimal(10 ** baseToken.decimals))
      .div(new Decimal(addQuoteAmount.toString()).div(new Decimal(10 ** quoteToken.decimals)))
      .toString()
  );

  try {
    // ✅ Create pool on Raydium
    const res = await Liquidity.makeCreatePoolV4InstructionV2Simple({
      connection,
      programId: PROGRAMIDS.AmmV4,
      marketInfo: {
        marketId: targetMarketId,
        programId: PROGRAMIDS.OPENBOOK_MARKET,
      },
      baseMintInfo: baseToken,
      quoteMintInfo: quoteToken,
      baseAmount: addBaseAmount,  // Pass BN directly
      quoteAmount: addQuoteAmount,  // Pass BN directly
      startTime: startTime,  // Pass BN directly
      ownerInfo: {
        feePayer: wallet.publicKey,
        wallet: wallet.publicKey,
        tokenAccounts: walletTokenAccounts,
        useSOLBalance: true,
      },
      associatedOnly: false,
      checkCreateATAOwner: true,
      makeTxVersion: 0,
      feeDestinationId: new PublicKey("7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5"),
    });
    
    return { txids: await buildAndSendTx(res.innerTransactions) }
  } catch (error) {
    console.error("Error creating liquidity pool:", error);
    throw error;
  }

  console.log("Done...");
}
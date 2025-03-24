"use server"

import { PublicKey, Keypair } from "@solana/web3.js";
import { connection, PROGRAMIDS, DEFAULT_TOKEN, wallet, FEE_DESTINATION } from "./config";
import { buildAndSendTx, getWalletTokenAccount } from "./util";
import Decimal from "decimal.js";
import BN from 'bn.js';
import {
  Liquidity,
  Token,
  TOKEN_PROGRAM_ID,
  //MARKET_PROGRAM_ID_V2
} from '@raydium-io/raydium-sdk';

import {
  Connection,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import { createMarket } from "./createMarket";
// import { PumpFunSDK, CreateTokenMetadata } from "./pumpfun";

export async function ammCreatePool(spltoken:any) {
  // ✅ Define token pair
  const baseToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(spltoken.mint), 9);

  const quoteToken = new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("So11111111111111111111111111111111111111112"), // WSOL
    9
  );

  // ✅ Define market ID (replace with real market ID if already created)
  const targetMarketId = Keypair.generate().publicKey;

  // ✅ Define initial liquidity amounts (using BN instead of BigInt)
const Balance = await connection.getBalance(wallet.publicKey);

const maxBaseAmount = Balance / 3; // use half of the available balance
const maxQuoteAmount = Balance / 3; // use half of the available balance

const addBaseAmount = new BN(Math.min(maxBaseAmount, 100000)); // limit to 100,000 or available balance
const addQuoteAmount = new BN(Math.min(maxQuoteAmount, 100000000000));

  // ✅ Set pool start time
  const startTime = new BN(Math.floor(Date.now() / 1000) + 60 * 5); // Start in 5 minutes
  // ✅ Get wallet token accounts
  const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey);
  // ✅ Compute initial pool price
  console.log(
    "✅ Pool price: ",
    new Decimal(addBaseAmount.toString()) // Convert BN to string for Decimal.js
      .div(new Decimal(10 ** baseToken.decimals))
      .div(new Decimal(addQuoteAmount.toString()).div(new Decimal(10 ** quoteToken.decimals)))
      .toString()
  );

  console.log("Creating New Market...")
  const marketRes = await createMarket({ baseToken: quoteToken, quoteToken, wallet: wallet, })
  console.log("✅ Market Created: ", marketRes)

  try {
    if (!FEE_DESTINATION) {
      throw new Error('FEE_DESTINATION is not defined');
    }
    
    const targetMarketId = new PublicKey((marketRes).txids[0]);
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
      feeDestinationId: new PublicKey(FEE_DESTINATION),
    });
    
    console.log('Liquidity pool created successfully');
    return { txids: await buildAndSendTx(res.innerTransactions, { skipPreflight: true }) }
  } catch (error) {
    console.error("Error creating liquidity pool:", error);
    throw error;
  }
}
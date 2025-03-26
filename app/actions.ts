"use server"
import { PublicKey } from '@solana/web3.js';
import { connection, initSdk, owner } from './utils/config';
import { Helius } from 'helius-sdk';

const helius = new Helius('65fcc005-35d2-48ec-bef0-c5cc89bc5197');

export async function test() {
    // createSPLToken().then(res => {
    //     console.log("🎉 SPL Token Successfully Created!", res);
    //   }).catch(err => console.error("❌ Error Creating Token:", err));
}

export const fetchBalance = async () => {
    try {
      const balance = await connection.getBalance(new PublicKey(owner.publicKey || ""));
      console.log("---> Balance:", balance / 1e9, "SOL"); // Convert from lamports to SOL
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
};

export const UserBalance = async (publicKey: string) => {
    try {
      const balance = await connection.getBalance(new PublicKey(publicKey));
      console.log("---> Balance:", balance / 1e9, "SOL"); // Convert from lamports to SOL
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
};

export const swap = async (from: string, to: string , a: number) => {
  try {
    // 'So11111111111111111111111111111111111111112'; // SOL Token
    // 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'; // USDT Token
    // 'ENchkhrvTGbYhgXTnZPhdbL74k1uRJrGijLeUfyuNjgD'; // My Token

    const amount = a * 10 ** 9; // 1 SOL in lamports
    const result = await helius.rpc.executeJupiterSwap(
      { inputMint: from, outputMint: to, amount},
      owner
    );

    if (result) {
      console.log(`Received ${result?.outputAmount} tokens, tx: ${result?.signature}`);
    }
    return result
  }catch(e){
    console.log("Error in Swapping : ",e)
  }
}

export const fetchRpcPoolInfo = async (poolId: string) => {
  console.log("Fetching Pool Info...");
  const raydium = await initSdk()
  // SOL-RAY
  const pool1 = poolId
  console.log("Pool ID:", pool1);

  const res = await raydium.cpmm.getRpcPoolInfos([pool1])
  console.log("RES : ",res);

  const pool1Info = res[pool1]

  console.log('SOL-RAY pool price:', pool1Info.poolPrice)
  console.log('cpmm pool infos:', res)
}
"use server"
import { PublicKey } from '@solana/web3.js';
import { connection, owner } from './utils/config';
import { createSPLToken } from './utils/createToken';

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
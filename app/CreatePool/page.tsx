import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { wallet } from "../utils/config";
export default function CreatePool() {
    //const wallet = Keypair.fromSecretKey(new Uint8Array(bs58.decode('5oQF1ezb1yGSs3FVYQuMmLiww8oH1sjX8K8rdg7WTR9sSaRL2YpjZGyu89zLBe6p9d613BpM6ZNSJxLGnkr2TDaS')))
    console.log(wallet)
    return (
        <div>
            <h1>Server Page</h1>
        </div>
    );
}
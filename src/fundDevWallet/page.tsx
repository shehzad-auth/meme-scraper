"use client"
import { useState } from 'react';
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';

export default function FundDevWallet() {
    const [txSig, setTxSig] = useState<string>('');

    const { publicKey, sendTransaction} = useWallet();
    const { connection } = useConnection();

    const fundWallet = async( event: { preventDefault: () => void; }) => {
        console.log("in")
        event.preventDefault();

        if (!publicKey || !connection) {
            alert('Please connect your wallet first!');
            return;
        }

        const sender = Keypair.generate();

        const balance = await connection.getBalance(sender.publicKey);
        if(balance < LAMPORTS_PER_SOL) {
            await connection.requestAirdrop(sender.publicKey, LAMPORTS_PER_SOL * 10);
        }

        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: sender.publicKey,
                toPubkey: publicKey,
                lamports: LAMPORTS_PER_SOL * 9,
            })
        );

        try {
            const signature = await sendTransaction(tx, connection, {
                signers: [sender]
            });
            setTxSig(signature);
        } catch (error) {
            console.error(error);
        }
    }

    const outputs = [
        {
            title: "Transaction Signature",
            dependency: txSig,
            href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
        }
    ]

    return (
        <div>
            <button onClick={(event) => fundWallet(event)}> Fund Wallet ... </button>

            {outputs.map((output, idx) => (
                <div key={idx}>
                    <a href={output.href} target="_blank">
                        {output.title}: {output.dependency}
                    </a>
                </div>
            ))}
        </div>
    );
}
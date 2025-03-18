import {
    ENDPOINT as _ENDPOINT,
    Currency,
    LOOKUP_TABLE_CACHE,
    MAINNET_PROGRAM_ID,
    RAYDIUM_MAINNET,
    Token,
    TOKEN_PROGRAM_ID,
    TxVersion,
  } from '@raydium-io/raydium-sdk';
  import {
    Connection,
    Keypair,
    PublicKey,
  } from '@solana/web3.js';
  import bs58 from "bs58";
  
  export const rpcUrl: string = 'https://mainnet.helius-rpc.com/?api-key=46738274-cac9-4e4b-9bbd-a77cc66b402e'
  export const rpcToken: string | undefined = undefined

  console.log(process.env.MY_WALLET_PRIVATE_KEY)
  
  export const wallet = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.MY_WALLET_PRIVATE_KEY || '')))
  
  export const connection = new Connection(rpcUrl, 'confirmed');
  
  export const PROGRAMIDS = MAINNET_PROGRAM_ID;
  
  export const ENDPOINT = _ENDPOINT;
  
  export const RAYDIUM_MAINNET_API = RAYDIUM_MAINNET;
  
  export const makeTxVersion = TxVersion.V0; // LEGACY
  
  export const addLookupTableInfo = LOOKUP_TABLE_CACHE // only mainnet. other = undefined
  
  export const DEFAULT_TOKEN = {
    'SOL': new Currency(9, 'USDC', 'USDC'),
    'WSOL': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'),
    'USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
    'RAY': new Token(TOKEN_PROGRAM_ID, new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY'),
    'RAY_USDC-LP': new Token(TOKEN_PROGRAM_ID, new PublicKey('FGYXP4vBkMEtKhxrmEBcWN8VNmXX8qNgEJpENKDETZ4Y'), 6, 'RAY-USDC', 'RAY-USDC'),
  }

    export const MYTOKEN = new Token(TOKEN_PROGRAM_ID, new PublicKey('HfgN3Nz2NjsG4xjeKHNBGrJJkAE3zAdxsq2oMMdcnscD'), 9)
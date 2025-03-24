// import {
//     ENDPOINT as _ENDPOINT,
//     Currency,
//     DEVNET_PROGRAM_ID,
//     LOOKUP_TABLE_CACHE,
//     MAINNET_PROGRAM_ID,
//     RAYDIUM_MAINNET,
//     Token,
//     TOKEN_PROGRAM_ID,
//     TxVersion,
//   } from '@raydium-io/raydium-sdk';
//   import {
//     Connection,
//     Keypair,
//     PublicKey,
//     clusterApiUrl,
//   } from '@solana/web3.js';
//   import bs58 from "bs58";

//   const env = "dev"
  
//   let rpcUrl
//   if (env == "dev") {
//     rpcUrl = 'https://api.devnet.solana.com'
//   } else {
//     rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=46738274-cac9-4e4b-9bbd-a77cc66b402e'
//   }
//   export { rpcUrl }
//   export const rpcToken: string | undefined = undefined
  
//   export const wallet = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.MY_WALLET_PRIVATE_KEY || '')))
  
//   export const connection = new Connection(rpcUrl, 'confirmed'); // mainnet
//   // export const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');
  
//   let PROGRAMID
//   if (env == "dev") {
//     PROGRAMID = DEVNET_PROGRAM_ID
//   } else {
//     PROGRAMID = MAINNET_PROGRAM_ID
//   }
  
//   export const PROGRAMIDS = PROGRAMID;
  
//   export const ENDPOINT = _ENDPOINT;
  
//   export const RAYDIUM_MAINNET_API = RAYDIUM_MAINNET;
  
//   export const makeTxVersion = TxVersion.V0; // LEGACY
  
//   let lookup_TABLE
//   if (env == "dev") {
//     lookup_TABLE = undefined
//   } else {
//     lookup_TABLE = LOOKUP_TABLE_CACHE
//   }
//   export const addLookupTableInfo = lookup_TABLE


//   let feeDestinationId
//   if (env == "dev") {
//     feeDestinationId = "3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR"
//   } else {
//     feeDestinationId = "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5"
//   }
//   export const FEE_DESTINATION = feeDestinationId
  
//   export const DEFAULT_TOKEN = {
//     'SOL': new Currency(9, 'USDC', 'USDC'),
//     'WSOL': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'),
//     'USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
//     'RAY': new Token(TOKEN_PROGRAM_ID, new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY'),
//     'RAY_USDC-LP': new Token(TOKEN_PROGRAM_ID, new PublicKey('FGYXP4vBkMEtKhxrmEBcWN8VNmXX8qNgEJpENKDETZ4Y'), 6, 'RAY-USDC', 'RAY-USDC'),
//   }




  import { Raydium, TxVersion, parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2'
  import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js'
  import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
  import bs58 from 'bs58'
  
  export const cluster = 'devnet' // 'mainnet' | 'devnet'
  
  let rpcUrl
  if (cluster == "devnet") {
    rpcUrl = 'https://api.devnet.solana.com'
  } else {
    rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=46738274-cac9-4e4b-9bbd-a77cc66b402e'
  }
  export { rpcUrl }
  export const rpcToken: string | undefined = undefined
  export const connection = new Connection(rpcUrl, 'confirmed'); 

  export const owner: Keypair = Keypair.fromSecretKey(bs58.decode("5oQF1ezb1yGSs3FVYQuMmLiww8oH1sjX8K8rdg7WTR9sSaRL2YpjZGyu89zLBe6p9d613BpM6ZNSJxLGnkr2TDaS"))
  export const txVersion = TxVersion.LEGACY// TxVersion.V0 // or TxVersion.LEGACY

  
  let raydium: Raydium | undefined
  export const initSdk = async (params?: { loadToken?: boolean }) => {
    if (raydium) return raydium

    if (connection.rpcEndpoint === clusterApiUrl('mainnet-beta'))
    console.warn('using free rpc node might cause unexpected error, strongly suggest uses paid rpc node')

    console.log(`connect to rpc ${connection.rpcEndpoint} in ${cluster}`)
    raydium = await Raydium.load({
      owner,
      connection,
      cluster,
      disableFeatureCheck: true,
      disableLoadToken: !params?.loadToken,
      blockhashCommitment: 'finalized',
      // urlConfigs: {
      //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
      // },
    })
  
    /**
     * By default: sdk will automatically fetch token account data when need it or any sol balace changed.
     * if you want to handle token account by yourself, set token account data after init sdk
     * code below shows how to do it.
     * note: after call raydium.account.updateTokenAccount, raydium will not automatically fetch token account
     */
  
    /*  
    raydium.account.updateTokenAccount(await fetchTokenAccountData())
    connection.onAccountChange(owner.publicKey, async () => {
      raydium!.account.updateTokenAccount(await fetchTokenAccountData())
    })
    */
  
    return raydium
  }
  
  export const fetchTokenAccountData = async () => {
    const solAccountResp = await connection.getAccountInfo(owner.publicKey)
    const tokenAccountResp = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_PROGRAM_ID })
    const token2022Req = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_2022_PROGRAM_ID })
    const tokenAccountData = parseTokenAccountResp({
      owner: owner.publicKey,
      solAccountResp,
      tokenAccountResp: {
        context: tokenAccountResp.context,
        value: [...tokenAccountResp.value, ...token2022Req.value],
      },
    })
    return tokenAccountData
  }
  
  export const grpcUrl = '<YOUR_GRPC_URL>'
  export const grpcToken = '<YOUR_GRPC_TOKEN>'

  export const host = "https://localhost:3000"
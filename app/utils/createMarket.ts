"use server"
import { RAYMint, USDCMint, OPEN_BOOK_PROGRAM, DEVNET_PROGRAM_ID, WSOLMint } from '@raydium-io/raydium-sdk-v2'
import { cluster, connection, initSdk, txVersion } from './config'
import { PublicKey, SendTransactionError } from '@solana/web3.js'

export const createMarket = async (baseTokenMintAddress: any) => {
  const raydium = await initSdk()

  // check mint info here: https://api-v3.raydium.io/mint/list
  // or get mint info by api: await raydium.token.getTokenInfo('mint address')

  //const PROGRAMID = cluster === 'mainnet' ? OPEN_BOOK_PROGRAM : DEVNET_PROGRAM_ID.OPENBOOK_MARKET;
  const PROGRAMID = cluster === 'mainnet' ? OPEN_BOOK_PROGRAM : DEVNET_PROGRAM_ID.OPENBOOK_MARKET;
  
  const marketInfo = {
    baseInfo: {
      // create market doesn't support token 2022
      mint: new PublicKey(baseTokenMintAddress),
      decimals: 9,
    },
    quoteInfo: {
      // create market doesn't support token 2022
      mint: WSOLMint,
      decimals: 9,
    },
    lotSize: 1,
    tickSize: 0.01,
    dexProgramId: PROGRAMID,
    // dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET, // devnet

    // requestQueueSpace: 5120 + 12, // optional
    // eventQueueSpace: 262144 + 12, // optional
    // orderbookQueueSpace: 65536 + 12, // optional

    txVersion,
    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },
  }
  const { execute, extInfo, transactions } = await raydium.marketV2.create(marketInfo)

//   console.log(
//     `create market total ${transactions.length} txs, market info: `,
//     Object.keys(extInfo.address).reduce(
//       (acc, cur) => ({
//         ...acc,
//         [cur]: extInfo.address[cur as keyof typeof extInfo.address].toBase58(),
//       }),
//       {}
//     )
//   )

  try {
    const txIds = await execute({
      sequentially: true,
    });
    console.log("✅ Market created! Market ID:", extInfo.address.marketId.toBase58());
    return extInfo.address.marketId.toBase58();
  } catch (error) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError:', await error.getLogs(connection));
      return console.error('SendTransactionError:', await error.getLogs(connection))
    } else {
      console.error('Error:', error);
    }
  }

  
}

/** uncomment code below to execute */
// createMarket()
"use server"
import { ApiV3PoolInfoStandardItemCpmm, CpmmKeys, Percent, getPdaPoolAuthority } from '@raydium-io/raydium-sdk-v2'
import { connection, initSdk, txVersion } from './config'
import BN from 'bn.js'
import { isValidCpmm } from './utils'
import { SendTransactionError } from '@solana/web3.js'

export const withdraw = async (poolId: string, lpAmountn: number) => {
  const raydium = await initSdk()
  // SOL - USDC pool
//   const poolId = '7JuwJuNU88gurFnyWeiyGKbFmExMWcmRZntn9imEzdny'
  let poolInfo: ApiV3PoolInfoStandardItemCpmm
  let poolKeys: CpmmKeys | undefined

  if (raydium.cluster === 'mainnet') {
    // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
    // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
    const data = await raydium.cpmm.getPoolInfoFromRpc(poolId)
    poolInfo = data.poolInfo
    poolKeys = data.poolKeys

    if (!isValidCpmm(poolInfo.programId)) throw new Error('target pool is not CPMM pool')
  } else {
    const data = await raydium.cpmm.getPoolInfoFromRpc(poolId)
    poolInfo = data.poolInfo
    poolKeys = data.poolKeys
  }

  const slippage = new Percent(1, 100) // 1%
  const lpAmount = new BN(lpAmountn)

  const { execute } = await raydium.cpmm.withdrawLiquidity({
    poolInfo,
    poolKeys,
    lpAmount,
    txVersion,
    slippage,

    // closeWsol: false, // default if true, if you want use wsol, you need set false

    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },
    // optional: add transfer sol to tip account instruction. e.g sent tip to jito
    // txTipConfig: {
    //   address: new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'),
    //   amount: new BN(10000000), // 0.01 sol
    // },
  })

  // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
  try{
    const { txId } = await execute({ sendAndConfirm: true })
    console.log('pool deposited', { txId: `https://explorer.solana.com/tx/${txId}` })
  } catch (error) {
      if (error instanceof SendTransactionError) {
          console.error("SendTransactionError:", await error.getLogs(connection));
          return console.error(
          "SendTransactionError:",
          await error.getLogs(connection)
          );
      } else {
          console.error("Error:", error);
      }
  } // if you don't want to end up node execution, comment this line
}

/** uncomment code below to execute */
// withdraw()
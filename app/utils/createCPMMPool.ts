"use server";
import {
    CREATE_CPMM_POOL_PROGRAM,
    CREATE_CPMM_POOL_FEE_ACC,
    DEVNET_PROGRAM_ID,
    getCpmmPdaAmmConfigId,
  } from '@raydium-io/raydium-sdk-v2'
  import BN from 'bn.js'
  import { cluster, connection, initSdk, txVersion } from './config'
import { SendTransactionError } from '@solana/web3.js';
  
  export const createPool = async (mintAAddr: any, mintBAddr:any) => {
    const PROGRAMID = cluster === "mainnet" ? CREATE_CPMM_POOL_PROGRAM : DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM;
    const POOL_FEE_ACCOUNT = cluster === "mainnet" ? CREATE_CPMM_POOL_FEE_ACC : DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC;
    
    const raydium = await initSdk({ loadToken: true })
  
    // check token list here: https://api-v3.raydium.io/mint/list
    // RAY
    const mintA = await raydium.token.getTokenInfo(mintAAddr)
    // USDC
    const mintB = await raydium.token.getTokenInfo(mintBAddr)
  
    /**
     * you also can provide mint info directly like below, then don't have to call token info api
     *  {
        address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        decimals: 6,
      } 
     */
  
    const feeConfigs = await raydium.api.getCpmmConfigs()
  
    if (raydium.cluster === 'devnet') {
      feeConfigs.forEach((config) => {
        config.id = getCpmmPdaAmmConfigId(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, config.index).publicKey.toBase58()
      })
    }
  
    const { execute, extInfo } = await raydium.cpmm.createPool({
      // poolId: // your custom publicKey, default sdk will automatically calculate pda pool id
      programId: PROGRAMID, // devnet: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM
      poolFeeAccount: POOL_FEE_ACCOUNT, // devnet:  DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC
      mintA,
      mintB,
      mintAAmount: new BN(0.01 * 10 ** 9),
      mintBAmount: new BN(0.01 * 10 ** 9 ),
      startTime: new BN(0),
      feeConfig: feeConfigs[0],
      associatedOnly: false,
      ownerInfo: {
        useSOLBalance: true,
      },
      txVersion,
      // optional: set up priority fee here
      // computeBudgetConfig: {
      //   units: 600000,
      //   microLamports: 46591500,
      // },
    })

    try {
        // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
        const { txId } = await execute({ sendAndConfirm: true })
        console.log('pool created', {
        txId,
        poolKeys: Object.keys(extInfo.address).reduce(
            (acc, cur) => ({
            ...acc,
            [cur]: extInfo.address[cur as keyof typeof extInfo.address].toString(),
            }),
            {}
        ),
        })
        console.log("extInfo", extInfo)
        return txId // if you don't want to end up node execution, comment this line
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
    }
  }
  
  /** uncomment code below to execute */
  // createPool()
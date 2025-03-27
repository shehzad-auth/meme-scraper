"use server";
import {
  ApiV3PoolInfoStandardItemCpmm,
  CpmmKeys,
  Percent,
  getPdaPoolAuthority,
} from "@raydium-io/raydium-sdk-v2";
import BN from "bn.js";
import { connection, initSdk, txVersion } from "./config";
import Decimal from "decimal.js";
import { isValidCpmm } from "./utils";
import { SendTransactionError } from "@solana/web3.js";

export const deposit = async (poolId: string, uiInputAmount: string) => {
  const raydium = await initSdk();

  // SOL - USDC pool
  // const poolId = '7JuwJuNU88gurFnyWeiyGKbFmExMWcmRZntn9imEzdny'
  let poolInfo: ApiV3PoolInfoStandardItemCpmm;
  let poolKeys: CpmmKeys | undefined;

  if (raydium.cluster === "devnet") {
    // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
    // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
    const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
    poolInfo = data.poolInfo;
    poolKeys = data.poolKeys;
    console.log("poolInfo", poolInfo);
    if (!isValidCpmm(poolInfo.programId))
      throw new Error("target pool is not CPMM pool");
  } else {
    const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
    poolInfo = data.poolInfo;
    poolKeys = data.poolKeys;
  }

  const inputAmount = new BN(
    new Decimal(uiInputAmount).mul(10 ** poolInfo.mintA.decimals).toFixed(0)
  );
  const slippage = new Percent(1, 100); // 1%
  const baseIn = true;

  // computePairAmount is not necessary, addLiquidity will compute automatically,
  // just for ui display
  /*
  const res = await raydium.cpmm.getRpcPoolInfos([poolId]);
  const pool1Info = res[poolId];

  const computeRes = await raydium.cpmm.computePairAmount({
    baseReserve: pool1Info.baseReserve,
    quoteReserve: pool1Info.quoteReserve,
    poolInfo,
    amount: uiInputAmount,
    slippage,
    baseIn,
    epochInfo: await raydium.fetchEpochInfo()
  });

  computeRes.anotherAmount.amount -> pair amount needed to add liquidity
  computeRes.anotherAmount.fee -> token2022 transfer fee, might be undefined if isn't token2022 program
  */

  const { execute } = await raydium.cpmm.addLiquidity({
    poolInfo,
    poolKeys,
    inputAmount,
    slippage,
    baseIn,
    txVersion,
  });
  try {
    const { txId } = await execute({ sendAndConfirm: true });
    console.log("pool deposited", {
      txId: `https://explorer.solana.com/tx/${txId}`,
    });
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
};

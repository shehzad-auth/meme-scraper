"use server"
import {
  ApiV3PoolInfoStandardItemCpmm,
  CpmmKeys,
  CpmmRpcData,
  CurveCalculator,
} from "@raydium-io/raydium-sdk-v2";
import BN from "bn.js";
import { isValidCpmm } from "./util";
import { connection, initSdk } from "./config";
import { SendTransactionError } from "@solana/web3.js";

export const swapNew = async (
  poolId: string,
  amount: number,
  inputMint: string,
  /**
   * If `true`, inputAmount is the amount of base mint to be swapped.
   * If `false`, inputAmount is the amount of quote mint to be swapped.
   */
  baseIn: boolean
) => {
  const raydium = await initSdk();
  // const amount = new BN(swapData.inputAmount * 10 ** 9);
  const inputAmount = new BN(amount * 10 ** 9)
  let poolInfo: ApiV3PoolInfoStandardItemCpmm;
  let poolKeys: CpmmKeys | undefined;
  let rpcData: CpmmRpcData;

  if (raydium.cluster === "mainnet") {
    const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
    poolInfo = data.poolInfo;
    poolKeys = data.poolKeys;
    rpcData = data.rpcData;
  } else {
    const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
    poolInfo = data.poolInfo;
    poolKeys = data.poolKeys;
    rpcData = data.rpcData;
  }


  if (
    inputMint !== poolInfo.mintA.address &&
    inputMint !== poolInfo.mintB.address
  )
    throw new Error("input mint does not match pool");

  const swapResult = CurveCalculator.swap(
    inputAmount,
    baseIn ? rpcData.baseReserve : rpcData.quoteReserve,
    baseIn ? rpcData.quoteReserve : rpcData.baseReserve,
    rpcData.configInfo!.tradeFeeRate
  );

  console.log("swapResult : ",swapResult)

  /**
   * swapResult.sourceAmountSwapped -> input amount
   * swapResult.destinationAmountSwapped -> output amount
   * swapResult.tradeFee -> this swap fee, charge input mint
   */
try {
  const { execute } = await raydium.cpmm.swap({
    poolInfo,
    poolKeys,
    inputAmount,
    swapResult,
    slippage: 0.001,
    baseIn,
  });
  const { txId } = await execute({ sendAndConfirm: true });
  console.log(
    `swapped: ${poolInfo.mintA.symbol} to ${poolInfo.mintB.symbol}:`,
    {
      txId: `https://explorer.solana.com/tx/${txId}`,
    }
  );
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

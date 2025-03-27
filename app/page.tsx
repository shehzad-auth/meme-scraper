"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);
import type { NextPage } from "next";
import { fetchRpcPoolInfo, swap } from "./actions";
import { createSPLToken } from "./utils/createToken";
import { createMarket } from "./utils/createMarket";
import { createAmmPool } from "./utils/createAMMPool";
import { getTempWallet, transferAmount } from "./utils/functions";
import { createPool } from "./utils/createCPMMPool";
import { deposit } from "./utils/deposit";
import { withdraw } from "./utils/withdraw";

const CreateToken: NextPage = () => {
  const { publicKey, signAllTransactions } =
    useWallet();
  const [textLogs, setTextLogs] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [swapData, setSwapData] = useState({
    from: "",
    to: "",
    amount: 0
  })
  

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("swap result : ", await swap( swapData.from, swapData.to, swapData.amount ));
  };

  const log = (text: string) => {
    setTextLogs((prev) => [...prev, text]);
    console.log(text);
  }

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    // Steps
    // 1. Create temp wallet
    // 2. Transfer amount from user to temp wallet
    // 3. create token from temp wallet
    // 4. create market
    // 5. create pool
    // 6. check investment in pool using helius webhook
    // 7. after certain amount of investment, collect total amount

    try{
      // 1. Create temp wallet
      log("Creating Temp Wallet...")
      const tempWallet = await getTempWallet();
      log(`Created Temp Wallet: ${tempWallet.publicKey}`)
  
      // 2. Transfer amount from user to temp wallet
      if(!publicKey || !signAllTransactions) {
        log("Please connect your wallet first!")
        return;
      }else if(publicKey === tempWallet.publicKey) {
        log("You cannot transfer amount to your own wallet!")
        return;
      }else if(amount <= 0) {
        log("Amount must be greater than 0")
        return;
      }
      log("Transferring amount from user to temp wallet...")
      await transferAmount( publicKey!, tempWallet.publicKey, amount, signAllTransactions )
      log(`Transferred amount from user to temp wallet: ${amount}`)

      // 3. create token from temp wallet
      log("Creating Token...")
      const spltoken = await createSPLToken()
      log(`Created Token: ${spltoken.mint}`)

      // 4. create market
      log("Creating Market...")
      const marketRes = await createMarket(spltoken.mint)
      log(`Created Market: ${marketRes}`)

      // 5. create pool
      log("Creating Pool...")
      const res = await createPool("So11111111111111111111111111111111111111112", spltoken.mint)
      log(`Created Pool: ${res}`)

      console.log("Deposit : ", await deposit('AgWuDqwncV3AUvtNmwd6dUYZeBnTvfCzV9mubby1X3xT', '0.0001'))
      console.log("POOL : ", await fetchRpcPoolInfo('AgWuDqwncV3AUvtNmwd6dUYZeBnTvfCzV9mubby1X3xT'))
      console.log("withdraw : ", await withdraw('AgWuDqwncV3AUvtNmwd6dUYZeBnTvfCzV9mubby1X3xT', 100))

      // const res = await createAmmPool(amount, marketRes)
      // log(`Created Pool: ${res}`)

      // 6. check investment in pool using helius webhook
      // 7. after certain amount of investment, collect total amount

    }catch(e){
      log(`Error : ${e}`)
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-2 flex flex-col justify-center items-center">
      <WalletMultiButton
        style={{ position: "fixed", top: "15px", right: "15px" }}
      />
      <div className="flex gap-5">
        <div className="max-w-[600px] p-10 bg-white shadow-lg rounded-2xl">
          <form className="flex justify-between items-end gap-2 w-full" onSubmit={handleInvest}>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Amount</label>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(e.target.valueAsNumber)}
                className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                placeholder="( SOL )"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-[10px] px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              Invest
            </button>
          </form>
          {/* <div className="flex justify-center items-center gap-4 mt-5 w-full">
            <div className="border-2 border-purple-700 rounded-md p-4 min-w-[130px] text-center">
              Token Number
            </div>
            <div className="border-2 border-purple-700 rounded-md p-4 min-w-[130px] text-center">
              Total Users
            </div>
            <div className="border-2 border-purple-700 rounded-md p-4 min-w-[130px] text-center">
              Total Coin
            </div>
          </div> */}
          <div className="bg-black h-[30vh] w-full text-white mt-5 rounded-md p-4 overflow-auto">
            {textLogs.length > 0 ? (
              textLogs.map((log: any, index: any) => (
                <div key={index} className=" border-gray-700 py-2 text-xs">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center mt-10">
                No logs available
              </div>
            )}
          </div>
          <button
            onClick={handleInvest}
            className="w-full flex justify-center mt-5 py-[10px] px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            Withdraw
          </button>
        </div>
        <div className="max-w-[600px] p-10 bg-white shadow-lg rounded-2xl">
          <form className="" onSubmit={handleSwap}>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">From Address</label>
              <input
                type="text"
                value={swapData.from || ""}
                onChange={(e) => setSwapData(prev => ({...prev, from: e.target.value}))}
                className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                placeholder="Address"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mt-3">To Address</label>
              <input
                type="text"
                value={swapData.to || ""}
                onChange={(e) => setSwapData(prev => ({...prev, to: e.target.value}))}
                className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                placeholder="Address"
                required
              />
            </div>
            <div className="flex flex-col ">
              <label className="text-sm text-gray-600 mt-3">Amount</label>
              <input
                type="number"
                value={swapData.amount || ""}
                onChange={(e) => setSwapData(prev => ({...prev, amount: e.target.valueAsNumber}))}
                className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                placeholder="( SOL )"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-3 w-full flex justify-center py-[10px] px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              Swap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateToken;

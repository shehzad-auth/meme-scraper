"use client";
import { useEffect, useState } from "react";
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
import { swapNew } from "./utils/swap";
import { BN } from "bn.js";
import { Keypair } from "@solana/web3.js";
import io from 'socket.io-client'
let socket :any;

const CreateToken: NextPage = () => {
  const { publicKey, signAllTransactions } = useWallet();
  const [textLogs, setTextLogs] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [swapData, setSwapData] = useState({
    poolId: "",
    inputAmount: 0,
    inputMint: "",
  });

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("swap result : ", await swap( swapData.from, swapData.to, swapData.amount ));
    console.log(
      "swap result : ",
      await swapNew(
        swapData.poolId,
        swapData.inputAmount,
        swapData.inputMint,
        true
      )
    );
  };

  const log = (text: string) => {
    setTextLogs((prev) => [...prev, text]);
    console.log(text);
  };

  const investmentLogAndLocalStorage = async (
    key: string,
    options: any = {}
  ) => {
    switch (key) {
      case "tempWallet":
        log("Creating Temp Wallet...");
        let storedWallet = localStorage.getItem("tempWallet");
        if (storedWallet) {
          const secretKey = Uint8Array.from(JSON.parse(storedWallet));
          const tempWallet = Keypair.fromSecretKey(secretKey);
          log(`Created Temp Wallet: ${tempWallet.publicKey}`);
          return tempWallet;
        }
        const tempWallet = await getTempWallet();
        localStorage.setItem(
          "tempWallet",
          JSON.stringify(Array.from(tempWallet.secretKey))
        );
        log(`Created Temp Wallet: ${tempWallet.publicKey}`);
        return tempWallet;

      case "transferAmount":
        log("Transferring amount from user to temp wallet...");
        let storedTransferAmount = localStorage.getItem("transferAmount");
        if (!storedTransferAmount) {
          await transferAmount(
            publicKey!,
            options.tempWallet.publicKey,
            options.amount,
            signAllTransactions
          );
          localStorage.setItem(
            "transferAmount",
            JSON.stringify(options.amount)
          );
        }
        log(`Transferred amount from user to temp wallet: ${options.amount}`);
        return true;

      case "spltoken":
        log("Creating Token...");
        const storedSpltoken = localStorage.getItem("storedSpltoken");
        const spltoken = storedSpltoken
          ? JSON.parse(storedSpltoken)
          : await createSPLToken(options.tempWallet);
        log(`Created Token: ${spltoken.mint}`);
        localStorage.setItem("storedSpltoken", JSON.stringify(spltoken));
        return spltoken;

      case "marketRes":
        log("Creating Market...");
        const storedMarketRes = localStorage.getItem("marketRes");
        const marketRes =
          storedMarketRes != null
            ? JSON.parse(storedMarketRes)
            : await createMarket(options.spltoken.mint);
        log(`Created Market: ${marketRes}`);
        localStorage.setItem("marketRes", JSON.stringify(marketRes));
        return marketRes;

      case "createPool":
        log("Creating Pool...");
        const storedCreatePool = localStorage.getItem("createPool");
        const res = storedCreatePool != null
          ? JSON.parse(storedCreatePool)
          : await createPool(
            "So11111111111111111111111111111111111111112",
            options.spltoken.mint
          );
        log(`Created Pool: ${res}`);
        localStorage.setItem("createPool", JSON.stringify(res));
        return res;

      case "deposit":
        log("Depositing Amount...");
        const storedDeposit = localStorage.getItem("deposit");
        if(!storedDeposit){
          await deposit(options.pool, options.amount)
          localStorage.setItem("deposit", JSON.stringify(options.amount));
        }
        log("Amount Deposited");
        return true;

      default:
        break;
    }
  };

  const handleInvest = async (e: any, amount: number) => {
    e.preventDefault();
    localStorage.setItem("investment", JSON.stringify(amount));

    // Steps
    // 1. Create temp wallet
    // 2. Transfer amount from user to temp wallet
    // 3. create token from temp wallet
    // 4. create market
    // 5. create pool
    // 6. check investment in pool using helius webhook
    // 7. after certain amount of investment, collect total amount

    try {
      // 1. Create temp wallet
      const tempWallet = await investmentLogAndLocalStorage("tempWallet");

      // 2. Transfer amount from user to temp wallet
      if (!publicKey || !signAllTransactions) {
        log("Please connect your wallet first!");
        return;
      } else if (publicKey === tempWallet!.publicKey) {
        log("You cannot transfer amount to your own wallet!");
        return;
      } else if (amount <= 0) {
        log("Amount must be greater than 0");
        return;
      }
      await investmentLogAndLocalStorage("transferAmount", {
        tempWallet,
        amount,
      });

      // 3. create token from temp wallet
      const spltoken = await investmentLogAndLocalStorage("spltoken", {
        tempWallet
      });

      // // 4. create market
      // const marketRes = await investmentLogAndLocalStorage("marketRes", {
      //   spltoken,
      // });

      // 5. create pool
      const pool = await investmentLogAndLocalStorage("createPool", {
        spltoken
      });

      // 6. Deposit amount
      await investmentLogAndLocalStorage("deposit",{amount, pool});
      // console.log(
      //   "Deposit : ",
      //   await deposit("AgWuDqwncV3AUvtNmwd6dUYZeBnTvfCzV9mubby1X3xT", "0.0001")
      // );
      // console.log(
      //   "POOL : ",
      //   await fetchRpcPoolInfo("AgWuDqwncV3AUvtNmwd6dUYZeBnTvfCzV9mubby1X3xT")
      // );
      // console.log(
      //   "withdraw : ",
      //   await withdraw("AgWuDqwncV3AUvtNmwd6dUYZeBnTvfCzV9mubby1X3xT", 100)
      // );

      // const res = await createAmmPool(amount, marketRes)
      // log(`Created Pool: ${res}`)

      // 6. check investment in pool using helius webhook
      // 7. after certain amount of investment, collect total amount
    } catch (e) {
      log(`Error : ${e}`);
    }
  };

  useEffect(() => {
    if (localStorage !== undefined) {
      let investment: string | number | null =
        localStorage.getItem("investment");
      if (investment) {
        investment = parseInt(JSON.parse(investment));
        setAmount(investment);
        handleInvest({ preventDefault: () => {} }, investment);
      } else {
        // localStorage.clear();
      }
    }
  }, []);

  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socketInitializer();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const socketInitializer = async () => {
    await fetch("/api/socket"); // Ensure server is initialized
    socket = io({ path: "/api/socket" });

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("message", (data: string) => {
      console.log("📩 New message:", data);
      setMessages((prev) => [...prev, data]);
    });
  };

  const sendMessage = () => {
    socket.emit("message", `Hello from ${socket.id}`);
  };
  

  return (
    <div className="min-h-screen bg-gray-100 py-2 flex flex-col justify-center items-center">
      <WalletMultiButton
        style={{ position: "fixed", top: "15px", right: "15px" }}
      />
      <div className="flex gap-5">
        <div className="max-w-[600px] p-10 bg-white shadow-lg rounded-2xl">
          <form
            className="flex justify-between items-end gap-2 w-full"
            onSubmit={(e) => handleInvest(e, amount)}
          >
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
          {/* <button
            onClick={handleInvest}
            className="w-full flex justify-center mt-5 py-[10px] px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            Withdraw
          </button> */}
        </div>
        <div className="max-w-[600px] p-10 bg-white shadow-lg rounded-2xl">
          <form className="" onSubmit={handleSwap}>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">poolId</label>
              <input
                type="text"
                value={swapData.poolId || ""}
                onChange={(e) =>
                  setSwapData((prev) => ({ ...prev, poolId: e.target.value }))
                }
                className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                placeholder="Pool Id"
                required
              />
            </div>
            <div className="flex flex-col ">
              <label className="text-sm text-gray-600 mt-3">Input Amount</label>
              <input
                type="number"
                value={swapData.inputAmount || ""}
                onChange={(e) =>
                  setSwapData((prev) => ({
                    ...prev,
                    inputAmount: e.target.valueAsNumber,
                  }))
                }
                className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                placeholder="( SOL )"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mt-3">Input Mint</label>
              <input
                type="text"
                value={swapData.inputMint || ""}
                onChange={(e) =>
                  setSwapData((prev) => ({
                    ...prev,
                    inputMint: e.target.value,
                  }))
                }
                className="px-4 py-2 border focus:ring-purple-500 focus:border-purple-500 rounded-md"
                placeholder="Address"
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

      <div>
      <h1>🔌 WebSocket Chat</h1>
      <button onClick={sendMessage} className="p-3 border-2 border-black">Send Message</button>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
    </div>
  );
};

export default CreateToken;

"use server";
import {
  MARKET_STATE_LAYOUT_V3,
  AMM_V4,
  OPEN_BOOK_PROGRAM,
  FEE_DESTINATION_ID,
  DEVNET_PROGRAM_ID,
} from "@raydium-io/raydium-sdk-v2";
import { cluster, connection, initSdk, txVersion } from "./config";
import { PublicKey, SendTransactionError } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";

export const createAmmPool = async (amount: number, MARKETID: any) => {
  const PROGRAMID = cluster === "mainnet" ? AMM_V4 : DEVNET_PROGRAM_ID.CLMM;
  const MARKET_PROGRAMID =
    cluster === "mainnet"
      ? OPEN_BOOK_PROGRAM
      : DEVNET_PROGRAM_ID.OPENBOOK_MARKET;
  const FEE_DESTINATIONID =
    cluster === "mainnet"
      ? FEE_DESTINATION_ID
      : DEVNET_PROGRAM_ID.FEE_DESTINATION_ID;

  const raydium = await initSdk();
  const marketId = new PublicKey(MARKETID);

  // if you are confirmed your market info, don't have to get market info from rpc below
  const marketBufferInfo = await raydium.connection.getAccountInfo(
    new PublicKey(marketId)
  );
  const { baseMint, quoteMint } = MARKET_STATE_LAYOUT_V3.decode(
    marketBufferInfo!.data
  );

  // check mint info here: https://api-v3.raydium.io/mint/list
  // or get mint info by api: await raydium.token.getTokenInfo('mint address')

  // amm pool doesn't support token 2022
  const baseMintInfo = await raydium.token.getTokenInfo(baseMint);
  const quoteMintInfo = await raydium.token.getTokenInfo(quoteMint);
  const baseAmount = new BN(amount * 10 ** baseMintInfo.decimals);
  const quoteAmount = new BN(amount * 10 ** baseMintInfo.decimals);;

  if (
    baseMintInfo.programId !== TOKEN_PROGRAM_ID.toBase58() ||
    quoteMintInfo.programId !== TOKEN_PROGRAM_ID.toBase58()
  ) {
    throw new Error(
      "amm pools with openbook market only support TOKEN_PROGRAM_ID mints, if you want to create pool with token-2022, please create cpmm pool instead"
    );
  }

  // if (baseAmount.mul(quoteAmount).lte(new BN(1).mul(new BN(10 ** baseMintInfo.decimals)).pow(new BN(2)))) {
  //   throw new Error('initial liquidity too low, try adding more baseAmount/quoteAmount')
  // }

  const { execute, extInfo } = await raydium.liquidity.createPoolV4({
    programId: PROGRAMID,
    marketInfo: {
      marketId,
      programId: MARKET_PROGRAMID,
    },
    baseMintInfo: {
      mint: baseMint,
      decimals: baseMintInfo.decimals,
    },
    quoteMintInfo: {
      mint: quoteMint,
      decimals: quoteMintInfo.decimals,
    },
    baseAmount: baseAmount,
    quoteAmount: quoteAmount,

    startTime: new BN(0),
    ownerInfo: {
      useSOLBalance: true,
    },
    associatedOnly: false,
    txVersion,
    feeDestinationId: FEE_DESTINATIONID,
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 4659150,
    // },
  });

  try {
    const { txId } = await execute({ sendAndConfirm: true });
    console.log(
      "amm pool created! txId: ",
      txId,
      ", poolKeys:",
      Object.keys(extInfo.address).reduce(
        (acc, cur) => ({
          ...acc,
          [cur]:
            extInfo.address[cur as keyof typeof extInfo.address].toBase58(),
        }),
        {}
      )
    );
    console.log("amm pool created! extInfo: ", extInfo);
    return extInfo.address.ammId.toBase58();
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

// ----------------- First Pool --------------

// Pool Created
// ---> Balance: 12.16084372 SOL
//  POST / 200 in 1029ms
// connect to rpc https://api.devnet.solana.com in devnet
// simulate tx string: [
//   'AcEF10UViO8v6qhM/hP6MtsLWvVrJHrFp1dgZvTdlXa2UyYn4MVUmlahYED9F37ZFxgnZJFVPXfyNBcRAOr/AQsBAAsWFCGPk9+JTppuGeX7HTjYVydxgFxi3BwHyJWPq4Kt9EMnFhzXm1cMFPulzsCRfCoIspgDFZFZkvDNhOdHbDfQqSGwXr/UPbArwBYt/EZMMCswZVKaHWTYTkWnhJ32C2yvJNqH3CR+ap160765OJxOKsPrI9xhwxsVA5lRmvj1qYMlfmGPXBABytmdspEDcHRdP3QKG9zl4hKKfKeAPVd68D3/KeH5aATXRsjVF+AXNAhthynBuJ9bqaXhKbWXKKIUZC8pfsVorVuVh6sD19BwmUt4Ee3hNgZz9/Z+Bj6cPN+bn+1npIL5w/OQ8OD365I7DG1HWHXB4cPwRYrb2sUXlLBv20jKQoS/htBH/68E/OoJbOX1mZKtRk/F57iGJtKO5vJYpcpphm64SFnY8i8Qxh9fPCfdMXOjXQC032Kz5hz1d5IJV4C5H8Dhn29O6jvdgNWivwPR5mNcBvs57pGlegAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbf4WPUsPNsn6+Yv59ZOc5qy/EPSN8y/0rNX75XdiHVaMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4Wbsc8KMrGdy+1jlvLpZxbQX1Ed7AHQ9l/XWG3WREqk2PvvylzZZVj4fd5QTeEF/Cu6z3Xb26E3LpuQ1jZ9mnnS7GsX8DWLbfWzesaFlLODVrbfd+pDBRmcqA6eRDYne0Us0OvB2b+t3WyS3gUpHVL3s5kpiU0A3vdEG2g02zN75E9WgrBvzL26a0DSNKFLH33p2LXhHkWnK8qpJiPz5nehsGm4hX/quBhPtof2NGGMA12sQ53BrrO1WYoPAAAAAAAQan1RcZLFxRIYzJTD1K8X9Y2u4Im6H9ROPb2YoAAAAABt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKlUanTkJhBm03TSwe4fZ/yV+0RKybu/xDpSRTCUOO6BMAQLAgAIfAMAAAAUIY+T34lOmm4Z5fsdONhXJ3GAXGLcHAfIlY+rgq30QyAAAAAAAAAAREtHRWozdmVMVURFR2ZYcHoyRXg0dDdlWVpWaHZ1ZFBwflI8AAAAAKUAAAAAAAAABt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKkVBAgTABQBARIVFQ0LFAkOAwYQEwUHAQwEEQ8AAggKGgH8AAAAAAAAAACAYDM8AAAAAIBgMzwAAAAAFQMIAAABCQ=='
// ]
// amm pool created! txId:  4rqANSWSLM4oFngwtbci2Md9dFYzxE8U5p8EJ5mqaYvAJC2noi5Z76KQsrj9hr3e7da9xZJaXCKEAeKskFG5Qg6v , poolKeys: {
//   programId: 'HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8',
//   ammId: 'GYX6xhPFCJtk2yPedVykSFRL4ZvVq78iZ8kyQC4gVzUB',
//   ammAuthority: 'DbQqP6ehDYmeYjcBaMRuA8tAJY1EjDUz9DpwSLjaQqfC',
//   ammOpenOrders: '3UrwuyJTXygqYehR9MF7y3szLdtYe4DN3zbdab6zaMJ2',
//   lpMint: '7k5UrHa1RGMRFAKJLq3az93YR6hvGDtgg4bNjztVwP34',
//   coinMint: 'ENchkhrvTGbYhgXTnZPhdbL74k1uRJrGijLeUfyuNjgD',
//   pcMint: 'So11111111111111111111111111111111111111112',
//   coinVault: '5B1YBKC25hxXJCFAgdQDbs7BfZUuaNKp2g9VSAcAFMJB',
//   pcVault: 'BUVdkr2Gy7xwu19hShAkdKSHeTHW6YPDQgetV9vxJSg3',
//   withdrawQueue: '4TpnjmtqBzTAjdfyijBjTzZPQ6p5sFF4itM3WMQZcHzW',
//   ammTargetOrders: '3daTVZTLjsgZuXr7rXWjJUNjrzbp4L4itKUDgrPhp7eQ',
//   poolTempLp: 'GjDSx7ojPJLikbmFjjrc5JsJoMt36WE5SuoWiG5o2CCz',
//   marketProgramId: 'EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj',
//   marketId: 'DrXuWwnh3bWnzBBdYZ5JPfmXmgPKFFmjTrutC3foXZnm',
//   ammConfigId: '8QN9yfKqWDoKjvZmqFsgCzAqwZBQuzVVnC388dN5RCPo',
//   feeDestinationId: '3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR'
// }
// amm pool created! extInfo:  {
//   address: {
//     programId: PublicKey [PublicKey(HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8)] {
//       _bn: <BN: f5682b06fccbdba6b40d234a14b1f7de9d8b5e11e45a72bcaa92623f3e677a1b>
//     },
//     ammId: PublicKey [PublicKey(GYX6xhPFCJtk2yPedVykSFRL4ZvVq78iZ8kyQC4gVzUB)] {
//       _bn: <BN: e6f258a5ca69866eb84859d8f22f10c61f5f3c27dd3173a35d00b4df62b3e61c>
//     },
//     ammAuthority: PublicKey [PublicKey(DbQqP6ehDYmeYjcBaMRuA8tAJY1EjDUz9DpwSLjaQqfC)] {
//       _bn: <BN: bb1cf0a32b19dcbed6396f2e96716d05f511dec01d0f65fd7586dd6444aa4d8f>
//     },
//     ammOpenOrders: PublicKey [PublicKey(3UrwuyJTXygqYehR9MF7y3szLdtYe4DN3zbdab6zaMJ2)] {
//       _bn: <BN: 24da87dc247e6a9d7ad3beb9389c4e2ac3eb23dc61c31b150399519af8f5a983>
//     },
//     lpMint: PublicKey [PublicKey(7k5UrHa1RGMRFAKJLq3az93YR6hvGDtgg4bNjztVwP34)] {
//       _bn: <BN: 642f297ec568ad5b9587ab03d7d070994b7811ede1360673f7f67e063e9c3cdf>
//     },
//     coinMint: PublicKey [PublicKey(ENchkhrvTGbYhgXTnZPhdbL74k1uRJrGijLeUfyuNjgD)] {
//       _bn: <BN: c6b17f0358b6df5b37ac68594b38356b6df77ea4305199ca80e9e4436277b452>
//     },
//     pcMint: PublicKey [PublicKey(So11111111111111111111111111111111111111112)] {
//       _bn: <BN: 69b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001>
//     },
//     coinVault: PublicKey [PublicKey(5B1YBKC25hxXJCFAgdQDbs7BfZUuaNKp2g9VSAcAFMJB)] {
//       _bn: <BN: 3dff29e1f96804d746c8d517e01734086d8729c1b89f5ba9a5e129b59728a214>
//     },
//     pcVault: PublicKey [PublicKey(BUVdkr2Gy7xwu19hShAkdKSHeTHW6YPDQgetV9vxJSg3)] {
//       _bn: <BN: 9b9fed67a482f9c3f390f0e0f7eb923b0c6d475875c1e1c3f0458adbdac51794>
//     },
//     withdrawQueue: PublicKey [PublicKey(4TpnjmtqBzTAjdfyijBjTzZPQ6p5sFF4itM3WMQZcHzW)] {
//       _bn: <BN: 3372324fe580bb879a949a786d5cb42dcb8413e9ee45d3504879c3d247f7219f>
//     },
//     ammTargetOrders: PublicKey [PublicKey(3daTVZTLjsgZuXr7rXWjJUNjrzbp4L4itKUDgrPhp7eQ)] {
//       _bn: <BN: 27161cd79b570c14fba5cec0917c2a08b2980315915992f0cd84e7476c37d0a9>
//     },
//     poolTempLp: PublicKey [PublicKey(GjDSx7ojPJLikbmFjjrc5JsJoMt36WE5SuoWiG5o2CCz)] {
//       _bn: <BN: e9afc5b012b1b9b15d3b77fa72275eb488c6c8eef7c9efe77bd6ce293d148a0b>
//     },
//     marketProgramId: PublicKey [PublicKey(EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj)] {
//       _bn: <BN: cd0ebc1d9bfaddd6c92de05291d52f7b39929894d00def7441b6834db337be44>
//     },
//     marketId: PublicKey [PublicKey(DrXuWwnh3bWnzBBdYZ5JPfmXmgPKFFmjTrutC3foXZnm)] {
//       _bn: <BN: befca5cd96558f87dde504de105fc2bbacf75dbdba1372e9b90d6367d9a79d2e>
//     },
//     ammConfigId: PublicKey [PublicKey(8QN9yfKqWDoKjvZmqFsgCzAqwZBQuzVVnC388dN5RCPo)] {
//       _bn: <BN: 6dfe163d4b0f36c9faf98bf9f5939ce6acbf10f48df32ff4acd5fbe577621d56>
//     },
//     feeDestinationId: PublicKey [PublicKey(3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR)] {
//       _bn: <BN: 257e618f5c1001cad99db2910370745d3f740a1bdce5e2128a7ca7803d577af0>
//     }
//   }
// }

//  ----------- Second Pool --------------
// simulate tx string: [
//   'AfN2SlRlZs2ycJE+PnCJtDUHDZFpf2/f+TxANfyJNB/YXACboDz6R9GDl5vTHo7CHRB5Pp1luCcKT6sDOwJ/OQcBAAsWFCGPk9+JTppuGeX7HTjYVydxgFxi3BwHyJWPq4Kt9EMPz880PtccEmvsjrCD8wTfeS2/cljB8FxYuHz6Xhla2BaGvx5ab/MVge1m6AjF/vzvKXd2MKI8T1MNkMNVJ5hqKTfcxfNdGOdaLEP0vw8yv55eYMLy8SPV/llt2j0929AlfmGPXBABytmdspEDcHRdP3QKG9zl4hKKfKeAPVd68DwvTqGa2liyUuHHx1HTxE7/Yx7giQ7oFHwtBZ/xzkZ5VsMhnRyM2vkDqGwBwzjRQg79k4QEvOzX+VC22tqmUcC0sbATje6KyJlA66DVlu64MuP1rT5IAkweBJ63+uiWiM3jbZNuFiZV4Bk3tpyDne/zzuBy3cTOqK5/WuAgKjVZ0CjqA9QA4HUrKiCBH8n9gx+den9CBgkKm44/tBJSP8QHU8DwP67LQ5jMEUJXSNwBrX1qOxee0qQ35YVJgQWZLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbf4WPUsPNsn6+Yv59ZOc5qy/EPSN8y/0rNX75XdiHVZ/0DTpTFEs0iWlB4om4rDR8zpPClfkyL62WZdqoOzSi4yXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZqOuSweW6TUvPA8NwL0RmC0/gTyniFxXmaxv8q3/cbYe7HPCjKxncvtY5by6WcW0F9RHewB0PZf11ht1kRKpNj80OvB2b+t3WyS3gUpHVL3s5kpiU0A3vdEG2g02zN75E9WgrBvzL26a0DSNKFLH33p2LXhHkWnK8qpJiPz5nehsGm4hX/quBhPtof2NGGMA12sQ53BrrO1WYoPAAAAAAAQan1RcZLFxRIYzJTD1K8X9Y2u4Im6H9ROPb2YoAAAAABt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKlKjxvjiL2d2YQMu0xKM6AaYOoGMi8l/DY26VikbqkzfQQLAgAHfAMAAAAUIY+T34lOmm4Z5fsdONhXJ3GAXGLcHAfIlY+rgq30QyAAAAAAAAAAM2NmZlA1Ym45cDg5dTlZVE05Vlp4d3ZLM0h4ODcxMU5wflI8AAAAAKUAAAAAAAAABt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKkVBAcTABQBARIVFQ4LFAoQAQkPEwIDBQwEEQ0ABgcIGgH8AAAAAAAAAACAYDM8AAAAAIBgMzwAAAAAFQMHAAABCQ=='
// ]
// amm pool created! txId:  2qcFUn9CYUeth2En48odwUdiDqKnmtuuQExaJN5n9U33iwMQoyRNT28YBn4kPUrbswsbN4qcYeHV6SGgTK49pjc1 , poolKeys: {
//   programId: 'HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8',
//   ammId: 'VbviEfpxAP5GH7keQikXp1vNTHzYpSzN3vH34XGJ9zC',
//   ammAuthority: 'DbQqP6ehDYmeYjcBaMRuA8tAJY1EjDUz9DpwSLjaQqfC',
//   ammOpenOrders: '24iuPBUX3PTQo5rbPy6evuD2wYjKUopaJkr5WKAc3ne3',
//   lpMint: 'F1ZzBCWoo5okHTH2Q8J6sZzkZdbiRxLx1BUehSdtxWKM',
//   coinMint: 'CNPqTMHrUrgzqWLM5qozPYUMmgg2adCGmdV115XSkM8S',
//   pcMint: 'So11111111111111111111111111111111111111112',
//   coinVault: '2Ww97ayY6hCMwFBz5CwmzTQG4JcvnTuzoNpqNMefwiQ1',
//   pcVault: '3mu7zgL9qHusS9FuqjHaD2nKseUy65nzYvZyh7SEdZSP',
//   withdrawQueue: 'AeZssq5bzteTgEF99m7hjbRyWKCHa2vMRn3PuqCX2x6X',
//   ammTargetOrders: '53wJS4J12xpWPUSDMP9ZX1WUtHnRGRwoi2W5fQMmKAiU',
//   poolTempLp: 'Hm9gDaSXJMT9xXDra4AqVt4RiJvDHLtvGSCmCaBgssRb',
//   marketProgramId: 'EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj',
//   marketId: '9bvvAezqkNY9tMRnSFLmRgfJPNwfnLjYrQeEi3AyZC4r',
//   ammConfigId: '8QN9yfKqWDoKjvZmqFsgCzAqwZBQuzVVnC388dN5RCPo',
//   feeDestinationId: '3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR'
// }
// amm pool created! extInfo:  {
//   address: {
//     programId: PublicKey [PublicKey(HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8)] {
//       _bn: <BN: f5682b06fccbdba6b40d234a14b1f7de9d8b5e11e45a72bcaa92623f3e677a1b>
//     },
//     ammId: PublicKey [PublicKey(VbviEfpxAP5GH7keQikXp1vNTHzYpSzN3vH34XGJ9zC)] {
//       _bn: <BN: 753c0f03faecb4398cc11425748dc01ad7d6a3b179ed2a437e585498105992d>
//     },
//     ammAuthority: PublicKey [PublicKey(DbQqP6ehDYmeYjcBaMRuA8tAJY1EjDUz9DpwSLjaQqfC)] {
//       _bn: <BN: bb1cf0a32b19dcbed6396f2e96716d05f511dec01d0f65fd7586dd6444aa4d8f>
//     },
//     ammOpenOrders: PublicKey [PublicKey(24iuPBUX3PTQo5rbPy6evuD2wYjKUopaJkr5WKAc3ne3)] {
//       _bn: <BN: fcfcf343ed71c126bec8eb083f304df792dbf7258c1f05c58b87cfa5e195ad8>
//     },
//     lpMint: PublicKey [PublicKey(F1ZzBCWoo5okHTH2Q8J6sZzkZdbiRxLx1BUehSdtxWKM)] {
//       _bn: <BN: d028ea03d400e0752b2a20811fc9fd831f9d7a7f4206090a9b8e3fb412523fc4>
//     },
//     coinMint: PublicKey [PublicKey(CNPqTMHrUrgzqWLM5qozPYUMmgg2adCGmdV115XSkM8S)] {
//       _bn: <BN: a8eb92c1e5ba4d4bcf03c3702f44660b4fe04f29e21715e66b1bfcab7fdc6d87>
//     },
//     pcMint: PublicKey [PublicKey(So11111111111111111111111111111111111111112)] {
//       _bn: <BN: 69b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001>
//     },
//     coinVault: PublicKey [PublicKey(2Ww97ayY6hCMwFBz5CwmzTQG4JcvnTuzoNpqNMefwiQ1)] {
//       _bn: <BN: 1686bf1e5a6ff31581ed66e808c5fefcef29777630a23c4f530d90c35527986a>
//     },
//     pcVault: PublicKey [PublicKey(3mu7zgL9qHusS9FuqjHaD2nKseUy65nzYvZyh7SEdZSP)] {
//       _bn: <BN: 2937dcc5f35d18e75a2c43f4bf0f32bf9e5e60c2f2f123d5fe596dda3d3ddbd0>
//     },
//     withdrawQueue: PublicKey [PublicKey(AeZssq5bzteTgEF99m7hjbRyWKCHa2vMRn3PuqCX2x6X)] {
//       _bn: <BN: 8f58d8bbea34025eabf546edcfb17a4cc1b24acf7d57235a51ac279bea4fafe4>
//     },
//     ammTargetOrders: PublicKey [PublicKey(53wJS4J12xpWPUSDMP9ZX1WUtHnRGRwoi2W5fQMmKAiU)] {
//       _bn: <BN: 3c2f4ea19ada58b252e1c7c751d3c44eff631ee0890ee8147c2d059ff1ce4679>
//     },
//     poolTempLp: PublicKey [PublicKey(Hm9gDaSXJMT9xXDra4AqVt4RiJvDHLtvGSCmCaBgssRb)] {
//       _bn: <BN: f90a5b48acfa31895247a8e235d9dd791bcb4f5963ceea37567c9010e49d5fda>
//     },
//     marketProgramId: PublicKey [PublicKey(EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj)] {
//       _bn: <BN: cd0ebc1d9bfaddd6c92de05291d52f7b39929894d00def7441b6834db337be44>
//     },
//     marketId: PublicKey [PublicKey(9bvvAezqkNY9tMRnSFLmRgfJPNwfnLjYrQeEi3AyZC4r)] {
//       _bn: <BN: 7fd034e94c512cd225a5078a26e2b0d1f33a4f0a57e4c8beb659976aa0ecd28b>
//     },
//     ammConfigId: PublicKey [PublicKey(8QN9yfKqWDoKjvZmqFsgCzAqwZBQuzVVnC388dN5RCPo)] {
//       _bn: <BN: 6dfe163d4b0f36c9faf98bf9f5939ce6acbf10f48df32ff4acd5fbe577621d56>
//     },
//     feeDestinationId: PublicKey [PublicKey(3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR)] {
//       _bn: <BN: 257e618f5c1001cad99db2910370745d3f740a1bdce5e2128a7ca7803d577af0>
//     }
//   }
// }
import { TransactionBlock } from "@mysten/sui.js/transactions";

async function sendTestTx(wallet: any) {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `0x2::devnet_nft::mint`,
    arguments: [tx.pure("Tank Hero"), tx.pure("A brave warrior"), tx.pure("https://example.com/tank.png")],
  });

  const res = await wallet.signAndExecuteTransactionBlock({
    transactionBlock: tx,
  });

  console.log("Transaction result:", res);
}

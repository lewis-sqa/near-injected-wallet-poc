import { transactions, providers, utils } from "near-api-js";
import { AccessKeyView } from "near-api-js/lib/providers/provider";

import { TestWallet } from "./TestWallet";
import { Wallet } from "./Wallet.types";

declare global {
  interface Window {
    near: Record<string, Wallet>;
  }
}

setTimeout(() => {
  if (!window.near) {
    window.near = {};
  }

  window.near.wallet = TestWallet();

  // @ts-ignore
  window._testSignAndSendTransaction = async () => {
    if (!window.near.wallet.connected) {
      await window.near.wallet.connect();
    }

    // Retrieve accounts (assuming already connected) and current network.
    const { network, accounts } = window.near.wallet;

    // Setup RPC to retrieve transaction-related prerequisites.
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const [block, accessKey] = await Promise.all([
      provider.block({ finality: "final" }),
      provider.query<AccessKeyView>({
        request_type: "view_access_key",
        finality: "final",
        account_id: accounts[0].accountId,
        public_key: accounts[0].publicKey,
      }),
    ]);

    const signedTx = await window.near.wallet.signTransaction({
      transaction: transactions.createTransaction(
        accounts[0].accountId,
        utils.PublicKey.from(accounts[0].publicKey),
        "guest-book.testnet",
        accessKey.nonce + 1,
        [transactions.functionCall(
          "addMessage",
          { text: "Hello World!" },
          utils.format.parseNearAmount("0.00000000003"),
          utils.format.parseNearAmount("0")
        )],
        utils.serialize.base_decode(block.header.hash)
      ),
    });

    // Send the transaction to the blockchain.
    await provider.sendTransaction(signedTx);
  };

  // @ts-ignore
  window._testSignAndSendTransactions = async () => {
    if (!window.near.wallet.connected) {
      await window.near.wallet.connect();
    }

    // Retrieve accounts (assuming already connected) and current network.
    const { network, accounts } = window.near.wallet;

// Setup RPC to retrieve transaction-related prerequisites.
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const [block, accessKey] = await Promise.all([
      provider.block({ finality: "final" }),
      provider.query<AccessKeyView>({
        request_type: "view_access_key",
        finality: "final",
        account_id: accounts[0].accountId,
        public_key: accounts[0].publicKey,
      }),
    ]);

    const signedTxs = await window.near.wallet.signTransactions({
      transactions: [
        transactions.createTransaction(
          accounts[0].accountId,
          utils.PublicKey.from(accounts[0].publicKey),
          "guest-book.testnet",
          accessKey.nonce + 1,
          [transactions.functionCall(
            "addMessage",
            { text: "Hello World! (1/2)" },
            utils.format.parseNearAmount("0.00000000003"),
            utils.format.parseNearAmount("0.01")
          )],
          utils.serialize.base_decode(block.header.hash)
        ),
        transactions.createTransaction(
          accounts[0].accountId,
          utils.PublicKey.from(accounts[0].publicKey),
          "guest-book.testnet",
          accessKey.nonce + 2,
          [transactions.functionCall(
            "addMessage",
            { text: "Hello World! (2/2)" },
            utils.format.parseNearAmount("0.00000000003"),
            utils.format.parseNearAmount("0.01")
          )],
          utils.serialize.base_decode(block.header.hash)
        )
      ]
    });

    for (let i = 0; i < signedTxs.length; i += 1) {
      const signedTx = signedTxs[i];

      // Send the transaction to the blockchain.
      await provider.sendTransaction(signedTx);
    }
  };

  console.log("Successfully injected test wallet under window.near.wallet");
}, 500);

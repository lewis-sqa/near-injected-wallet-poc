import { keyStores, transactions, providers, utils } from "near-api-js";
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
          accounts[0].publicKey,
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
          accounts[0].publicKey,
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

  // @ts-ignore
  window._testSignIn = async () => {
    // Setup keystore to locally store FunctionCall access keys.
    const keystore = new keyStores.BrowserLocalStorageKeyStore(
      window.localStorage,
      "dapp:keystore:"
    );

    // Retrieve the list of accounts we have visibility of.
    const { accounts, network } = window.near.wallet;

    if (!accounts.length) {
      throw new Error("No accounts to sign in to");
    }

    // Request FunctionCall access to the 'guest-book.testnet' smart contract for each account.
    await window.near.wallet.signIn({
      permission: {
        receiverId: "guest-book.testnet",
        methodNames: [],
      },
      accounts: await Promise.all(
        accounts.map(async ({ accountId }) => {
          const keyPair = utils.KeyPair.fromRandom("ed25519");
          await keystore.setKey(network.networkId, accountId, keyPair);

          return {
            accountId,
            publicKey: keyPair.getPublicKey()
          };
      })
      ),
    });
  };

  // @ts-ignore
  window._testSignOut = async () => {
    // Setup keystore to retrieve locally stored FunctionCall access keys.
    const keystore = new keyStores.BrowserLocalStorageKeyStore(
      window.localStorage,
      "dapp:keystore:"
    );

    // Retrieve current network and accounts with FunctionCall access keys.
    const { network } = window.near.wallet;
    const accountIds = await keystore.getAccounts(network.networkId);

    if (!accountIds.length) {
      throw new Error("No accounts to sign out of");
    }

    // Remove FunctionCall access (previously granted via signIn) for each account.
    await window.near.wallet.signOut({
      accounts: await Promise.all(
        accountIds.map(async (accountId) => {
          const keyPair = await keystore.getKey(network.networkId, accountId);

          return {
            accountId,
            publicKey: keyPair.getPublicKey()
          };
        })
      ),
    });
  };

  console.log("Successfully injected test wallet under window.near.wallet");
}, 500);

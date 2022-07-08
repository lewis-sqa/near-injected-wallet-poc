import { InMemorySigner, KeyPair, keyStores, transactions as nearTransactions } from "near-api-js";
// @ts-ignore.
import { parseSeedPhrase } from "near-seed-phrase";

import { Network, Wallet } from "./Wallet.types";
import { WalletState } from "./TestWallet.types";
import * as storage from "./utils/storage";
import * as restore from "./utils/restore";
import * as format from "./utils/format";

const network: Network = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

const loadState = (): WalletState => {
  const state = storage.getJsonItem<WalletState>("wallet_state");

  if (!state) {
    return {
      accounts: [],
    };
  }

  return state;
}

export function TestWallet(): Wallet {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const signer = new InMemorySigner(keyStore);
  let state = loadState();

  const setState = (reducer: (prevState: WalletState) => WalletState) => {
    const nextState = reducer(state);

    state = nextState;
    storage.setJsonItem("wallet_state", nextState);
  }

  return {
    // Exposed for testing.
    // @ts-ignore:next-line
    get _state() {
      return state;
    },
    // Exposed for testing.
    // @ts-ignore:next-line
    get _keyStore() {
      return keyStore;
    },
    get id() {
      return "wallet";
    },
    get connected() {
      return Boolean(state.accounts.length);
    },
    get network() {
      return { ...network };
    },
    get accounts() {
      return [ ...state.accounts ];
    },
    // Exposed for testing
    _restore: async ({ accountId, mnemonic }) => {
      const keyPair = await keyStore.getKey(network.networkId, accountId);

      if (keyPair) {
        throw new Error("Account already restored");
      }

      const { publicKey, secretKey } = parseSeedPhrase(mnemonic);
      await restore.validateAccessKey({ accountId, publicKey });

      await keyStore.setKey(
        network.networkId,
        accountId,
        KeyPair.fromString(secretKey)
      );

      console.log("Successfully restored account", { accountId, publicKey });
    },
    connect: async () => {
      const accountIds = await keyStore.getAccounts(network.networkId);
      const total = accountIds.length;

      console.log(`There are ${total} accounts(s) imported`);

      const accounts = await Promise.all(accountIds.map(async (accountId) => {
        const keyPair = await keyStore.getKey(network.networkId, accountId);

        return {
          accountId,
          publicKey: keyPair.getPublicKey().toString(),
        };
      }))

      setState((prevState) => ({
        ...prevState,
        accounts,
      }));

      console.log("Selected all account(s)");
    },
    disconnect: async () => {
      if (!state.accounts.length) {
        throw new Error("Not connected");
      }

      const total = state.accounts.length;

      setState((prevState) => ({
        ...prevState,
        accounts: [],
      }));

      console.log(`Removed visibility of ${total} account(s)`);
    },
    signTransaction: async ({ transaction }) => {
      const formattedTx = format.formatTransaction(transaction);

      const approved = confirm([
        "Permission to sign transaction?",
        JSON.stringify(formattedTx, null, 2),
      ].join("\n"))

      if (!approved) {
        throw new Error("User rejected signing");
      }

      const [, signedTx] = await nearTransactions.signTransaction(
        transaction,
        signer,
        transaction.signerId,
        network.networkId
      );

      return signedTx;
    },
    signTransactions: async ({ transactions }) => {
      const formattedTxs = transactions.map(format.formatTransaction);
      const signedTxs: Array<nearTransactions.SignedTransaction> = [];

      const approved = confirm([
        "Permission to sign transactions?",
        JSON.stringify(formattedTxs, null, 2),
      ].join("\n"))

      if (!approved) {
        throw new Error("User rejected signing");
      }

      for (let i = 0; i < transactions.length; i += 1) {
        const transaction = transactions[i];
        const [, signedTx] = await nearTransactions.signTransaction(
          transaction,
          signer,
          transaction.signerId,
          network.networkId
        );

        signedTxs.push(signedTx);
      }

      return signedTxs;
    },
    on: () => {
      throw new Error("Not implemented");
    },
    off: () => {
      throw new Error("Not implemented");
    }
  }
}

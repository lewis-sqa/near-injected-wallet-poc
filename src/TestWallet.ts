import { KeyPair, keyStores } from "near-api-js";
// @ts-ignore.
import { parseSeedPhrase } from "near-seed-phrase";

import { Network, Wallet } from "./Wallet.types";
import { WalletState } from "./TestWallet.types";
import * as storage from "./utils/storage";
import * as restore from "./utils/restore";

const network: Network = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

const loadState = (): WalletState => {
  const state = storage.getJsonItem<WalletState>("wallet_state");

  if (!state) {
    return {};
  }

  return state;
}

export function TestWallet(): Wallet {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
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
    get connected() {
      return false;
    },
    get network() {
      return { ...network };
    },
    get accounts() {
      return [];
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
    on: () => {
      throw new Error("Not implemented");
    },
    off: () => {
      throw new Error("Not implemented");
    }
  }
}

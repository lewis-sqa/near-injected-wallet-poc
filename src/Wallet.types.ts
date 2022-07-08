import { transactions } from "near-api-js";

export interface Account {
  accountId: string;
  publicKey: string;
}

export interface Network {
  networkId: string;
  nodeUrl: string;
}

interface RestoreParams {
  accountId: string;
  mnemonic: string;
}

interface SignInParams {
  permission: transactions.FunctionCallPermission;
  accounts: Array<Account>;
}

interface SignOutParams {
  accounts: Array<Account>;
}

interface SignTransactionParams {
  transaction: transactions.Transaction;
}

interface SignTransactionsParams {
  transactions: Array<transactions.Transaction>;
}

interface Events {
  accountsChanged: { accounts: Array<Account> };
  networkChanged: { network: Network };
}

type Unsubscribe = () => void;

export interface Wallet {
  id: string;
  connected: boolean;
  network: Network;
  accounts: Array<Account>;

  _restore(params: RestoreParams): Promise<void>;

  connect(): Promise<void>;
  signIn(params: SignInParams): Promise<void>;
  signOut(params: SignOutParams): Promise<void>;
  signTransaction(params: SignTransactionParams): Promise<transactions.SignedTransaction>;
  signTransactions(params: SignTransactionsParams): Promise<Array<transactions.SignedTransaction>>;
  disconnect(): Promise<void>;
  on<EventName extends keyof Events>(
    event: EventName,
    callback: (params: Events[EventName]) => void
  ): Unsubscribe;
  off<EventName extends keyof Events>(
    event: EventName,
    callback?: () => void
  ): void;
}

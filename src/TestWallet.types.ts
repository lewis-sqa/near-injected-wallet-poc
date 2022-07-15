export interface AccountState {
  accountId: string;
  publicKey: string;
}

export interface WalletState {
  accounts: Array<AccountState>;
}

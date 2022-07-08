import { TestWallet } from "./TestWallet";
import { Wallet } from "./Wallet.types";

declare global {
  interface Window {
    near: Record<string, Wallet>;
  }
}

if (!window.near) {
  window.near = {};
}

window.near.wallet = TestWallet();

console.log("Successfully injected test wallet under window.near.wallet");

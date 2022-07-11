# NEAR Injected Wallet (POC)

This is POC for the NEAR Injected Wallet standard.

## Getting Started

To get up and running with this project, you will need to run the following.

```shell
yarn install # Install packages.
yarn start # Bundle modules and serve at localhost:1234.
```

Once the project has been bundled, you can open your browser at `localhost:1234` and play around with the POC in the developer console via `window.near.wallet`.

Although out of scope for the standard, it's important that we have accounts imported in the wallet to use any of the methods:

```ts
// Note: This demo is hardcoded to the testnet network. 
window.near.wallet._restore({
  accountId: "test.testnet",
  mnemonic: "mnemonic encoding of a FullAccess key pair linked to the accountId",
});
```

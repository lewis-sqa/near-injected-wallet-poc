import { transactions } from "near-api-js";

export const formatTransaction = (transaction: transactions.Transaction) => {
  return {
    signerId: transaction.signerId,
    receiverId: transaction.receiverId,
    publicKey: transaction.publicKey.toString(),
    actions: transaction.actions.map((action) => {
      switch (action.enum) {
        case "createAccount": {
          return {
            type: "CreateAccount",
            params: action.createAccount
          };
        }
        case "deployContract": {
          return {
            type: "DeployContract",
            params: {
              ...action.deployContract,
              args: Buffer.from(action.deployContract.code).toString(),
            }
          };
        }
        case "functionCall": {
          return {
            type: "FunctionCall",
            params: {
              ...action.functionCall,
              args: JSON.parse(Buffer.from(action.functionCall.args).toString()),
            }
          };
        }
        case "transfer": {
          return {
            type: "Transfer",
            params: action.transfer
          };
        }
        case "stake": {
          return {
            type: "Stake",
            params: {
              ...action.stake,
              publicKey: action.stake.publicKey.toString()
            }
          };
        }
        case "addKey": {
          return {
            type: "AddKey",
            params: {
              ...action.addKey,
              publicKey: action.addKey.publicKey.toString()
            }
          };
        }
        case "deleteKey": {
          return {
            type: "DeleteKey",
            params: {
              ...action.deleteKey,
              publicKey: action.deleteKey.publicKey.toString()
            }
          };
        }
        case "deleteAccount": {
          return {
            type: "DeleteAccount",
            params: action.deleteAccount
          };
        }
        default: {
          return {
            type: action.enum,
            params: action[action.enum]
          };
        }
      }
    })
  }
}

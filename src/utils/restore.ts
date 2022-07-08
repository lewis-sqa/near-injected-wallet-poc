import { providers } from "near-api-js";
import { AccessKeyView } from "near-api-js/lib/providers/provider";

interface ValidateAccessKeyParams {
  accountId: string;
  publicKey: string;
}

export const validateAccessKey = ({ accountId, publicKey }: ValidateAccessKeyParams) => {
  const provider = new providers.JsonRpcProvider({ url: "https://rpc.testnet.near.org" });

  return provider.query<AccessKeyView>({
    request_type: "view_access_key",
    finality: "final",
    account_id: accountId,
    public_key: publicKey
  }).then(
    (accessKey) => {
      if (accessKey.permission !== "FullAccess") {
        throw new Error("Public key requires 'FullAccess' permission");
      }

      return accessKey;
    },
    (err) => {
      if (err instanceof providers.TypedError && err.type === "AccessKeyDoesNotExist") {
        return null;
      }

      throw err;
    }
  );
}

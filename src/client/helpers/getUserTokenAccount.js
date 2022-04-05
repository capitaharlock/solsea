import { AccountLayout, TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token";
import BN from "bn.js";

export async function getUserTokenAccount(mint, source, connection) {
  const tokens = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: AccountLayout.offsetOf("owner"),
          bytes: source.toBase58()
        }
      },
      {
        memcmp: {
          offset: AccountLayout.offsetOf("mint"),
          bytes: mint.toBase58()
        }
      },
      {
        dataSize: AccountLayout.span
      }
    ]
  });

  if (tokens.length > 1) {
    let highestAccount = { publicKey: tokens[0].pubkey, amount: new BN(0) };
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const decoded = AccountLayout.decode(t.account.data);
      const num = u64.fromBuffer(decoded.amount);
      if (num.gt(highestAccount.amount)) {
        highestAccount = { publicKey: t.pubkey, amount: num };
      }
    }
    return highestAccount;
  } else {
    if (tokens[0]) {
      const decoded = AccountLayout.decode(tokens[0].account.data);
      const num = u64.fromBuffer(decoded.amount);
      return { publicKey: tokens[0].pubkey, amount: num };
    }
  }

  return null;
}

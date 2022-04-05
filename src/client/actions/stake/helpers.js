import { AccountLayout, u64 } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { connect } from "all-art-core/lib/core/connection";
import { Numberu64 } from "all-art-core/lib/programs/TokenSwap";
import { AART_ACCOUNT, STAKE_PREFIX } from ".";
import {
  AART_DECIMALS,
  AART_KEY,
  CLUSTER_URL,
  ESCROW_PROGRAM_ID
} from "../../../api/Definitions";
import { getUserTokenAccount } from "../../helpers/getUserTokenAccount";

const ESCROW_PROGRAM = new PublicKey(ESCROW_PROGRAM_ID);

export async function getStakingAccountKeyForWallet({ wallet }) {
  const AART_ACCOUNT = new PublicKey(AART_KEY);
  const [programAartAccount] = await PublicKey.findProgramAddress(
    [Buffer.from(STAKE_PREFIX), wallet.toBuffer(), AART_ACCOUNT.toBuffer()],
    ESCROW_PROGRAM
  );

  return programAartAccount;
}

export async function getAartAccountForWallet({ wallet }) {
  const connection = await connect(CLUSTER_URL);
  const account = await getUserTokenAccount(AART_ACCOUNT, wallet, connection);
  console.log("account", account);
  return account ? account.publicKey : null;
}

export function getFeeFromAmount(amount) {
  if (amount < 5000) {
    return "3%";
  } else if (amount < 7000) {
    return "2.7%";
  } else if (amount < 10000) {
    return "2.4%";
  } else if (amount < 15000) {
    return "2.1%";
  } else {
    return "1.8%";
  }
}

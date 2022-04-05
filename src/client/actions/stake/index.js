import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  Keypair
} from "@solana/web3.js";
import { connect } from "all-art-core/lib/core/connection";
import {
  AART_KEY,
  CLUSTER_URL,
  ESCROW_PROGRAM_ID
} from "../../../api/Definitions";
import { getUserTokenAccount } from "../../helpers/getUserTokenAccount";
import BN from "bn.js";
import {
  createTransaction,
  sendMultipleTransactions,
  serializeMultipleTransactions
} from "all-art-core/lib/core/transactions";
import { Numberu64 } from "all-art-core/lib/programs/TokenSwap";
import {
  createStakeInstruction,
  createUnstakeInstruction
} from "./instructions";
import { AccountLayout, u64 } from "@solana/spl-token";
import { createTokenAccountInstruction } from "all-art-core/lib/core/account";

export const AART_ACCOUNT = new PublicKey(AART_KEY);
const ESCROW_PROGRAM = new PublicKey(ESCROW_PROGRAM_ID);

/// Prefix for staking AART
export const STAKE_PREFIX = "aartstake3";
/// Prefix for staking authotiy
export const STAKE_AUTHORITY_PREFIX = "stakeauthority3";

export async function handleStake({
  wallet,
  amount,
  loadingDispatcher,
  approval,
  waitingForTransaction
}) {
  let instructions = [],
    signers = [];
  const connection = await connect(CLUSTER_URL);
  const userAartAccount = await getUserTokenAccount(
    AART_ACCOUNT,
    wallet.publicKey,
    connection
  );

  if (!userAartAccount) throw new Error("You don't have AART account!");

  console.log(
    "user account",
    userAartAccount.publicKey.toString(),
    userAartAccount.amount.toNumber()
  );

  if (userAartAccount.amount.lt(new BN(amount)))
    throw new Error("You don't have enough AARTs!");

  const [authority, nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from(STAKE_AUTHORITY_PREFIX),
      wallet.publicKey.toBuffer(),
      AART_ACCOUNT.toBuffer()
    ],
    ESCROW_PROGRAM
  );

  const [programAartAccount, nonce2] = await PublicKey.findProgramAddress(
    [
      Buffer.from(STAKE_PREFIX),
      wallet.publicKey.toBuffer(),
      AART_ACCOUNT.toBuffer()
    ],
    ESCROW_PROGRAM
  );
  console.log("authority", authority.toString(), nonce);
  console.log("programAart", programAartAccount.toString(), nonce2);

  instructions.push(
    createStakeInstruction({
      walletAccount: wallet.publicKey,
      userAartAccount: userAartAccount.publicKey,
      programAartAccount,
      authority,
      amount: new Numberu64(amount)
    })
  );

  const transaction = await createTransaction(
    instructions,
    connection,
    signers,
    wallet
  );
  loadingDispatcher(approval);
  const buff = await serializeMultipleTransactions([transaction], wallet);
  loadingDispatcher(waitingForTransaction);
  for (let i = 0; i < buff.length; i++) {
    console.log("raw", buff);
    const id = await connection.sendRawTransaction(buff[i].buffer);
    await connection.confirmTransaction(id, "confirmed");
  }
}

export async function handleUnstake({
  wallet,
  amount,
  loadingDispatcher,
  approval,
  waitingForTransaction
}) {
  let instructions = [],
    signers = [];
  const connection = await connect(CLUSTER_URL);
  const userAartAcc = await getUserTokenAccount(
    AART_ACCOUNT,
    wallet.publicKey,
    connection
  );

  let userAartAccount;

  if (!userAartAcc) {
    const acc = Keypair.generate();
    signers.push(acc);
    instructions.push(
      ...createTokenAccountInstruction(
        acc,
        wallet.publicKey,
        AART_ACCOUNT,
        wallet.publicKey,
        AccountLayout.span
      )
    );
    userAartAccount = acc.publicKey;
  } else {
    userAartAccount = userAartAcc.publicKey;
  }

  const [authority, nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from(STAKE_AUTHORITY_PREFIX),
      wallet.publicKey.toBuffer(),
      AART_ACCOUNT.toBuffer()
    ],
    ESCROW_PROGRAM
  );

  const [programAartAccount, nonce2] = await PublicKey.findProgramAddress(
    [
      Buffer.from(STAKE_PREFIX),
      wallet.publicKey.toBuffer(),
      AART_ACCOUNT.toBuffer()
    ],
    ESCROW_PROGRAM
  );

  console.log("program aart", programAartAccount.toString());

  const programAcc = await connection.getAccountInfo(programAartAccount);
  if (!programAcc) {
    throw new Error("You don't have staked AARTs!");
  }

  const parsedProgramAartAccount = AccountLayout.decode(programAcc.data);
  if (u64.fromBuffer(parsedProgramAartAccount.amount).lt(new BN(amount)))
    throw new Error("You don't have enough AARTs!");

  instructions.push(
    createUnstakeInstruction({
      walletAccount: wallet.publicKey,
      userAartAccount,
      programAartAccount,
      authority,
      amount: new Numberu64(amount)
    })
  );

  const transaction = await createTransaction(
    instructions,
    connection,
    signers,
    wallet
  );
  loadingDispatcher(approval);
  const buff = await serializeMultipleTransactions([transaction], wallet);
  loadingDispatcher(waitingForTransaction);
  for (let i = 0; i < buff.length; i++) {
    console.log("raw", buff);
    const id = await connection.sendRawTransaction(buff[i].buffer);
    await connection.confirmTransaction(id, "confirmed");
  }
}

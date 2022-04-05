import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction
} from "@solana/web3.js";
import { AART_ACCOUNT } from ".";
import { ESCROW_PROGRAM_ID } from "../../../api/Definitions";

const ESCROW_PROGRAM = new PublicKey(ESCROW_PROGRAM_ID);

export function createStakeInstruction({
  walletAccount,
  userAartAccount,
  programAartAccount,
  authority,
  amount
}) {
  const keys = [
    { pubkey: walletAccount, isSigner: true, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: true },
    { pubkey: AART_ACCOUNT, isSigner: false, isWritable: false },
    { pubkey: userAartAccount, isSigner: false, isWritable: true },
    { pubkey: programAartAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
  ];

  const data = Buffer.concat([Buffer.from([3]), amount.toBuffer()]);

  return new TransactionInstruction({
    keys,
    programId: ESCROW_PROGRAM,
    data
  });
}

export function createUnstakeInstruction({
  walletAccount,
  userAartAccount,
  programAartAccount,
  authority,
  amount
}) {
  const keys = [
    { pubkey: walletAccount, isSigner: true, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: true },
    { pubkey: AART_ACCOUNT, isSigner: false, isWritable: false },
    { pubkey: userAartAccount, isSigner: false, isWritable: true },
    { pubkey: programAartAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
  ];

  const data = Buffer.concat([Buffer.from([4]), amount.toBuffer()]);

  return new TransactionInstruction({
    keys,
    programId: ESCROW_PROGRAM,
    data
  });
}

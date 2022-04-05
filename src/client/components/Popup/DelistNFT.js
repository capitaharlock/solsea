import {
  PublicKey,
  AccountMeta,
  TransactionInstruction
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const DelistNFT = ({
  wallet,
  escrowAccount,
  escrowProgram,
  sellerNftAccount,
  programNftAccount,
  authority,
  programStakeAccount,
  stakeAuthority,
  userAartAccount
}) => {
  const keys = [
    { pubkey: escrowAccount, isSigner: false, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: true },
    { pubkey: wallet, isSigner: false, isWritable: false },
    { pubkey: sellerNftAccount, isSigner: false, isWritable: true },
    { pubkey: programNftAccount, isSigner: false, isWritable: true },
    { pubkey: userAartAccount, isSigner: false, isWritable: true },
    { pubkey: programStakeAccount, isSigner: false, isWritable: true },
    { pubkey: stakeAuthority, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
  ];

  const data = Buffer.from([1]);

  return new TransactionInstruction({
    keys,
    programId: escrowProgram,
    data
  });
};

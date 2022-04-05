import {
  PublicKey,
  AccountMeta,
  TransactionInstruction,
  SystemProgram
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const BuyNFT = ({
  source,
  walletKey,
  sellerTokenAccount,
  escrowAccount,
  escrowProgram,
  buyerNftAccount,
  programNftAccount,
  userAuthority,
  authority,
  feeAccount,
  sellerWalletAccount,
  sellerAartAccount,
  stakeAuthority,
  programStakeAccount,
  sellerPlatformStakedAart,
  nonce,
  escrow
}) => {
  const keys = [
    { pubkey: escrowAccount, isSigner: false, isWritable: true },
    { pubkey: userAuthority, isSigner: false, isWritable: true },
    { pubkey: walletKey, isSigner: true, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: true },
    { pubkey: source, isSigner: false, isWritable: false },
    { pubkey: sellerTokenAccount, isSigner: false, isWritable: true },
    { pubkey: buyerNftAccount, isSigner: false, isWritable: true },
    { pubkey: feeAccount, isSigner: false, isWritable: true },
    { pubkey: programNftAccount, isSigner: false, isWritable: true },
    { pubkey: sellerAartAccount, isSigner: false, isWritable: true },
    { pubkey: programStakeAccount, isSigner: false, isWritable: true },
    { pubkey: stakeAuthority, isSigner: false, isWritable: true },
    { pubkey: sellerWalletAccount, isSigner: false, isWritable: true },
    { pubkey: sellerPlatformStakedAart, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
  ];

  if (escrow && escrow.creators && escrow.creators.length > 0) {
    for (let i = 0; i < escrow.creators.length; i++) {
      const creator = escrow.creators[i];
      keys.push({ pubkey: creator, isSigner: false, isWritable: true });
    }
  }

  const data = Buffer.concat([Buffer.from([2]), Buffer.from([nonce])]);
  console.log("before return");
  return new TransactionInstruction({
    keys,
    programId: escrowProgram,
    data
  });
};

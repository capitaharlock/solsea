import {
  AccountMeta,
  PublicKey,
  TransactionInstruction
} from "@solana/web3.js";
import { Numberu64 } from "all-art-core/lib/programs/TokenSwap";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { uint16ToBuffer } from "all-art-core/lib/utils/number";
import { ESCROW_PROGRAM_ID } from "../../../api/Definitions";

export const createEscrowInitInstruction = ({
  price,
  stake,
  nonce,
  escrowAccount,
  authority,
  nftMintAccount,
  nftTokenAccount,
  programNftAccount,
  sellerTokenAccount,
  feeAccount,
  currencyMint,
  walletKey,
  escrowProgram,
  creatorWalletKeys = [],
  creatorsFee,
  creatorsPercentage,
  stakeAccount,
  userAartAccount
}) => {
  const keys = [
    { pubkey: escrowAccount, isSigner: false, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: false },
    { pubkey: nftMintAccount, isSigner: false, isWritable: false },
    { pubkey: nftTokenAccount, isSigner: false, isWritable: true },
    { pubkey: programNftAccount, isSigner: false, isWritable: true },
    { pubkey: sellerTokenAccount, isSigner: false, isWritable: false },
    { pubkey: feeAccount, isSigner: false, isWritable: false },
    { pubkey: currencyMint, isSigner: false, isWritable: false },
    { pubkey: walletKey, isSigner: true, isWritable: false },
    { pubkey: userAartAccount, isSigner: false, isWritable: true },
    { pubkey: stakeAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
  ];

  for (let i = 0; i < creatorWalletKeys.length; i++) {
    const walletKey = creatorWalletKeys[i];
    keys.push({ pubkey: walletKey, isSigner: false, isWritable: false });
  }

  const fee = [];
  for (let i = 0; i < 5; i++) {
    if (creatorsPercentage[i]) {
      fee.push(creatorsPercentage[i]);
    } else {
      fee.push(0);
    }
  }

  const data = Buffer.concat([
    Buffer.from([0]),
    price.toBuffer(),
    stake.toBuffer(),
    Buffer.from([nonce]),
    Buffer.from([creatorWalletKeys.length]), //count
    uint16ToBuffer(creatorsFee),
    Buffer.from(fee)
  ]);
  return new TransactionInstruction({
    keys,
    programId: escrowProgram,
    data
  });
};

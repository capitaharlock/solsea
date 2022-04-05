import { PublicKey } from "@solana/web3.js";
import { Numberu64 } from "all-art-core/lib/programs/TokenSwap";
import { bufferToUint16 } from "all-art-core/lib/utils/number";
import { FEE_ACCOUNT } from "../../../api/Definitions";

const feeAccount = new PublicKey(FEE_ACCOUNT);

export const parseEscrow = data => {
  if (data.length === 500) {
    return parseStateV1(data);
  }
  return parseStateV2(data);
};

export const parseStateV1 = data => {
  let i = 0;
  const state = data[i++];
  const nonce = data[i++];

  const u64Price = Numberu64.fromBuffer(data.slice(i, i + 8));
  i += 8;

  const nftMintAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const sellerNftAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const walletAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const programNftAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const feeAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const currencyMintAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const authorityAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;

  const creatorCount = data[i++];
  const sellerFee = bufferToUint16(data.slice(i, i + 2));
  i += 2;
  const percentage = [];
  for (let j = 0; j < 5; j++) {
    percentage.push(data[i++]);
  }

  const creators = [];

  for (let j = 0; j < 5; j++) {
    if (j < creatorCount) {
      creators.push(new PublicKey(data.slice(i, i + 32)));
    }
    i += 32;
  }
  const sellerTokenAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const buyerAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;

  return {
    state,
    nonce,
    nftMintAccount,
    price: u64Price.toNumber(),
    sellerNftAccount,
    sellerTokenAccount,
    programNftAccount,
    feeAccount,
    currencyMintAccount,
    authorityAccount,
    creatorCount,
    sellerFee,
    percentage,
    creators,
    walletAccount,
    buyerAccount
  };
};

export const parseStateV2 = data => {
  let i = 0;
  const state = data[i++];
  const nonce = data[i++];

  const u64Price = Numberu64.fromBuffer(data.slice(i, i + 8));
  i += 8;
  const u64Stake = Numberu64.fromBuffer(data.slice(i, i + 8));
  i += 8;

  const nftMintAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const sellerNftAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const walletAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const programNftAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const currencyMintAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const authorityAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;

  const creatorCount = data[i++];
  const sellerFee = bufferToUint16(data.slice(i, i + 2));
  i += 2;
  const percentage = [];
  for (let j = 0; j < 5; j++) {
    percentage.push(data[i++]);
  }

  const creators = [];

  for (let j = 0; j < 5; j++) {
    if (j < creatorCount) {
      creators.push(new PublicKey(data.slice(i, i + 32)));
    }
    i += 32;
  }
  const sellerTokenAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const buyerAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;
  const programStakeAccount = new PublicKey(data.slice(i, i + 32));
  i += 32;

  return {
    state,
    nonce,
    nftMintAccount,
    price: u64Price.toNumber(),
    stake: u64Stake.toNumber(),
    sellerNftAccount,
    sellerTokenAccount,
    programNftAccount,
    feeAccount,
    currencyMintAccount,
    authorityAccount,
    creatorCount,
    sellerFee,
    percentage,
    creators,
    walletAccount,
    buyerAccount,
    programStakeAccount
  };
};

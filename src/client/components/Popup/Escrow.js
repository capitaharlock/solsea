import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { AccountLayout, MintLayout } from "@solana/spl-token";
import { connect } from "all-art-core/lib/core/connection";
import { Numberu64 } from "all-art-core/lib/programs/TokenSwap";
import { createEscrowInitInstruction } from "./InitEscrow";
import {
  createTransaction,
  serializeMultipleTransactions
} from "all-art-core/lib/core/transactions";
import { createTokenAccountInstruction } from "all-art-core/lib/core/account";
import { DelistNFT } from "./DelistNFT";
import { BuyNFT } from "./BuyNFT";
import {
  SOL_TO_LAMPORTS,
  FEE_ACCOUNT,
  AART_KEY,
  ESCROW_PROGRAM_ID,
  AART_DECIMALS
} from "../../../api/Definitions";
import { getUserTokenAccount } from "../../helpers/getUserTokenAccount";
import { parseEscrow } from "../../actions/escrow/parse";
import BN from "bn.js";
import { getStakingAccountKeyForWallet } from "../../actions/stake/helpers";

const ESCROW_PROGRAM = new PublicKey(ESCROW_PROGRAM_ID);
const feeAccount = new PublicKey(FEE_ACCOUNT);
const AART_TOKEN = new PublicKey(AART_KEY);

export const InitEscrow = async ({
  cluster,
  wallet,
  price,
  mintKey,
  currency,
  creators,
  creatorsFee,
  escrowAccount,
  stake
}) => {
  const connection = await connect(cluster);

  const transactions = [];
  let instructions = [];
  let signers = [];

  let stakeAccount = SystemProgram.programId;
  let stakeAuthority = SystemProgram.programId;
  let userAartAccount = SystemProgram.programId;

  const nftMintPubkey = new PublicKey(mintKey);

  let u64Stake = new Numberu64(0);
  let u64Price = new Numberu64(price * SOL_TO_LAMPORTS);

  console.log("price", u64Price.toString());

  const lamports = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );

  console.log("stake", stake);
  if (stake && stake > 0) {
    const [auth] = await PublicKey.findProgramAddress(
      [
        Buffer.from("aartstakenft"),
        wallet.publicKey.toBuffer(),
        nftMintPubkey.toBuffer()
      ],
      ESCROW_PROGRAM
    );
    stakeAuthority = auth;
    u64Stake = new Numberu64(stake * AART_DECIMALS);
    const acc = Keypair.generate();
    sellerPubkey = acc.publicKey;
    signers.push(acc);
    instructions.push(
      ...createTokenAccountInstruction(
        acc.publicKey,
        wallet.publicKey,
        AART_TOKEN,
        auth,
        lamports
      )
    );
    stakeAccount = acc.publicKey;

    const userAartAcc = await getUserTokenAccount(
      AART_TOKEN,
      wallet.publicKey,
      connection
    );
    if (!userAartAcc || !userAartAcc.amount.gt(new BN(stake))) {
      throw new Error("You don't have enough AART coins");
    }

    userAartAccount = userAartAcc.publicKey;
  }

  const creatorsPercentage = [];

  let currencyMint = SystemProgram.programId;

  if (currency !== SystemProgram.programId.toString()) {
    currencyMint = new PublicKey(currency);
    const currencyMintAcc = await connection.getAccountInfo(currencyMint);
    if (!currencyMintAcc) {
      throw new Error("No currency mint account!!");
    }

    try {
      const currencyData = MintLayout.decode(currencyMintAcc.data);
      u64Price = new Numberu64(price * Math.pow(10, currencyData.decimals));
    } catch (error) {
      console.log(error);
      throw new Error("Invalid mint!");
    }
  }

  const walletKey = wallet.publicKey;
  const creatorWalletKeys = [];

  let feePubkey = feeAccount;
  let sellerPubkey = walletKey;

  if (currency !== SystemProgram.programId.toString()) {
    const walletAcc = await getUserTokenAccount(
      currencyMint,
      walletKey,
      connection
    );
    if (!walletAcc) {
      const acc = Keypair.generate();
      sellerPubkey = acc.publicKey;
      signers.push(acc);
      instructions.push(
        ...createTokenAccountInstruction(
          acc.publicKey,
          walletKey,
          currencyMint,
          walletKey,
          lamports
        )
      );
    } else {
      sellerPubkey = walletAcc.publicKey;
    }

    // Currency mint account for fee
    const feeAcc = await getUserTokenAccount(
      currencyMint,
      feeAccount,
      connection
    );
    if (!feeAcc) {
      const acc = Keypair.generate();
      feePubkey = acc.publicKey;
      signers.push(acc);
      instructions.push(
        ...createTokenAccountInstruction(
          acc.publicKey,
          walletKey,
          currencyMint,
          feeAccount,
          lamports
        )
      );
    } else {
      feePubkey = feeAcc.publicKey;
    }

    if (creators && creators.length > 0) {
      for (let i = 0; i < creators.length; i++) {
        const creator = creators[i];

        creatorsPercentage.push(creator.share);

        const creatorPubkey = new PublicKey(creator.address);
        const checkAcc = await getUserTokenAccount(
          currencyMint,
          creatorPubkey,
          connection
        );
        if (!checkAcc) {
          const acc = Keypair.generate();
          signers.push(acc);
          creatorWalletKeys.push(acc.publicKey);

          instructions.push(
            ...createTokenAccountInstruction(
              acc.publicKey,
              walletKey,
              currencyMint,
              creatorPubkey,
              lamports
            )
          );
        } else {
          creatorWalletKeys.push(checkAcc.publicKey);
        }
      }
    }
  } else {
    if (creators && creators.length > 0) {
      for (let i = 0; i < creators.length; i++) {
        const creator = creators[i];
        creatorsPercentage.push(creator.share);
        creatorWalletKeys.push(new PublicKey(creator.address));
      }
    }
  }
  if (instructions.length > 0) {
    transactions.push(
      await createTransaction(instructions, connection, signers, wallet)
    );
    instructions = [];
    signers = [];
  }
  const [authority, nonce] = await PublicKey.findProgramAddress(
    [escrowAccount.publicKey.toBuffer()],
    ESCROW_PROGRAM
  );

  const account = await getUserTokenAccount(
    nftMintPubkey,
    walletKey,
    connection
  );

  if (account && account.publicKey) {
    const nftTokenAccount = account.publicKey;

    // ESCROW ACCOUNT
    instructions.push(
      SystemProgram.createAccount({
        fromPubkey: walletKey,
        newAccountPubkey: escrowAccount.publicKey,
        lamports,
        space: 600,
        programId: ESCROW_PROGRAM
      })
    );
    signers.push(escrowAccount);

    // PROGRAM NFT ACCOUNT
    const programNftAccount = await getUserTokenAccount(
      nftMintPubkey,
      ESCROW_PROGRAM,
      connection
    );

    let programNftAccountKey = programNftAccount && programNftAccount.publicKey;

    if (!programNftAccountKey) {
      const acc = Keypair.generate();
      signers.push(acc);

      instructions.push(
        ...createTokenAccountInstruction(
          acc.publicKey,
          walletKey,
          nftMintPubkey,
          authority,
          lamports
        )
      );

      programNftAccountKey = acc.publicKey;
    }

    instructions.push(
      createEscrowInitInstruction({
        price: u64Price,
        stake: u64Stake,
        nonce,
        walletKey,
        escrowAccount: escrowAccount.publicKey,
        escrowProgram: ESCROW_PROGRAM,
        sellerTokenAccount: sellerPubkey,
        nftMintAccount: nftMintPubkey,
        authority,
        feeAccount: feePubkey,
        nftTokenAccount,
        currencyMint,
        programNftAccount: programNftAccountKey,
        creatorWalletKeys: creatorWalletKeys,
        creatorsFee,
        creatorsPercentage,
        stakeAccount,
        stakeAuthority,
        userAartAccount
      })
    );

    transactions.push(
      await createTransaction(instructions, connection, signers, wallet)
    );

    return {
      buffer: await serializeMultipleTransactions(transactions, wallet)
    };

    // return escrowAccount.publicKey;
  }
  throw new Error("No token account for wallet!");
};

export const Delist = async ({ wallet, cluster, escrowAccount }) => {
  const connection = await connect(cluster);
  const transactions = [];
  const instructions = [];
  const signers = [];
  const walletKey = wallet.publicKey;

  const escrowInfo = await connection.getAccountInfo(escrowAccount);
  if (escrowInfo) {
    const escrow = parseEscrow(escrowInfo.data);
    console.log(escrow);
    let sellerNftAccount = escrow.sellerNftAccount;

    const sellerNftAcc = await connection.getAccountInfo(sellerNftAccount);
    if (!sellerNftAcc) {
      const lamports = await connection.getMinimumBalanceForRentExemption(
        AccountLayout.span
      );
      const acc = Keypair.generate();
      instructions.push(
        ...createTokenAccountInstruction(
          acc.publicKey,
          walletKey,
          escrow.nftMintAccount.toString(),
          walletKey,
          lamports
        )
      );

      sellerNftAccount = acc.publicKey;
      signers.push(acc);
    }

    let stakeAuthority = SystemProgram.programId;
    let userAartAccount = SystemProgram.programId;
    if (escrow.programStakeAccount) {
      if (
        escrow.programStakeAccount.toString() !==
        SystemProgram.programId.toString()
      ) {
        const [auth] = await PublicKey.findProgramAddress(
          [
            Buffer.from("aartstakenft"),
            wallet.publicKey.toBuffer(),
            escrow.nftMintAccount.toBuffer()
          ],
          ESCROW_PROGRAM
        );
        stakeAuthority = auth;
        const userAartAcc = await getUserTokenAccount(
          AART_TOKEN,
          escrow.walletAccount,
          connection
        );
        if (!userAartAcc) {
          const acc = Keypair.generate();
          signers.push(acc);
          instructions.push(
            ...createTokenAccountInstruction(
              acc,
              wallet.publicKey,
              AART_TOKEN,
              escrow.walletAccount,
              AccountLayout.span
            )
          );
          userAartAccount = acc.publicKey;
        } else {
          userAartAccount = userAartAcc.publicKey;
        }
      }
    }

    instructions.push(
      DelistNFT({
        wallet: walletKey,
        escrowAccount,
        sellerNftAccount,
        programNftAccount: escrow.programNftAccount,
        escrowProgram: ESCROW_PROGRAM,
        authority: escrow.authorityAccount,
        programStakeAccount:
          escrow.programStakeAccount || SystemProgram.programId,
        stakeAuthority,
        userAartAccount
      })
    );
    console.log("after delist");
    transactions.push(
      await createTransaction(instructions, connection, signers, wallet)
    );
    // const wait = await sendMultipleTransactions(
    //   transactions,
    //   connection,
    //   wallet
    // );
    // return wait;
    return {
      buffer: await serializeMultipleTransactions(transactions, wallet)
    };
  }
};

export const BuyEscrow = async ({ wallet, cluster, escrowAccount }) => {
  const connection = await connect(cluster);
  const transactions = [];
  const instructions = [];
  const signers = [];
  const walletKey = wallet.publicKey;

  const lamports = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );

  const [userAuthority, nonce] = await PublicKey.findProgramAddress(
    [escrowAccount.toBuffer()],
    ESCROW_PROGRAM
  );

  const escrowInfo = await connection.getAccountInfo(escrowAccount);
  if (escrowInfo) {
    const escrow = parseEscrow(escrowInfo.data);

    const mintPubkey = escrow.nftMintAccount;

    const account = await getUserTokenAccount(
      escrow.nftMintAccount,
      walletKey,
      connection
    );
    let buyerNftAccount;
    if (!buyerNftAccount) {
      const acc = Keypair.generate();
      instructions.push(
        ...createTokenAccountInstruction(
          acc.publicKey,
          walletKey,
          mintPubkey,
          walletKey,
          lamports
        )
      );
      signers.push(acc);
      buyerNftAccount = acc.publicKey;
    } else {
      buyerNftAccount = account.publicKey;
    }

    let source = walletKey;
    console.log("before currency", escrow.currencyMintAccount);
    if (escrow.currencyMintAccount.toString() !== SystemProgram.programId) {
      const account = await getUserTokenAccount(
        escrow.currencyMintAccount,
        walletKey,
        connection
      );
      if (account) {
        source = account.publicKey;
      }
    }

    let sellerTokenAccount = escrow.sellerTokenAccount;

    if (
      escrow.sellerTokenAccount.toString() ===
      SystemProgram.programId.toString()
    ) {
      sellerTokenAccount = escrow.walletAccount;
    }

    let stakeAuthority = SystemProgram.programId;
    let sellerAartAccount = SystemProgram.programId;

    if (
      escrow.programStakeAccount &&
      escrow.programStakeAccount.toString() !==
        SystemProgram.programId.toString()
    ) {
      const [auth] = await PublicKey.findProgramAddress(
        [
          Buffer.from("aartstakenft"),
          escrow.walletAccount.toBuffer(),
          escrow.nftMintAccount.toBuffer()
        ],
        ESCROW_PROGRAM
      );
      stakeAuthority = auth;
      const userAartAcc = await getUserTokenAccount(
        AART_TOKEN,
        escrow.walletAccount,
        connection
      );
      if (!userAartAcc) {
        const acc = Keypair.generate();
        signers.push(acc);
        console.log("AART_TOKEN", AART_TOKEN);
        instructions.push(
          ...createTokenAccountInstruction(
            acc,
            wallet.publicKey,
            AART_TOKEN,
            escrow.walletAccount,
            AccountLayout.span
          )
        );
        sellerAartAccount = acc.publicKey;
      } else {
        sellerAartAccount = userAartAcc.publicKey;
      }
    }

    let sellerPlatformStakedAart = SystemProgram.programId;

    const stakeAcc = await getStakingAccountKeyForWallet({
      wallet: escrow.walletAccount
    });
    if (stakeAcc) {
      const acc = await connection.getAccountInfo(stakeAcc);
      if (acc) {
        sellerPlatformStakedAart = stakeAcc;
      }
    }

    console.log("source = ", source.toString());
    console.log("walletKey = ", walletKey.toString());
    console.log("escrowAccount = ", escrowAccount.toString());
    console.log("buyerNftAccount = ", buyerNftAccount.toString());
    console.log("sellerTokenAccount = ", sellerTokenAccount.toString());
    console.log(
      "escrow.programNftAccount = ",
      escrow.programNftAccount.toString()
    );
    console.log("ESCROW_PROGRAM = ", ESCROW_PROGRAM.toString());
    console.log(
      "escrow.authorityAccount = ",
      escrow.authorityAccount.toString()
    );
    console.log("escrow.feeAccount = ", escrow.feeAccount.toString());
    console.log("escrow.walletAccount = ", escrow.walletAccount.toString());
    console.log("sellerAartAccount = ", sellerAartAccount.toString());
    console.log("stakeAuthority = ", stakeAuthority.toString());
    console.log(
      "escrow.programStakeAccount = ",
      escrow.programStakeAccount && escrow.programStakeAccount.toString()
    );
    console.log("escrow = ", escrow);
    console.log("userAuthority = ", userAuthority.toString());
    console.log(
      "sellerPlatformStakedAart = ",
      sellerPlatformStakedAart.toString()
    );

    instructions.push(
      BuyNFT({
        source,
        walletKey,
        escrowAccount,
        buyerNftAccount,
        sellerTokenAccount,
        programNftAccount: escrow.programNftAccount,
        escrowProgram: ESCROW_PROGRAM,
        authority: escrow.authorityAccount,
        feeAccount: escrow.feeAccount,
        sellerWalletAccount: escrow.walletAccount,
        sellerAartAccount,
        stakeAuthority,
        programStakeAccount:
          escrow.programStakeAccount || SystemProgram.programId,
        escrow,
        userAuthority,
        sellerPlatformStakedAart,
        nonce
      })
    );

    transactions.push(
      await createTransaction(instructions, connection, signers, wallet)
    );

    console.log("after create transaction");
    return {
      buffer: await serializeMultipleTransactions(transactions, wallet)
    };
  }
};

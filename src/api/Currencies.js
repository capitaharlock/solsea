import { SystemProgram } from "@solana/web3.js";

export const currencies = [
  {
    value: SystemProgram.programId.toString(),
    label: "SOL",
    conversionLimit: 0.01,
    decimals: 9,
    fractionalToken: "Lamport"
  },
  {
    value: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    label: "USDC",
    conversionLimit: 0.01,
    decimals: 6,
    fractionalToken: "Cent"
  }
  // {
  //   value: "BcjYAsNCtugm61trWmiYQPNDkGxZbEikgEpKhzc3kFEd",
  //   label: "TEST TOKEN"
  // }
];

export const listingCurrencies = [
  {
    value: SystemProgram.programId.toString(),
    label: "SOL",
    conversionLimit: 0.01,
    decimals: 9,
    fractionalToken: "Lamport"
  }
  // {
  //   value: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  //   label: "USDC",
  //   conversionLimit: 0.01,
  //   decimals: 6,
  //   fractionalToken: "Cent"
  // }
  // {
  //   value: "BcjYAsNCtugm61trWmiYQPNDkGxZbEikgEpKhzc3kFEd",
  //   label: "TEST TOKEN"
  // }
];

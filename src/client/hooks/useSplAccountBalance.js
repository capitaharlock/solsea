import { AccountLayout } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { connect } from "all-art-core/lib/core/connection";
import { Numberu64 } from "all-art-core/lib/programs/TokenSwap";
import { useEffect, useState } from "react";
import { AART_DECIMALS, CLUSTER_URL } from "../../api/Definitions";
import BN from "bn.js";

const decimals = new BN(AART_DECIMALS);

export const useSplBalance = ({ publicKey }) => {
  const [balance, setBalance] = useState(0);

  const addListener = async () => {
    const connection = await connect(CLUSTER_URL);
    connection.onAccountChange(new PublicKey(publicKey), acc => {
      if (acc) {
        const data = AccountLayout.decode(acc.data);
        const amount = Numberu64.fromBuffer(data.amount);
        setBalance(amount.div(decimals).toString());
      }
    });
  };

  const init = async () => {
    const connection = await connect(CLUSTER_URL);
    const acc = await connection.getAccountInfo(new PublicKey(publicKey));
    if (acc) {
      const data = AccountLayout.decode(acc.data);
      const amount = Numberu64.fromBuffer(data.amount);
      setBalance(amount.div(decimals).toString());
    }
    addListener();
  };

  useEffect(() => {
    if (publicKey) {
      init();
    }
  }, [publicKey]);

  return { balance };
};

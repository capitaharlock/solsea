import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import s from "./WalletLoader.scss";

const WalletNftLoader = () => {
  useStyles(s);
  return (
    <div className={`${s.nftLoader} d-flex`}>
      <span className={s.nftSpinner}></span>
    </div>
  );
};

export default WalletNftLoader;

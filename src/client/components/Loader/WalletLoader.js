import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import s from "./WalletLoader.scss";

const WalletLoader = ({ text }) => {
  useStyles(s);
  return (
    <div className={`${s.contentLoader} d-flex`}>
      <span className={s.spinner}></span>
      <span className={s.text}>{text}</span>
    </div>
  );
};

export default WalletLoader;

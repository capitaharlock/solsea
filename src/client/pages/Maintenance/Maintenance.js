import withStyles from "isomorphic-style-loader/withStyles";
import React from "react";
import s from "./Maintenance.scss";

const Maintenance = () => {
  return (
    <div className={`${s.topMargin}`}>
      <h1 className="text-center">
        Solsea is under maintenance.
        <br /> We are working on updating the site and fixing issues.
        <br />
        <br />
        Delisting NFTs is now enabled.
        <br />
        Clear cache and connect your wallet.
      </h1>
    </div>
  );
};

export default {
  component: withStyles(s)(Maintenance)
};

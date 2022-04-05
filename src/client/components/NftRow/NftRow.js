import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import s from "./NftRow.scss";

const NftRow = ({ image, title, listed, price }) => {
  useStyles(s);

  let newPrice = (price / 1000000000).toFixed(2);

  return (
    <div className={s.tableRow}>
      <div className={s.boxWrap}>
        <img src={image} className={s.rowImage} />
        <div className={s.title}>{title}</div>
      </div>
      <div className={s.boxWrap}>
        <div className={s.listed}>{listed}</div>
        <div className={s.price}>
          Floor: <div className={s.priceDiv}>{newPrice}</div>SOL
        </div>
      </div>
      {/* <button>Remove</button> */}
    </div>
  );
};

export default NftRow;

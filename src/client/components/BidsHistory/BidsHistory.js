import useStyles from "isomorphic-style-loader/useStyles";
import React, { useState } from "react";
import { currencies } from "../../../api/Currencies";
import { SOL_TO_LAMPORTS } from "../../../api/Definitions";
import s from "./BidsHistory.scss";
import { useTranslation } from "react-i18next";

const BidsHistory = ({ history, text1 }) => {
  const { t } = useTranslation();
  const [isBid, setIsBid] = useState(false);
  useStyles(s);

  return (
    <div>
      <div className={`mb-4 ${s.nav}`}>
        <Button
          text={text1}
          // isActive={!isBid}
          onClick={() => {
            setIsBid(!isBid);
          }}
        />
      </div>
      <div className={s.content}>
        <div key={"2"} className={`mb-3 ${s.item}`}></div>
        {history && history.length > 0 ? (
          history.map((item, index) => (
            <div key={index} className={`mb-3 ${s.item}`}>
              <div className={s.info}>
                <p className="mb-0 text-start">
                  {(item.price / SOL_TO_LAMPORTS).toFixed(2)}{" "}
                  {currencies.find(c => c.value === item.currency).label}
                </p>
                <p className="mb-0 text-start">
                  {t("bidsHistory.buyer")} <span>{item.buyerKey}</span> <br />
                  {t("bidsHistory.at")} {item.updatedAt}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>{t("bidsHistory.noHistory")}</p>
        )}
      </div>
    </div>
  );
};

export default BidsHistory;

export const Button = ({ text, isActive, onClick }) => {
  useStyles(s);
  return (
    <div
      onClick={onClick}
      className={`${s.button} ${isActive ? s.active : ""}`}
    >
      <span>{text}</span>
    </div>
  );
};

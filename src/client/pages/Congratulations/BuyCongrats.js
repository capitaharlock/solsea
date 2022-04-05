/* eslint-disable prettier/prettier */
import withStyles from "isomorphic-style-loader/withStyles";
import React from "react";
import s from "./Congratulations.scss";
import { useTranslation } from "react-i18next";

const BuyCongrats = () => {
  const { t } = useTranslation();

  return (
    <div className={`page-wrapper container`}>
      <div className={`${s.congrats}`}>
        <h2 style={{ paddingTop: "150px" }}>{t("congratulations.congrats")}</h2>
        <p>{t("congratulations.purchaseSuccess")}</p>
        <p>{t("congratulations.checkWallet")}</p>
      </div>
    </div>
  );
};

export default {
  component: withStyles(s)(BuyCongrats)
};

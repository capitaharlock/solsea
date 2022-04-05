/* eslint-disable prettier/prettier */
import React from "react";
import s from "./Congratulations.scss";
import withStyles from "isomorphic-style-loader/withStyles";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

const Congratulations = () => {
  const { t } = useTranslation();
  const params = useParams();

  return (
    <div className={`page-wrapper container profile-banner ${s.container}`}>
      <div className={`${s.congrats}`}>
        <div className={s.checkSign}>
          <i className="fa fa-check"></i>
        </div>
        <h2>{t("congratulations.congrats")}</h2>
        <p>{t("congratulations.mintSuccess")}</p>
        <p>{t("congratulations.checkRefresh")}</p>
        <div className={`mt-5 d-flex ${s.buttonContainer}`}>
          <Link
            to={"/nft/" + params.mintKey}
            className={`${s.viewButton} mb-3`}
          >
            {t("congratulations.seeMint")}
          </Link>
          <a
            href={"https://explorer.solana.com/address/" + params.mintKey}
            target="_blank"
            rel="noopener noreferrer"
            className={`${s.viewButton} mb-3`}
          >
            {t("congratulations.viewSolana")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default {
  component: withStyles(s)(Congratulations)
};

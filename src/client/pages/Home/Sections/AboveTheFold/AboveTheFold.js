import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import FreshCollections from "../FreshCollection/FreshCollections";
import s from "./AboveTheFold.scss";

const AboveTheFold = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  useStyles(s);

  return (
    <>
      <div
        className={`${s.upcoming} ${
          isDarkMode ? "dark-mode-upcoming-collections-line" : ""
        }`}
      >
        {/* <div className={s.idoBanner}>
          <div className={`${s.idoInner} d-flex`}>
            <div className={s.left}>
              <span>JOIN THE ALL.ART IDO</span>
              <p>{"SOLSEA WILL USE ALL.ART'S AART TOKEN"}</p>
            </div>
            <div className={s.right}>
              <div className={s.date}>
                <p>DEC 21, 18:00 UTC</p>
              </div>
              <div className={s.idoButton}>
                <a href="https://ido.all.art/" target="_blank" rel="noreferrer">
                  WHITELIST NOW
                </a>
              </div>
            </div>
          </div>
        </div> */}
        <div className={`container ${s.container}`}>
          <span>{t("homepage.fresh")}</span>
        </div>
      </div>

      <div className={`${s.header} container d-flex`}>
        <div className={`d-flex ${s.textSection}`}>
          <div className={`${s.textTop}`}>
            <h1>{t("homepage.titleAboveTheFold")}</h1>
          </div>
          <div className={s.textTopSecond}>
            <p>{t("homepage.belowTitleAboveTheFold")}</p>
            <div className={`${s.buttons} d-flex`}>
              <Link to="/explore" className={`${s.btnMain}`}>
                {t("homepage.exploreButton")}
              </Link>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Link to="/create" className={`${s.btnWhite}`}>
                {t("homepage.createButton")}
              </Link>
            </div>
          </div>
        </div>
        <div className={`${s.freshCollections} row d-flex`}>
          <FreshCollections />
        </div>
      </div>
    </>
  );
};

export default AboveTheFold;

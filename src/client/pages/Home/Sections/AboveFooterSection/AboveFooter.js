import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import usePopup from "../../../../components/Popup/usePopup";
import WalletPopup from "../../../../components/Popup/WalletPopup";
import TitleAbove from "../../../../components/TitleAbove/TitleAbove";
import s from "./AboveFooter.scss";

const AboveFooter = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const { isShowing, toggle } = usePopup();
  useStyles(s);

  return (
    <div className={`${s.explanation} row`}>
      <div className={`title-above`}>
        <TitleAbove title={t("homepage.aboveFooterTitle")} emoji={`⚒️`} />
      </div>
      <div className="col-lg-4 col-md-6 mb-sm-30">
        <div
          className={`${s.featureBox} ${isDarkMode ? "dark-feature-box" : ""}`}
        >
          <h3>{t("homepage.aboveFooterFirstTitle")}</h3>
          <p>{t("homepage.aboveFooterFirstText")}</p>
          <br />
          <a className={s.buttonAboveFooter} onClick={toggle}>
            {t("homepage.aboveFooterFirstTitle")}
            <i className={`${s.checkIcon} fa fa-arrow-right me-1`}></i>
          </a>
          <WalletPopup isShowing={isShowing} hide={toggle} />
        </div>
      </div>
      <div className="col-lg-4 col-md-6 mb-sm-30">
        <div
          className={`${s.featureBox} ${isDarkMode ? "dark-feature-box" : ""}`}
        >
          <h3>{t("homepage.aboveFooterSecondTitle")} </h3>
          <p>{t("homepage.aboveFooterSecondText")}</p>
          <br />
          <Link to="/create-collection">
            {t("homepage.aboveFooterSecondTitle")}
            <i className={`${s.checkIcon} fa fa-arrow-right me-1`}></i>
          </Link>
        </div>
      </div>
      <div className="col-lg-4 col-md-6 mb-sm-30">
        <div
          className={`${s.featureBox} ${isDarkMode ? "dark-feature-box" : ""}`}
        >
          <div className={`${s.thirdTitle}`}>
            <h3>{t("homepage.aboveFooterThirdTitle")}</h3>
            <p>{t("homepage.aboveFooterThirdText")}</p>
            <br />
            <Link to="/create">
              {t("homepage.aboveFooterThirdTitle")}
              <i className={`${s.checkIcon} fa fa-arrow-right me-1`}></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboveFooter;

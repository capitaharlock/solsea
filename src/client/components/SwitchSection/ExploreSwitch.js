import useStyles from "isomorphic-style-loader/useStyles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { getWalletRoutes } from "../../pages/Wallet/Routes";

import s from "./ExploreSwitch.scss";

const ExploreSwitch = ({ activity, setActivity }) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const match = useRouteMatch();
  const { t } = useTranslation();

  const onItemSwitch = e => {
    setActivity(e);
  };

  useStyles(s);
  return (
    <div className={s.switchSection}>
      <div className={s.switchWrap}>
        <ul className={s.walletSwitch}>
          <li
            key={"Golden"}
            className={`${
              isDarkMode && activity === "golden"
                ? "dark-explore-switch-selected"
                : ""
            } ${isDarkMode ? "dark-explore-switch" : ""}
                ${activity === "golden" ? s.selectedButton : ""}
              `}
          >
            <div onClick={() => onItemSwitch("golden")}>
              <h6>{t("navbar.gold")}</h6>
            </div>
            <span
              className={`${isDarkMode ? "dark-underline" : s.underline}`}
            ></span>
          </li>
          <li
            key={"Nfts"}
            className={`${
              isDarkMode && activity === "explore"
                ? "dark-explore-switch-selected"
                : ""
            } ${isDarkMode ? "dark-explore-switch" : ""}
                ${activity === "explore" ? s.selectedButton : ""}
              `}
          >
            <div onClick={() => onItemSwitch("explore")}>
              <h6>{t("navbar.explore")}</h6>
            </div>
            <span
              className={`${isDarkMode ? "dark-underline" : s.underline}`}
            ></span>
          </li>
          <li
            key={"Activity"}
            className={`${
              isDarkMode && activity === "activity"
                ? "dark-explore-switch-selected"
                : ""
            } ${isDarkMode ? "dark-explore-switch" : ""}
                ${activity === "activity" ? s.selectedButton : ""}
              `}
          >
            <div onClick={() => onItemSwitch("activity")}>
              <h6>{t("navbar.activity")}</h6>
            </div>
            <span
              className={`${isDarkMode ? "dark-underline" : s.underline}`}
            ></span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ExploreSwitch;

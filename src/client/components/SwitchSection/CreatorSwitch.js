import useStyles from "isomorphic-style-loader/useStyles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { getCreatorRoutes } from "../../pages/CreatorsPage/Routes";

import s from "./CreatorSwitch.scss";

const CreatorSwitch = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const match = useRouteMatch();
  const history = useHistory();

  const navRoutes = useMemo(
    () =>
      getCreatorRoutes({
        urlPrefix: match.url
      }),
    [match.url]
  );

  useStyles(s);
  return (
    <div className={s.switchSection}>
      <div
        className={`${s.switchWrap} ${isDarkMode ? "dark-wallet-switch" : ""}`}
      >
        <ul className={s.walletSwitch}>
          {navRoutes.map((navigation, index) => (
            <li
              key={index}
              className={` ${
                isDarkMode && history.location.pathname === navigation.route
                  ? "dark-explore-switch-selected"
                  : ""
              }
              ${isDarkMode ? "dark-explore-switch" : ""}
                ${history.location.pathname === navigation.route &&
                  s.selectedButton}
              `}
            >
              <Link to={navigation.route} replace>
                <h6>{t(navigation.title)}</h6>
              </Link>
              <span className={s.underline}></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CreatorSwitch;

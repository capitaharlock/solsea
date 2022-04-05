import useStyles from "isomorphic-style-loader/useStyles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { getWalletRoutes } from "../../pages/Wallet/Routes";

import s from "./WalletSwitch.scss";

const Switch = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const match = useRouteMatch();
  const history = useHistory();

  const navRoutes = useMemo(
    () =>
      getWalletRoutes({
        urlPrefix: match.url
      }),
    [match.url]
  );

  useStyles(s);
  return (
    <div className={s.switchSection}>
      <div
        className={`${s.switchWrap} ${
          isDarkMode ? "dark-wallet-switch" : "light-wallet-switch"
        }`}
      >
        <ul className={s.walletSwitch}>
          {navRoutes.map((navigation, index) => (
            <li
              key={index}
              className={`
                ${
                  history.location.pathname === navigation.route
                    ? s.selectedButton
                    : ""
                }
              `}
            >
              <Link to={navigation.route} replace>
                <h6>{t(navigation.title)}</h6>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Switch;

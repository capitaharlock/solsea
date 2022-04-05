import React, { useEffect, useState } from "react";
import s from "./CookieConsent.scss";
import useStyles from "isomorphic-style-loader/useStyles";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const CookieConsent = () => {
  const { isInitialRender } = useSelector(({ app }) => ({
    isInitialRender: app.isInitialRender
  }));
  const { t } = useTranslation();
  const [close, setClose] = useState(true);
  const [agreedCookies, setAgreedCookies] = useState(() => {
    if (typeof window !== "undefined") {
      const localGet = localStorage.getItem("agreedCookies");
      return JSON.parse(localGet);
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agreedCookies", JSON.stringify(agreedCookies));
    }
  }, [agreedCookies]);

  const onClickClose = () => {
    setAgreedCookies(false);
    setClose(false);
  };

  const onClickAgree = () => {
    setAgreedCookies(true);
    setClose(false);
  };

  useStyles(s);
  return close && !agreedCookies && !isInitialRender ? (
    <div className={`${s.cookieContainer}`}>
      <div className={`${s.cookies} d-flex`}>
        <div className={`${s.closeButton}`}>
          <button onClick={onClickClose}>&times;</button>
        </div>
        <div className={`d-flex ${s.text}`}>
          <p>{t("notification.cookies")}</p>
        </div>
        <div className={`d-flex ${s.agreeButton}`}>
          <button onClick={onClickAgree}>{t("notification.accept")}</button>
        </div>
      </div>
    </div>
  ) : null;
};

export default CookieConsent;

import React from "react";
import { useSelector } from "react-redux";
import s from "./Page404.scss";
import { useTranslation } from "react-i18next";

const Page404 = () => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const { t } = useTranslation();
  return (
    <div
      className={`banner page-wrapper ${s.topMargin} ${
        isDarkMode ? "dark-lighter" : "light-white"
      }`}
    >
      <h1
        style={{ fontSize: "50px", paddingTop: "200px" }}
        className="text-center"
      >
        {t("page404.error")}
      </h1>
    </div>
  );
};

export default {
  component: Page404
};

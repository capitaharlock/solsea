import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import s from "./NavBarComponents.scss";

const NewNavigationItem = ({ name, url }) => {
  const { t } = useTranslation();
  useStyles(s);
  return (
    <li className={`${s.navItem}`}>
      <Link className="d-flex align-items-center h-100" to={url}>
        <span className={s.text}>
          <i>{t("navbar.new")}</i>
          {name} <span className={s.underline}></span>
        </span>
      </Link>
    </li>
  );
};

export default NewNavigationItem;

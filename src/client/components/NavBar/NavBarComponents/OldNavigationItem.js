import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { Link } from "react-router-dom";
import s from "./NavBarComponents.scss";

const OldNavigationItem = ({ name, url }) => {
  useStyles(s);
  return (
    <li className={`${s.navItem}`}>
      <Link className="d-flex align-items-center h-100" to={url}>
        <span className={s.text}>
          {name} <span className={s.underline}></span>
        </span>
      </Link>
    </li>
  );
};

export default OldNavigationItem;

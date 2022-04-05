import React from "react";
import s from "./Loader.module.scss";
import useStyles from "isomorphic-style-loader/useStyles";
import { useSelector } from "react-redux";

const Loader = props => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  useStyles(s);
  return (
    <div className={`${s.root} ${isDarkMode ? "dark-loader" : ""}`}>
      <div className={s.spinnerContainer}>
        <span className={s.spinner}></span>
        {props.text && (
          <p
            className="mt-2"
            dangerouslySetInnerHTML={{ __html: props.text }}
          ></p>
        )}
      </div>
    </div>
  );
};

export default Loader;

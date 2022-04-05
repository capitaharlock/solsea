import React from "react";
import s from "./DarkSwitch.scss";
import useStyles from "isomorphic-style-loader/useStyles";
import { useSelector } from "react-redux";

const DarkSwitch = ({ handleChange }) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));

  useStyles(s);

  return (
    <button className={s.switchDarkLight} onClick={handleChange}>
      <img src={`${isDarkMode ? "/assets/light.png" : "/assets/moon.png"}`} />
    </button>
  );
};

export default DarkSwitch;

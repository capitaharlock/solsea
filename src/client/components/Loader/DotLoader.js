import React from "react";
import s from "./Loader.module.scss";
import useStyles from "isomorphic-style-loader/useStyles";

const DotLoader = () => {
  useStyles(s);
  return (
    <div className={s.dotLoader}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default DotLoader;

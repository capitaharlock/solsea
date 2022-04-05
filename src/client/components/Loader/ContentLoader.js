import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import s from "./Loader.module.scss";

const ContentLoader = () => {
  useStyles(s);
  return (
    <div className={s.contentLoader}>
      <span className={s.spinner}></span>
    </div>
  );
};

export default ContentLoader;

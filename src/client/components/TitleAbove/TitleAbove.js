import withStyles from "isomorphic-style-loader/withStyles";
import React from "react";
import s from "./TitleAbove.scss";

const TitleAbove = ({ title, emoji }) => {
  return (
    <div className={s.title}>
      <span>{emoji}</span>
      <h2>{title}</h2>
    </div>
  );
};

export default withStyles(s)(TitleAbove);

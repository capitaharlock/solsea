import React from "react";
import useStyles from "isomorphic-style-loader/useStyles";
import s from "./Banner.scss";

const ExternalBanner = ({ url, imageUrl, alt }) => {
  useStyles(s);

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img className={`${s.bannerImage}`} src={imageUrl} alt={alt} />
    </a>
  );
};

export default ExternalBanner;

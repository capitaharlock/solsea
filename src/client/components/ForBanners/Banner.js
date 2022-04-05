import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { isMobile } from "react-device-detect";
import { Link } from "react-router-dom";
import s from "./Banner.scss";

const Banner = ({ url, imageUrl, mobileImageUrl, alt }) => {
  useStyles(s);

  return (
    <Link to={url}>
      <img
        className={`${s.bannerImage}`}
        src={isMobile ? mobileImageUrl : imageUrl}
        alt={alt}
      />
    </Link>
  );
};

export default Banner;

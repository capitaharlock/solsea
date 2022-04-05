import withStyles from "isomorphic-style-loader/withStyles";
import React, { useState } from "react";
import s from "./ReadMore.scss";
import { useTranslation } from "react-i18next";

const ReadMore = ({ children = "" }) => {
  const { t } = useTranslation();
  const text = children;
  const [isReadMore, setIsReadMore] = useState(true);
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  return (
    <p className={`text mb-0`}>
      {text.length < 150 ? (
        text
      ) : (
        <>
          {isReadMore ? text.slice(0, 150) : text}
          <span onClick={toggleReadMore} className="read-or-hide">
            {isReadMore ? t("readMore.readMore") : t("readMore.showLess")}
          </span>
        </>
      )}
    </p>
  );
};

export default withStyles(s)(ReadMore);

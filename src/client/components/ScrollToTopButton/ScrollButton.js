import useStyles from "isomorphic-style-loader/useStyles";
import React, { useState } from "react";
import s from "./ScrollButton.scss";

const ScrollButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 300) {
      setVisible(true);
    } else if (scrolled <= 300) {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", toggleVisible);
  }

  useStyles(s)
  return (
    <div className={`${s.scrollContainer}`}>
      <button
        className={`${s.scroll}`}
        onClick={scrollToTop}
        style={{ display: visible ? "inline" : "none" }}
      >
        <i className={`fa fa-chevron-up`} />
      </button>
    </div>
  );
};

export default ScrollButton;

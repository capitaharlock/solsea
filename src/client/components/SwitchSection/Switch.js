import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";

import s from "./Switch.scss";
import SwitchButton from "./SwitchButton";

const Switch = ({
  firstSwitchText,
  secondSwitchText,
  isListed,
  setIsListed
}) => {
  const toggleListed = () => setIsListed(!isListed);

  useStyles(s);
  return (
    <div className={s.switchSection}>
      <div className={s.switchWrap}>
        <div
          onClick={() => {
            setIsListed(true);
          }}
          className={`${!isListed ? "" : s.switchBtn1} ${
            isListed ? "" : s.selectedButton
          }`}
        >
          <div className={`${s.span} ${isListed ? "" : s.selected}`}>
            {firstSwitchText}
          </div>
        </div>
        <SwitchButton handleChange={toggleListed} value={isListed} />
        <div
          onClick={() => {
            setIsListed(false);
          }}
          className={`${!isListed ? s.switchBtn2 : ""} ${
            isListed ? s.selectedButton : ""
          }`}
        >
          <div className={`${s.span} ${isListed ? s.selected : ""}`}>
            {secondSwitchText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Switch;

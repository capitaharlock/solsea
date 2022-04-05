import React from "react";
import PropTypes from "prop-types";

import s from "./SwitchButton.scss";
import useStyles from "isomorphic-style-loader/useStyles";

const SwitchButton = ({ handleChange, value }) => {
  useStyles(s);
  return (
    <label className={s.switch} htmlFor={s.switch}>
      <input
        type="checkbox"
        name="switch-checkbox"
        id={s.switch}
        onChange={handleChange}
        checked={value}
        aria-hidden="true"
      />
      <span className={`${s.slider} ${s.rounded}`}></span>
    </label>
  );
};

SwitchButton.propTypes = {
  handleChange: PropTypes.func.isRequired
};

export default SwitchButton;

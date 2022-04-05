import React, { useCallback, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

import s from "./MultiRangeSlider.scss";
import useStyles from "isomorphic-style-loader/useStyles";

const MultiRangeSlider = ({ min, max, onChange }) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range = useRef(null);

  // Convert to percentage
  const getPercent = useCallback(
    value => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Get min and max values when their state changes
  // useEffect(() => {
  //   onChange({ min: minVal, max: maxVal });
  // }, [minVal, maxVal, onChange]);

  const onValueChanges = () => {
    onChange({ min: minVal, max: maxVal });
  };

  useStyles(s);

  return (
    <div className="container">
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={event => {
          const value = Math.min(Number(event.target.value), maxVal - 1);
          setMinVal(value);
          minValRef.current = value;
          onValueChanges();
        }}
        className={`${s.thumb} ${s.thumbLeft}`}
        style={{ zIndex: minVal > max - 100 && "5" }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={event => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          setMaxVal(value);
          maxValRef.current = value;
          onValueChanges();
        }}
        className={`${s.thumb} ${s.thumbRight}`}
      />

      <div className={`${s.slider}`}>
        <div className={`${s.sliderTrack}`} />
        <div ref={range} className={`${s.sliderRange}`} />
        <div className={`${s.sliderLeftValue}`}>{minVal}</div>
        <div className={`${s.sliderRightValue}`}>{maxVal}</div>
      </div>
    </div>
  );
};

export default MultiRangeSlider;

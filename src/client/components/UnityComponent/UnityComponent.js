import React, { useEffect, useState } from "react";
import withStyles from "isomorphic-style-loader/withStyles";
import s from "./UnityComponent.scss";

const UnityComponent = ({ iframeLink, isExhibitionLoaded }) => {
  const ref = React.createRef();

  return (
    <div className={`${s.unityOverlay}`}>
      <div className={s.root}>
        <iframe
          ref={ref}
          className={s.iframe}
          src={iframeLink}
          allowtransparency="true"
        ></iframe>
        {isExhibitionLoaded ? (
          <button
            className={s.fullscreenButton}
            onClick={() => {
              openFullscreen(ref.current);
            }}
          >
            <span>Full screen</span>
            <img src={"/assets/fullscreen.png"}></img>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default withStyles(s)(UnityComponent);

function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

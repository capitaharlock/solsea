import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import s from "./Popup.scss";

const Modal = ({ isShowing, children }) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  useStyles(s);
  return isShowing
    ? createPortal(
        <>
          <div className={`${s.modalOverlay}`} />
          <div
            className={`${s.modalWrapper}`}
            aria-modal
            aria-hidden
            tabIndex={-1}
            role="dialog"
          >
            <div
              className={`${s.modal} ${
                isDarkMode ? "dark-theme" : "light-theme"
              }`}
            >
              {children}
            </div>
          </div>
        </>,
        document.body
      )
    : null;
};

export default Modal;

import React from "react";
import { renderRoutes } from "react-router-config";
import withStyles from "isomorphic-style-loader/withStyles";
import s from "./Layout.scss";
import Navbar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";
import { useDispatch, useSelector } from "react-redux";
import CookieConsent from "../components/CookieConsent/CookieConsent";
import ScrollButton from "../components/ScrollToTopButton/ScrollButton";
import { TOGGLE_WALLET } from "../actions/app";
// import Maintenance from "../pages/Maintenance/Maintenance";

const DefaultLayout = ({ route }) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));

  const dispatch = useDispatch();

  const toggleWallet = () => {
    dispatch({
      type: TOGGLE_WALLET
    });
  };

  return (
    <div className={s.root}>
      <ScrollToTop
        excludePath={[
          {
            path: "/explore",
            action: "POP"
          }
          // {
          // 	path: "/explore",
          // 	action: "PUSH"
          // }
        ]}
      >
        <Navbar />
        <div className={`${isDarkMode ? "dark-page-wrap" : "page-wrap"}`}>
          {renderRoutes(route.routes)}
        </div>
        <Footer />
        <CookieConsent />
        <ScrollButton />
      </ScrollToTop>
    </div>
  );
};

export default {
  component: withStyles(s)(DefaultLayout)
};

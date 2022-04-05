import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import Seo from "../../components/Seo/Seo";
import { store } from "react-notifications-component";
import { handleInitialUserData, handleLogin } from "../../actions/user";
import s from "./Login.scss";
import { useDispatch, useSelector } from "react-redux";
import withStyles from "isomorphic-style-loader/withStyles";
import { notificationOptions } from "../../../api/Definitions";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  const { register, handleSubmit } = useForm();

  const onSubmit = data => {
    dispatch(handleLogin(data))
      .then(({ redirect }) => {
        history.replace(redirect ? redirect : "/");
        dispatch(handleInitialUserData());
        store.addNotification({
          title: t("notification.successNotification"),
          message: t("login.loggedSuccess"),
          type: "success",
          ...notificationOptions
        });
      })
      .catch(err => {
        store.addNotification({
          title: t("notification.errorNotification"),
          message: err.message,
          type: "danger",
          ...notificationOptions
        });
      });
  };

  return (
    <div>
      <Seo title={`Solsea | ${t("seo.login")}`} />

      <section
        className={`banner profile-banner d-flex ${
          isDarkMode ? "dark-lighter" : "light-white"
        }`}
      >
        <div className="header">
          <h1>{t("login.login")}</h1>
        </div>
      </section>
      <div className="pt-5 page-wrapper">
        <div className="container">
          <div className={`row`}>
            <div className="col-md-6 offset-md-3 label-text-colors">
              <form onSubmit={handleSubmit(onSubmit)} className="form-border">
                <h3 className="mb-4">{t("login.loginToAccount")}</h3>
                <div className="field-set mb-4">
                  <label htmlFor="email">{t("login.email")}</label>
                  <input
                    {...register("email")}
                    className={`form-control ${
                      isDarkMode ? "dark-lighter-more-input" : "light-white"
                    }`}
                    type="email"
                  />
                </div>
                <div className="field-set mb-1">
                  <label htmlFor="password">{t("login.password")}</label>
                  <input
                    className={`form-control ${
                      isDarkMode ? "dark-lighter-more-input" : "light-white"
                    }`}
                    type="password"
                    {...register("password")}
                  />
                </div>
                <div className="mb-5">
                  <Link to="/forgot-password">
                    {t("forgotPassword.forgot")}
                  </Link>
                </div>
                <button className="main-button mb-4">{t("login.login")}</button>
                <div className="mb-2">
                  <Link to="/register">{t("login.notRegisteredYet")}</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  component: withStyles(s)(Login)
};

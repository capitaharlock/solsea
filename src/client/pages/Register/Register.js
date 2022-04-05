import React from "react";
import { useForm } from "react-hook-form";
import { Link, useHistory } from "react-router-dom";
import Seo from "../../components/Seo/Seo";
import { handleLogin, handleRegister } from "../../actions/user";
import s from "./Register.scss";
import { useDispatch, useSelector } from "react-redux";
import withStyles from "isomorphic-style-loader/withStyles";
import { store } from "react-notifications-component";
import { notificationOptions } from "../../../api/Definitions";
import { useTranslation } from "react-i18next";

const Register = () => {
  const {
    user: { walletKey, connected, user },
    isDarkMode,
    app
  } = useSelector(({ user, app }) => ({
    user,
    isDarkMode: app.isDarkMode,
    app
  }));

  const { t } = useTranslation();

  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const history = useHistory();
  const onSubmit = data => {
    if (data.password === data.repeatPassword) {
      dispatch(handleRegister({ ...data, walletKey: walletKey.toString() }))
        .then(() => {
          dispatch(
            handleLogin({
              ...data
            })
          ).then(({ user }) => {
            history.replace("/edit-profile/" + user._id);
          });
          store.addNotification({
            title: t("notification.successNotification"),
            message: t("register.registerSuccess"),
            type: "success",
            ...notificationOptions
          });
        })
        .catch(error => {
          store.addNotification({
            title: t("notification.errorNotification"),
            message: error.message,
            type: "danger",
            ...notificationOptions
          });
        });
    } else {
      // alert("Please type in the same password.");
      store.addNotification({
        title: t("notification.errorNotification"),
        message: t("notification.pleaseRetype"),
        type: "danger",
        ...notificationOptions
      });
    }
  };
  return (
    <div>
      <Seo title={`Solsea | ${t("seo.registration")}`} />

      <section
        className={`banner profile-banner d-flex ${
          isDarkMode ? "dark-lighter" : "light-white"
        }`}
      >
        <div className="header">
          <h1>{t("register.register")}</h1>
        </div>
      </section>
      <div className="pt-5 page-wrapper">
        <div className="container">
          {!connected ? (
            <div className="connect-wallet-text">
              <h4 style={{ textAlign: "center" }}>
                {t("mintNFT.connectFirst")}
              </h4>
            </div>
          ) : (
            <div className={`row`}>
              <div className="col-md-6 offset-md-3">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="form-border label-text-colors "
                >
                  <h3 className="mb-4">{t("register.registerNow")}</h3>
                  <div className="field-set mb-4">
                    <label htmlFor="email">{t("register.email")}</label>
                    <input
                      {...register("email")}
                      className={`form-control ${
                        isDarkMode ? "dark-lighter-more-input" : "light-white"
                      }`}
                      type="email"
                    />
                  </div>
                  <div className="field-set mb-4">
                    <label htmlFor="password">{t("login.password")}</label>
                    <input
                      className={`form-control ${
                        isDarkMode ? "dark-lighter-more-input" : "light-white"
                      }`}
                      type="password"
                      {...register("password")}
                    />
                  </div>
                  <div className="field-set mb-4">
                    <label htmlFor="password">
                      {t("register.retypePassword")}
                    </label>
                    <input
                      className={`form-control ${
                        isDarkMode ? "dark-lighter-more-input" : "light-white"
                      }`}
                      type="password"
                      {...register("repeatPassword")}
                    />
                  </div>
                  <button className="main-button mb-4">
                    {t("register.register")}
                  </button>
                  <div className="mb-2">
                    <Link to="/login">{t("register.alreadyHaveAccount")}</Link>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  component: withStyles(s)(Register)
};

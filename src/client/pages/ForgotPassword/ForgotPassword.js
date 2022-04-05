import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { store } from "react-notifications-component";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import Seo from "../../components/Seo/Seo";
import { notificationOptions } from "../../../api/Definitions";
import { handleForgotPassword } from "../../actions/user";
import DotLoader from "../../components/Loader/DotLoader";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  const { register, handleSubmit } = useForm();

  const onSubmit = data => {
    if (loading) return;
    setLoading(true);
    dispatch(handleForgotPassword(data))
      .then(() => {
        setLoading(false);
        store.addNotification({
          title: t("notification.successNotification"),
          message: t("forgotPassword.requestMessage"),
          type: "success",
          ...notificationOptions
        });
      })
      .catch(err => {
        setLoading(false);
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
      <Seo title={`Solsea | ${t("seo.forgotPassword")}`} />
      <section
        className={`banner empty-header d-flex ${
          isDarkMode ? "dark-lighter" : "light-white"
        }`}
      >
        <div className="header">
          <h1>{t("forgotPassword.forgot")}</h1>
        </div>
      </section>
      <div className="pt-5 page-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <form onSubmit={handleSubmit(onSubmit)} className="form-border">
                <h3 className="mb-4">{t("forgotPassword.requestReset")}</h3>
                <div className="mb-4">
                  <label htmlFor="email">{t("forgotPassword.email")}</label>
                  <input
                    {...register("email")}
                    className={`form-control ${
                      isDarkMode ? "dark-lighter-more-input" : "light-white"
                    }`}
                    type="email"
                  />
                </div>

                <button className="main-button mb-4">
                  {loading ? <DotLoader /> : "Send request"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  component: ForgotPassword
};

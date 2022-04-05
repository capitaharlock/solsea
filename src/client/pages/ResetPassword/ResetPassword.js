import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { store } from "react-notifications-component";
import { useDispatch } from "react-redux";
import { useHistory, useRouteMatch } from "react-router";
import Seo from "../../components/Seo/Seo";
import { notificationOptions } from "../../../api/Definitions";
import { handleForgotPassword, handleResetPassword } from "../../actions/user";
import DotLoader from "../../components/Loader/DotLoader";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const match = useRouteMatch();

  const { register, handleSubmit } = useForm();

  const onSubmit = data => {
    if (loading) return;
    setLoading(true);

    data.token = match.params.token;

    dispatch(handleResetPassword(data))
      .then(() => {
        setLoading(false);
        store.addNotification({
          title: t("notification.successNotification"),
          message: t("notification.passwordSuccess"),
          type: "success",
          ...notificationOptions
        });
        history.replace("/login");
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
      <Seo title={`Solsea | ${t("seo.resetPass")}`} />
      <section className="empty-header d-flex">
        <div className="header">
          <h1>{t("resetPassword.reset")}</h1>
        </div>
      </section>
      <div className="page-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <form onSubmit={handleSubmit(onSubmit)} className="form-border">
                <h3 className="mb-4">{t("resetPassword.reset")}</h3>
                <div className="field-set mb-4">
                  <label htmlFor="email">{t("login.password")}</label>
                  <input
                    {...register("password")}
                    className="form-control"
                    type="password"
                  />
                </div>
                <div className="field-set mb-4">
                  <label htmlFor="email">{t("resetPassword.repeat")}</label>
                  <input
                    {...register("repeatPassword")}
                    className="form-control"
                    type="password"
                  />
                </div>

                <button className="main-button mb-4">
                  {loading ? <DotLoader /> : "Submit"}
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
  component: ResetPassword
};

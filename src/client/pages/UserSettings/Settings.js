import React, { useEffect, useState } from "react";

import s from "./Settings.scss";
import Seo from "../../components/Seo/Seo";
import { useForm } from "react-hook-form";
import withStyles from "isomorphic-style-loader/withStyles";
import { useSelector } from "react-redux";
import { store } from "react-notifications-component";
import { notificationOptions } from "../../../api/Definitions";
import client from "../../services/feathers";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const [checkPassword, setCheckPassword] = useState(false);
  const { t } = useTranslation();

  const { user, connected, isDarkMode, isLoggedIn } = useSelector(
    ({ user, app }) => ({
      user: user.user,
      connected: user.connected,
      isLoggedIn: user.isLoggedIn,
      isDarkMode: app.isDarkMode
    })
  );
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (user && user.password) {
      reset({ ...user.password });
    }
  }, [user]);

  const onSubmit = async data => {
    if (data.password === data.repeatPassword) {
      try {
        await client.service("change-password").patch(user._id, {
          ...data
        });
        store.addNotification({
          title: t("notification.successNotification"),
          message: t("notification.passwordUpdated"),
          type: "success",
          ...notificationOptions
        });
        // await client.authentication.logout();
      } catch (error) {
        store.addNotification({
          title: t("notification.errorNotification"),
          message: error.message,
          type: "danger",
          ...notificationOptions
        });
        console.log(error);
      }
    }
  };

  const onConfirm = () => {
    setCheckPassword(true);
  };

  const onClose = () => {
    setCheckPassword(false);
  };

  const onDelete = async data => {
    try {
      if (user._id) {
        if (confirm(t("notification.areYouSureDelete"))) {
          await client.service("delete-account").patch(user._id, { ...data });
          window.location.reload();
          store.addNotification({
            title: t("notification.successNotification"),
            message: t("notification.updateProfileSuccess"),
            type: "success",
            ...notificationOptions
          });
        }
      }
    } catch (error) {
      store.addNotification({
        title: t("notification.danger"),
        message: error.message,
        type: "danger",
        ...notificationOptions
      });
      console.log(error);
    }
  };

  return (
    <div>
      <Seo title={`Solsea | ${t("seo.userSettings")}`} />
      {!connected ? (
        <div className={`${s.notLoggedIn} connect-wallet-text`}>
          <p>{t("mintNFT.connectFirst")}</p>
        </div>
      ) : (
        <div id="container page-wrapper position-relative">
          <section
            aria-label="section"
            className={`banner profile-banner d-flex ${
              isDarkMode ? "dark-lighter" : "light-white"
            }`}
          >
            <h1>{t("settings.editSettings")}</h1>
          </section>
          {!isLoggedIn ? (
            <h4 className={s.notConnected}>{t("mintNFT.connectFirst")}</h4>
          ) : (
            <section aria-label="section">
              <div className="container">
                <div className={`${s.section}  row wow fadeIn`}>
                  <div className="col-md-7">
                    <form
                      className="form-border"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      <div className="mb-4">
                        <h5 className={`text-center`} htmlFor="oldPassword">
                          {t("settings.typeOldPass")}
                        </h5>
                        <input
                          {...register("oldPassword")}
                          type="password"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                        />
                      </div>
                      <div className="mb-4">
                        <h5 className={`text-center`} htmlFor="password">
                          {t("settings.changePass")}
                        </h5>
                        <input
                          {...register("password")}
                          type="password"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                        />
                      </div>
                      <div className="mb-4">
                        <h5 className={`text-center`} htmlFor="password">
                          {t("settings.retypeNewPass")}
                        </h5>
                        <input
                          {...register("repeatPassword")}
                          type="password"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                        />
                      </div>

                      <input
                        type="submit"
                        id="submit"
                        value={t("submit")}
                        className={`${s.submit} main-button`}
                      />
                    </form>
                    <button
                      onClick={onConfirm}
                      className={`${s.delete} main-button`}
                    >
                      <span>{t("settings.deleteAccount")}</span>
                    </button>
                  </div>
                  <>
                    {checkPassword && (
                      <>
                        <form
                          className={`${
                            s.deleteForm
                          } container col-md-7 form-border ${
                            isDarkMode ? "dark-divided-section" : "light-white"
                          }`}
                          onSubmit={handleSubmit(onDelete)}
                        >
                          <div className="mb-4">
                            <h5 className={`text-center`} htmlFor="oldPassword">
                              {t("settings.typePassToDelete")}
                            </h5>
                            <input
                              {...register("oldPassword")}
                              type="password"
                              className={`form-control ${
                                isDarkMode
                                  ? "dark-lighter-more-input"
                                  : "light-white"
                              }`}
                            />
                          </div>
                          <input
                            type="submit"
                            id="submit"
                            value={t("submit")}
                            className={`${s.deleteAccount} main-button`}
                          />
                          <button
                            onClick={onClose}
                            className={`${s.cancel} main-button`}
                          >
                            {t("settings.cancel")}
                          </button>
                        </form>
                      </>
                    )}
                  </>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  component: withStyles(s)(Settings)
};

import React, { useEffect, useState } from "react";

import s from "./EditProfile.scss";
import Seo from "../../components/Seo/Seo";
import { Controller, useForm } from "react-hook-form";
import { updateUser } from "../../actions/user";
import { handleUpload } from "../../actions/files";
import withStyles from "isomorphic-style-loader/withStyles";
import { useDispatch, useSelector } from "react-redux";
import ImageSelector from "../../components/ImageSelector/ImageSelector";
import { store } from "react-notifications-component";
import { notificationOptions } from "../../../api/Definitions";
import Loader from "../../components/Loader/Loader";
import ReactTooltip from "react-tooltip";
import { useTranslation } from "react-i18next";

const EditProfile = () => {
  const [isLoading, setLoading] = useState(false);

  const { app, user, connected, isDarkMode, isLoggedIn } = useSelector(
    ({ app, user }) => ({
      ...user,
      isDarkMode: app.isDarkMode,
      app
    })
  );
  const { t } = useTranslation();
  const { register, handleSubmit, reset, control } = useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && user.profile) {
      reset({ ...user.profile });
    }
  }, [user]);

  const onSubmit = async data => {
    setLoading(true);
    try {
      if (data.profileImage instanceof File) {
        data.profileImage = await handleUpload({
          file: data.profileImage,
          fileCollection: "Files_ProfileImage"
        });
      }
      if (data.headerImage instanceof File) {
        data.headerImage = await handleUpload({
          file: data.headerImage,
          fileCollection: "Files_HeaderImage"
        });
      }

      if (user._id) {
        const x = data;

        dispatch(
          updateUser({
            data: x,
            _id: user._id
          })
        );
        // .then(() => {
        store.addNotification({
          title: t("notification.successNotification"),
          message: t("editProfile.profileUpdated"),
          type: "success",
          ...notificationOptions
        });
        // })
        // .catch(e => {
        //   console.log(e);
        // });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      // console.log(error);
    }
  };

  return (
    <div>
      <Seo title={`Solsea | ${t("seo.editProfile")}`} />
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
            <h1>{t("editProfile.editYourProfile")}</h1>
          </section>
          {!isLoggedIn ? (
            <h4 className={s.notConnected}>{t("mintNFT.connectFirst")}</h4>
          ) : (
            <section aria-label="section">
              <div className="container">
                <div className={`${s.section} row wow fadeIn`}>
                  <div className="col-md-7">
                    <div>
                      <p>
                        {t("editProfile.registeredEmail")} {user.email}
                      </p>
                    </div>
                    <form
                      className="form-border"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      <label
                        className={`mb-3 ${isDarkMode ? "light-font" : ""}`}
                        htmlFor="isPublic"
                      >
                        {t("editProfile.isPublic")}
                      </label>
                      <div className={`${s.fieldSection} mb-4`}>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${
                              isDarkMode ? "dark-lighter-checkbox" : ""
                            }`}
                            type="checkbox"
                            id="isPublic"
                            {...register("isPublic")}
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <h5 className={`text-center`}>
                          {t("editProfile.changeProfileImage")}
                        </h5>
                        <Controller
                          name="profileImage"
                          control={control}
                          render={({ field: { onChange, name, value } }) => {
                            return (
                              <ImageSelector
                                innerText1={t("editProfile.uploadProfileImage")}
                                innerText2={t("mintNFT.supportedFormat")}
                                innerText3={t("mintNFT.maxFileSize10")}
                                className={`${s.dCreateFile} ${
                                  isDarkMode
                                    ? "dark-lighter-more"
                                    : "light-white"
                                }`}
                                onChange={onChange}
                                name={name}
                                value={value}
                              />
                            );
                          }}
                        />
                      </div>
                      <div className="mb-4">
                        <h5 className={`text-center`}>
                          {t("editProfile.changeHeaderImage")}
                        </h5>
                        <Controller
                          name="headerImage"
                          control={control}
                          render={({ field: { onChange, name, value } }) => {
                            return (
                              <ImageSelector
                                innerText1={t("editProfile.uploadHeaderImage")}
                                innerText2={t("mintNFT.supportedFormat")}
                                innerText3={t("mintNFT.maxFileSize10")}
                                className={`${s.dCreateFile} ${
                                  isDarkMode
                                    ? "dark-lighter-more"
                                    : "light-white"
                                }`}
                                onChange={onChange}
                                name={name}
                                value={value}
                              />
                            );
                          }}
                        />
                      </div>
                      <div className="mb-4">
                        <h5 className={`text-center`} htmlFor="name">
                          {t("editProfile.name")}
                        </h5>
                        <input
                          {...register("name")}
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                        />
                      </div>

                      <div className="mb-4">
                        <h5 className={`text-center`} htmlFor="description">
                          {t("editProfile.bio")}
                        </h5>
                        <textarea
                          {...register("description")}
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                          rows={5}
                        ></textarea>
                      </div>

                      <div className="mb-4">
                        <h5 className={`text-center`} htmlFor="location">
                          {t("editProfile.location")}
                        </h5>
                        <input
                          {...register("location")}
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                        />
                      </div>

                      <div className="mb-4">
                        <h5 className={`text-center`} htmlFor="website">
                          {t("editProfile.websiteUrl")}
                        </h5>
                        <input
                          {...register("website")}
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                        />
                      </div>

                      <div className=" mb-4">
                        <h5 className={`text-center`} htmlFor="twitter">
                          {t("editProfile.twitterLink")}
                        </h5>
                        <input
                          {...register("twitter")}
                          type="text"
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
                    {isLoading && <Loader />}
                  </div>
                </div>
              </div>
              {!app.isInitialRender && (
                <ReactTooltip
                  place="bottom"
                  effect="solid"
                  className={`${isDarkMode ? "dark-tool-tip" : "tool-tip"}`}
                  multiline={true}
                />
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  component: withStyles(s)(EditProfile)
};

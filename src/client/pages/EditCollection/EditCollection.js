/* eslint-disable no-unreachable */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import s from "./EditCollection.scss";
import f from "../CreateCollection/CreateCollection.scss";
import "react-datepicker/dist/react-datepicker.css";
// import { useHistory } from "react-router";
import ImageSelector from "../../components/ImageSelector/ImageSelector";
import Seo from "../../components/Seo/Seo";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import withStyles from "isomorphic-style-loader/withStyles";
import { useDispatch, useSelector } from "react-redux";
import client from "../../services/feathers";
import { useClientLoading } from "../../hooks/useClientLoading";
import Loader from "../../components/Loader/Loader";
import { errorNotification } from "../../helpers/nofiticationsFunction";
import { handleUpload } from "../../actions/files";
import { handlePatchCollection } from "../../actions/collections";
import { notificationOptions } from "../../../api/Definitions";
import { store } from "react-notifications-component";
import { useRouteMatch } from "react-router";
import {
  getEditCollectionData,
  SET_COLLECTION_MINTS,
  SET_EDIT_COLLECTION
} from "../../actions/pages";
import { SET_TAGS } from "../../actions/tags";
import Select from "react-select";
import ReactTooltip from "react-tooltip";
import { useTranslation } from "react-i18next";

const EditCollection = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const {
    app,
    editCollection,
    collection,
    isDarkMode,
    user: { connected, isLoggedIn, wallet, _id },
    tags
  } = useSelector(({ app, user, collections, tags }) => ({
    app,
    user,
    collection: collections.editCollection,
    editCollection: collections.editCollection,
    userForCollections: user.user,
    isDarkMode: app.isDarkMode,
    tags: tags.tags
  }));

  const match = useRouteMatch();
  const dispatch = useDispatch();
  const [isMinted, setIsMinted] = useState(false);
  const [isSolseaMinted, setIsSolseaMinted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, submitCount }
  } = useForm({
    defaultValues: {
      traits: [{ key: "", value: "" }]
    }
  });

  useEffect(() => {
    if (app.isInitialRender) {
      loadCollection();
      loadMints();
    }
    if (collection && collection.length > 0) {
      let defaultTags = [];
      if (collection[0].tags) {
        defaultTags = collection[0].tags.map(t => ({
          value: t,
          label: t
        }));
      }
      let newDate = new Date();
      try {
        if (collection[0].mintedDate) {
          newDate = new Date(collection[0].mintedDate);
        }
      } catch (e) {
        //e
      }

      reset({ ...collection[0], tags: defaultTags, mintedDate: newDate });
    }
  }, [collection]);

  const { append, fields /* remove */ } = useFieldArray({
    control,
    name: "traits"
  });

  const loadCollection = async () => {
    setLoading(true);
    try {
      const res = await client.service("collections").find({
        query: {
          _id: match.params._id,
          user: _id
        }
      });

      dispatch({
        type: SET_EDIT_COLLECTION,
        payload: res.data
      });
      setIsMinted(res.data[0].minted);
      setIsSolseaMinted(res.data[0].solseaMinted);
      setLoading(false);
    } catch (error) {
      // console.log(error);
    }
  };

  const loadMints = async () => {
    setLoading(true);
    try {
      const res = await client.service("verified-nft-mints").find({
        query: {
          nft_collection: match.params._id
        }
      });
      dispatch({
        type: SET_COLLECTION_MINTS,
        payload: { data: res.data }
      });
      setLoading(false);
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    if (errors) {
      const keys = Object.keys(errors);
      keys.forEach(key => {
        switch (true) {
          case key === "title" && errors[key].type === "maxLength":
            errors[key].message = t("mintNFT.titleMaxLengthMessage");
            break;
        }
        errorNotification(errors[key]);
      });
    }
  }, [submitCount]);

  const item = watch();

  useEffect(() => {
    if (item.traits && item.traits.length > 0) {
      const last = item.traits[item.traits.length - 1];
      if (last.key && last.value) {
        append(
          {
            key: "",
            value: ""
          },
          {
            shouldFocus: false
          }
        );
      }
    }
  }, [item.traits]);

  const onSubmit = async formData => {
    setLoading(true);
    try {
      if (formData.iconImage instanceof File) {
        formData.iconImage = await handleUpload({
          file: formData.iconImage,
          fileCollection: "Files_CollectionIcons",
          onProgress: e => {}
        });
      }

      if (formData.headerImage instanceof File) {
        formData.headerImage = await handleUpload({
          file: formData.headerImage,
          fileCollection: "Files_CollectionHeader",
          onProgress: e => {}
        });
      }

      if (formData.promotionProtraitImage instanceof File) {
        formData.promotionProtraitImage = await handleUpload({
          file: formData.promotionProtraitImage,
          fileCollection: "Files_PromotionPortrait",
          onProgress: e => {}
        });
      }

      if (formData.promotionLandscapeImage instanceof File) {
        formData.promotionLandscapeImage = await handleUpload({
          file: formData.promotionLandscapeImage,
          fileCollection: "Files_PromotionLandscape",
          onProgress: e => {}
        });
      }

      if (formData.tags && formData.tags.length > 0) {
        formData.tags = formData.tags.map(t => t.value);
      }

      const col = await handlePatchCollection(match.params._id, formData);
      loadCollection();

      store.addNotification({
        title: t("userCollectionItem.collectionUpdated"),
        type: "success",
        message: t("userCollectionItem.collectionSuccessUpdated"),
        ...notificationOptions
      });

      setLoading(false);
    } catch (error) {
      console.log(error);
      store.addNotification({
        title: t("notification.wentWrong"),
        type: "danger",
        message: error ? error.message : "error",
        ...notificationOptions
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const fixedScroll = document.getElementById("preview");
    if (fixedScroll !== null) {
      const elTop =
        fixedScroll.getBoundingClientRect().top -
        document.body.getBoundingClientRect().top;

      addEventListener("scroll", function() {
        if (document.documentElement.scrollTop > elTop) {
          fixedScroll.style.position = "fixed";
          fixedScroll.style.top = "120px";
        } else {
          fixedScroll.style.position = "static";
          fixedScroll.style.top = "auto";
        }
      });
    }
  }, []);

  const loadTags = async () => {
    try {
      const res = await client.service("nfttags").find({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      });

      dispatch({
        type: SET_TAGS,
        payload: res.data
      });
    } catch (error) {
      // console.log(error);
    }
  };

  const loadFormData = async () => {
    await loadTags();
    await loadCollection();
    // await loadMints()
  };

  const isLoading = useClientLoading({
    load: loadFormData,
    isInitialRender: app.isInitialRender,
    params: {}
  });

  const selectDarkMode = {
    menu: () => ({
      backgroundColor: isDarkMode ? "#242634" : "#fff",
      border: isDarkMode ? "1px solid #dddddd40" : "1px solid #ddd",
      borderRadius: "0.25rem",
      color: isDarkMode ? "#808080" : "#251552",
      position: "absolute",
      zIndex: "1000",
      width: "100%"
    }),
    control: () => ({
      backgroundColor: isDarkMode ? "#242634" : "#fff",
      border: isDarkMode ? "1px solid #dddddd40" : "1px solid #ddd",
      borderRadius: "0.25rem",
      display: "flex",
      cursor: "pointer"
    }),
    singleValue: () => ({
      backgroundColor: isDarkMode ? "#242634" : "#fff",
      color: isDarkMode ? "#f4f7fcbb" : "#251552"
    }),
    placeholder: () => ({
      backgroundColor: isDarkMode ? "#242634" : "#fff",
      color: isDarkMode ? "#f4f7fcbb" : "#251552"
    }),
    option: base => ({
      ...base,
      "&:hover": {
        backgroundColor: isDarkMode ? "#5c287c" : "#e9ecef"
      },
      backgroundColor: isDarkMode ? "#242634" : "#fff",
      color: isDarkMode ? "#f4f7fcbb" : ""
    })
  };

  return (
    <div>
      <Seo title={`Solsea | ${t("seo.editCollection")}`} />
      <div id="container page-wrapper position-relative">
        <section
          aria-label="section"
          className={`banner profile-banner d-flex ${
            isDarkMode ? "dark-lighter" : "light-white"
          }`}
        >
          <h1>{t("seo.editCollection")}</h1>
        </section>
        {!connected || !isLoggedIn ? (
          <div className={`container page-wrapper position-relative pt-5 connect-wallet-text`}>
            <h4>{t("mintNFT.connectFirst")}</h4>
          </div>
        ) : isLoading ? (
          <Loader />
        ) : (
          <section aria-label="section">
            <div className="container">
              <div className={`${s.section} row wow fadeIn`}>
                <div className="col-md-7">
                  <form className="form-border">
                    <div
                      className={`${s.dividedSection} ${
                        isDarkMode ? "dark-divided-section" : "light-white"
                      } mb-5`}
                    >
                      <div className={`${s.required} field-set mb-5`}>
                        <h5 htmlFor="title">
                          {t("userCollectionItem.title")}{" "}
                          <i
                            data-tip={t("userCollectionItem.titleToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("title", {
                            required: t("mintNFT.titleRequired"),
                            maxLength: 20
                          })}
                          id="title"
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-input-not-allowed"
                              : "light-not-allowed"
                          }`}
                          placeholder={t("userCollectionItem.titlePlaceholder")}
                          readOnly={true}
                        />
                      </div>

                      <div className={`${s.required} field-set mb-5`}>
                        <h5 htmlFor="shortDescription">
                          {t("userCollectionItem.shortDescription")}{" "}
                          <i
                            data-tip={t(
                              "userCollectionItem.shortDescriptionToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <textarea
                          {...register("shortDescription", {
                            // required: "Short description is required!",
                            maxLength: 64
                          })}
                          className={`form-control ${
                            isDarkMode
                              ? "dark-input-not-allowed"
                              : "light-not-allowed"
                          }`}
                          placeholder={t(
                            "createCollection.descriptionPlaceholder"
                          )}
                          rows={5}
                          readOnly={true}
                        ></textarea>
                      </div>

                      <div className={`${s.required} field-set`}>
                        <h5 htmlFor="description">
                          {t("userCollectionItem.description")}{" "}
                          <i
                            data-tip={t(
                              "userCollectionItem.descriptionToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <textarea
                          {...register("description", {
                            required: t(
                              "userCollectionItem.descriptionRequired"
                            )
                          })}
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          } mb-0`}
                          placeholder={t(
                            "createCollection.descriptionPlaceholder"
                          )}
                          rows={5}
                        ></textarea>
                      </div>
                    </div>
                    <div
                      className={`${s.dividedSection} ${
                        isDarkMode ? "dark-divided-section" : "light-white"
                      } mb-5`}
                    >
                      <div className={`${s.required} mb-5`}>
                        <h5>
                          {t("createCollection.headerImage")}{" "}
                          <i
                            data-tip={t("createCollection.headerImageToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <Controller
                          name="headerImage"
                          control={control}
                          rules={{
                            required: t("mintNFT.headerRequired")
                          }}
                          render={({ field: { onChange, name, value } }) => (
                            <ImageSelector
                              innerText1={t("editProfile.uploadHeaderImage")}
                              innerText2={t("createCollection.idealSize")}
                              innerText3={t("createCollection.necessaryFormat")}
                              className={`${s.dCreateFile} ${
                                isDarkMode ? "dark-lighter-more" : "light-white"
                              }`}
                              onChange={onChange}
                              name={name}
                              value={value}
                            />
                          )}
                        />
                      </div>
                      <div className={`${s.required} mb-5`}>
                        <h5>
                          {t("userCollectionItem.uploadIconImage")}{" "}
                          <i
                            data-tip={t("createCollection.iconImageToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <Controller
                          name="iconImage"
                          control={control}
                          rules={{
                            required: t("mintNFT.iconRequired")
                          }}
                          render={({ field: { onChange, name, value } }) => (
                            <ImageSelector
                              innerText1={t(
                                "userCollectionItem.uploadIconImageField"
                              )}
                              innerText2={t("createCollection.iconIdealSize")}
                              innerText3={t("createCollection.necessaryFormat")}
                              className={`${s.dCreateFile} ${
                                isDarkMode ? "dark-lighter-more" : "light-white"
                              }`}
                              name={name}
                              onChange={onChange}
                              value={value}
                            />
                          )}
                        />
                      </div>
                      <div className="mb-5">
                        <h5>
                          {t("createCollection.verticalImage")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.verticalImageToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <Controller
                          name="promotionProtraitImage"
                          control={control}
                          render={({ field: { onChange, name, value } }) => (
                            <ImageSelector
                              innerText1={t(
                                "userCollectionItem.uploadVerticalBanner"
                              )}
                              innerText2={t(
                                "createCollection.verticalIdealSize"
                              )}
                              innerText3={t("createCollection.necessaryFormat")}
                              className={`${s.dCreateFile} ${
                                isDarkMode ? "dark-lighter-more" : "light-white"
                              }`}
                              onChange={onChange}
                              name={name}
                              value={value}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <h5>
                          {t("createCollection.horizontalImage")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.horizontalImageToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <Controller
                          name="promotionLandscapeImage"
                          control={control}
                          render={({ field: { onChange, name, value } }) => (
                            <ImageSelector
                              innerText1={t(
                                "userCollectionItem.uploadHorizontalBanner"
                              )}
                              innerText2={t(
                                "createCollection.horizontalIdealSize"
                              )}
                              innerText3={t("createCollection.necessaryFormat")}
                              className={`${s.dCreateFile} ${
                                isDarkMode ? "dark-lighter-more" : "light-white"
                              }`}
                              name={name}
                              onChange={onChange}
                              value={value}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div
                      className={`${s.dividedSection} ${
                        isDarkMode ? "dark-divided-section" : "light-white"
                      } mb-5`}
                    >
                      <div className={`mb-5`}>
                        <h5>
                          {t("mintNFT.tags")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.collectionTagsToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        {tags && (
                          <Controller
                            name="tags"
                            control={control}
                            className="form-control"
                            render={({ field: { onChange, name, value } }) => (
                              <Select
                                styles={selectDarkMode}
                                classNamePrefix="select"
                                name={name}
                                isMulti
                                defaultValue={value}
                                options={tags.map(tag => ({
                                  value: tag.name,
                                  label: tag.name
                                }))}
                                placeholder={t("filters.selectTags")}
                                onChange={onChange}
                              />
                            )}
                          />
                        )}
                      </div>

                      <div className="field-set mb-5">
                        <h5 htmlFor="symbol">
                          {t("createCollection.collectionSymbol")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.collectionSymbolToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("symbol")}
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                          placeholder={t("createCollection.symbolPlaceholder")}
                        />
                      </div>
                      <div className="field-set mb-0  ">
                        <h5 htmlFor="nsfw">
                          {t("filters.nsfw")}{" "}
                          <i
                            data-tip={t("userCollectionItem.nsfwText")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <div
                          className="form-check form-switch"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <input
                            {...register("nsfw")}
                            className={`form-check-input ${
                              isDarkMode ? "dark-lighter-checkbox" : ""
                            }`}
                            style={{ marginBottom: "0" }}
                            type="checkbox"
                            id="nsfw"
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#919191",
                              lineHeight: "1.5"
                            }}
                          >
                            {t("userCollectionItem.nsfwText2")}
                          </span>
                          {/* <label className="form-check-label" htmlFor="nsfw">Explicit & Sensitive Content</label> */}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`${s.dividedSection} ${
                        isDarkMode ? "dark-divided-section" : "light-white"
                      } mb-5`}
                    >
                      <div className={`mb-4`}>
                        <h4>{t("userCollectionItem.upcomingCollection")}</h4>
                        <p className={`${s.upcomingCollection}`}>
                          {t("userCollectionItem.upcomingCollectionText")}
                        </p>
                      </div>
                      <div className="field-set mb-5">
                        <h5 htmlFor="supply">
                          {t("userCollectionItem.supply")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.collectionSupplyToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("supply")}
                          min="0"
                          type="number"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                          placeholder={t("createCollection.supplyPlaceholder")}
                        />
                      </div>
                      <div className="field-set mb-4">
                        <h5 htmlFor="mintedDate">
                          {t("createCollection.mintingDate")}
                        </h5>
                        <p>{t("userCollectionItem.mintedDateForCollection")}</p>
                        <Controller
                          className="form-control"
                          name="mintedDate"
                          control={control}
                          render={({ field: { onChange, name, value } }) => (
                            <DatePicker
                              name={name}
                              selected={value}
                              onChange={onChange}
                              showTimeSelect
                              dateFormat="MMMM d, yyyy h:mm aa"
                              className={`${
                                isDarkMode
                                  ? "dark-lighter-more-input"
                                  : "light-white"
                              }`}
                              // calendarClassName={`${
                              //   isDarkMode
                              //     ? "dark-lighter-more-input"
                              //     : "light-white"
                              // }`}
                            />
                          )}
                        />
                        {/* <input
                          {...register("mintedDate")}
                          type="datetime-local"
                          className="form-control"
                          placeholder="mintedDate"
                        /> */}
                      </div>
                      <div className="field-set mb-0">
                        <h5 htmlFor="initialPrice">
                          {t("userCollectionItem.initialPrice")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.nftInitialPriceToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("initialPrice")}
                          min="0"
                          type="number"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          } mb-0`}
                          placeholder={t(
                            "createCollection.initialPricePlaceholder"
                          )}
                        />
                      </div>
                    </div>
                    <div
                      className={`${s.dividedSection} ${
                        isDarkMode ? "dark-divided-section" : "light-white"
                      } mb-5`}
                    >
                      <div className="field-set mb-5">
                        <h5 htmlFor="twitter">
                          {t("footer.twitter")}{" "}
                          <i
                            data-tip={t("userCollectionItem.twitterToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("twitter")}
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          } mb-0`}
                          placeholder={t(
                            "userCollectionItem.twitterPlaceholder"
                          )}
                        />
                      </div>
                      <div className="field-set mb-5">
                        <h5 htmlFor="discord">
                          {t("footer.discord")}{" "}
                          <i
                            data-tip={t("createCollection.discordToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("discord")}
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          } mb-0`}
                          placeholder={t(
                            "userCollectionItem.discordPlaceholder"
                          )}
                        />
                      </div>
                      <div className="field-set mb-5">
                        <h5 htmlFor="telegram">
                          {t("footer.telegram")}{" "}
                          <i
                            data-tip={t("createCollection.telegramToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("telegram")}
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          } mb-0`}
                          placeholder={t(
                            "userCollectionItem.telegramPlaceholder"
                          )}
                        />
                      </div>
                      <div className="field-set mb-5">
                        <h5 htmlFor="instagram">
                          {t("footer.instagram")}{" "}
                          <i
                            data-tip={t("userCollectionItem.instagramToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("instagram")}
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          } mb-0`}
                          placeholder={t(
                            "userCollectionItem.instagramPlaceholder"
                          )}
                        />
                      </div>
                      <div className="field-set mb-0">
                        <h5 htmlFor="website">
                          {t("footer.website")}{" "}
                          <i
                            data-tip={t("createCollection.websiteToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("website")}
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          } mb-0`}
                          placeholder={t(
                            "userCollectionItem.websitePlaceholder"
                          )}
                        />
                      </div>
                    </div>
                    {!loading ? (
                      <input
                        type="button"
                        id="submit"
                        value={t("userCollectionItem.editCollectionButton")}
                        className={`${s.submit} main-button`}
                        onClick={handleSubmit(onSubmit)}
                      />
                    ) : (
                      <div className="main-button">{t("loading")}</div>
                    )}
                  </form>
                </div>

                {loading && <Loader />}
              </div>
            </div>
            {!app.isInitialRender && (
              <ReactTooltip
                place="bottom"
                effect="solid"
                multiline={true}
                className={`${isDarkMode ? "dark-tool-tip" : "tool-tip"}`}
              />
            )}
          </section>
        )}
        {/* )} */}
      </div>
      {/* )} */}
    </div>
  );
};

const loadData = (store, params, query, path, req) => {
  return store.dispatch(getEditCollectionData(params._id, req));
};

export default {
  loadData,
  component: withStyles(s)(EditCollection)
};

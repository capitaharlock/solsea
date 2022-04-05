/* eslint-disable no-unreachable */
/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import s from "./CreateCollection.scss";
// import { useHistory } from "react-router";
import ImageSelector from "../../components/ImageSelector/ImageSelector";
import Seo from "../../components/Seo/Seo";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Select from "react-select";
import withStyles from "isomorphic-style-loader/withStyles";
import { useDispatch, useSelector } from "react-redux";
import client from "../../services/feathers";
import { SET_LICENSES } from "../../actions/licenses";
import { useClientLoading } from "../../hooks/useClientLoading";
import Loader from "../../components/Loader/Loader";
import { errorNotification } from "../../helpers/nofiticationsFunction";
import { handleUpload } from "../../actions/files";
import {
  checkCollectionName,
  handleCreateCollection
} from "../../actions/collections";
import CreateNftCollection from "all-art-core/lib/programs/CreateNftCollection";
import NftCollection from "all-art-core/lib/data/NftCollection";
import { CLUSTER_URL, notificationOptions } from "../../../api/Definitions";
import { store } from "react-notifications-component";
import { useHistory } from "react-router";
import { Keypair } from "@solana/web3.js";
import { loadTags, SET_TAGS } from "../../actions/tags";
import ReactTooltip from "react-tooltip";
import { useTranslation } from "react-i18next";

const CreateCollection = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [isSolseaMinted, setIsSolseaMinted] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const {
    app,
    userForCollections,
    isDarkMode,
    user: { connected, isLoggedIn, wallet, walletKey },
    tags
  } = useSelector(({ app, user, nfts, tags }) => ({
    app,
    user,
    userForCollections: user.user,
    isDarkMode: app.isDarkMode,
    nfts,
    tags: tags.tags
  }));

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, submitCount }
  } = useForm({
    defaultValues: {
      traits: [{ key: "", value: "" }]
    }
  });

  const { append, fields /* remove */ } = useFieldArray({
    control,
    name: "traits"
  });

  useEffect(() => {
    if (errors) {
      const keys = Object.keys(errors);
      console.log(keys);
      keys.forEach(key => {
        switch (true) {
          case key === "title" && errors[key].type === "maxLength":
            errors[key].message = t("mintNFT.titleMaxLengthMessage");
            break;
          case key === "shortDescription" && errors[key].type === "maxLength":
            errors[key].message = t("mintNFT.shortDescriptionMaxLengthMessage");
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

  const preview = useMemo(() => {
    if (item.preview) {
      return URL.createObjectURL(item.preview);
    }
  }, [item.preview]);

  const onIsMintedChanged = e => {
    const val = e.target.checked;
    console.log(val);
    setIsMinted(val);
  };

  const onIsSolseaMintedChanged = e => {
    const val = e.target.checked;
    setIsSolseaMinted(val);
  };

  const onSubmit = async data => {
    data.traits.pop();
    console.log(data);
    setLoading(true);
    setShowLoader(true);
    try {
      await checkCollectionName(data.title);
      const collectionKeyPair = Keypair.generate();
      const collectionKey = collectionKeyPair.publicKey;
      if (data.iconImage) {
        data.iconImage = await handleUpload({
          file: data.iconImage,
          fileCollection: "Files_CollectionIcons",
          onProgress: e => {
            console.log(e);
          }
        });
      }

      if (data.headerImage) {
        data.headerImage = await handleUpload({
          file: data.headerImage,
          fileCollection: "Files_CollectionHeader",
          onProgress: e => {}
        });
      }

      if (data.promotionProtraitImage) {
        data.promotionProtraitImage = await handleUpload({
          file: data.promotionProtraitImage,
          fileCollection: "Files_PromotionPortrait",
          onProgress: e => {
            console.log(e);
          }
        });
      }

      if (data.promotionLandscapeImage) {
        data.promotionLandscapeImage = await handleUpload({
          file: data.promotionLandscapeImage,
          fileCollection: "Files_PromotionLandscape",
          onProgress: e => {}
        });
      }

      console.log("upoladed");

      let collectionTraits = [];
      if (data.traits && data.traits.length > 0) {
        collectionTraits = data.traits.map(t => t.key);
      }
      let collectionTags = [];
      if (data.tags && data.tags.length > 0) {
        collectionTags = data.tags.map(t => t.value);
      }

      data = {
        ...data,
        traits: collectionTraits,
        tags: collectionTags,
        Pubkey: collectionKey.toString(),
        user: userForCollections._id
      };

      try {
        const col = await handleCreateCollection({ data });
      } catch (e) {
        console.log(e.message);
      }

      const collection = new NftCollection({
        title: data.title,
        description: data.shortDescription
      });

      const result = await new CreateNftCollection(
        collectionKeyPair,
        wallet,
        walletKey,
        collection,
        CLUSTER_URL
      ).run();

      if (result) {
        history.replace("/user-collections/" + userForCollections._id);
      } else {
        store.addNotification({
          title: t("notification.wentWrong"),
          type: "danger",
          message: t("mintNFT.collectionFailed"),
          ...notificationOptions
        });
      }
      setLoading(false);
    } catch (error) {
      // console.log(error);
      store.addNotification({
        title: t("notification.wentWrong"),
        type: "danger",
        message: error ? error.message : "error",
        ...notificationOptions
      });
      // setLoading(false)
      setShowLoader(false);
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

  const loadLicenses = async () => {
    try {
      const res = await client.service("licenses").find({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      });

      dispatch({
        type: SET_LICENSES,
        payload: res.data
      });
    } catch (error) {
      // console.log(error);
    }
  };

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
    await loadLicenses();
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

  const [descriptionCount, setDescriptionCount] = useState(0);
  const [titleCount, setTitleCount] = useState(0);

  return (
    <div>
      {showLoader && <Loader text={t("mintNFT.yourCollectionIsMinting")} />}
      <Seo title={`Solsea | ${t("seo.createCollection")}`} />
      <div id="container page-wrapper position-relative">
        <section
          aria-label="section"
          className={`banner profile-banner d-flex ${
            isDarkMode ? "dark-lighter" : "light-white"
          }`}
        >
          <h1>{t("createCollection.createCollection")}</h1>
        </section>
        {!connected || !isLoggedIn ? (
          <div className={`container page-wrapper position-relative pt-5 connect-wallet-text`}>
            <h4 style={{ textAlign: "center" }}>{t("mintNFT.connectFirst")}</h4>
          </div>
        ) : isLoading ? (
          <Loader />
        ) : (
          <section aria-label="section">
            <div className="container">
              <div className={`${s.section} ${s.createPage} row wow fadeIn`}>
                <div className="col-md-7">
                  <form className="form-border">
                    <div
                      className={`${s.dividedSection} ${
                        isDarkMode ? "dark-divided-section" : "light-white"
                      } mb-5`}
                    >
                      <div className={`${s.required} mb-5 field-set`}>
                        <h5 htmlFor="title">
                          {t("mintNFT.title")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.collectionTitleToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("title", {
                            required: t("createCollection.titleRequired"),
                            maxLength: 20
                          })}
                          id="title"
                          type="text"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          } mb-0`}
                          placeholder={t("createCollection.titlePlaceholder")}
                          maxLength={20}
                          onChange={e => setTitleCount(e.target.value.length)}
                        />
                        <div className={`d-flex justify-content-end`}>
                          <span className={s.limit}>
                            {t("mintNFT.totalCharacters")} {titleCount}/20
                          </span>
                        </div>
                      </div>

                      <div className={`${s.required} mb-5`}>
                        <h5 htmlFor="shortDescription">
                          {t("mintNFT.shortDescription")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.collectionShortDescriptionToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <textarea
                          {...register("shortDescription", {
                            required: t(
                              "createCollection.shortDescriptionRequired"
                            ),
                            maxLength: 64
                          })}
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          } mb-0`}
                          placeholder={t(
                            "createCollection.shortDescriptionPlaceholder"
                          )}
                          rows={3}
                          maxLength={64}
                          onChange={e =>
                            setDescriptionCount(e.target.value.length)
                          }
                        ></textarea>
                        <div className={`d-flex justify-content-end`}>
                          <span className={s.limit}>
                            {t("mintNFT.totalCharacters")} {descriptionCount}/64
                          </span>
                        </div>
                      </div>

                      <div className={`${s.required}`}>
                        <h5 htmlFor="description">
                          {t("mintNFT.description")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.collectionDescriptionToolTip"
                            )}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <textarea
                          {...register("description", {
                            required: t("createCollection.descriptionRequired")
                          })}
                          className={`form-control mb-0 ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
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
                          render={({ field: { onChange, name } }) => (
                            <ImageSelector
                              innerText1={t("createCollection.headerImage")}
                              innerText2={t("createCollection.idealSize")}
                              innerText3={t("createCollection.necessaryFormat")}
                              className={`${s.dCreateFile} ${
                                isDarkMode ? "dark-lighter-more" : "light-white"
                              }`}
                              onChange={onChange}
                              name={name}
                            />
                          )}
                        />
                      </div>
                      <div className={`${s.required} mb-5`}>
                        <h5>
                          {t("createCollection.iconImage")}{" "}
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
                          render={({ field: { onChange, name } }) => (
                            <ImageSelector
                              innerText1={t("createCollection.iconImage")}
                              innerText2={t("createCollection.iconIdealSize")}
                              innerText3={t("createCollection.necessaryFormat")}
                              className={`${s.dCreateFile} ${
                                isDarkMode ? "dark-lighter-more" : "light-white"
                              }`}
                              name={name}
                              onChange={onChange}
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
                          render={({ field: { onChange, name } }) => (
                            <ImageSelector
                              innerText1={t("createCollection.verticalImage")}
                              innerText2={t(
                                "createCollection.verticalIdealSize"
                              )}
                              innerText3={t("createCollection.necessaryFormat")}
                              className={`${s.dCreateFile} ${
                                isDarkMode ? "dark-lighter-more" : "light-white"
                              }`}
                              onChange={onChange}
                              name={name}
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
                          render={({ field: { onChange, name } }) => (
                            <ImageSelector
                              innerText1={t("createCollection.horizontalImage")}
                              innerText2={t(
                                "createCollection.horizontalIdealSize"
                              )}
                              innerText3={t("createCollection.necessaryFormat")}
                              className={`${s.dCreateFile} ${
                                isDarkMode ? "dark-lighter-more" : "light-white"
                              }`}
                              name={name}
                              onChange={onChange}
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
                        <Controller
                          name="tags"
                          control={control}
                          className={`form-control`}
                          render={({ field: { onChange, name, value } }) => (
                            <Select
                              classNamePrefix="select"
                              styles={selectDarkMode}
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
                      </div>

                      <div className="mb-5">
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
                      <div className="field-set mb-0">
                        <h5 htmlFor="nsfw">
                          {t("filters.nsfw")}{" "}
                          <i
                            data-tip={t(
                              "createCollection.collectionNsfwToolTip"
                            )}
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
                            {t("createCollection.collectionNsfwText")}
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
                        <h4>{t("createCollection.upcomingCollection")}</h4>
                        <p className={`${s.upcomingCollection}`}>
                          {t("createCollection.upcomingCollectionText")}
                        </p>
                      </div>
                      <div className="field-set mb-5">
                        <h5 htmlFor="supply">
                          {t("createCollection.collectionSupply")}{" "}
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
                          {t("createCollection.mintingDate")}{" "}
                          <i
                            data-tip={t("createCollection.mintingDateToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <Controller
                          className={`form-control`}
                          name="mintedDate"
                          control={control}
                          render={({ field: { onChange, name, value } }) => (
                            <DatePicker
                              name={name}
                              selected={value}
                              onChange={onChange}
                              showTimeSelect
                              dateFormat="MMMM d, yyyy h:mm aa"
                              className={`${s.datePicker} ${
                                isDarkMode
                                  ? "dark-lighter-more-input"
                                  : "light-white"
                              }`}
                            />
                          )}
                        />
                      </div>
                      <div className="field-set mb-0">
                        <h5 htmlFor="initialPrice">
                          {t("createCollection.nftInitialPrice")}{" "}
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
                          className={`form-control mb-0 ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
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
                            data-tip={t("createCollection.twitterToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("twitter")}
                          type="text"
                          className={`form-control mb-0 ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                          placeholder={t("createCollection.officialTwitter")}
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
                          className={`form-control mb-0 ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                          placeholder={t("createCollection.officialDiscord")}
                        />
                      </div>
                      <div className="field-set mb-5">
                        <h5 htmlFor="telegram">
                          {t("createCollection.telegram")}{" "}
                          <i
                            data-tip={t("createCollection.telegramToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("telegram")}
                          type="text"
                          className={`form-control mb-0 ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                          placeholder={t("createCollection.officialTelegram")}
                        />
                      </div>
                      <div className="field-set mb-5">
                        <h5 htmlFor="instagram">
                          {t("createCollection.instagram")}{" "}
                          <i
                            data-tip={t("createCollection.instagramToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("instagram")}
                          type="text"
                          className={`form-control mb-0 ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                          placeholder={t("createCollection.officialInstagram")}
                        />
                      </div>
                      <div className="field-set mb-0">
                        <h5 htmlFor="website">
                          {t("createCollection.website")}{" "}
                          <i
                            data-tip={t("createCollection.websiteToolTip")}
                            className={`${s.question} fa fa-question-circle`}
                          ></i>
                        </h5>
                        <input
                          {...register("website")}
                          type="text"
                          className={`form-control mb-0 ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                          placeholder={t("createCollection.officialWebsite")}
                        />
                      </div>
                    </div>
                    {!loading ? (
                      <input
                        type="button"
                        id="submit"
                        value={t("createCollection.createCollectionButton")}
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

const loadData = store => {
  return store.dispatch(loadTags());
};

export default {
  loadData,
  component: withStyles(s)(CreateCollection)
};

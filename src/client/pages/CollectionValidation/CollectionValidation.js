/* eslint-disable no-unreachable */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";

import s from "./CollectionValidation.scss";
// import { useHistory } from "react-router";
import Seo from "../../components/Seo/Seo";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Select from "react-select";
import withStyles from "isomorphic-style-loader/withStyles";
import { useDispatch, useSelector } from "react-redux";
import client from "../../services/feathers";
import { useClientLoading } from "../../hooks/useClientLoading";
import Loader from "../../components/Loader/Loader";
import { notificationOptions } from "../../../api/Definitions";
import { store } from "react-notifications-component";
import { useHistory } from "react-router";
import { SET_USER_COLLECTION } from "../../actions/pages";
import ReactTooltip from "react-tooltip";
import { useTranslation } from "react-i18next";

const CollectionValidation = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [submission, setSubmission] = useState();
  const [collectionDefault, setCollectionDefault] = useState();
  const [candyOptions, setCandyOptions] = useState([]);
  const {
    app,
    user: { connected, isLoggedIn, user },
    selectedForValidation,
    isDarkMode,
    collections
  } = useSelector(({ app, user, collections }) => ({
    app,
    user,
    collections: collections.collection,
    selectedForValidation: app.selectedForValidation,
    isDarkMode: app.isDarkMode
  }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, submitCount }
  } = useForm({
    defaultValues: {
      candymachine: [{ candymachineids: "" }]
    }
  });

  const { append, fields /* remove */ } = useFieldArray({
    control,
    name: "candymachine"
  });
  const item = watch();

  useEffect(() => {
    if (item.candymachine && item.candymachine.length > 0) {
      const last = item.candymachine[item.candymachine.length - 1];
      if (last.candymachineids) {
        append(
          {
            candymachineids: ""
          },
          {
            shouldFocus: false
          }
        );
      }
    }
  }, [item.candymachine]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (submission) {
      let defaultCandy = [{ candymachineids: "" }];
      if (submission.candymachine.length > 0) {
        defaultCandy = submission.candymachine.map(t => ({
          candymachineids: t
        }));
        setCandyOptions(defaultCandy);
      }
      reset(submission ? { ...submission, candymachine: defaultCandy } : {}); //, mints: mints && mints.data ? mints.data[0] : {}
    }
  }, [submission]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await client.service("collections").find({
        query: {
          user: user._id,
          $sort: {
            createdAt: 1
          }
        }
      });

      dispatch({
        type: SET_USER_COLLECTION,
        payload: res.data
      });

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const parseMints = mints => {
    let cleanedUpHashes = [];
    try {
      const hashesJson = JSON.parse(mints.toString());
      cleanedUpHashes = hashesJson;
    } catch (e) {
      const lines = mints.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const newLine = lines[i]
          .replaceAll(",", "")
          .replaceAll("&quot;", "")
          .replaceAll('"', "")
          .replace("[", "")
          .replace("]", "")
          .replace(/\s/g, "");

        if (newLine) {
          cleanedUpHashes.push(newLine);
        }
      }
    }
    return cleanedUpHashes;
  };

  const onCollectionSelection = e => {
    setSelectedCollection(e.value);
    loadSubmissions(e.value);
  };

  const loadSubmissions = async (collection, update = true) => {
    setLoading(true);
    try {
      const res = await client
        .service("collections-validation-submission")
        .find({
          query: {
            nft_collection: collection
          }
        });
      if (update) {
        setSubmission(res.data[0]);
        setLoading(false);
      }
      return res;
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const onSubmit = async data => {
    data.candymachine.pop();
    setLoading(true);
    setShowLoader(true);
    try {
      const subData = await loadSubmissions(selectedCollection, false);
      const cleanedMints = parseMints(data.mints);

      const col = collections.find(e => e._id === selectedCollection);

      if (col) {
        data.collection_name = col.title;
      }

      data = {
        ...data,
        nft_collection: selectedCollection,
        parsedMints: cleanedMints
      };

      if (data.candymachine && data.candymachine.length > 0) {
        data.candymachine = data.candymachine.map(t => t.candymachineids);
      }

      if (subData && subData.data && subData.data.length > 0) {
        client
          .service("collections-validation-submission")
          .patch(subData.data[0]._id, { ...data, state: "UPDATED" });
        store.addNotification({
          title: t("collections.submissionUpdated"),
          type: "success",
          message: t("collections.submissionUpdatedMessage"),
          ...notificationOptions
        });
      } else {
        await client.service("collections-validation-submission").create(data);
        store.addNotification({
          title: t("collections.validationCreated"),
          type: "success",
          message: t("collections.validationCreatedMessage"),
          ...notificationOptions
        });
      }

      setLoading(false);
      history.push(`/user-collections/${user._id}`);
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

  const [stateText, setStateText] = useState("");

  const stateSwitch = () => {
    if (submission && submission.state)
      switch (submission.state) {
        case "UPDATED":
          setStateText(t("collections.pendingReverification"));
          break;
        case "PENDING":
          setStateText(t("collections.pending"));
          break;
        case "VERIFIED":
          setStateText(t("collections.verifiedSuccessfully"));
          break;
        case "REJECTED":
          setStateText(t("collections.rejected"));
          break;
        default:
      }
  };

  useEffect(() => {
    stateSwitch();
  }, [submission]);

  useEffect(() => {
    loadFormData();
  }, [user, connected]);

  const loadFormData = async () => {
    await loadCollections();
    if (selectedForValidation) {
      const col = collections.find(e => e._id === selectedForValidation);
      if (col) {
        setCollectionDefault({
          value: selectedForValidation,
          label: col.title
        });
        setSelectedCollection(selectedForValidation);
        loadSubmissions(selectedForValidation);
      }
    }
  };

  const isLoading = useClientLoading({
    load: loadFormData,
    isInitialRender: app.isInitialRender,
    params: {}
  });

  const handleCreateOption = async input => {
    setCandyOptions([...candyOptions, { value: input, label: input }]);
  };

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
      <Seo title={`Solsea | ${t("seo.collectionVerification")}`} />
      <div id="container page-wrapper position-relative">
        <section
          aria-label="section"
          className={`banner profile-banner d-flex ${
            isDarkMode ? "dark-lighter" : "light-white"
          }`}
        >
          <h1>{t("navbar.collectionVerification")}</h1>
        </section>
        {!connected || !isLoggedIn ? (
          <div className="container page-wrapper position-relative connect-wallet-text">
            <h4>{t("mintNFT.connectFirst")}</h4>
          </div>
        ) : isLoading ? (
          <Loader />
        ) : (
          <section aria-label="section">
            <div className="container">
              <div className={`${s.section} ${s.createPage} row wow fadeIn`}>
                <div className="col-md-7">
                  <form className="form-border">
                    <div className={`mb-4`}>
                      <h5 htmlFor="tags">{t("mintNFT.collectionSelection")}</h5>
                      <Controller
                        className="form-control"
                        name="nft_collection"
                        control={control}
                        render={({ field: { onChange, name, value } }) => (
                          <Select
                            classNamePrefix="select"
                            styles={selectDarkMode}
                            name={name}
                            defaultValue={collectionDefault}
                            options={collections.map(col => ({
                              value: col._id,
                              label: col.title
                            }))}
                            placeholder={t("collections.selectCollection")}
                            onChange={e => {
                              onCollectionSelection(e);
                              onChange(e);
                            }}
                          />
                        )}
                      />
                    </div>

                    {submission && (
                      <>
                        {stateText && (
                          <p
                            className={`${
                              submission.state === "VERIFIED"
                                ? s.verified
                                : s.pending
                            } `}
                          >
                            {stateText}
                          </p>
                        )}
                        {submission.adminMessage &&
                          submission.state === "REJECTED" && (
                            <p className={s.declined}>
                              {submission.adminMessage
                                ? submission.adminMessage
                                : t("collections.notQualify")}
                            </p>
                          )}
                      </>
                    )}
                    {selectedCollection && (
                      <>
                        <div
                          className={`${s.dividedSection} ${
                            isDarkMode ? "dark-divided-section" : "light-white"
                          } mb-5`}
                        >
                          <div className={`mb-4`}>
                            <h4 style={{ textAlign: "left" }}>
                              {t("collections.personalContact")}
                            </h4>
                            <p
                              className={`${s.upcomingCollection}`}
                              dangerouslySetInnerHTML={{
                                __html: t("collections.personalContactText")
                              }}
                            ></p>
                          </div>
                          <div className="field-set mb-5">
                            <h5 htmlFor="twitter">
                              {t("collections.twitterHandle")}{" "}
                              <i
                                data-tip={t("collections.twitterHandleToolTip")}
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
                              }`}
                              placeholder="@mytwitterhandle"
                            />
                          </div>
                          <div className="field-set mb-5">
                            <h5 htmlFor="discord">
                              {t("collections.discordUserName")}{" "}
                              <i
                                data-tip={t(
                                  "collections.discordUserNameToolTip"
                                )}
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
                              }`}
                              placeholder="mydiscordname#3477"
                            />
                          </div>
                          <div className="field-set mb-5">
                            <h5 htmlFor="twitter">
                              {t("collections.telegramUserName")}{" "}
                              <i
                                data-tip={t(
                                  "collections.telegramUserNameToolTip"
                                )}
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
                              }`}
                              placeholder="@telegram_username"
                            />
                          </div>
                          <div className="field-set mb-0">
                            <h5 htmlFor="discord">
                              {t("collections.instagramUserName")}{" "}
                              <i
                                data-tip={t(
                                  "collections.instagramUserNameToolTip"
                                )}
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
                              placeholder="@igusername"
                            />
                          </div>
                        </div>
                        {/* <div className="field-set mb-4">
												<h5 htmlFor="discord">Candy Machine Key</h5>
												<p>Please paste in candy</p>
												<input
													{...register("candymachine")}
													type="text"
													className="form-control"
													placeholder="awdawf123afdawfaweasdwa21123"
												/>
											</div> */}
                        <div
                          className={`${s.dividedSection} ${
                            isDarkMode ? "dark-divided-section" : "light-white"
                          } mb-5`}
                        >
                          <div className={`mb-4`}>
                            <h4 style={{ textAlign: "left" }}>
                              {t("collections.externalMinting")}
                            </h4>
                            <p
                              className={`${s.upcomingCollection}`}
                              dangerouslySetInnerHTML={{
                                __html: t("collections.externalMintingText")
                              }}
                            ></p>
                          </div>
                          <div className={`mb-5`}>
                            <h5 htmlFor="candymachine">
                              {t("collections.candyMachine")}{" "}
                              <i
                                data-tip={t("collections.candyMachineToolTip")}
                                className={`${s.question} fa fa-question-circle`}
                              ></i>
                            </h5>
                            <div className="field-set mb-0">
                              {fields.map((field, index) => (
                                <div key={field.id}>
                                  <input
                                    {...register(
                                      `candymachine.${index}.candymachineids`
                                    )}
                                    type="text"
                                    className={`form-control ${
                                      isDarkMode
                                        ? "dark-lighter-more-input"
                                        : "light-white"
                                    }`}
                                    placeholder="e.g. ghsdfgh32442oitjsdoifjsadf132rASfnhg"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="field-set mb-0">
                            <h5 htmlFor="proof">
                              {t("collections.hashTable")}{" "}
                              <i
                                data-tip={t("collections.hashTableToolTip")}
                                className={`${s.question} fa fa-question-circle`}
                              ></i>
                            </h5>
                            <textarea
                              {...register("mints")} //, { required: "Description is required!"})}
                              className={`form-control ${
                                isDarkMode
                                  ? "dark-lighter-more-input"
                                  : "light-white"
                              } mb-0`}
                              placeholder='e.g. ["11111111111111111111111111"]'
                              rows={5}
                            ></textarea>
                          </div>
                        </div>
                        <div
                          className={`${s.dividedSection} ${
                            isDarkMode ? "dark-divided-section" : "light-white"
                          } mb-5`}
                        >
                          <div className={`mb-4`}>
                            <h4 style={{ textAlign: "left" }}>
                              {t("collections.proofAuthorship")}
                            </h4>
                            <p
                              className={`${s.upcomingCollection}`}
                              dangerouslySetInnerHTML={{
                                __html: t("collections.proofAuthorshipToolTip")
                              }}
                            ></p>
                          </div>
                          <div className="field-set mb-0">
                            <h5 htmlFor="proof">
                              {t("collections.linkProof")}{" "}
                              <i
                                data-tip={t("collections.linkProofToolTip")}
                                className={`${s.question} fa fa-question-circle`}
                              ></i>
                            </h5>
                            <input
                              {...register("proof")}
                              type="text"
                              className={`form-control ${
                                isDarkMode
                                  ? "dark-lighter-more-input"
                                  : "light-white"
                              } mb-0`}
                              placeholder={t(
                                "collections.linkProofPlaceholder"
                              )}
                            />
                          </div>
                        </div>

                        {!loading ? (
                          <>
                            {submission &&
                            (submission.state === "PENDING" ||
                              submission.state === "UPDATED") ? (
                              <></>
                            ) : (
                              <input
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                id="submit"
                                value={
                                  submission
                                    ? t("collections.updateApplication")
                                    : t("collections.submitApplication")
                                }
                                className={`${s.submit} main-button`}
                              />
                            )}
                          </>
                        ) : (
                          <div className="main-button">{t("loading")}</div>
                        )}
                      </>
                    )}
                  </form>
                  {!app.isInitialRender && selectedCollection && (
                    <ReactTooltip
                      place="bottom"
                      effect="solid"
                      multiline={true}
                      className={`${isDarkMode ? "dark-tool-tip" : "tool-tip"}`}
                    />
                  )}
                </div>
                {loading && <Loader />}
              </div>
            </div>
          </section>
        )}
        {/* )} */}
      </div>
      {/* )} */}
    </div>
  );
};

export default {
  component: withStyles(s)(CollectionValidation)
};

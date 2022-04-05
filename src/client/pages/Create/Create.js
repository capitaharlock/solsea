/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from "react";
import NftItem from "../../components/NftItem/NftItem";
import ImageSelector from "../../components/ImageSelector/ImageSelector";
import Seo from "../../components/Seo/Seo";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Select from "react-select";
import withStyles from "isomorphic-style-loader/withStyles";
import { useDispatch, useSelector } from "react-redux";
import client from "../../services/feathers";
import { getLicensesData, SET_LICENSES } from "../../actions/licenses";
import { useClientLoading } from "../../hooks/useClientLoading";
import Loader from "../../components/Loader/Loader";
import { CLUSTER_URL, SOL_TO_LAMPORTS } from "../../../api/Definitions";
import { store } from "react-notifications-component";
import { notificationOptions } from "../../../api/Definitions";
import { useHistory } from "react-router";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import s from "./Create.scss";
import { SET_TAGS } from "../../actions/tags";
import { errorNotification } from "../../helpers/nofiticationsFunction";
import NftCreatorRenderer from "../../components/NftCreator/NftCreatorRenderer";
import CreateNFTProHybrid, {
  getAssetCostToStore
} from "all-art-core/lib/programs/CreateNFTProHybrid";
import { Creator } from "all-art-core/lib/data/MetaplexData";
import { round } from "all-art-core/lib/utils/number";
import { connect } from "all-art-core/lib/core/connection";
import { handleUploadArweaveFiles } from "../../actions/files";
import Console from "all-art-core/lib/utils/console";
import { ARWEAVE_FEE_ACCOUNT } from "all-art-core/lib/core/consts";
import { FileTypes } from "all-art-core/lib/utils/fileType";
import { createTransaction } from "all-art-core/lib/core/transactions";
import ReactTooltip from "react-tooltip";
import { useTranslation } from "react-i18next";

const Create = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [showLoader, setShowLoader] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("");
  const [collections, setCollections] = useState([]);
  const [creators, setCreators] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [creatorsSelection, setCreatorsSelection] = useState({});
  const [fileStorageCost, setFileStorageCost] = useState(null);
  const [previewStorageCost, setPreviewStorageCost] = useState(null);
  const [animatedPreviewStorageCost, setAnimatedPreviewStorageCost] = useState(
    null
  );
  const [fee, setFee] = useState("");

  const {
    license,
    tags,
    isDarkMode,
    app,
    user: { connected, isLoggedIn, wallet, walletKey, user }
  } = useSelector(({ listedLicenses, tags, app, user, nfts }) => ({
    license: listedLicenses.license,
    tags: tags.tags,
    isDarkMode: app.isDarkMode,
    app,
    user,
    nfts
  }));

  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, submitCount },
    watch
  } = useForm({
    defaultValues: {
      traits: [{ trait_type: "", value: "" }]
    }
  });
  const { append, fields /* remove */ } = useFieldArray({
    control,
    name: "traits"
  });
  const item = watch();
  useEffect(() => {
    if (item.traits && item.traits.length > 0) {
      const last = item.traits[item.traits.length - 1];
      if (last.trait_type && last.value) {
        append(
          {
            trait_type: "",
            value: ""
          },
          {
            shouldFocus: false
          }
        );
      }
    }
  }, [item]);

  const preview = useMemo(() => {
    if (item.preview) {
      return URL.createObjectURL(item.preview);
    }
  }, [item.preview]);

  useEffect(() => {
    if (errors) {
      const keys = Object.keys(errors);
      keys.forEach(key => {
        switch (true) {
          case key === "title" && errors[key].type === "maxLength":
            errors[key].message = t("titleMaxLength");
            break;
          case key === "shortDescription" && errors[key].type === "maxLength":
            errors[key].message = t("mintNFT.shortDescriptionMaxLengthMessage");
            break;
          default:
            errors[key].message = `${key[0].toUpperCase()}${key.slice(1)} ${t(
              "hasInvalidValue"
            )}`;
            break;
        }
        errorNotification(errors[key]);
      });
    }
  }, [submitCount]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        if (user) {
          const nftService = client.service("collections");
          const res = await nftService.find({
            query: {
              user: user._id
            }
          });
          if (res.data) setCollections(res.data);
        }
      } catch (error) {
        // console.log(error);
      }
    };

    const fetchHosts = async () => {
      try {
        if (user) {
          const hostService = client.service("host-nft");
          const hosts = await hostService.find();
          setCreators(hosts.data);
        }
      } catch (error) {
        // console.log(error);
      }
    };

    fetchHosts();
    fetchCollections();
  }, [walletKey, user]);

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
    try {
      const res = await client.service("nfttags").find();
      dispatch({
        type: SET_TAGS,
        payload: res.data
      });
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    const fixedScroll = document.getElementById("preview");
    let scrollHandler = null;
    if (fixedScroll !== null) {
      const elTop =
        fixedScroll.getBoundingClientRect().top -
        document.body.getBoundingClientRect().top;

      scrollHandler = () => {
        if (document.documentElement.scrollTop > elTop) {
          fixedScroll.style.position = "fixed";
          fixedScroll.style.top = "120px";
        } else {
          fixedScroll.style.position = "static";
          fixedScroll.style.top = "auto";
        }
      };
      addEventListener("scroll", scrollHandler);
    }
    return () => {
      if (scrollHandler) removeEventListener("scroll", scrollHandler);
    };
  }, []);

  const isLoading = useClientLoading({
    load: loadLicenses,
    isInitialRender: app.isInitialRender,
    params: {}
  });

  const validateCreators = () => {
    const creators = Object.values(creatorsSelection);
    if (creators && creators.length > 0) {
      const share = creators.reduce((prev, current) => {
        return parseFloat(prev) + parseFloat(current.share);
      }, 0);
      if (share != 100) return false;
    }
    return true;
  };

  const onSubmit = data => {
    data.traits.pop();
    console.log("Data", data);
    // return;
    if (fee.length === 0) {
      errorNotification({ message: t("mintNFT.sellerFeeRequired") });
      return;
    }
    if (!validateCreators()) {
      errorNotification({
        message: t("mintNFT.sumOfSellerFee")
      });
      return;
    }

    const normailizeFee = fee => {
      const floatFee = parseFloat(fee);
      if (isNaN(floatFee)) return 0;
      if (floatFee > 50) return 50;
      if (floatFee < 0) return 0;
      return parseFloat(parseFloat(floatFee).toFixed(2));
    };

    const uploadFilestToServer = async metadata => {
      const result = {};
      // Upload preview file
      result.previewId = await handleUploadArweaveFiles({
        file: data.preview,
        onProgress: e => {
          Console.log(`${t("mintNFT.uploading2")} ${data.preview.name}`, e);
          setLoaderMessage(`
            ${t("mintNFT.uploading")} "${data.animated_preview.name}" ${t(
            "mintNFT.toTheSolsea"
          )}<br/>
							${parseInt((e.loaded / e.total) * 100)} %
						`);
        }
      });
      // Upload animated preview file
      if (data.animated_preview) {
        result.animatedPreviewId = await handleUploadArweaveFiles({
          file: data.animated_preview,
          onProgress: e => {
            Console.log(
              `${t("mintNFT.uploading2")} ${data.animated_preview.name}`,
              e
            );
            setLoaderMessage(`
          ${t("mintNFT.uploading")} "${data.preview.name}" ${t(
              "mintNFT.toTheSolsea"
            )}<br/>
						${parseInt((e.loaded / e.total) * 100)} %
					`);
          }
        });
      }
      // Upload artwork file
      result.artworkId = await handleUploadArweaveFiles({
        file: data.artwork,
        onProgress: e => {
          Console.log(`${t("mintNFT.uploading2")} ${data.artwork.name}`, e);
          setLoaderMessage(`
          ${t("mintNFT.uploading")} "${data.artwork.name}" ${t(
            "mintNFT.toTheSolsea"
          )}<br/>
						${parseInt((e.loaded / e.total) * 100)} %
					`);
        }
      });
      // Upload metadata
      result.metadataId = await handleUploadArweaveFiles({
        file: metadata,
        onProgress: e => {
          Console.log("Uploading json", e);
          setLoaderMessage(`
          ${t("mintNFT.uploadingMetadata")}<br/>
						${(e.loaded / e.total) * 100} %
					`);
        }
      });
      Console.log("Image ID", result.previewId);
      Console.log("Metadata ID", result.metadataId);
      return result;
    };

    const uploadFilesToARWeave = async (metadata, uploadResult) => {
      const connection = await connect(CLUSTER_URL);
      const arweaveTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: walletKey,
          lamports: await client.service("arweave-upload").find({
            query: {
              bytes: [
                data.preview.size,
                data.artwork.size,
                metadata.size
              ].concat(
                data.animated_preview ? [data.animated_preview.size] : []
              )
            }
          }),
          toPubkey: new PublicKey(ARWEAVE_FEE_ACCOUNT)
        })
      );
      arweaveTransaction.recentBlockhash = (
        await connection.getRecentBlockhash("finalized")
      ).blockhash;
      arweaveTransaction.feePayer = walletKey;
      const signedArWeaveTransaction = await wallet.signTransaction(
        arweaveTransaction
      );
      if (signedArWeaveTransaction) {
        setLoaderMessage(`
					${t("mintNFT.uploadingArweave")}
				`);
        client.service("arweave-upload").timeout = 1000 * 60 * 60 * 3;
        const metadataResult = await client
          .service("arweave-upload")
          .patch("", {
            json: uploadResult.metadataId,
            preview: uploadResult.previewId,
            animated_preview: uploadResult.animatedPreviewId,
            file: uploadResult.artworkId,
            transaction: signedArWeaveTransaction.serialize()
          });
        if (metadataResult.error) {
          Console.log("Metadata Result Error", metadataResult);
          throw new Error(metadataResult.error);
        }
        Console.log(
          "AR UPLOAD COMPLETE ",
          metadataResult.metadata,
          `https://www.arweave.net/${metadataResult.metadataId}?ext=json`
        );
        return metadataResult;
      }
      throw new Error("Error: Transaction signing faild!");
    };

    const sendMintTransaction = async transactionsInput => {
      const connection = await connect(CLUSTER_URL);
      const transactions = [];
      for (let i = 0; i < transactionsInput.length; i++) {
        transactions.push(
          await createTransaction(
            transactionsInput[i].instructions,
            connection,
            transactionsInput[i].signers,
            wallet
          )
        );
      }
      const signedTransactions = await wallet.signAllTransactions(transactions);

      setLoaderMessage(`
				${t("mintNFT.processingMintTransaction")}
			`);

      client.service("nft-mint").timeout = 1000 * 60 * 10;
      const mintResult = await client.service("nft-mint").create({
        transactions: signedTransactions.map(t => t.serialize())
      });

      if (!mintResult.success) {
        const retryTransactions = [];
        for (let i = 0; i < mintResult.transactions.length; i++) {
          if (!mintResult.transactions[i])
            retryTransactions.push(transactionsInput[i]);
        }

        setLoaderMessage(`
					<span style="color:red">${t("mintNFT.message1")}<br/>
					${t("mintNFT.message2")}<br/>
					${t("mintNFT.message3")}</span>
				`);
        await sendMintTransaction(retryTransactions);
      }
    };

    const asyncSubmit = async () => {
      try {
        // Create metadata JSON
        const metadataContent = {
          name: data.title,
          symbol: "NFTPro",
          description: data.description,
          seller_fee_basis_points: normailizeFee(fee) * 100,
          image: data.preview.name,
          animation_url: undefined,
          attributes: data.traits ? data.traits : [],
          external_url: data.externalUrl,
          properties: {
            files: [
              {
                uri: data.preview.name,
                type: data.preview.type
              }
            ],
            category: "image",
            creators:
              Object.keys(creatorsSelection).length > 0
                ? Object.values(creatorsSelection).map(creator => {
                    return new Creator({
                      address: creator.wallet,
                      verified:
                        walletKey.toBase58() === creator.wallet ? true : false,
                      share: creator.share
                    });
                  })
                : [
                    new Creator({
                      address: walletKey.toBase58(),
                      verified: true,
                      share: 100
                    })
                  ]
          }
        };

        let metadata = new File(
          [JSON.stringify(metadataContent)],
          "metadata.json"
        );
        const uploadResult = await uploadFilestToServer(metadata);

        // Charge for arweave storage
        setLoaderMessage(`
					${t("mintNFT.filesUploadedToSolsea")}<br/>
					${t("mintNFT.pleaseSignTransaction")}
				`);

        const metadataResult = await uploadFilesToARWeave(
          metadata,
          uploadResult
        );

        // Preparing mint transactions
        setLoaderMessage(`
        ${t("mintNFT.creatingMintTransaction")}
				`);

        const { mintKey, transactions } = await new CreateNFTProHybrid(
          wallet,
          walletKey,
          {
            json: metadataResult.metadata,
            jsonUri: `https://www.arweave.net/${metadataResult.metadataId}?ext=json`,
            short_description: data.shortDescription,
            collection: data.collection
              ? new PublicKey(data.collection.value.Pubkey)
              : undefined,
            license: data.license ? data.license.value.URL : undefined,
            licence_title: data.license ? data.license.value.title : undefined,
            nsfw: data.nsfw,
            tags: data.tags
              ? data.tags.map(tag => {
                  return tag.value;
                })
              : []
          },
          CLUSTER_URL
        ).run();

        setLoaderMessage(`
					${t("mintNFT.processingTransaction")}
				`);

        // Sending mint transactions
        await sendMintTransaction(transactions);
        Console.log("Mint complete", mintKey);
        history.replace(`/congrats/${mintKey}`);
      } catch (err) {
        setShowLoader(false);
        if (err && err.response && err.response.data) {
          errorNotification(err.response.data);
        } else {
          errorNotification(err);
        }
      }
    };
    setShowLoader(true);
    setLoaderMessage(`${t("mintNFT.uploadingAssets")}`);
    asyncSubmit();
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
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [titleCount, setTitleCount] = useState(0);

  return (
    <div>
      {showLoader && <Loader text={loaderMessage} />}
      <Seo title={`Solsea | ${t("seo.createNFT")}`} />
      <div id="container page-wrapper position-relative">
        <section
          aria-label="section"
          className={`banner profile-banner d-flex ${
            isDarkMode ? "dark-lighter" : "light-white"
          }`}
        >
          <h1>{t("mintNFT.mintNft")}</h1>
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
              <div className={`${s.section} ${s.createPage} row wow fadeIn`}>
                <div className="col-md-8">
                  <form className={` ${s.formBorder} form-border`}>
                    <div
                      className={`${s.fieldSection} ${s.required} ${
                        isDarkMode ? "dark-red" : ""
                      } mb-4 mt-4`}
                    >
                      {/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
                      <p style={{ color: "red" }}>
                        {t("mintNFT.checkInformation")}
                      </p>
                      <h5>
                        {t("mintNFT.uploadStaticPreview")}{" "}
                        <i
                          data-tip={t("mintNFT.staticToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <p>
                        {previewStorageCost != null && (
                          <>
                            <strong>
                              {t("mintNFT.storageCost")}{" "}
                              {round(previewStorageCost / SOL_TO_LAMPORTS, 8)}{" "}
                              SOL
                            </strong>
                          </>
                        )}
                      </p>
                      <Controller
                        name="preview"
                        control={control}
                        rules={{
                          required: t("mintNFT.previewRequired")
                        }}
                        render={({ field: { onChange } }) => (
                          <ImageSelector
                            className={`${s.dCreateFile} ${
                              isDarkMode ? "dark-lighter-more" : "light-white"
                            }`}
                            name="preview"
                            innerText1={t("mintNFT.uploadPreview")}
                            innerText2={t("mintNFT.supportedFormat")}
                            innerText3={t("mintNFT.maxFileSize10")}
                            sizeLimit={1024 * 1024 * 10}
                            supportedTypes={[
                              FileTypes.jpg,
                              FileTypes.png,
                              FileTypes.gif
                            ]}
                            onChange={file => {
                              const updateFileStorageCost = async files => {
                                const cost = await getAssetCostToStore(files);
                                setPreviewStorageCost(cost);
                              };
                              updateFileStorageCost([file]);
                              onChange(file);
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className={`${s.fieldSection} mb-4 mt-4`}>
                      {/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
                      <h5>
                        {t("mintNFT.animatedPreview")}{" "}
                        <i
                          data-tip={t("mintNFT.animatedToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <p>
                        {animatedPreviewStorageCost != null && (
                          <>
                            <strong>
                              {t("mintNFT.storageCost")}{" "}
                              {round(
                                animatedPreviewStorageCost / SOL_TO_LAMPORTS,
                                8
                              )}{" "}
                              SOL
                            </strong>
                          </>
                        )}
                      </p>
                      <Controller
                        name="animated_preview"
                        control={control}
                        render={({ field: { onChange } }) => (
                          <ImageSelector
                            innerText1={t("mintNFT.uploadPreview")}
                            innerText2={t("mintNFT.supportedFormatMov")}
                            innerText3={t("mintNFT.maxFileSize10")}
                            className={`${s.dCreateFile} ${
                              isDarkMode ? "dark-lighter-more" : "light-white"
                            }`}
                            sizeLimit={1024 * 1024 * 10}
                            supportedTypes={[FileTypes.mov, FileTypes.mp4]}
                            name="animated_preview"
                            onChange={file => {
                              const updateFileStorageCost = async files => {
                                const cost = await getAssetCostToStore(files);
                                setAnimatedPreviewStorageCost(cost);
                              };
                              updateFileStorageCost([file]);
                              onChange(file);
                            }}
                          />
                        )}
                      />
                    </div>

                    <div
                      className={`${s.fieldSection} ${s.required} mb-4 mt-4`}
                    >
                      {/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
                      <h5>
                        {t("mintNFT.artworkFile")}{" "}
                        <i
                          data-tip={t("mintNFT.artworkToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <p>
                        <strong></strong>
                        {fileStorageCost != null && (
                          <>
                            <strong>
                              {t("mintNFT.storageCost")}{" "}
                              {round(fileStorageCost / SOL_TO_LAMPORTS, 8)} SOL
                            </strong>
                          </>
                        )}
                      </p>
                      <Controller
                        name="artwork"
                        control={control}
                        rules={{
                          required: t("mintNFT.fileRequired")
                        }}
                        render={({ field: { onChange } }) => (
                          <ImageSelector
                            className={`${s.dCreateFile} ${
                              isDarkMode ? "dark-lighter-more" : "light-white"
                            }`}
                            innerText1={t("mintNFT.artworkPreview")}
                            innerText2={t("mintNFT.artworkSupportedFormat")}
                            innerText3={t("mintNFT.maxFileSize40")}
                            sizeLimit={1024 * 1024 * 40}
                            supportedTypes={[
                              FileTypes.jpg,
                              FileTypes.png,
                              FileTypes.gif,
                              FileTypes.mp4,
                              FileTypes.mov
                              //   FileTypes.glb
                            ]}
                            name="artwork"
                            onChange={file => {
                              const updateFileStorageCost = async files => {
                                const cost = await getAssetCostToStore(files);
                                setFileStorageCost(cost);
                              };
                              updateFileStorageCost([file]);
                              onChange(file);
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className={`${s.fieldSection} ${s.required} mb-4`}>
                      <h5 htmlFor="title">
                        {t("mintNFT.title")}{" "}
                        <i
                          data-tip={t("mintNFT.titleToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <input
                        {...register("title", {
                          required: t("mintNFT.titleRequired"),
                          maxLength: 20
                        })}
                        type="text"
                        className={`form-control ${
                          isDarkMode ? "dark-lighter-more-input" : "light-white"
                        }`}
                        placeholder={t("mintNFT.titlePlaceholder")}
                        maxLength={20}
                        onChange={e => setTitleCount(e.target.value.length)}
                      />
                      <div className={`d-flex justify-content-end`}>
                        <span className={s.limit}>
                          {t("mintNFT.totalCharacters")}
                          {titleCount}/20
                        </span>
                      </div>
                    </div>

                    <div className={`${s.fieldSection} ${s.required} mb-4`}>
                      <h5 htmlFor="shortDescription">
                        {t("mintNFT.shortDescription")}{" "}
                        <i
                          data-tip={t("mintNFT.shortDescriptionToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <textarea
                        {...register("shortDescription", {
                          required: t("mintNFT.shortDescriptionRequired"),
                          maxLength: 64
                        })}
                        className={`form-control ${
                          isDarkMode ? "dark-lighter-more-input" : "light-white"
                        } mb-1`}
                        placeholder={t("mintNFT.shortDescriptionPlaceholder")}
                        rows={5}
                        maxLength={64}
                        onChange={e => setTitleCount(e.target.value.length)}
                      ></textarea>
                      <div className={`d-flex justify-content-end`}>
                        <span className={s.limit}>
                          {t("mintNFT.totalCharacters")}
                          {titleCount}/64
                        </span>
                      </div>
                    </div>

                    <div className={`${s.fieldSection} ${s.required} mb-4`}>
                      <h5 htmlFor="description">
                        {t("mintNFT.description")}{" "}
                        <i
                          data-tip={t("mintNFT.descriptionToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <textarea
                        {...register("description")}
                        className={`form-control ${
                          isDarkMode ? "dark-lighter-more-input" : "light-white"
                        } mb-1`}
                        placeholder={t("mintNFT.descriptionPlaceholder")}
                        rows={5}
                      ></textarea>
                    </div>

                    <div className={`${s.fieldSection} ${s.required} mb-4`}>
                      <h5 htmlFor="fee">
                        {t("mintNFT.royalties")}{" "}
                        <i
                          data-tip={t("mintNFT.royaltiesToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <input
                        type="text"
                        className={`form-control ${
                          isDarkMode ? "dark-lighter-more-input" : "light-white"
                        }`}
                        placeholder={t("mintNFT.royaltiesPlaceholder")}
                        value={fee}
                        onChange={e => {
                          const regex = /^\d+\.?\d{0,2}$/g;
                          const result = e.target.value.match(regex);
                          if (result) {
                            setFee(result.join(""));
                          } else {
                            if (e.target.value.length === 0) setFee("");
                          }
                        }}
                      />
                    </div>

                    {creators && creators.length > 0 && (
                      <>
                        <div className="mb-4">
                          <h5>
                            {t("mintNFT.coCreators")}{" "}
                            <i
                              data-tip={t("mintNFT.coCreatorsToolTip")}
                              className={`${s.question} fa fa-question-circle`}
                            ></i>
                          </h5>
                          <div className={s.creatorsSelectContainer}>
                            {selectedCreator && (
                              <button
                                className={s.btnAddCreator}
                                onClick={e => {
                                  e.preventDefault();
                                  const currentSelection = {
                                    ...creatorsSelection
                                  };
                                  if (
                                    !currentSelection.hasOwnProperty(
                                      selectedCreator.wallet
                                    )
                                  ) {
                                    currentSelection[selectedCreator.wallet] = {
                                      ...selectedCreator,
                                      share: 100
                                    };
                                    setCreatorsSelection(currentSelection);
                                  }
                                }}
                              >
                                <span>
                                  <i className={`fa fa-plus-circle me-1`}></i>
                                </span>
                              </button>
                            )}
                            <Select
                              classNamePrefix="select"
                              options={[
                                { value: user.walletKey, label: "You" }
                              ].concat(
                                creators.map(creator => ({
                                  value: creator.walletKey,
                                  label: creator.userEmail
                                }))
                              )}
                              styles={selectDarkMode}
                              placeholder={t("mintNFT.selectCreator")}
                              onChange={selection => {
                                setSelectedCreator({
                                  email: selection.label,
                                  wallet: selection.value
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className={s.selectedCreators}>
                          {Object.values(creatorsSelection).map(
                            (item, index) => {
                              return (
                                <NftCreatorRenderer
                                  key={`${item.value}${index}`}
                                  {...item}
                                  deletable={
                                    Object.keys(creatorsSelection).length > 0
                                  }
                                  onChange={share => {
                                    const currentSelection = {
                                      ...creatorsSelection
                                    };
                                    currentSelection[item.wallet] = {
                                      ...item,
                                      share
                                    };
                                    setCreatorsSelection(currentSelection);
                                  }}
                                  onDelete={() => {
                                    const currentSelection = {
                                      ...creatorsSelection
                                    };
                                    if (
                                      currentSelection.hasOwnProperty(
                                        item.wallet
                                      )
                                    )
                                      delete currentSelection[item.wallet];
                                    setCreatorsSelection(currentSelection);
                                  }}
                                />
                              );
                            }
                          )}
                        </div>
                      </>
                    )}

                    <div className={`${s.fieldSection} mb-4`}>
                      <h5 htmlFor="external_url">
                        {t("mintNFT.externalUrl")}{" "}
                        <i
                          data-tip={t("mintNFT.externalUrlToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <input
                        {...register("external_url")}
                        type="text"
                        className={`form-control ${
                          isDarkMode ? "dark-lighter-more-input" : "light-white"
                        }`}
                        placeholder={t("mintNFT.externalUrlPlaceholder")}
                      />
                    </div>

                    <div className={`${s.fieldSection} mb-4`}>
                      <h5>
                        {t("mintNFT.tags")}{" "}
                        <i
                          data-tip={t("mintNFT.tagsToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <Controller
                        name="tags"
                        control={control}
                        render={({ field: { onChange, name, value } }) => (
                          <Select
                            classNamePrefix="select"
                            name={name}
                            isMulti
                            defaultValue={value}
                            options={tags.map(license => ({
                              value: license.name,
                              label: license.name
                            }))}
                            placeholder={t("mintNFT.selectTags")}
                            onChange={onChange}
                            styles={selectDarkMode}
                          />
                        )}
                      />
                    </div>

                    <div className={`${s.fieldSection} mb-4`}>
                      <h5>
                        {t("mintNFT.license")}{" "}
                        <i
                          data-tip={t("mintNFT.licenseToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <p>
                        {t("mintNFT.findLicenseText")}{" "}
                        <a href="https://docs.solsea.io/licenses/license-scope-summary">
                          docs.solsea.io/licenses
                        </a>
                        .
                      </p>
                      <Controller
                        name="license"
                        control={control}
                        render={({ field: { onChange, name, value } }) => (
                          <Select
                            classNamePrefix="select"
                            styles={selectDarkMode}
                            name={name}
                            defaultValue={value}
                            value={value}
                            isMulti={false}
                            isClearable={true}
                            options={license.map(license => ({
                              value: {
                                title: license.shortTitle,
                                // URL: license.fileUrl,
                                URL: license.licenseUrl
                              },
                              label: license.title
                            }))}
                            placeholder={t("mintNFT.selectLicense")}
                            onChange={onChange}
                          />
                        )}
                      />
                    </div>

                    <div className={`${s.fieldSection} mb-4`}>
                      <h5>
                        {t("mintNFT.collectionSelection")}{" "}
                        <i
                          data-tip={t("mintNFT.collectionSelectionToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <Controller
                        name="collection"
                        control={control}
                        render={({ field: { onChange, name, value } }) => (
                          <Select
                            classNamePrefix="select"
                            styles={selectDarkMode}
                            name={name}
                            defaultValue={value}
                            isMulti={false}
                            value={value}
                            isClearable={true}
                            options={collections.map(collection => ({
                              // value: collection.Pubkey,
                              value: collection,
                              label: collection.title
                            }))}
                            placeholder={t("mintNFT.selectCollection")}
                            onChange={onChange}
                          />
                        )}
                      />
                    </div>

                    <div className={`${s.fieldSection} field-set`}>
                      <h5>
                        {t("mintNFT.traits")}{" "}
                        <i
                          data-tip={t("mintNFT.traitsToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className={`${s.traitContainer} row`}
                        >
                          <div className="col-md-6">
                            <input
                              type="text"
                              className={`${
                                isDarkMode
                                  ? "dark-lighter-more-input"
                                  : "light-white"
                              } form-control`}
                              placeholder={t("mintNFT.traitsPlaceholder")}
                              {...register(`traits.${index}.trait_type`)}
                            />
                          </div>
                          <div className="col-md-6">
                            <input
                              type="text"
                              className={`${
                                isDarkMode
                                  ? "dark-lighter-more-input"
                                  : "light-white"
                              } form-control`}
                              placeholder={t("mintNFT.traitsPlaceholder2")}
                              {...register(`traits.${index}.value`)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`${s.fieldSection} mb-4`}>
                      <h5>
                        {t("filters.nsfw")}{" "}
                        <i
                          data-tip={t("mintNFT.nsfwToolTip")}
                          className={`${s.question} fa fa-question-circle`}
                        ></i>
                      </h5>
                      <div className="form-check form-switch">
                        <input
                          className={`form-check-input ${
                            isDarkMode ? "dark-lighter-checkbox" : ""
                          }`}
                          type="checkbox"
                          id="nsfw"
                          {...register("nsfw")}
                        />
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#919191",
                            lineHeight: "1.5"
                          }}
                        >
                          {t("mintNFT.nsfwText")}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: "red" }}>{t("mintNFT.noEditing")}</p>
                    <input
                      type="button"
                      id="submit"
                      value={t("mintNFT.mint")}
                      className={`${s.submit} main-button`}
                      onClick={handleSubmit(onSubmit)}
                    />
                  </form>
                </div>

                <div className={`col-md-4 ${s.previewContainer}`}>
                  <h5 className="mt-4">{t("mintNFT.previewNft")}</h5>
                  <div
                    id={"preview"}
                    className={`${s.nftItem} d-flex justify-content-center`}
                  >
                    <NftItem
                      Title={item.title}
                      Preview_URL={preview}
                      price={item.price}
                      nft_collection={
                        item.collection ? item.collection.value : undefined
                      }
                      LicenseTitle={item.license ? item.license.label : ""}
                      isNFTPRO
                      className={"col-lg"}
                    />
                  </div>
                </div>
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

const loadData = (store, params) => {
  return store.dispatch(getLicensesData());
};

export default {
  loadData,
  component: withStyles(s)(Create)
};

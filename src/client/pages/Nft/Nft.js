import { PublicKey } from "@solana/web3.js";
import React, { useEffect, useMemo, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";
import Loader from "../../components/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { BuyEscrow } from "../../components/Popup/Escrow";
import Seo from "../../components/Seo/Seo";
import client from "../../services/feathers";
import {
  handleBuyNFT,
  handleResetSingleNft,
  loadSingleNft
} from "../../actions/nft";
import s from "./Nft.scss";
import withStyles from "isomorphic-style-loader/withStyles";
import { useClientLoading } from "../../hooks/useClientLoading";
import { getNftPageData } from "../../actions/pages";
import { connect } from "all-art-core/lib/core/connection";
import { useFilePath } from "../../hooks/useFilePath";
import {
  CLUSTER_URL,
  MAX_REPORT_EXCLUSION_COUNT,
  notificationOptions,
  SOL_TO_LAMPORTS
} from "../../../api/Definitions";
import { Link } from "react-router-dom";
import { ROOT_URL } from "../../../api/Definitions";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton
} from "react-share";
import ReactTooltip from "react-tooltip";
import BidsHistory from "../../components/BidsHistory/BidsHistory";
import { parseNFTPrice } from "../../hooks/parsePrice";
import usePopup from "../../components/Popup/usePopup";
import WalletPopup from "../../components/Popup/WalletPopup";
import { store } from "react-notifications-component";
import { SET_CREATOR } from "../../actions/user";
import Creator from "../../components/Creator/Creator";
import { handleGetWalletNfts } from "../../actions/nft";
import { MetadataCategory } from "all-art-core/lib/utils/fileType";
import { reloadLikes, reloadReports } from "../../actions/user";
import { errorNotification } from "../../helpers/nofiticationsFunction";
import { useTranslation } from "react-i18next";

const NftPage = () => {
  const {
    connected,
    singleNft,
    user,
    walletKey,
    wallet,
    setCreator,
    isDarkMode,
    app,
    nfts
  } = useSelector(({ nfts, user, collections, app }) => ({
    collectionPage: collections.collectionPage,
    connected: user.connected,
    singleNft: nfts.singleNft,
    setCreator: user.setCreator,
    nfts: nfts.nfts,
    user: user.user,
    walletKey: user.walletKey,
    wallet: user.wallet,
    isDarkMode: app.isDarkMode,
    nfts,
    app
  }));

  const [moreCreators, setMoreCreators] = useState(false);

  const openOtherCreators = () => {
    setMoreCreators(!moreCreators);
  };

  // const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [priceHistory, setPriceHistory] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("");
  const [reportedCollectionStatus, setReportedCollectionStatus] = useState(
    false
  );
  const [reportedNftStatus, setReportedNftStatus] = useState(false);
  const history = useHistory();
  const match = useRouteMatch();
  const dispatch = useDispatch();
  const [sols, setSols] = useState(0);
  const { isShowing, toggle } = usePopup();
  const [likes, setLikes] = useState((singleNft && singleNft.liked) || 0);

  const isOwner = () => {
    if (user && singleNft && nfts) {
      const userNfts = nfts.walletListedNfts.concat(nfts.walletUnlistedNfts);
      for (let i = 0; i < userNfts.length; i++) {
        if (singleNft.Pubkey === userNfts[i].Pubkey) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (user) dispatch(handleGetWalletNfts({ query: {} }));
  }, [user]);

  const loadNft = async () => {
    try {
      await dispatch(loadSingleNft({ pubkey: match.params.pubkey }));
    } catch (error) {
      console.log(error);
      history.replace("/404");
    }
  };

  const checkReportNFTStatus = () => {
    if (singleNft && singleNft.adminReported) {
      setReportedNftStatus(true);
    } else {
      setReportedNftStatus(false);
    }
  };

  const checkReportedCollection = () => {
    if (singleNft && singleNft.nft_collection) {
      if (
        singleNft.nft_collection.reported &&
        singleNft.nft_collection.reported >= MAX_REPORT_EXCLUSION_COUNT
      ) {
        setReportedCollectionStatus(true);
      } else {
        setReportedCollectionStatus(false);
      }
    } else {
      setReportedCollectionStatus(false);
    }
  };

  const getUserAmounts = async () => {
    if (connected && wallet) {
      const connection = await connect(CLUSTER_URL);

      const acc = await connection.getAccountInfo(walletKey);
      if (acc) {
        setSols(acc.lamports);
      } else {
        setSols(0);
      }
    }
  };

  useEffect(() => {
    if (!app.isInitialRender) {
      loadCreator();
    }
  }, [singleNft]);

  const loadCreator = async () => {
    if (singleNft) {
      const creatorService = client.service("creators-users");
      try {
        const oneUser = await creatorService.find({
          query: {
            mint: singleNft.Mint
          }
        });
        dispatch({
          type: SET_CREATOR,
          payload: oneUser
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (connected) {
      getUserAmounts();
      checkReportedCollection();
      checkReportNFTStatus();
    }
  }, [connected, singleNft]);

  useEffect(() => {
    loadPriceHistory();
    return () => {
      dispatch(handleResetSingleNft());
    };
  }, []);

  const loading = useClientLoading({
    load: loadNft,
    params: {},
    isInitialRender: app.isInitialRender
  });

  useEffect(() => {
    if (singleNft) {
      setLikes(singleNft.liked || 0);
    }
  }, [singleNft]);

  const loadPriceHistory = async () => {
    try {
      const nftPriceHistory = client.service("listed-archive");
      const result = await nftPriceHistory.find({
        query: {
          Mint: match.params.pubkey,
          status: "SOLD"
        }
      });
      setPriceHistory(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const onBuyNFT = async () => {
    if (singleNft) {
      try {
        setShowLoader(true);
        setLoaderMessage(t("nftItem.waitingApproval"));
        const res = await BuyEscrow({
          wallet,
          cluster: CLUSTER_URL,
          // escrowAccount: SystemProgram.programId
          escrowAccount: new PublicKey(singleNft.escrowKey)
        });
        setLoaderMessage(t("nftItem.waitingTransaction"));
        await handleBuyNFT({
          escrow: singleNft.escrowKey,
          buyer: walletKey.toString(),
          buffer: res.buffer
        });
        history.replace("/buy-congrats");
        getUserAmounts();
      } catch (error) {
        console.log(error);
        setShowLoader(false);
        let parsedMessage = "";
        if (error.message.includes("0x0")) {
          parsedMessage = "0x0";
        } else if (error.message.includes("0x1")) {
          parsedMessage = t("nftItem.error0x1");
        } else if (error.message.includes("0x2")) {
          parsedMessage = "0x2";
        } else if (error.message.includes("0x3")) {
          parsedMessage = "0x3";
        } else if (error.message.includes("0x4")) {
          parsedMessage = t("nftItem.error0x4");
        } else if (error.message.includes("0x5")) {
          parsedMessage = "0x5";
        } else if (error.message.includes("0x6")) {
          parsedMessage = "0x6";
        } else if (error.message.includes("0x7")) {
          parsedMessage = "0x7";
        } else if (error.message.includes("0x8")) {
          parsedMessage = "0x8";
        } else if (error.message.includes("0x9")) {
          parsedMessage = t("nftItem.error0x9");
        } else if (error.message.includes("0x10")) {
          parsedMessage = "0x10";
        } else if (error.message.includes("0x11")) {
          parsedMessage = "0x11";
        }
        store.addNotification({
          type: "danger",
          title: t("notification.wentWrong"),
          message: parsedMessage || t("notification.unknownProblem"),
          ...notificationOptions
        });
      }
    }
  };

  const onBuyFTX = async () => {
    window.open(
      `https://ftx.us/pay/request?coin=SOL&size=${singleNft.price /
        SOL_TO_LAMPORTS}&address=${walletKey.toString()}&tag=&wallet=sol&memoIsRequired=false&memo=&allowTip=false&fixedWidth=true`,
      "_blank",
      "resizable,width=700,height=900"
    );
  };

  const price = useMemo(() => {
    if (singleNft && singleNft.currency) {
      return parseNFTPrice(singleNft.price, singleNft.currency);
    }
    return {};
  }, [singleNft]);

  const handleLike = async () => {
    if (user && user._id) {
      try {
        const likes = await client.service("user-likes").patch(user._id, {
          nft: singleNft.Mint
        });

        setLikes(likes || 0);
        await dispatch(reloadLikes());
      } catch (error) {
        errorNotification(error);
      }
    } else {
      store.addNotification({
        type: "warning",
        title: t("notification.notAllowed"),
        message: t("notification.connectToLikeNft"),
        ...notificationOptions
      });
    }
  };

  const handleReport = async () => {
    if (user && user._id) {
      try {
        const reports = await client.service("nft-reported").patch(user._id, {
          nft: singleNft.Mint
        });
        if (reports >= MAX_REPORT_EXCLUSION_COUNT) {
          setReportedNftStatus(true);
        } else {
          setReportedNftStatus(false);
        }

        await dispatch(reloadReports());
      } catch (error) {
        errorNotification(error);
      }
    } else {
      store.addNotification({
        type: "warning",
        title: t("notification.notAllowed"),
        message: t("notification.connectToReportNft"),
        ...notificationOptions
      });
    }
  };

  const attributes = useMemo(() => {
    if (singleNft && singleNft.Properties && singleNft.Properties.attributes)
      return singleNft.Properties.attributes;
    return [];
  }, [singleNft]);

  const { path: image } = useFilePath({
    destination:
      singleNft &&
      singleNft.image &&
      singleNft.image.s3 &&
      singleNft.image.s3.preview
  });

  const { path: collectionimage } = useFilePath({
    destination:
      singleNft &&
      singleNft.nft_collection &&
      singleNft.nft_collection.iconImage &&
      singleNft.nft_collection.iconImage.s3 &&
      singleNft.nft_collection.iconImage.s3.thumbnail
  });

  const sharePath = useMemo(() => {
    return ROOT_URL + history.location.pathname;
  }, [history.location]);

  const [copyPath, setCopyPath] = useState("");

  const handleCopyLink = e => {
    e.preventDefault();
    const pageUrl = ROOT_URL + history.location.pathname;
    if (navigator && navigator.clipboard) {
      setCopyPath(navigator.clipboard.writeText(pageUrl));
    }
  };

  const creators = useMemo(() => {
    if (singleNft) {
      if (
        singleNft.Creators &&
        singleNft.Creators.length > 0 &&
        singleNft.Properties &&
        singleNft.Properties.creators &&
        singleNft.Properties.creators.length > 0
      ) {
        const total = [...singleNft.Creators, ...singleNft.Properties.creators];
        const final = [];
        for (let i = 0; i < total.length; i++) {
          const e = total[i];
          if (!final.find(f => f.address === e.address)) {
            final.push(e);
          }
        }

        return final;
      }
    }
    return [];
  }, [setCreator]);

  return !app.isInitialRender && loading ? (
    <Loader />
  ) : !singleNft ? (
    <div>{t("nftPage.notFound")}</div>
  ) : (
    <>
      <Seo
        title={singleNft.Title + " | NFT on Solsea"}
        imageUrl={singleNft.Preview_URL}
        url={history.location.pathname}
        description={singleNft.Description}
      />
      <div
        className={`${s.root} ${
          isDarkMode ? "dark-nft-page" : ""
        } page-wrapper`}
      >
        {showLoader && <Loader text={loaderMessage} />}
        <section className="mt90 sm-mt-0">
          <div className="container">
            <div className="row page-wrapper">
              <div className={`${s.image} col-md-6 text-center`}>
                <PreviewRenderer nft={singleNft} />
                <div
                  className={`${s.infoContainer} ${
                    isDarkMode ? "dark-nft-info-container" : ""
                  }`}
                >
                  <div className={s.rarityHolder}>
                    {singleNft.rarity_rank && (
                      <div className={s.rarityScore}>
                        <p>{t("nftPage.rarityRank")}</p>
                        <div
                          className={`${s.counter} ${s.counterRarity} ${
                            isDarkMode ? "dark-rarity" : ""
                          }`}
                        >
                          <p>
                            {/* <i className="fa fa-star-o me-1"></i> */}
                            {singleNft.rarity_rank}
                          </p>
                          {isDarkMode ? (
                            <img
                              className={`${s.rankIcon}`}
                              src="/rank_dark.svg"
                            />
                          ) : (
                            <img className={`${s.rankIcon}`} src="/rank.svg" />
                          )}
                        </div>
                      </div>
                    )}
                    {singleNft.rarity_score && (
                      <div className={s.rarityScore}>
                        <p>{t("nftPage.rarityScore")}</p>
                        <div
                          className={`${s.counter} ${
                            isDarkMode ? "dark-lighter-yellow" : ""
                          }`}
                        >
                          <p>{singleNft.rarity_score.toFixed(2)}</p>
                          <i className="fa fa-star-o me-1"></i>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`d-flex ${s.traits} ${
                      isDarkMode ? "dark-nft-border-bottom" : ""
                    }`}
                  >
                    {attributes.map((trait, index) => (
                      <div
                        className={`${s.oneTrait} ${
                          isDarkMode ? "dark-trait-background" : ""
                        }`}
                        key={index}
                      >
                        <p className={`${s.traitName}`} type={trait.trait_type}>
                          {trait.trait_type}
                        </p>
                        <p
                          className={`${s.traitValue} ${
                            isDarkMode ? "dark-trait-value" : ""
                          }`}
                          value={trait.value}
                        >
                          {trait.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className={s.description}>
                    <p>{singleNft.Description}</p>
                  </div>
                </div>
              </div>
              <div className={`${s.leftColumn} col-md-6`}>
                <div
                  className={`${s.infoContainer} ${
                    isDarkMode ? "dark-nft-info-container" : ""
                  }`}
                >
                  <div className={s.likeContainer}>
                    {singleNft.status === "LISTED" && (
                      <>
                        <div
                          className={`${s.views} ${
                            isDarkMode ? "dark-rarity" : ""
                          }`}
                        >
                          <p>
                            <i className="fa fa-eye me-1"></i>
                            {singleNft.views}
                          </p>
                        </div>
                        <div
                          className={`${s.like} ${
                            isDarkMode ? "dark-lighter-more-like" : ""
                          } ${!user && s.noCursor}`}
                          onClick={handleLike}
                        >
                          <p>
                            <i
                              className={`fa me-1 ${
                                singleNft.userLiked ? "fa-heart" : "fa-heart-o"
                              } `}
                            ></i>
                            {likes}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className={s.itemInfo}>
                    <h6 className={s.creatorText}>{t("nftPage.creator")}</h6>
                    <div className={`${s.creators} mb-4`}>
                      {setCreator && setCreator.length > 0 && (
                        <>
                          {setCreator.slice(0, 1).map((creator, index) => (
                            <div
                              key={index}
                              className={`d-flex ${s.firstCreator}`}
                            >
                              <Creator {...creator} />
                              {setCreator.length > 1 && (
                                <button
                                  className={isDarkMode ? "dark" : ""}
                                  onClick={openOtherCreators}
                                >
                                  + {setCreator.length - 1}{" "}
                                  {t("nftPage.creators")}
                                  {!moreCreators ? (
                                    <i className={`fa fa-angle-right me-1`}></i>
                                  ) : (
                                    <i className={`fa fa-angle-down me-1`}></i>
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                          {moreCreators &&
                            setCreator
                              .slice(1)
                              .map((creator, index) => (
                                <Creator key={index} {...creator} />
                              ))}
                        </>
                      )}
                    </div>
                    <div
                      className={`${s.title} ${
                        isDarkMode ? "dark-nft-border-bottom" : ""
                      }`}
                    >
                      <h1>{singleNft.Title}</h1>
                      {singleNft.verified && (
                        <i
                          data-tip={t("nftPage.verifiedToolTip")}
                          className={`fa fa-check ${s.checkmark}`}
                        />
                      )}
                      {!app.isInitialRender && (
                        <ReactTooltip
                          place="right"
                          effect="solid"
                          className={`${
                            isDarkMode ? "dark-tool-tip" : "tool-tip"
                          }`}
                        />
                      )}
                    </div>
                    <div
                      className={`${s.license} ${
                        isDarkMode ? "dark-nft-border-bottom" : ""
                      } `}
                    >
                      <div className={`mb-1`}>
                        {isDarkMode ? (
                          <>
                            <img src="../../assets/c_badge_dark.svg" />{" "}
                          </>
                        ) : (
                          <>
                            <img src="../../assets/c_badge.svg" />{" "}
                          </>
                        )}
                        <span
                          className={`${
                            isDarkMode ? "light-font" : "light-font-color"
                          }`}
                        >
                          <strong>{t("nftPage.licenseNft")}</strong>
                        </span>{" "}
                        {singleNft.LicenseTitle && singleNft.License_URL ? (
                          <a
                            href={`${singleNft.License_URL}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span
                              className={`${
                                isDarkMode ? "light-font" : "light-font-color"
                              }`}
                            >
                              {singleNft.LicenseTitle}
                            </span>
                          </a>
                        ) : (
                          <span
                            className={`${
                              isDarkMode ? "light-font" : "light-font-color"
                            }`}
                          >
                            {t("nftPage.noneAttached")}
                          </span>
                        )}
                      </div>
                      {singleNft.isNFTPRO && (
                        <div className={s.mintedSolsea}>
                          <img src="../../assets/solsea_icon.svg" />
                          <span
                            className={`${
                              isDarkMode ? "light-font" : "light-font-color"
                            }`}
                          >
                            {t("nftPage.mintedOnSolsea")}
                          </span>
                        </div>
                      )}
                    </div>

                    {singleNft.tags && singleNft.tags.length > 0 && (
                      <div
                        className={`${s.tagHolder} ${
                          isDarkMode ? "dark-nft-border-bottom" : ""
                        }`}
                      >
                        {singleNft.tags.map((trait, index) => (
                          <div
                            key={index}
                            className={`${s.counter} ${s.darkFont}`}
                          >
                            <p>{trait}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {singleNft.nft_collection ? (
                      <div
                        className={`${s.collection} ${
                          isDarkMode ? "dark-nft-border-bottom" : ""
                        }`}
                      >
                        <p>{t("navbar.collection")}</p>
                        <div className={s.collectionWrapper}>
                          <img src={collectionimage} />
                          <div>
                            <div className="d-flex">
                              <Link
                                to={`/collection/${singleNft.nft_collection._id}`}
                              >
                                <span
                                  className={`${
                                    isDarkMode
                                      ? "light-font"
                                      : "light-font-color"
                                  }`}
                                >
                                  {singleNft.nft_collection.title}
                                </span>
                              </Link>
                              {singleNft.nft_collection.verified && (
                                <i
                                  data-tip={t("nftPage.verifiedToolTip")}
                                  className={`fa fa-check ${s.collectionCheckmark}`}
                                />
                              )}
                            </div>
                            <p>{singleNft.nft_collection.description}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`${s.collection} ${s.not}`}>
                        <p>{t("nftPage.notPartOfCollection")}</p>
                      </div>
                    )}

                    {singleNft && !singleNft.verified && (
                      <div className={s.darkFont}>
                        <p className={s.notVerified}>
                          {t("nftPage.unverifiedNft")}
                        </p>
                      </div>
                    )}

                    <div className={s.btnsLine}>
                      {/* <div className={s.counters}> */}
                      <div className={`dropdown ${s.share} `}>
                        <button
                          className={`${s.btnShare} ${
                            isDarkMode ? "transparent" : ""
                          }`}
                          data-bs-toggle="dropdown"
                        >
                          <i className="fa fa-share-alt me-1"></i>
                          {t("nftPage.share")}
                        </button>
                        <ul
                          className={`dropdown-menu ${
                            isDarkMode ? "dark" : ""
                          }`}
                          aria-labelledby="dropdownMenuButton1"
                        >
                          <li>
                            <FacebookShareButton
                              url={sharePath}
                              className={s.shareButton}
                            >
                              <FacebookIcon size={32} round />
                              <p>{t("nftPage.shareFacebook")}</p>
                            </FacebookShareButton>
                          </li>
                          <li>
                            <TwitterShareButton
                              url={sharePath}
                              className={s.shareButton}
                            >
                              <TwitterIcon size={32} round />
                              <p>{t("nftPage.shareTwitter")}</p>
                            </TwitterShareButton>
                          </li>
                          <li>
                            <TelegramShareButton
                              url={sharePath}
                              className={s.shareButton}
                            >
                              <TelegramIcon size={32} round />
                              <p>{t("nftPage.shareTelegram")}</p>
                            </TelegramShareButton>
                          </li>
                          <li>
                            <LinkedinShareButton
                              url={sharePath}
                              className={s.shareButton}
                            >
                              <LinkedinIcon size={32} round />
                              <p>{t("nftPage.shareLinkedin")}</p>
                            </LinkedinShareButton>
                          </li>
                          <li>
                            <Link
                              to={""}
                              onClick={handleCopyLink}
                              className={s.shareButton}
                            >
                              <i className="fa fa-copy"></i>
                              <p>{t("nftPage.copyClipboard")}</p>
                            </Link>
                          </li>
                        </ul>
                      </div>
                      {/* </div> */}

                      <div className={s.btnSolana}>
                        <a
                          href={
                            "https://explorer.solana.com/address/" +
                            singleNft.Mint
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i
                            className={`fa fa-globe me-1 ${
                              isDarkMode ? "light-font" : ""
                            }`}
                          ></i>
                          <span
                            className={`${
                              isDarkMode ? "light-font" : "light-font-color"
                            }`}
                          >
                            {t("nftPage.viewOnSolana")}
                          </span>
                        </a>
                      </div>
                      {!singleNft.verified && (
                        <div
                          className={s.btnReport}
                          data-tip={t("nftPage.pleaseReportAFake")}
                        >
                          <Link to="#" onClick={handleReport}>
                            <i
                              className={`fa fa-flag me-1 ${
                                singleNft.userReported ? s.reported : ""
                              }`}
                            ></i>
                            {t("nftPage.report")}
                          </Link>
                        </div>
                      )}

                      {isOwner() &&
                        singleNft.Properties &&
                        singleNft.Properties.files &&
                        singleNft.Properties.files.length && (
                          <div className={s.btnDownload}>
                            <a
                              href={
                                singleNft.Properties.files[
                                  singleNft.Properties.files.length - 1
                                ].uri
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fa fa-cloud-download"></i>
                              {t("nftPage.download")}
                            </a>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    className={`${s.infoContainer} ${
                      isDarkMode ? "dark-nft-info-container" : ""
                    }`}
                  >
                    {singleNft.status === "LISTED" && (
                      <div
                        className={`${s.listedBy} ${
                          isDarkMode ? "dark-nft-border-bottom" : ""
                        }`}
                      >
                        <p>
                          <strong>{t("nftPage.listedBy")}</strong>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href={`
                            https://explorer.solana.com/address/${singleNft.sellerKey}`}
                          >
                            {singleNft.sellerKey}
                          </a>
                        </p>
                      </div>
                    )}
                    {singleNft.status === "LISTED" ? (
                      <div
                        className={`${s.containerPrice} ${
                          isDarkMode ? "dark-nft-price" : ""
                        }`}
                      >
                        <span className={s.price}>{price.price}</span>
                        <span className={s.currency}>{price.currency}</span>
                      </div>
                    ) : (
                      // "Not listed"
                      <div
                        data-tip={t("nftPage.notListed")}
                        className={s.mintedSolsea}
                      >
                        <span>{t("nftPage.notListed")}</span>
                      </div>
                    )}
                    {singleNft.Properties &&
                    singleNft.Properties.seller_fee_basis_points ? (
                      <span className={s.royalties}>
                        {t("nftPage.creatorRoyalties")}{" "}
                        <strong>
                          {singleNft.Properties.seller_fee_basis_points / 100} %
                        </strong>
                      </span>
                    ) : null}
                    <div className={s.buyConnectButton}>
                      {singleNft.status === "LISTED" &&
                        !reportedCollectionStatus &&
                        !reportedNftStatus && (
                          <>
                            {" "}
                            {connected ? (
                              // sols >= parseInt(singleNft.price) ? (
                              <button
                                onClick={onBuyNFT}
                                className="main-button mt-3 w-100"
                              >
                                {t("nftPage.buyNft")}
                              </button>
                            ) : (
                              // ) : (
                              //   <button
                              //     onClick={onBuyFTX}
                              //     className="main-button mt-3 w-100"
                              //   >
                              //     Fund with FTX
                              //   </button>
                              // )
                              <>
                                <button
                                  onClick={toggle}
                                  className="main-button mt-3 w-100"
                                >
                                  {t("nftPage.connectWalletNft")}
                                </button>
                                <WalletPopup
                                  isShowing={isShowing}
                                  hide={toggle}
                                />
                              </>
                            )}
                          </>
                        )}
                      {singleNft.status === "SOLD" && (
                        <h4>{t("nftPage.sold")}</h4>
                      )}
                      <div className={s.importantMessage}>
                        <span
                          className={`${
                            isDarkMode ? "light-font" : "light-font-color"
                          }`}
                        >
                          {t("nftPage.doubleCheck")}{" "}
                        </span>{" "}
                        <a href="https://docs.solsea.io/getting-started/how-to-spot-a-fake-nft">
                          {t("nftPage.spotFakes")}
                        </a>
                        <br />
                        <span
                          className={`${
                            isDarkMode ? "light-font" : "light-font-color"
                          }`}
                        >
                          {t("nftPage.readOur")}
                        </span>{" "}
                        <a href="https://docs.solsea.io/getting-started/terms-and-conditions">
                          <span
                            className={`${
                              isDarkMode ? "light-font" : "light-font-color"
                            }`}
                          >
                            {t("footer.terms")}
                          </span>
                        </a>{" "}
                        <span
                          className={`${
                            isDarkMode ? "light-font" : "light-font-color"
                          }`}
                        >
                          {t("nftPage.beforeBuy")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`${s.infoContainer} ${
                    isDarkMode ? "dark-nft-info-container" : ""
                  }`}
                >
                  <BidsHistory
                    text1={t("nftPage.history")}
                    text2={"History"}
                    bids={[]}
                    history={priceHistory}
                    author={"Djura"}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

const loadData = (store, params, query, path, req) => {
  return store.dispatch(getNftPageData(params, req));
};

export default {
  loadData,
  component: withStyles(s)(NftPage)
};

function PreviewRenderer(props) {
  const ImageRenderer = () => {
    if (props.nft) {
      const { path: imagePath } = useFilePath({
        destination:
          props.nft.files && props.nft.files.s3 && props.nft.files.s3.preview
      });

      return (
        <img
          className="img-fluid img-rounded mb-sm-3"
          src={imagePath ? imagePath : props.nft.Preview_URL}
          alt={props.nft.Title}
        />
      );
    }
    return null;
  };
  const VideoRenderer = () => {
    return (
      <video
        className="img-fluid img-rounded mb-sm-3"
        autoPlay
        controls
        loop
        src={props.nft.Properties.animation_url}
      />
    );
  };

  if (props.nft && props.nft.Properties) {
    switch (props.nft.Properties.category) {
      case MetadataCategory.glb:
        return ImageRenderer();
      case MetadataCategory.mov:
      case MetadataCategory.mp4:
        return props.nft.Properties.animation_url
          ? VideoRenderer()
          : ImageRenderer();
      case MetadataCategory.jpg:
      case MetadataCategory.png:
      case MetadataCategory.gif:
      default:
        return ImageRenderer();
    }
  }
  return ImageRenderer();
}

import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import NftItem from "../../components/NftItem/NftItem";
import s from "./Wallet.scss";
import Seo from "../../components/Seo/Seo";
import withStyles from "isomorphic-style-loader/withStyles";
import { useDispatch, useSelector } from "react-redux";
import { handleGetWalletNfts, handleReloadWallet } from "../../actions/nft";
import { store } from "react-notifications-component";
import { notificationOptions } from "../../../api/Definitions";
import WalletSwitch from "../../components/SwitchSection/WalletSwitch";
import client from "../../services/feathers";
import { Route, useRouteMatch } from "react-router";
import InfiniteScroll from "react-infinite-scroller";
import ContentLoader from "../../components/Loader/ContentLoader";
import { useTranslation } from "react-i18next";
import SaleHistoryItem from "../../components/SaleHistoryItem/SaleHistoryItem";

const Wallet = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [text, setText] = useState("");

  const dispatch = useDispatch();
  const {
    user: { connected, isLoggedIn, user: { walletKey, ...rest } = {} },
    nfts: { walletListedNfts = [], walletUnlistedNfts = [] },
    isDarkMode,
    app
  } = useSelector(({ user, nfts, app }) => ({
    user,
    nfts,
    isDarkMode: app.isDarkMode,
    app
  }));

  useEffect(() => {
    if (connected && isLoggedIn) {
      dispatch(handleGetWalletNfts())
        .then(() => {
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          store.addNotification({
            type: "warning",
            title: t("notification.wentWrong"),
            message: error.message,
            ...notificationOptions
          });
        });
    }
  }, [connected, isLoggedIn]);

  const reloadWallet = () => {
    setText(t("notification.fetchingNft"));
    setActionLoading(true);
    dispatch(handleReloadWallet())
      .then(() => {
        setActionLoading(false);
      })
      .catch(error => {
        setActionLoading(false);
        console.log(error);
        store.addNotification({
          type: "warning",
          title: t("notification.wentWrong"),
          message: error.message,
          ...notificationOptions
        });
      });
  };

  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(50);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!app.isInitialRender && walletKey) {
      loadPriceHistory();
    }
  }, [walletKey, count]);

  const loadPriceHistory = async (skip = 0) => {
    setIsLoading(true);
    try {
      const nftPriceHistory = client.service("listed-archive");
      const result = await nftPriceHistory.find({
        query: {
          $or: [{ buyerKey: walletKey }, { sellerKey: walletKey }],
          status: "SOLD",
          $sort: {
            createdAt: 1
          },
          $skip: skip,
          $limit: 50
        },
        $populate: ["image"]
      });
      setPriceHistory([...priceHistory, ...result.data]);
      setTotal(result.total);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const match = useRouteMatch();

  return (
    <div>
      <Seo title={`Solsea | ${t("seo.wallet")}`} />

      <section
        className={`banner profile-banner d-flex ${
          isDarkMode ? "dark-lighter" : "light-white"
        }`}
      >
        <div className="container">
          <h1>{t("wallet.myWallet")}</h1>
          {connected && isLoggedIn && (
            <div className="d-flex justify-content-center mb-4">
              <button onClick={reloadWallet} className={`main-button`}>
                {t("wallet.reloadWallet")}
              </button>
            </div>
          )}
        </div>
      </section>
      <div className="container page-wrapper position-relative">
        <div className={`row`}>
          {!connected || !isLoggedIn ? (
            <h4
              className={`pt-5 connect-wallet-text`}
              style={{ textAlign: "center" }}
            >
              {t("mintNFT.connectFirst")}
            </h4>
          ) : loading ? (
            <Loader text={text} />
          ) : (
            <div>
              <WalletSwitch />
              <Route exact path={match.path + "/transaction-history"}>
                <div className="page-wrapper">
                  <InfiniteScroll
                    pageStart={0}
                    loadMore={() => {
                      if (!isLoading) {
                        loadPriceHistory(priceHistory.length);
                      }
                    }}
                    hasMore={total > priceHistory.length}
                    threshold={250}
                  >
                    <div className={`row ${s.transactionWrapper}`}>
                      {priceHistory.map((user, index) => (
                        <div
                          key={`${user._id}_${user.sellerKey}_${user.updatedAt}`}
                          className={`d-flex col-lg-4 col-md-4 col-sm-4 col-xs-4 ${s.exploreNft}`}
                        >
                          <SaleHistoryItem {...user} />
                        </div>
                      ))}
                    </div>
                  </InfiniteScroll>
                  <div
                    style={{
                      height: "100px",
                      width: "100%",
                      position: "relative"
                    }}
                  >
                    {isLoading && priceHistory.length > 0 && <ContentLoader />}
                  </div>
                </div>
              </Route>
              <Route exact path={match.path + "/unlisted-nfts"}>
                <div className="container page-wrapper position-relative">
                  <div className="row">
                    {walletUnlistedNfts.length ? (
                      walletUnlistedNfts.map(row => (
                        <div
                          key={row.Pubkey}
                          className={`d-flex col-lg-3 col-md-6 col-sm-6 col-xs-12 ${s.itemContainer}`}
                        >
                          <NftItem
                            isEditing={true}
                            {...row}
                            loadingDispatcher={(isLoading, text = "") => {
                              setActionLoading(isLoading);
                              setText(text);
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div>
                        <p className={s.noNft}>{t("wallet.noNftsInWallet")}</p>
                      </div>
                    )}
                  </div>
                  {actionLoading && <Loader text={text} />}
                </div>
              </Route>

              <Route exact path={match.path + "/listed-nfts"}>
                <div className="container page-wrapper position-relative">
                  <div className="row">
                    {walletListedNfts.length ? (
                      walletListedNfts.map(row => (
                        <div
                          key={row.Pubkey}
                          className={`d-flex col-lg-3 col-md-6 col-sm-6 col-xs-12 ${s.itemContainer}`}
                        >
                          <NftItem
                            isEditing={true}
                            {...row}
                            loadingDispatcher={(isLoading, text = "") => {
                              setActionLoading(isLoading);
                              setText(text);
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div>
                        <p className={s.noNft}>
                          {t("wallet.noListedNftsInWallet")}
                        </p>
                      </div>
                    )}
                  </div>
                  {actionLoading && <Loader text={text} />}
                </div>
              </Route>
            </div>
          )}
        </div>
        {actionLoading && <Loader text={text} />}
      </div>
    </div>
  );
};

export default {
  component: withStyles(s)(Wallet)
};

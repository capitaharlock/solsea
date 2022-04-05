import { SystemProgram } from "@solana/web3.js";
import { connect } from "all-art-core/lib/core/connection";
import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CLUSTER_URL, notificationOptions } from "../../../api/Definitions";
import { parseNFTPrice } from "../../hooks/parsePrice";
import s from "./Wallet.scss";
import NftItem from "../NftItem/NftItem";
import WalletPopup from "../Popup/WalletPopup";
import usePopup from "../Popup/usePopup";
import { useTranslation } from "react-i18next";
import { handleGetWalletNfts, handleReloadWallet } from "../../actions/nft";
import { store } from "react-notifications-component";
import WalletLoader from "../Loader/WalletLoader";
import client from "../../services/feathers";
import SaleHistoryItem from "../SaleHistoryItem/SaleHistoryItem";
import WalletFilters from "./WalletFilters";
import WalletNftLoader from "../Loader/WalletNftLoader";
import { SET_EXPLORE_FILTERS } from "../../actions/explore";
import { useStateWithCallback } from "../../hooks/useStateWithCallback";
import { SET_LISTED_NFTS } from "../../actions/pages";
import LinesSlideWallet from "../Svg/LinesSlideWallet";
import WalletMap from "./WalletMap";

let previousX = 0;
let right = "-600px";

const Wallet = ({ onChange }) => {
  useStyles(s);
  const [actionLoading, setActionLoading] = useState(false);
  const [nftLoading, setNftLoading] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { isShowing, toggle } = usePopup();
  const { t } = useTranslation();
  const [sols, setSols] = useState(0);
  const [nft, setNft] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [searchClass, setSearchClass] = useState(false);
  const [query, setQuery] = useState({});
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const resizeRef = useRef();

  const {
    isWalletOpen,
    wallet,
    connected,
    walletKey,
    app,
    nfts: {
      walletListedNfts = [],
      walletUnlistedNfts = [],
      purchases = 0,
      sales = 0,
      profit = 0
    }
  } = useSelector(({ app, user, nfts, explore }) => ({
    isWalletOpen: app.isWalletOpen,
    connected: user.connected,
    wallet: user.wallet,
    walletKey: user.walletKey,
    nfts,
    total: nfts.total,
    filters: explore.walletFilters,
    app
  }));

  //Options

  const nftWalletOptions = [
    {
      label: "Listed",
      value: "listed"
    },
    {
      label: "Unlisted",
      value: "unlisted"
    },
    {
      label: "Price History",
      value: "history"
    }
  ];

  // UseEffect

  useEffect(() => {
    if (connected) {
      dispatch(handleGetWalletNfts({ query: query }))
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
  }, [isWalletOpen, query]);

  useEffect(() => {
    if (isWalletOpen) {
      getUserAmounts();
    }
  }, [isWalletOpen && connected]);

  useEffect(() => {
    if (!app.isInitialRender && walletKey) {
      loadPriceHistory();
    }
  }, [isWalletOpen, query]);

  //Functions

  const onChangeSelect = e => {
    if (e.value === "listed") {
      setNft("listed");
    } else if (e.value === "unlisted") {
      setNft("unlisted");
    } else if (e.value === "history") {
      setNft("price");
    }
  };

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

  const getUserAmounts = async () => {
    if (connected && wallet) {
      const connection = await connect(CLUSTER_URL);

      const acc = await connection.getAccountInfo(walletKey);
      if (acc) {
        const balance = parseNFTPrice(
          acc.lamports,
          SystemProgram.programId.toString()
        );
        setSols(`${balance.price} ${balance.currency}`);
      } else {
        setSols("0");
      }
    }
  };

  const allPurchases = useMemo(() => {
    if (purchases && purchases > 0) {
      const purchase = parseNFTPrice(
        purchases,
        SystemProgram.programId.toString()
      );
      return `${purchase.price} ${purchase.currency}`;
    }
    return "0";
  }, [purchases]);

  const allSales = useMemo(() => {
    if (sales && sales > 0) {
      const sale = parseNFTPrice(sales, SystemProgram.programId.toString());
      return `${sale.price} ${sale.currency}`;
    }
    return "0";
  }, [sales]);

  const allProfit = useMemo(() => {
    if ((profit && profit > 0) || (profit && profit < 0)) {
      const profitParsed = parseNFTPrice(
        profit,
        SystemProgram.programId.toString()
      );
      return `${profitParsed.price} ${profitParsed.currency}`;
    }
    return "0";
  }, [profit]);

  const loadPriceHistory = async (skip = 0) => {
    try {
      const nftPriceHistory = client.service("listed-archive");
      const result = await nftPriceHistory.find({
        query: {
          $or: [
            { buyerKey: walletKey.toString() },
            { sellerKey: walletKey.toString() }
          ],
          status: "SOLD",
          ...query,
          $sort: {
            createdAt: 1
          },
          $skip: skip,
          $limit: 50
        },
        $populate: ["image"]
      });
      setPriceHistory([...result.data]);
    } catch (error) {
      console.log(error);
    }
  };

  const disconnectWallet = () => {
    wallet.disconnect();
  };

  const [dimensions, setDimensions] = useState({ w: 450 });

  const startResize = e => {
    window.addEventListener("mouseup", stopResize);
    window.addEventListener("mousemove", resizeFrame);
    previousX = e.clientX;
  };

  const resizeFrame = e => {
    const currentWidth = resizeRef.current.offsetWidth;
    resizeRef.current.style.width = `${currentWidth - e.clientX + previousX}px`;
    right = `-${currentWidth - e.clientX + previousX + 50}px`;
    previousX = e.clientX;
    setDimensions({
      w: resizeRef.current.offsetWidth
    });
  };

  const stopResize = () => {
    window.removeEventListener("mouseup", stopResize);
    window.removeEventListener("mousemove", resizeFrame);
    setDimensions({
      w: resizeRef.current.offsetWidth
    });
  };

  const parsedWallet = useMemo(() => {
    if (wallet) {
      const pubKey = wallet.publicKey.toString();
      const first = pubKey.slice(0, 4);
      const last = pubKey.slice(-4);

      if (dimensions.w <= 600) {
        return `${first} . . . ${last}`;
      } else {
        return `${pubKey}`;
      }
    }
    return "";
  }, [wallet, dimensions]);

  // Select styles

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

  return !connected ? (
    <>
      <button
        onClick={toggle}
        className={`${s.connectWalletButton} ${s.button} d-flex`}
      >
        {t("navbar.connectWallet")}
      </button>
      <WalletPopup isShowing={isShowing} hide={toggle} />
    </>
  ) : (
    <div>
      <button
        onClick={onChange}
        className={`main-button ${s.button} ${s.walletOpen}`}
      >
        <img src="/assets/wallet.png" />

        {t("WALLET")}
      </button>
      <aside
        // onMouseMove={resizeFrame}
        ref={resizeRef}
        className={`${s.root} ${isWalletOpen ? s.open : ""}`}
        style={{ right: isWalletOpen ? 0 : right }}
      >
        <div className={s.handle} onPointerDown={startResize}>
          <div className={s.linesContainer}>
            <LinesSlideWallet />
          </div>
        </div>
        <div className={s.panel}>
          <div className={s.upperSection}>
            <div className={`${s.resizeContainer} d-flex`}>
              <div className={s.balance}>
                <div className={s.svgSolls}>
                  <p>{sols}</p>
                </div>
                <div className={s.reloadFundsBtns}>
                  <button onClick={reloadWallet} className={s.reloadButton}>
                    <img src="/assets/purpleReduIcon.svg" />
                    <span className={dimensions.w <= 729 ? s.noSpan : null}>
                      Refresh
                    </span>
                  </button>
                  <button className={s.fundsButton}>Add Funds</button>
                </div>
              </div>
              <div className={s.twoButttons}>
                <button className={s.walletContainer}>
                  <p>{parsedWallet}</p>
                  <div className={s.imgContainer}>
                    <img src="/assets/copy.svg" alt="" />
                  </div>
                </button>
                <div className={s.disconnectButton}>
                  <button onClick={disconnectWallet}>
                    <div className={s.imgContainer}>
                      <img src="/assets/disconnect.svg" alt="" />
                    </div>
                    <span className={dimensions.w <= 729 ? s.noSpan : null}>
                      Disconnect
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className={s.statsWrap}>
              <div className={s.stats}>
                <span>Purchases</span>
                <p>{allPurchases}</p>
              </div>
              <div className={s.stats}>
                <span>Sales</span>
                <p>{allSales}</p>
              </div>
              <div className={s.stats}>
                <span>Profit</span>
                <p>{`${allProfit}`}</p>
              </div>
            </div>
          </div>
          <div
            className={s.filterSection}
            onClick={() => setSearchClass(false)}
          >
            <div className={s.filters}>
              <WalletFilters
                query={query}
                setQuery={setQuery}
                width={dimensions}
                searchStyle={searchClass}
                setSearchStyle={setSearchClass}
                onChange={onChangeSelect}
                options={nftWalletOptions}
                selectStyle={selectDarkMode}
              />
            </div>
          </div>
          <div className={s.list}>
            <WalletMap
              nft={nft}
              listedMap={walletListedNfts}
              unlistedMap={walletUnlistedNfts}
              priceMap={priceHistory}
            />
            {/* {nftLoading && <WalletNftLoader />} */}
          </div>
          {actionLoading && <WalletLoader text={text} />}
        </div>
      </aside>
    </div>
  );
};

export default Wallet;

import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { switchDarkMode, TOGGLE_WALLET } from "../../actions/app";
// import ConnectWallet from "../ConnectWallet/ConnectWallet";
import DarkSwitch from "../DarkSwitch/DarkSwitch";
import LanguageSelector from "../LanguageSelector/LanguageSelector";
import s from "./NavBar.scss";
import { useTranslation } from "react-i18next";
import NewNavigationItem from "./NavBarComponents/NewNavigationItem";
import { useCookies } from "react-cookie";
import Wallet from "../Wallet/WalletAside";
import ShoppingCartPopup from "../Popup/ShoppingCartPopup";
// import OldNavigationItem from "./NavBarComponents/OldNavigationItem";
import NavSearch from "./NavBarComponents/SearchResults/NavSearch";

const Navbar = () => {
  const [isVisible, setVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const cartItems = useSelector(({ nfts }) => nfts.cartItems);
  const { t } = useTranslation();

  const [inputOpen, setInputOpen] = useState(false);

  const system = useSelector((state) => state.app.system);
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode,
    app,
  }));

  const [cookies, setCookies] = useCookies(["darkMode"]);

  const dispatch = useDispatch();
  useEffect(() => {
    setCookies("darkMode", isDarkMode, {
      domain: "solsea.io",
      path: "/",
      maxAge: 2592000,
    });
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    dispatch(switchDarkMode(!isDarkMode));
  };

  useStyles(s);

  const [isSticky, setSticky] = useState(false);
  useEffect(() => {
    window.onscroll = () => {
      if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };
  }, []);

  const toggleWallet = () => {
    dispatch({
      type: TOGGLE_WALLET,
    });
  };

  const handleHidePopup = () => {
    setShowPopup(false);
  };

  console.log(isVisible);

  return (
    <header
      className={`${s.root} ${isDarkMode ? "nav-bar-dark" : ""} ${system.maintenance ? s.reverse : ""} ${
        isSticky ? s.smaller : ""
      } d-flex`}
    >
      <div className={`${s.rootContainer} container `}>
        <div className="row">
          <div className="col-md-12">
            <div className="d-flex justify-content-between sm-pt10">
              <div className={` ${inputOpen ? s.hiden : s.visible} d-flex align-items-center`}>
                <div className={s.logo}>
                  <Link to="/">
                    <img src={isDarkMode ? "/assets/SolSea_Logo light.svg" : "/assets/SolSea_Logo.svg"} alt="" />
                  </Link>
                </div>
              </div>

              <NavSearch inputOpen={inputOpen} setInputOpen={setInputOpen} />
              <div className="d-flex header">
                <ul
                  id="mainmenu"
                  className={`d-flex justify-content-start align-items-center h-100 ${s.mobileMenu} ${
                    isDarkMode ? "nav-bar-dark-mobile" : ""
                  } ${isVisible ? s.visible : "nav-bar-light-mobile"}`}
                >
                  <div className={`d-flex`}>
                    <div className={`dropdown ${s.dropdown}`}>
                      <button className={`${s.connectCreateButton} dropdown-toggle main-button`}>
                        {t("navbar.explore")}
                      </button>
                      <ul
                        className={`dropdown-menu ${isDarkMode ? "nav-bar-dark-menu" : ""} ${s.dropdownMenu}`}
                        aria-labelledby="dropdownMenuButton1"
                      >
                        <li>
                          <Link
                            className={`${s.dropdownItem} dropdown-item`}
                            to={"/explore"}
                            onClick={() => setVisible(false)}
                          >
                            {t("navbar.nfts")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            onClick={() => setVisible(false)}
                            className={`${s.dropdownItem} dropdown-item`}
                            to="/collections"
                          >
                            {t("navbar.collections")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            onClick={() => setVisible(false)}
                            className={`${s.dropdownItem} dropdown-item`}
                            to="/collection-statistics"
                          >
                            {t("statistics.stats")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            onClick={() => setVisible(false)}
                            className={`${s.dropdownItem} dropdown-item`}
                            to="/collection-calendar"
                          >
                            {t("navbar.calendar")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            onClick={() => setVisible(false)}
                            className={`${s.dropdownItem} dropdown-item`}
                            to="/collection/61b75ee47362cf61b1b987e7"
                          >
                            The First 100
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className={`d-flex`}>
                    <div className={`dropdown ${s.dropdown}`}>
                      <button
                        className={`${s.connectCreateButton} dropdown-toggle main-button`}
                        // type="button"
                        // data-bs-toggle="dropdown"
                        // aria-expanded="false"
                      >
                        {t("navbar.create")}
                      </button>
                      <ul
                        className={`dropdown-menu ${isDarkMode ? "nav-bar-dark-menu" : ""} ${s.dropdownMenu}`}
                        aria-labelledby="dropdownMenuButton1"
                      >
                        <li>
                          <Link
                            onClick={() => setVisible(false)}
                            className={`${s.dropdownItem} dropdown-item`}
                            to={"/create"}
                          >
                            {t("navbar.nft")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            onClick={() => setVisible(false)}
                            className={`${s.dropdownItem} dropdown-item`}
                            to="/create-collection"
                          >
                            {t("navbar.collection")}
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <NewNavigationItem onClick={() => setVisible(false)} url={"/staking-page"} name="Stake" />
                  <li className={`${s.navItem}`}>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="d-flex align-items-center h-100"
                      href={"https://docs.solsea.io/getting-started/faq"}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9 0.53125C4.18359 0.53125 0.28125 4.46875 0.28125 9.25C0.28125 14.0664 4.18359 17.9688 9 17.9688C13.7812 17.9688 17.7188 14.0664 17.7188 9.25C17.7188 4.46875 13.7812 0.53125 9 0.53125ZM9 16.2812C5.09766 16.2812 1.96875 13.1523 1.96875 9.25C1.96875 5.38281 5.09766 2.21875 9 2.21875C12.8672 2.21875 16.0312 5.38281 16.0312 9.25C16.0312 13.1523 12.8672 16.2812 9 16.2812ZM12.7617 7.31641C12.7617 5.55859 10.8984 4.1875 9.17578 4.1875C7.52344 4.1875 6.46875 4.89062 5.66016 6.12109C5.51953 6.29688 5.55469 6.54297 5.73047 6.68359L6.71484 7.42188C6.89062 7.5625 7.17188 7.52734 7.3125 7.35156C7.83984 6.68359 8.22656 6.29688 9.03516 6.29688C9.66797 6.29688 10.4414 6.68359 10.4414 7.31641C10.4414 7.77344 10.0547 7.98438 9.42188 8.33594C8.71875 8.75781 7.76953 9.25 7.76953 10.5156V10.7969C7.76953 11.043 7.94531 11.2188 8.19141 11.2188H9.77344C10.0195 11.2188 10.1953 11.043 10.1953 10.7969V10.5859C10.1953 9.70703 12.7617 9.67188 12.7617 7.31641ZM10.4766 13.1875C10.4766 12.3789 9.80859 11.7109 9 11.7109C8.15625 11.7109 7.52344 12.3789 7.52344 13.1875C7.52344 14.0312 8.15625 14.6641 9 14.6641C9.80859 14.6641 10.4766 14.0312 10.4766 13.1875Z"
                          fill={isDarkMode ? "#f4f7fcbb" : "#251552"}
                        />
                      </svg>
                    </a>
                  </li>
                  <DarkSwitch handleChange={toggleDarkMode} />
                  <LanguageSelector />
                  <div className={s.walletContainer}>
                    <Wallet onChange={toggleWallet} />
                  </div>
                  <div className={s.svgContainer} onClick={() => setShowPopup(true)}>
                    {cartItems.length > 0 && <div className={s.cartItemsNum}>{cartItems.length}</div>}
                    <img src="/assets/shoppingCart.svg" />
                  </div>
                </ul>
                <div
                  className={`${s.navBarsWrap} ${isDarkMode ? "dark-nav-bars-wrap-mobile" : ""}`}
                  onClick={() => setVisible(!isVisible)}
                >
                  <div className={s.navBars}>
                    <span className={s.iconBar}></span>
                    <span className={s.iconBar}></span>
                    <span className={s.iconBar}></span>
                  </div>
                  <span>{t("navbar.menu")}</span>
                </div>
                {isVisible && <div onClick={() => setVisible(false)} className={s.close}></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ShoppingCartPopup isShowing={showPopup} hideFunction={handleHidePopup} />
      {/* <button type="button" className="main-button" onClick={toggleWallet}>
          Wallet
        </button> */}
      {system.maintenance && (
        <div className={s.maintenance}>
          <p>{system.maintenanceMessage || t("navbar.maintenanceMessage")}</p>
        </div>
      )}
    </header>
  );
};

export default Navbar;

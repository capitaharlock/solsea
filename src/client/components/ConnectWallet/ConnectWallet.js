import React, { useEffect, useState } from "react";
import s from "./ConnectWallet.scss";
import { connect } from "all-art-core/lib/core/connection";
import usePopup from "../Popup/usePopup";
import { Link } from "react-router-dom";
import WalletPopup from "../Popup/WalletPopup";
import NavigationItem from "../NavBar/NavBarComponents/NavigationItem";
import client from "../../services/feathers";
import useStyles from "isomorphic-style-loader/useStyles";
import { useDispatch, useSelector } from "react-redux";
import { handleLogout } from "../../actions/user";
import { CLUSTER_URL } from "../../../api/Definitions";
import { handleOpenNft } from "../../actions/app";
import { useTranslation } from "react-i18next";

const ConnectWallet = () => {
  useStyles(s);
  const { t } = useTranslation();

  const { connected, wallet, walletKey, isLoggedIn, user } = useSelector(
    ({ user, app }) => ({
      connected: user.connected,
      wallet: user.wallet,
      walletKey: user.walletKey,
      isLoggedIn: user.isLoggedIn,
      user: user.user,
      app
    })
  );
  const dispatch = useDispatch();
  const [sols, setSols] = useState("");
  const { isShowing, toggle } = usePopup();

  useEffect(() => {
    getUserAmounts();
  }, [connected]);

  const getUserAmounts = async () => {
    if (connected && wallet) {
      const connection = await connect(CLUSTER_URL);

      const acc = await connection.getAccountInfo(walletKey);
      if (acc) {
        setSols((acc.lamports / 1000000000).toFixed(2));
      } else {
        setSols("0");
      }
    }
  };

  const disconnectWallet = () => {
    wallet.disconnect();
  };

  const onBuyFTX = async () => {
    window.open(
      `https://ftx.us/pay/request?coin=SOL&address=${walletKey.toString()}&tag=&wallet=sol&memoIsRequired=false&memo=&allowTip=false&fixedWidth=true`,
      "_blank",
      "resizable,width=700,height=900"
    );
  };

  const onLogout = () => {
    client.logout().then(() => {
      dispatch(handleLogout());
    });
  };

  const onOpenNfts = val => {
    dispatch(handleOpenNft(val));
  };

  // const airdropSol = async () => {
  //   const connection = new Connection(CLUSTER_URL, "confirmed");
  //   try {
  //     const myAddress = new PublicKey(walletKey.toString());
  //     const signature = await connection.requestAirdrop(
  //       myAddress,
  //       LAMPORTS_PER_SOL
  //     );
  //     await connection.confirmTransaction(signature);
  //     getUserAmounts();
  //     store.addNotification({
  //       title: "Success!",
  //       message: "Added 1 SOL to wallet.",
  //       type: "success",
  //       ...notificationOptions
  //     });
  //   } catch (e) {
  //     store.addNotification({
  //       title: "Error!",
  //       message: e.message,
  //       type: "danger",
  //       ...notificationOptions
  //     });
  //   }
  // };

  const onWalletOpen = () => {
    getUserAmounts();
  };

  return !connected ? (
    <>
      <button onClick={toggle} className={`${s.connectWalletButton} d-flex`}>
        {t("navbar.connectWallet")}
      </button>
      <WalletPopup isShowing={isShowing} hide={toggle} />
    </>
  ) : (
    <div className={`${s.user} d-flex`}>
      <div className={`dropdown  ${s.dropdown}`}>
        <button
          className={`${s.walletButton} dropdown-toggle main-button`}
          onMouseEnter={onWalletOpen}
        >
          {t("navbar.wallet")}
        </button>
        <ul
          className={`dropdown-menu ${s.dropdownMenu}`}
          aria-labelledby="dropdownMenuButton1"
        >
          <li>
            <p className={`${s.solWalletText} ms-3 pe-3 `}>{sols} SOL</p>
          </li>
          <li>
            <a
              href={"https://explorer.solana.com/address/" + walletKey}
              target="_blank"
              rel="noreferrer"
              className={`${s.solWalletText}`}
            >
              <p>{walletKey.toString()}</p>
            </a>
          </li>
          <li>
            <Link
              to="/wallet/listed-nfts"
              className={`${s.dropdownItem} dropdown-item`}
            >
              {t("navbar.listedNfts")}
            </Link>
          </li>
          <li>
            <Link
              to="/wallet/unlisted-nfts"
              className={`${s.dropdownItem} dropdown-item`}
            >
              {t("navbar.walletNfts")}
            </Link>
          </li>
          <li>
            <Link
              className={`${s.dropdownItem} dropdown-item`}
              to={"/wallet/transaction-history"}
            >
              {t("navbar.myHistory")}
            </Link>
          </li>
          <li>
            <Link
              onClick={onBuyFTX}
              className={`${s.dropdownItem} dropdown-item`}
              to="#"
            >
              {t("navbar.ftx")}
            </Link>{" "}
          </li>

          <li>
            <Link
              onClick={disconnectWallet}
              className={`${s.dropdownItem} dropdown-item`}
              to={""}
            >
              {t("navbar.disconnect")}
            </Link>
          </li>
        </ul>
      </div>

      {!isLoggedIn ? (
        <div className={`${s.loginContainer}`}>
          <NavigationItem url="/login" name="Log in" />
          <NavigationItem url="/register" name="Register" />
        </div>
      ) : (
        <div className={`d-flex`}>
          <div className={`dropdown ${s.dropdown}`}>
            <button
              className={`dropdown dropdown-toggle ${s.profileMenu} px-3 ${s.navItem}`}
            >
              {t("navbar.myProfile")}
            </button>
            <ul
              className={`dropdown-menu ${s.dropdownMenu}`}
              aria-labelledby="dropdownMenuButton1"
            >
              <li>
                <Link
                  className={`${s.dropdownItem} dropdown-item`}
                  to={"/user-collections/" + user._id}
                >
                  {t("navbar.myCollections")}
                </Link>
              </li>
              <li>
                <Link
                  to="/collection-verification"
                  className={`${s.dropdownItem} dropdown-item`}
                >
                  {t("navbar.collectionVerification")}
                </Link>
              </li>
              <li>
                <Link
                  to="/hostNft"
                  className={`${s.dropdownItem} dropdown-item`}
                >
                  {t("navbar.permission")}
                </Link>
              </li>
              <li>
                <Link
                  className={`${s.dropdownItem} dropdown-item`}
                  to={"/edit-profile/" + user._id}
                >
                  {t("navbar.editProfile")}
                </Link>
              </li>
              <li>
                <Link
                  className={`${s.dropdownItem} dropdown-item`}
                  to={"/settings/" + user._id}
                >
                  {t("navbar.settings")}
                </Link>
              </li>

              <li>
                <Link
                  onClick={onLogout}
                  className={`${s.dropdownItem} dropdown-item`}
                  to="#"
                >
                  {t("navbar.logout")}
                </Link>{" "}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;

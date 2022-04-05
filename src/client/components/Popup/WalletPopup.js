import React from "react";
import s from "./Popup.scss";
import Popup from "./Popup";
import { useDispatch, useSelector } from "react-redux";
import useStyles from "isomorphic-style-loader/useStyles";
import { handleConnectWallet } from "../../actions/user";
import { WalletProviders } from "all-art-core/lib/core/enums";
import { walletInfo } from "all-art-core/lib/core/wallet";
import { useTranslation } from "react-i18next";

const WalletPopup = ({ hide, isShowing }) => {
  useStyles(s);
  const { t } = useTranslation();
  const store = useSelector(store => store);
  const dispatch = useDispatch();

  const onConnectWallet = provider => {
    // store.wallet.connect()
    dispatch(handleConnectWallet(provider));
  };

  return (
    <Popup isShowing={isShowing} hide={hide}>
      <div className={`${s.walletHolder}`}>
        <div className={`${s.modalHeader}`}>
          <p>{t("notification.selectWallet")}</p>
          <button
            type="button"
            className={`${s.modalCloseButton}`}
            data-dismiss="modal"
            aria-label="Close"
            onClick={hide}
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
        <div className={s.modalContent}>
          <div className={`${s.wallet} d-flex`}>
            <button
              onClick={() => onConnectWallet(WalletProviders.Phantom)}
              className={`${s.phantom} d-flex`}
            >
              <img src="/images/phantom-wallet.jpg" alt="sollet" />
              <p>{t("notification.phantom")}</p>
            </button>
          </div>
          <div className={`${s.wallet} d-flex`}>
            <button
              onClick={() => onConnectWallet(WalletProviders.SolflareWeb)}
              className={`${s.phantom} d-flex`}
            >
              <img
                style={{ backgroundColor: "white" }}
                src={walletInfo()[WalletProviders.SolflareWeb].icon}
                alt="sollet"
              />
              <p>{t("notification.solflare")}</p>
            </button>
          </div>
          <div className={`${s.wallet} d-flex`}>
            <button
              onClick={() => onConnectWallet(WalletProviders.Sollet)}
              className={`${s.sollet} d-flex`}
            >
              <img src="/images/sollet-logo.jpg" alt="sollet" />
              <p>{t("notification.sollet")}</p>
            </button>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default WalletPopup;

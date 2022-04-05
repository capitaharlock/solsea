import React, { useState } from "react";
import s from "./Popup.scss";
import Popup from "./Popup";
import { currencies, listingCurrencies } from "../../../api/Currencies";
import Select from "react-select";
import { InitEscrow } from "./Escrow";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { useSelector } from "react-redux";
import useStyles from "isomorphic-style-loader/useStyles";
import { CLUSTER_URL, notificationOptions } from "../../../api/Definitions";
import { store } from "react-notifications-component";
import client from "../../services/feathers";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

const ListNFTPopup = ({ hide, isShowing, data, loadingDispatcher }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  useStyles(s);
  const { wallet, cluster, isDarkMode } = useSelector(({ user, app }) => ({
    ...user,
    isDarkMode: app.isDarkMode
  }));
  const [currency, setCurrency] = useState(currencies[0]);
  const [isPrivate, setPrivate] = useState(false);

  const onSubmit = async formData => {
    if (formData.price === 0) {
      store.addNotification({
        type: "danger",
        title: t("notification.errorNotification"),
        message: t("listNft.insertPrice"),
        ...notificationOptions
      });
      return;
    }

    if (formData.price && data.Mint) {
      setLoading(true);
      try {
        const escrowAccount = Keypair.generate();

        let creators = [];
        let badCreators = false;
        for (let i = 0; i < data.Creators.length; i++) {
          const creator = data.Creators[i];
          if (creator.address === SystemProgram.programId.toString()) {
            badCreators = true;
            break;
          }
        }

        if (badCreators) {
          creators = data.Properties && data.Properties.creators;
        } else {
          creators = data.Creators;
        }
        // await client.service("escrow").get(escrowAccount.publicKey.toString());
        loadingDispatcher(true, t("nftItem.waitingApproval"));
        const escrow = await InitEscrow({
          wallet,
          cluster: CLUSTER_URL,
          price: +formData.price,
          currency: currency.value,
          mintKey: data.Mint,
          creators: creators,
          creatorsFee:
            data.Properties && data.Properties.seller_fee_basis_points,
          escrowAccount,
          stake: +formData.stake
        });
        loadingDispatcher(true, t("nftItem.waitingTransaction"));

        await client.service("escrow").create({
          buffer: escrow.buffer,
          escrowKey: escrowAccount.publicKey.toString(),
          isPrivate
        });

        hide();
        store.addNotification({
          type: "success",
          title: t("notification.successNotification"),
          message: t("listNft.nftListedSuccessfully"),
          ...notificationOptions
        });
        setLoading(false);
        loadingDispatcher(false);
      } catch (error) {
        console.log(error);
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
          message:
            parsedMessage || error.message || t("notification.unknownProblem"),
          ...notificationOptions
        });
        setLoading(false);
        loadingDispatcher(false);
      }
    }
  };

  // const errors = [];

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange"
  });

  // console.log("errors", errors);
  return (
    <Popup isShowing={isShowing} hide={hide}>
      <div className={s.listWrapper}>
        <div className={`${s.modalHeader}`}>
          <p>{t("listNft.listNFT")}</p>
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
        <form onSubmit={handleSubmit(onSubmit)} className={s.modalContent}>
          <div className={s.price}>
            <div className={s.title}>
              <h4>{data.Title}</h4>
            </div>
            <div
              className={`input-wrap ${
                errors && errors["price"] ? "input-error" : ""
              } ${s.input}`}
            >
              <div className="styled-input">
                <input
                  {...register("price", {
                    min: {
                      value: 0.000000001,
                      message: "Amount must be greater then 0"
                    },
                    required: {
                      message: "Amount must be greater then 0"
                    },
                    pattern: /^(\d+)|(0.\d+)|(0,\d+)$/
                  })}
                  placeholder="Price"
                  type="number"
                  step="0.000000001"
                />
                <span>SOL</span>
              </div>
              {errors && errors["price"] && (
                <span className={"styled-input-error"}>
                  {errors["price"].message}
                </span>
              )}
            </div>
            <span className={s.text}>{t("listNft.authorityByListing")}</span>
          </div>

          {data.verified && (
            <div className={s.stake}>
              <p>Stake your AART tokens</p>
              <div
                className={`input-wrap ${
                  errors && errors["stake"] ? "input-error" : ""
                }`}
              >
                <div className="styled-input">
                  <input
                    {...register("stake", {
                      min: {
                        value: 100,
                        message: "Amount must be greater then 100"
                      },
                      pattern: /^(\d+)|(0.\d+)$/
                    })}
                    placeholder="0"
                    type="number"
                    step="0.000001"
                  />
                  <span>AART</span>
                </div>
                {errors && errors["stake"] && (
                  <span className={"styled-input-error"}>
                    {errors["stake"].message}
                  </span>
                )}
              </div>
              <span className={s.stakeText}>
                By staking AART tokens your NFT is getting better reach.
              </span>
            </div>
          )}
          {!loading ? (
            <button className="teal-button" type="submit">
              {t("listNft.listNFT")}
            </button>
          ) : (
            <div className="teal-button">{t("listNft.listNFT")}</div>
          )}
        </form>
      </div>
    </Popup>
  );
};

export default ListNFTPopup;

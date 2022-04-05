import withStyles from "isomorphic-style-loader/withStyles";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import client from "../../services/feathers";
import {
  addToCart,
  handleDelistNFT,
  removeFromCart,
} from "../../actions/nft";
// import { Delist } from "../Popup/Escrow"
// import ListNFTPopup from "../Popup/ListNFTPopup"
// import usePopup from "../Popup/usePopup"
import s from "./NftItem.scss";
import usePopup from "../Popup/usePopup";
import ListNFTPopup from "../Popup/ListNFTPopup";
import { Delist } from "../Popup/Escrow";
import { PublicKey } from "@solana/web3.js";
import {
  AART_DECIMALS,
  CLUSTER_URL,
  notificationOptions
} from "../../../api/Definitions";
import { useFilePath } from "../../hooks/useFilePath";
import { store } from "react-notifications-component";
import { parseNFTPrice } from "../../hooks/parsePrice";
import { reloadLikes } from "../../actions/user";
import { errorNotification } from "../../helpers/nofiticationsFunction";
import { useTranslation } from "react-i18next";

const NftItem = props => {
  const {
    Title,
    Preview_URL,
    price,
    Mint,
    listed = false,
    isEditing = false,
    rarity_score,
    rarity_rank,
    verified,
    nft_collection,
    currency,
    liked = 0,
    userLiked = false,
    escrowKey,
    views = 0,
    status,
    stakeAmount = 0,
    loadingDispatcher,
    files
  } = props;

  const url = "/nft/" + Mint;

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { isShowing, toggle } = usePopup();
  const { user } = useSelector(({ user }) => ({ ...user }));
  const { wallet } = useSelector(({ user }) => ({ ...user }));
  const cartItems = useSelector(({ nfts }) => nfts.cartItems);
  const [likes, setLikes] = useState(liked);
  const inputCheckboxRef = useRef(null);

  const delistNFT = async () => {
    if (confirm(t("nftItem.areYouSure"))) {
      try {
        // await client.service("escrow").get(escrowKey);
        loadingDispatcher(true, t("nftItem.waitingApproval"));
        const result = await Delist({
          wallet,
          cluster: CLUSTER_URL,
          escrowAccount: new PublicKey(escrowKey)
        });
        loadingDispatcher(true, t("nftItem.waitingTransaction"));
        await handleDelistNFT(escrowKey, result.buffer);
        // await dispatch(handleReloadWallet());
        loadingDispatcher(false);
        store.addNotification({
          type: "success",
          title: t("notification.successNotification"),
          message: t("nftItem.nftDelisted"),
          ...notificationOptions
        });
      } catch (error) {
        loadingDispatcher(false);
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

  const listNFT = () => {
    toggle();
  };

  // const updateLike = async () => {
  //   if (user && user._id) {
  //     try {
  //       const likes = await client.service("user-likes").patch(user._id, {
  //         nft: Mint
  //       });
  //       setLikes(likes);
  //       dispatch(reloadLikes());
  //     } catch (error) {
  //       errorNotification(error);
  //     }
  //   } else {
  //     store.addNotification({
  //       type: "warning",
  //       title: t("notification.notAllowed"),
  //       message: t("notification.connectToLikeNft"),
  //       ...notificationOptions
  //     });
  //   }
  // };

  const noLike = async () => {
    store.addNotification({
      type: "warning",
      title: t("notification.notAllowed"),
      message: "Please visit the NFT page in order to like it.",
      ...notificationOptions
    });
  };

  const { path: imagePath } = useFilePath({
    destination: files && files.s3 && files.s3.thumbnail
    // collectionPage.iconImage.s3 &&
    // collectionPage.iconImage.s3.thumbnail
  });

  const parsedCurrency = useMemo(() => {
    if (currency) {
      return parseNFTPrice(price, currency);
    }

    return "";
  }, [currency]);

  const parsedStakeAmount = useMemo(() => {
    if (stakeAmount) return (stakeAmount / AART_DECIMALS).toFixed(2);
    return "";
  }, [stakeAmount]);

  const likesParsed = useMemo(() => {
    if (liked) {
      if (liked > 1000) {
        return (liked / 1000).toFixed(1) + "K";
      } else {
        return liked;
      }
    }
    return "0";
  }, [liked]);

  const viewsParsed = useMemo(() => {
    if (views) {
      if (views > 1000) {
        return (views / 1000).toFixed(1) + "K";
      } else {
        return views;
      }
    }
    return "0";
  }, [views]);

  const handleCheckboxChange = useCallback(event => {
    const isChecked = event.currentTarget.checked;

    if (isChecked) dispatch(addToCart(props));
    else dispatch(removeFromCart(props));
  }, []);

  useEffect(() => {
    let itemInCart = cartItems.find(item => item.Mint === props.Mint);

    if (!itemInCart) {
      inputCheckboxRef.current.checked = false;
    }
  }, [cartItems]);

  return (
    <>
      <div
        className={`
        ${s.nftItem} 
        ${isEditing && s.walletItem} 
        ${isEditing && listed ? s.listed : ""} 
        ${verified ? s.verified : ""} 
        ${stakeAmount > 0 ? s.goldItem : ""} 
        d-flex`}
      >
        <div className={s.viewLikeContainer}>
          <div className={s.viewsContainer}>
            {listed && (
              <div>
                <i className={`${s.viewsIcon} fa fa-eye me-1`}></i>
                <span className={`${s.views}`}>{viewsParsed}</span>
              </div>
            )}
          </div>
          <div className={s.likeContainer}>
            {listed && (
              <div>
                {/* <button
                  onClick={updateLike}
                  className={`${s.likeButton} ${
                    userLiked ? "fa fa-heart" : "fa fa-heart-o"
                  } ${!user && s.noCursor}`}
                ></button> */}
                <i
                  onClick={noLike}
                  className={`${s.likeButton} ${"fa fa-heart-o"}`}
                ></i>
                <span className={`${s.likes}`}>{likesParsed}</span>
              </div>
            )}
          </div>
        </div>
        <div className={s.nftItemWrap}>
          <Link to={url}>
            <img
              src={!imagePath ? Preview_URL : imagePath}
              className={`${s.nftItemPreview}`}
              alt=""
            />
          </Link>
          {rarity_rank || rarity_score ? (
            <div className={s.rarity}>
              {rarity_rank ? (
                <>
                  <i className={`fa fa-angle-double-up ${s.rankIcon}`}></i>
                  <span className={`${s.rank}`}>{rarity_rank}</span>
                </>
              ) : (
                rarity_score && (
                  <>
                    <i className={`${s.starsIcon} fa fa-star-o me-1`}></i>
                    <span className={`${s.stars}`}>
                      {rarity_score.toFixed(2)}
                    </span>
                  </>
                )
              )}
            </div>
          ) : null}
        </div>

        <div className={`${s.nftItemHeader} d-flex`}>
          <Link to={url}>
            <h4 className={s.title}>{Title}</h4>
          </Link>
          {nft_collection && (
            <Link
              className={`${s.collectionLink} d-flex`}
              to={`/collection/${nft_collection._id}`}
            >
              {nft_collection.verified ? (
                <i className={`fa fa-check-circle me-1`}></i>
              ) : null}
              <span className={`${s.collectionName}`}>
                {nft_collection.title}
              </span>
            </Link>
          )}
        </div>
        <div className={`${s.nftItemInfo} d-flex`}>
          <div className={`d-flex`}>
            {isEditing && parsedStakeAmount && (
              <div className={s.staked}>
                <span>Staked {parsedStakeAmount} AART</span>
              </div>
            )}
          </div>
          <div className={`${s.price} d-flex`}>
            <input
              ref={inputCheckboxRef}
              type="checkbox"
              onChange={handleCheckboxChange}
            />
            {status === "LISTED" ? (
              parsedCurrency ? (
                <>
                  {parsedCurrency.price} {parsedCurrency.currency}
                  {verified && <i className={`fa fa-check-circle`}></i>}
                </>
              ) : (
                t("nftItem.notListedItem")
              )
            ) : status === "SOLD" ? (
              t("nftPage.sold")
            ) : (
              t("nftItem.notListedItem")
            )}
          </div>
          {isEditing && (
            <div className={s.listButton}>
              {listed ? (
                <span onClick={delistNFT} className={`${s.delist}`}>
                  {t("nftItem.delist")}
                </span>
              ) : (
                <span onClick={listNFT} className={`${s.list}`}>
                  {t("nftItem.list")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <ListNFTPopup
        isShowing={isShowing}
        hide={toggle}
        data={{ ...props }}
        loadingDispatcher={(isLoading, text) => {
          if (loadingDispatcher) loadingDispatcher(isLoading, text);
        }}
      />
    </>
  );
};

export default withStyles(s)(NftItem);

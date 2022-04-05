import React from "react";
import Popup from "./Popup";
import s from "./Popup.scss";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart } from "../../actions/nft";
import NftRow from "../NftRow/NftRow";

const ShoppingCartPopup = ({ isShowing, hideFunction }) => {
  const cartItems = useSelector(({ nfts }) => nfts.cartItems);
  // console.log("cartItems", cartItems);

  const dispatch = useDispatch();

  return (
    <Popup isShowing={isShowing} className={`${s.popupWidth}`}>
      <div className={`${s.listWrapper} ${s.popupWidth}`}>
        <div className={`${s.modalHeader}`}>
          <h3>Shopping cart</h3>
        </div>
        <div className={`${s.modalContent} ${s.modalDisplay}`}>
          <div
            className={`${
              cartItems.length !== 0 ? s.nftContainer : s.nftContainerEmpty
            }`}
          >
            {cartItems.length !== 0 ? (
              cartItems.map(item => {
                return (
                  <div key={item.Mint} className={s.box}>
                    <NftRow
                      image={item.Preview_URL}
                      title={item.Title}
                      price={item.price}
                      currency={item.currency}
                    />
                    <button
                      className={s.removeButton}
                      onClick={() => dispatch(removeFromCart(item))}
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            ) : (
              <div>Shopping cart is empty...</div>
            )}
          </div>
          <div className={s.buttons}>
            <button className={s.popupButton} onClick={() => hideFunction()}>
              Cancel
            </button>
            <button className={s.buyButton}>Buy</button>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default ShoppingCartPopup;

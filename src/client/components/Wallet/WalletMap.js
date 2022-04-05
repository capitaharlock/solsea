import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import NftItem from "../NftItem/NftItem";
import SaleHistoryItem from "../SaleHistoryItem/SaleHistoryItem";
import s from "./Wallet.scss";

const WalletMap = ({ nft, listedMap, unlistedMap, priceMap }) => {
  const { t } = useTranslation();
  useStyles(s);
  return (
    <div>
      <div className={`nft-global`}>
        {nft === "listed" ||
        (listedMap && nft !== "unlisted" && nft !== "price") ? (
          listedMap.length > 0 ? (
            listedMap.map(nft => (
              <div key={nft._id}>
                <NftItem isEditing={true} {...nft} />
              </div>
            ))
          ) : (
            <div>
              <p className={s.noNft}>{t("wallet.noListedNftsInWallet")}</p>
            </div>
          )
        ) : null}
      </div>
      <div className={`nft-global`}>
        {nft === "unlisted" ? (
          unlistedMap.length > 0 ? (
            unlistedMap.map(nft => (
              <div key={nft._id}>
                <NftItem isEditing={true} {...nft} />
              </div>
            ))
          ) : (
            <div>
              <p className={s.noNft}>{t("wallet.noNftsInWallet")}</p>
            </div>
          )
        ) : null}
      </div>
      <div className={`${s.transactionHolder}`}>
        {nft === "price" ? (
          priceMap.length > 0 ? (
            priceMap.map(user => (
              <div key={`${user._id}_${user.sellerKey}_${user.updatedAt}`}>
                <SaleHistoryItem {...user} />
              </div>
            ))
          ) : (
            <div>
              <p className={s.noNft}>Nemaaaa.</p>
            </div>
          )
        ) : null}
      </div>
      {/* {nftLoading && <WalletNftLoader />} */}
    </div>
  );
};

export default WalletMap;

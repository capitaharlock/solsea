import React from "react";
import SaleHistoryItem from "../SaleHistoryItem/SaleHistoryItem";

import s from "./ExploreActivity.scss";

const ExploreActivity = ({ saleshistory }) => {
  return (
    <>
      {saleshistory.map(nft => (
        <div
          key={`${nft._id}_${nft.sellerKey}_${nft.updatedAt}`}
          className={`d-flex col-lg-4 col-md-4 col-sm-4 col-xs-4 ${s.exploreNft}`}
        >
          <SaleHistoryItem {...nft} />
        </div>
      ))}
    </>
  );
};

export default ExploreActivity;

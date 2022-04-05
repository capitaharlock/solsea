import React from "react";
import useStyles from "isomorphic-style-loader/useStyles";
import { Link } from "react-router-dom";
import s from "../NavBarComponents.scss";
export const CONTENT_URL = process.env.CONTENT_URL;
import { useFilePath } from "../../../../hooks/useFilePath";

function SearchResultsCollection({
  Pubkey,
  title,
  _id,
  nftCount,
  floorPrice,
  iconImage,
  clear
}) {
  useStyles(s);

  const { path: iconImagePath } = useFilePath({
    destination: iconImage && iconImage.s3 && iconImage.s3.thumbnail
  });

  return (
    <Link
      to={`/collection/${_id}`}
      className={s.searchedItem}
      key={Pubkey}
      onClick={clear}
    >
      <div className={s.searchedItemImgTitle}>
        <img
          src={iconImagePath ? iconImagePath : "/assets/no_collection_icon.jpg"}
        />
        <p>{title.length > 23 ? title.slice(0, 23) + "..." : title}</p>
      </div>
      <div className={s.searchedCountPrice}>
        <p>
          Listed: <strong>{nftCount}</strong>
        </p>
        {floorPrice ? (
          <p>
            Floor: <strong>{floorPrice / 1000000000} SOL</strong>
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default SearchResultsCollection;

import React from "react";
import useStyles from "isomorphic-style-loader/useStyles";
import { Link } from "react-router-dom";
import s from "../NavBarComponents.scss";

function SearchResultsNft({ dataNft, clear }) {
  useStyles(s);

  return (
    <Link
      to={`/nft/${dataNft.Pubkey}`}
      className={s.searchedItem}
      key={dataNft.Pubkey}
      onClick={clear}
    >
      <div className={s.searchedItemImgTitle}>
        <img
          src={
            dataNft.Preview_URL
              ? dataNft.Preview_URL
              : "/assets/no_collection_icon.jpg"
          }
        />
        <p>
          {dataNft.Title.length > 23
            ? dataNft.Title.slice(0, 23) + "..."
            : dataNft.Title}
        </p>
      </div>

      {dataNft.price ? (
        <p>
          Floor: <strong>{dataNft.price / 1000000000} SOL</strong>
        </p>
      ) : null}
    </Link>
  );
}

export default SearchResultsNft;

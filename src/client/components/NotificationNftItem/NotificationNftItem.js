import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { Link } from "react-router-dom";
import { useFilePath } from "../../hooks/useFilePath";
import s from "./NotificationNftItem.scss";
import { useTranslation } from "react-i18next";

const NotificationNftItem = ({ Mint, image, Preview_URL, Title }) => {
  useStyles(s);
  const { t } = useTranslation();

  const { path: imagePath } = useFilePath({
    destination: image && image.s3 && image.s3.thumbnail
  });

  return (
    <div className={s.nftItem}>
      <div className="d-flex">
        <Link to={`/nft/${Mint}`}>
          <img src={!imagePath ? Preview_URL : imagePath} alt="" />
        </Link>
        <div className={s.content}>
          <h6>{Title}</h6>
          <p>{t("nftPage.sold")}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationNftItem;

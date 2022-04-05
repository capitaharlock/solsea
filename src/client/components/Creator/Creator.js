import useStyles from "isomorphic-style-loader/useStyles";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFilePath } from "../../hooks/useFilePath";
import s from "./Creator.scss";

const Creator = props => {
  useStyles(s);
  const { profile, walletKey, address, _id, verified } = props;

  const { path: profileImage } = useFilePath({
    destination:
      profile &&
      profile.profileImage &&
      profile.profileImage.s3 &&
      profile.profileImage.s3.thumbnail
  });

  const parsedAddress = useMemo(() => {
    return address
      ? address.substr(0, 4) +
          "..." +
          address.substr(address.length - 4, address.length)
      : "";
  }, [address]);

  const parsedWalletKey = useMemo(() => {
    return walletKey
      ? walletKey.substr(0, 4) +
          "..." +
          walletKey.substr(walletKey.length - 4, walletKey.length)
      : "";
  }, [walletKey]);

  return address ? (
    <a
      target="_blank"
      rel="noreferrer"
      href={"https://explorer.solana.com/address/" + address}
      className={`${s.root}`}
    >
      <section className={`d-flex ${s.creatorContainer}`}>
        <div className={s.info}>
          <p>
            {parsedAddress} {verified ? "✍️" : ""}
          </p>
        </div>
      </section>
    </a>
  ) : (
    <Link className={`${s.root}`} to={"/creator/" + _id + "/nfts"}>
      <section className={`d-flex ${s.creatorContainer}`}>
        <div className={`d-flex ${s.profileImageContainer}`}>
          <img src={profileImage ? profileImage : "/assets/profile.svg"} />
        </div>
        <div className={s.info}>
          <p className={s.name}>
            {profile && profile.name ? profile.name : parsedWalletKey}{" "}
            {verified ? "✍️" : ""}
          </p>
          <p style={{ fontSize: "12px" }}>{parsedWalletKey}</p>
        </div>
      </section>
    </Link>
  );
};

export default Creator;

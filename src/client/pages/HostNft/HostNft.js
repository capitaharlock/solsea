import React, { useEffect, useState } from "react";

import s from "./HostNft.scss";
import Seo from "../../components/Seo/Seo";
import { useForm } from "react-hook-form";
import withStyles from "isomorphic-style-loader/withStyles";
import { useSelector } from "react-redux";
import { store } from "react-notifications-component";
import { notificationOptions } from "../../../api/Definitions";
import client from "../../services/feathers";
import { useTranslation } from "react-i18next";

const HostNft = () => {
  const [selectedHosts, setHosts] = useState([]);
  const { t } = useTranslation();

  const { user = {}, connected, isDarkMode, isLoggedIn } = useSelector(
    ({ user, app }) => ({
      ...user,
      isDarkMode: app.isDarkMode
    })
  );
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchHosts = async () => {
      if (connected && user.walletKey) {
        const hosts = await client.service("host-nft").get(user.walletKey);
        setHosts(hosts);
      }
    };
    fetchHosts();
  }, [connected, user.walletKey]);

  const onSubmit = async data => {
    await client.service("users").get(user._id);
    try {
      await client.service("host-nft").create({
        ...data
      });
      store.addNotification({
        title: t("notification.successNotification"),
        message: t("hostNft.hostAddedMessage"),
        type: "success",
        ...notificationOptions
      });
    } catch (error) {
      store.addNotification({
        title: t("notification.errorNotification"),
        message: error.message,
        type: "danger",
        ...notificationOptions
      });
    }
  };

  return (
    <div>
      <Seo title={`Solsea |${t("seo.hostNFT")}`} />
      {!connected ? (
        <div className={`${s.notLoggedIn} connect-wallet-text`}>
          <p>{t("mintNFT.connectFirst")}</p>
        </div>
      ) : (
        <div id="container page-wrapper position-relative">
          <section
            aria-label="section"
            className={`banner profile-banner d-flex ${
              isDarkMode ? "dark-lighter" : "light-white"
            }`}
          >
            <h1 style={{ fontSize: "50px" }}>{t("hostNft.givePermission")}</h1>
          </section>
          {!isLoggedIn ? (
            <h4 className={s.notConnected}>{t("mintNFT.connectFirst")}</h4>
          ) : (
            <section aria-label="section">
              <div className="container">
                <div className={`${s.section} row wow fadeIn`}>
                  <div
                    style={{ alignItems: "center" }}
                    className="d-flex  flex-column mb-4"
                  >
                    <h3>{t("hostNft.permissionGiven")}</h3>
                    {selectedHosts.map((host, index) => (
                      <div key={index}>
                        <p>{host.hostEmail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="col-md-7">
                    <form
                      className="form-border"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      <div className="mb-4">
                        <h5 className={`text-center`} htmlFor="email">
                          {t("hostNft.addEmail")}
                        </h5>
                        <input
                          {...register("hostEmail")}
                          type="email"
                          className={`form-control ${
                            isDarkMode
                              ? "dark-lighter-more-input"
                              : "light-white"
                          }`}
                        />
                      </div>
                      <input
                        type="submit"
                        id="submit"
                        value={t("submit")}
                        className={`${s.submit} main-button`}
                      />
                    </form>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  component: withStyles(s)(HostNft)
};

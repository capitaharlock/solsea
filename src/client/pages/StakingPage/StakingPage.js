import React, { useEffect, useState } from "react";
import withStyles from "isomorphic-style-loader/withStyles";
import s from "./StakingPage.scss";
import Seo from "../../components/Seo/Seo";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import StakingForm from "../../components/StakingForm/StakingForm";
import { AART_ACCOUNT, handleStake } from "../../actions/stake";
import {
  getAartAccountForWallet,
  getStakingAccountKeyForWallet,
  getFeeFromAmount
} from "../../actions/stake/helpers";
import { handleUnstake } from "../../actions/stake";
import { useSplBalance } from "../../hooks/useSplAccountBalance";
import { FormProvider, useForm } from "react-hook-form";
import { AART_DECIMALS, notificationOptions } from "../../../api/Definitions";
import { store } from "react-notifications-component";
import Loader from "../../components/Loader/Loader";

const StakingPage = () => {
  const { t } = useTranslation();

  const [aartKey, setAartKey] = useState(null);
  const [userAartKey, setUserAartKey] = useState(null);
  const [calculatedFee, setCalculatedFee] = useState("-");
  const [currentFee, setCurrentFee] = useState("3%");
  const [isDeposit, setDeposit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const { wallet, isLoggedIn, connected } = useSelector(({ user }) => ({
    wallet: user.wallet,
    isLoggedIn: user.isLoggedIn,
    connected: user.connected
  }));

  useEffect(() => {
    if (wallet && wallet.connected) {
      handleAart();
    }
  }, [wallet]);

  const handleAart = async () => {
    setLoading(true);
    const res = await getStakingAccountKeyForWallet({
      wallet: wallet.publicKey
    });
    setAartKey(res);

    const walletRes = await getAartAccountForWallet({
      wallet: wallet.publicKey
    });
    if (walletRes) {
      setUserAartKey(walletRes);
    }
    setLoading(false);
  };

  const { balance } = useSplBalance({ publicKey: aartKey });
  const { balance: walletBalance } = useSplBalance({ publicKey: userAartKey });

  useEffect(() => {
    setCurrentFee(getFeeFromAmount(balance));
  }, [balance]);

  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange"
  });

  useEffect(() => {
    methods.reset();
  }, [isDeposit]);

  const handleSubmit = methods.handleSubmit(async data => {
    if (!data.amount) {
      store.addNotification({
        title: t("notification.errorNotification"),
        message: "Amount is missing!",
        type: "danger",
        ...notificationOptions
      });
      return;
    }
    setLoading(true);
    try {
      if (isDeposit) {
        await handleStake({
          wallet,
          amount: data.amount * AART_DECIMALS,
          loadingDispatcher: setLoadingText,
          waitingForTransaction: t("nftItem.waitingTransaction"),
          approval: t("nftItem.waitingApproval")
        });
      } else {
        await handleUnstake({
          wallet,
          amount: data.amount * AART_DECIMALS,
          loadingDispatcher: setLoadingText,
          waitingForTransaction: t("nftItem.waitingTransaction"),
          approval: t("nftItem.waitingApproval")
        });
      }
      setLoading(false);
      store.addNotification({
        title: t("notification.successNotification"),
        message: "Successfuly staked",
        type: "success",
        ...notificationOptions
      });
      methods.reset();
    } catch (error) {
      setLoading(false);
      store.addNotification({
        title: t("notification.errorNotification"),
        message: error.message,
        type: "danger",
        ...notificationOptions
      });
    }
  });

  const data = methods.watch();

  useEffect(() => {
    if (data.amount) {
      let newBalance;
      if (isDeposit) {
        newBalance = +data.amount + +balance;
      } else {
        newBalance = +balance - +data.amount;
      }

      setCalculatedFee(getFeeFromAmount(newBalance));
    } else {
      setCalculatedFee("-");
    }
  }, [data, balance]);

  return (
    <div>
      <Seo title={`Solsea | ${t("seo.stakingPage")}`} />
      <section
        aria-label="section"
        className={`banner profile-banner d-flex ${s.banner}`}
      >
        <h1>{`${t("seo.stakingPage")}`}</h1>
      </section>
      <div className={`page-wrapper ${s.stakingWrapper}`}>
        {!connected || !isLoggedIn ? (
          <h4 className={`pt-5`} style={{ textAlign: "center" }}>
            {t("mintNFT.connectFirst")}
          </h4>
        ) : (
          <div className={s.stakingContent}>
            <div className={s.balanceWrap}>
              <div className={s.balance}>
                <span>In wallet</span>
                <p className={s.wallet}>{walletBalance} AART</p>
              </div>
              <div className={s.right}>
                <div className={s.balance}>
                  <span>Staked</span>
                  <p>{balance} AART</p>
                </div>
                <div className={s.balance}>
                  <span>Current Fee</span>
                  <p>{currentFee}</p>
                </div>
              </div>
            </div>
            <FormProvider {...methods}>
              <StakingForm
                depositButton="DEPOSIT"
                withdrawButton="WITHDRAW"
                handleSubmit={handleSubmit}
                calculagedFee={calculatedFee}
                userTokens={isDeposit ? walletBalance : balance}
                isDeposit={isDeposit}
                setDeposit={setDeposit}
                loading={loading}
              />
            </FormProvider>
            <div>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://orca.so/?input=USDC&output=AART`}
              >
                Swap USDC to AART on Orca
              </a>
            </div>
          </div>
        )}
      </div>
      {loading && <Loader text={loadingText} />}
    </div>
  );
};

export default {
  component: withStyles(s)(StakingPage)
};

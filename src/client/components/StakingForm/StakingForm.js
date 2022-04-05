import React, { useState } from "react";
import useStyles from "isomorphic-style-loader/useStyles";
import s from "./StakingForm.scss";
import { useForm, useFormContext } from "react-hook-form";
import QuestionMark from "../Svg/QuestionMark";

const StakingForm = ({
  depositButton,
  withdrawButton,
  handleSubmit,
  calculagedFee,
  userTokens = 0,
  isDeposit,
  setDeposit,
  loading
}) => {
  useStyles(s);
  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <div className={s.root}>
      <div className={`${s.formHeader}`}>
        <div
          onClick={() => setDeposit(true)}
          className={`${s.tab} ${isDeposit ? s.activeTab : ""}`}
        >
          DEPOSIT
        </div>
        <div
          onClick={() => setDeposit(false)}
          className={`${s.tab} ${isDeposit ? "" : s.activeTab}`}
        >
          WITHDRAW
        </div>
      </div>
      <div className={`${s.content}`}>
        <form className={s.form} onSubmit={handleSubmit}>
          <div
            className={`input-wrap ${
              errors && errors["amount"] ? "input-error" : ""
            }`}
          >
            <div className="styled-input">
              <input
                {...register("amount", {
                  min: {
                    value: 0,
                    message: "Amount must be greater then 0"
                  },
                  max: {
                    value: userTokens,
                    message: "Amount too large"
                  },
                  pattern: /^(\d+)|(0.\d+)$/
                })}
                placeholder="0"
                type="number"
                step="0.000001"
                // value={value}
                // onChange={e => setValue(e.target.value)}
              />
              <span>AART</span>
            </div>
            {errors && errors["amount"] && (
              <span className={"styled-input-error"}>
                {errors["amount"].message}
              </span>
            )}
          </div>
          <div className={s.fees}>
            <div>
              <span>Calculated fee</span>
              <p>{calculagedFee}</p>
            </div>
          </div>
          <button className="teal-button" disabled={loading} type="submit">
            {isDeposit ? depositButton : withdrawButton} AART
          </button>
        </form>
        <a
          href="https://docs.solsea.io/getting-started/faq/aart-token-utility#staking-aart-tokens"
          target="_blank"
          rel="noreferrer"
          className={s.info}
        >
          <QuestionMark /> <p>More info</p>
        </a>
      </div>
    </div>
  );
};

export default StakingForm;

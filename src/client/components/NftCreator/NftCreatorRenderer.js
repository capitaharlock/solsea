import React from "react";
import withStyles from "isomorphic-style-loader/withStyles";
import styles from "./NftCreatorRenderer.scss";
import { useTranslation } from "react-i18next";

const NftCreatorRenderer = props => {
  const { t } = useTranslation();
  return (
    <div className={styles.nftCreatorRenderer}>
      <span>{props.email}</span>
      <div>
        <input
          placeholder={t("notification.percentage")}
          type="text"
          defaultValue={props.percentage}
          onChange={e => {
            if (props.onChange) props.onChange(e.target.value);
          }}
        />
        {props.deletable && (
          <button
            className={styles.btnClear}
            onClick={e => {
              console.log("delete clicked");
              console.log(props.onDelete);
              e.preventDefault();
              if (props.onDelete) props.onDelete();
            }}
          >
            <span>
              <i className={`fa fa-times-circle me-1`}></i>
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default withStyles(styles)(NftCreatorRenderer);

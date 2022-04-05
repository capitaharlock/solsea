import axios from "axios";
import client from "../services/feathers";

export const IS_INITIAL_RENDER = "IS_INITIAL_RENDER";
export const IS_EXPLORE = "IS_EXPLORE";
export const SET_BUTTON_ID = "SET_BUTTON_ID";
export const SET_OPEN_FORM = "SET_OPEN_FORM";
export const SET_SELECTED_PLAN = "SET_SELECTED_PLAN";
export const SET_REDIRECT = "SET_REDIRECT";
export const SET_OPEN_NFT = "SET_OPEN_NFT";
export const SYSTEM_UPDATED = "SYSTEM_UPDATED";
export const SET_COLLECTION_FOR_VALIDATION = "SET_COLLECTION_FOR_VALIDATION";
export const SET_DARK_MODE = "SET_DARK_MODE";
export const TOGGLE_WALLET = "TOGGLE_WALLET";

export function switchDarkMode(value) {
  return {
    type: SET_DARK_MODE,
    value
  };
}

export function handleOpenNft(value) {
  return {
    type: SET_OPEN_NFT,
    value
  };
}

export function setInitialRender(isInitialRender) {
  return {
    type: IS_INITIAL_RENDER,
    isInitialRender
  };
}

export function setIsExplore(value) {
  return {
    type: IS_EXPLORE,
    value
  };
}

export function setButtonId(value) {
  return {
    type: SET_BUTTON_ID,
    value
  };
}

export function handleOpenBuyForm(value) {
  return {
    type: SET_OPEN_FORM,
    value
  };
}

export function handleSelectedPlan(value) {
  return {
    type: SET_SELECTED_PLAN,
    value
  };
}

export const fetchVimeoScreenshot = id => {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://vimeo.com/api/v2/video/${id}.json`)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        console.error(err.message);
        reject();
      });
  });
};

export const listenSystemChanges = () => dispatch => {
  const systemService = client.service("system");
  systemService.find({}).then(message => {
    if (message && message[0]) {
      dispatch({
        type: SYSTEM_UPDATED,
        payload: message[0]
      });
    }
  });
  systemService.on("patched", message => {
    dispatch({
      type: SYSTEM_UPDATED,
      payload: message
    });
  });
};
